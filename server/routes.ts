import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import { 
  insertPlayerSchema, 
  insertGameweekSchema, 
  insertFixtureSchema, 
  insertPredictionSchema,
  updateFixtureResultSchema
} from "@shared/schema";

// Simple in-memory auth store
const activeTokens = new Map<string, number>(); // token -> userId

function generateToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Middleware to require authentication
async function requireAuth(req: any, res: any, next: any) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token || !activeTokens.has(token)) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const userId = activeTokens.get(token)!;
    const player = await storage.getPlayer(userId);
    if (!player) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    req.user = player;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

// Middleware to require admin access
async function requireAdmin(req: any, res: any, next: any) {
  await requireAuth(req, res, () => {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  });
}

export async function registerRoutes(app: Express): Promise<Server> {

  // Simple auth routes
  app.post('/api/auth/simple-login', async (req, res) => {
    try {
      const { name, email } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "Name and email are required" });
      }

      // Find or create player
      let player = await storage.getPlayerByEmail(email);
      if (!player) {
        player = await storage.createPlayer({ name, email });
      }

      // Generate token and store in memory
      const token = generateToken();
      activeTokens.set(token, player.id);
      
      console.log("Login successful, token generated:", token);
      res.json({ success: true, user: player, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post('/api/auth/existing-login', async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }

      // Find existing player
      const player = await storage.getPlayerByEmail(email);
      if (!player) {
        return res.status(404).json({ error: "Player not found with this email" });
      }

      // Generate token and store in memory
      const token = generateToken();
      activeTokens.set(token, player.id);
      
      console.log("Existing player login successful, token generated:", token);
      res.json({ success: true, user: player, token });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get('/api/auth/user', async (req: any, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      console.log("Auth check - Token:", token);
      
      if (!token || !activeTokens.has(token)) {
        console.log("No valid token found");
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const userId = activeTokens.get(token)!;
      const player = await storage.getPlayer(userId);
      if (!player) {
        console.log("Player not found for userId:", userId);
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      console.log("Returning user:", player);
      res.json(player);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.post('/api/auth/logout', async (req, res) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token && activeTokens.has(token)) {
        activeTokens.delete(token);
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  // Public players endpoint for login dropdown
  app.get("/api/players/public", async (req, res) => {
    try {
      const players = await storage.getPlayers();
      // Only return basic info needed for login dropdown
      const publicPlayers = players.map(p => ({ id: p.id, name: p.name, email: p.email }));
      res.json(publicPlayers);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Failed to fetch players" });
    }
  });



  // Players - Admin only routes
  app.get("/api/players", requireAdmin, async (req, res) => {
    const players = await storage.getPlayers();
    res.json(players);
  });

  app.post("/api/players", requireAdmin, async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: "Invalid player data" });
    }
  });

  app.patch("/api/players/:id", requireAdmin, async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      if (isNaN(playerId)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }
      
      await storage.updatePlayer(playerId, req.body);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to update player" });
    }
  });

  app.delete("/api/players/:id", requireAdmin, async (req, res) => {
    try {
      const playerId = parseInt(req.params.id);
      if (isNaN(playerId)) {
        return res.status(400).json({ error: "Invalid player ID" });
      }
      
      await storage.deletePlayer(playerId);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Failed to delete player" });
    }
  });

  // Gameweeks
  app.get("/api/gameweeks", async (req, res) => {
    const gameweeks = await storage.getGameweeks();
    res.json(gameweeks);
  });

  app.get("/api/gameweeks/active", async (req, res) => {
    const activeGameweek = await storage.getActiveGameweek();
    if (!activeGameweek) {
      return res.status(404).json({ error: "No active gameweek found" });
    }
    res.json(activeGameweek);
  });

  app.post("/api/gameweeks", requireAdmin, async (req, res) => {
    try {
      console.log("Received gameweek data:", req.body);
      const gameweekData = insertGameweekSchema.parse(req.body);
      console.log("Parsed gameweek data:", gameweekData);
      
      // Check for duplicate gameweek names
      const existingGameweeks = await storage.getGameweeks();
      const duplicate = existingGameweeks.find(gw => gw.name.toLowerCase() === gameweekData.name.toLowerCase());
      if (duplicate) {
        return res.status(400).json({ error: `A gameweek named "${gameweekData.name}" already exists` });
      }
      
      const gameweek = await storage.createGameweek(gameweekData);
      res.json(gameweek);
    } catch (error) {
      console.error("Gameweek creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid gameweek data" });
      }
    }
  });

  app.patch("/api/gameweeks/:id/activate", requireAdmin, async (req, res) => {
    try {
      const gameweekId = Number(req.params.id);
      
      // First deactivate all other gameweeks
      const allGameweeks = await storage.getGameweeks();
      for (const gw of allGameweeks) {
        if (gw.id !== gameweekId && gw.isActive) {
          await storage.updateGameweekStatus(gw.id, false, gw.isComplete || false);
        }
      }
      
      // Then activate the selected gameweek
      await storage.updateGameweekStatus(gameweekId, true, false);
      res.json({ success: true });
    } catch (error) {
      console.error("Error activating gameweek:", error);
      res.status(500).json({ error: "Failed to activate gameweek" });
    }
  });

  app.get("/api/admin/predictions-overview/:gameweekId", requireAdmin, async (req, res) => {
    try {
      const gameweekId = Number(req.params.gameweekId);
      const overview = await storage.getPredictionsOverview(gameweekId);
      res.json(overview);
    } catch (error) {
      console.error("Error fetching predictions overview:", error);
      res.status(500).json({ error: "Failed to fetch predictions overview" });
    }
  });

  // Fixtures
  app.get("/api/fixtures", async (req, res) => {
    const gameweekId = req.query.gameweekId;
    if (gameweekId) {
      const fixtures = await storage.getFixturesByGameweek(Number(gameweekId));
      res.json(fixtures);
    } else {
      const fixtures = await storage.getFixtures();
      res.json(fixtures);
    }
  });

  app.post("/api/fixtures", requireAdmin, async (req, res) => {
    try {
      console.log("Received fixture data:", req.body);
      const fixtureData = insertFixtureSchema.parse(req.body);
      console.log("Parsed fixture data:", fixtureData);
      const fixture = await storage.createFixture(fixtureData);
      res.json(fixture);
    } catch (error) {
      console.error("Fixture creation error:", error);
      if (error instanceof Error) {
        res.status(400).json({ error: error.message });
      } else {
        res.status(400).json({ error: "Invalid fixture data" });
      }
    }
  });

  app.patch("/api/fixtures/:id", requireAdmin, async (req, res) => {
    try {
      const fixtureId = Number(req.params.id);
      const updateData = req.body;
      
      // Update fixture details (teams, kickoff time, etc.)
      await storage.updateFixture(fixtureId, updateData);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating fixture:", error);
      res.status(400).json({ error: "Invalid fixture data" });
    }
  });

  app.patch("/api/fixtures/:id/result", requireAdmin, async (req, res) => {
    try {
      const fixtureId = Number(req.params.id);
      const resultData = updateFixtureResultSchema.parse(req.body);
      
      await storage.updateFixtureResult(fixtureId, resultData.homeScore, resultData.awayScore);
      
      // Calculate points for all predictions on this fixture
      await calculatePredictionPoints(fixtureId);
      
      // Get the gameweek for this fixture to check if it's now complete
      const fixture = (await storage.getFixtures()).find(f => f.id === fixtureId);
      if (fixture) {
        const gameweekFixtures = await storage.getFixturesByGameweek(fixture.gameweekId);
        const allFixturesComplete = gameweekFixtures.every(f => f.isComplete);
        
        if (allFixturesComplete) {
          // Calculate weekly scores and mark gameweek as complete
          await calculateGameweekScores(fixture.gameweekId);
          await storage.updateGameweekStatus(fixture.gameweekId, undefined, true);
          console.log(`Gameweek ${fixture.gameweekId} completed and scores calculated`);
        }
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error updating fixture result:", error);
      res.status(400).json({ error: "Invalid result data" });
    }
  });

  // Predictions
  app.get("/api/predictions", async (req, res) => {
    const playerId = req.query.playerId;
    const gameweekId = req.query.gameweekId;
    
    if (playerId) {
      const predictions = await storage.getPredictionsByPlayer(Number(playerId));
      res.json(predictions);
    } else if (gameweekId) {
      const predictions = await storage.getPredictionsByGameweek(Number(gameweekId));
      res.json(predictions);
    } else {
      const predictions = await storage.getPredictions();
      res.json(predictions);
    }
  });

  app.post("/api/predictions", async (req, res) => {
    try {
      const predictions = Array.isArray(req.body) ? req.body : [req.body];
      const createdPredictions = [];
      
      // Validate that only one joker is selected per player per gameweek
      const jokerCount = predictions.filter(p => p.isJoker).length;
      if (jokerCount > 1) {
        return res.status(400).json({ error: "Only one joker allowed per gameweek" });
      }
      
      for (const predictionData of predictions) {
        const parsedData = insertPredictionSchema.parse(predictionData);
        
        // Check if prediction already exists
        const existing = await storage.getPredictionByPlayerAndFixture(
          parsedData.playerId, 
          parsedData.fixtureId
        );
        
        if (existing) {
          await storage.updatePrediction(existing.id, parsedData);
          createdPredictions.push({ ...existing, ...parsedData });
        } else {
          const prediction = await storage.createPrediction(parsedData);
          createdPredictions.push(prediction);
        }
      }
      
      res.json(createdPredictions);
    } catch (error) {
      res.status(400).json({ error: "Invalid prediction data" });
    }
  });

  // Weekly Scores and League Table
  app.get("/api/weekly-scores", async (req, res) => {
    const gameweekId = req.query.gameweekId;
    if (gameweekId) {
      const scores = await storage.getWeeklyScoresByGameweek(Number(gameweekId));
      
      // Get player details and sort by total points
      const players = await storage.getPlayers();
      const playersMap = new Map(players.map(p => [p.id, p]));
      
      const leagueTable = scores
        .map(score => ({
          ...score,
          player: playersMap.get(score.playerId),
        }))
        .filter(entry => entry.player)
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      
      res.json(leagueTable);
    } else {
      const scores = await storage.getWeeklyScores();
      res.json(scores);
    }
  });

  // Calculate scores for a gameweek
  app.post("/api/calculate-scores/:gameweekId", async (req, res) => {
    try {
      const gameweekId = Number(req.params.gameweekId);
      await calculateGameweekScores(gameweekId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate scores" });
    }
  });

  // Send reminders to players
  app.post("/api/admin/send-reminders", requireAdmin, async (req, res) => {
    try {
      const { gameweekId, type, playerIds } = req.body;
      
      // Get gameweek and fixture details
      const gameweek = (await storage.getGameweeks()).find(g => g.id === gameweekId);
      if (!gameweek) {
        return res.status(404).json({ error: "Gameweek not found" });
      }

      const fixtures = await storage.getFixturesByGameweek(gameweekId);
      const players = await storage.getPlayers();
      
      // Get players who need reminders
      const targetPlayers = playerIds ? 
        players.filter(p => playerIds.includes(p.id)) : 
        players;

      // Create email content
      const deadlineText = gameweek.deadline ? 
        `Deadline: ${new Date(gameweek.deadline).toLocaleDateString('en-GB', { 
          weekday: 'long', 
          day: 'numeric', 
          month: 'long', 
          hour: '2-digit', 
          minute: '2-digit' 
        })}` : 
        'No deadline set';

      const fixturesList = fixtures.map(f => 
        `${f.homeTeam} vs ${f.awayTeam} - ${new Date(f.kickoffTime).toLocaleDateString('en-GB', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short',
          hour: '2-digit',
          minute: '2-digit'
        })}`
      ).join('\n');

      // Log reminder attempt (since we can't send actual emails without API key)
      console.log('=== PREDICTION REMINDER ===');
      console.log(`Gameweek: ${gameweek.name}`);
      console.log(`${deadlineText}`);
      console.log('Players to remind:', targetPlayers.map(p => `${p.name} (${p.email})`));
      console.log('Fixtures:');
      console.log(fixturesList);
      console.log('=========================');

      // Create formatted email template for manual sending
      const emailTemplate = `
Subject: Williams League - ${gameweek.name} Predictions Reminder

Hi there!

Don't forget to submit your predictions for ${gameweek.name}!

${deadlineText}

Fixtures:
${fixturesList}

Visit the app to make your predictions: ${req.protocol}://${req.get('host')}

Good luck!
Williams Friends & Family League
      `.trim();

      // Create WhatsApp-friendly message with specific player names
      const playerNamesList = targetPlayers.map(p => `• ${p.name}`).join('\n');
      const whatsappMessage = `
🏈 Williams Friends & Family League

${gameweek.name} Predictions Needed!

Outstanding players:
${playerNamesList}

${deadlineText}

Fixtures this week:
${fixturesList}

Please submit your predictions at: ${req.protocol}://${req.get('host')}

Good luck! ⚽
      `.trim();

      // For now, return success with formatted email template
      res.json({ 
        success: true, 
        message: `Reminder details prepared for ${targetPlayers.length} player(s)`,
        playersContacted: targetPlayers.length,
        emailTemplate,
        whatsappMessage,
        playerEmails: targetPlayers.map(p => p.email),
        playerNames: targetPlayers.map(p => p.name),
        alternatives: [
          {
            method: "WhatsApp Group Message",
            instruction: "Copy the WhatsApp message below and send to your family group chat",
            icon: "fab fa-whatsapp",
            color: "bg-green-500"
          },
          {
            method: "Individual WhatsApp",
            instruction: "Send WhatsApp messages directly to each player listed above",
            icon: "fab fa-whatsapp",
            color: "bg-green-500"
          },
          {
            method: "Gmail/Outlook",
            instruction: "Copy the email template and send to the player emails listed",
            icon: "fas fa-envelope",
            color: "bg-blue-500"
          },
          {
            method: "SMS Text Messages",
            instruction: "Send text messages using the WhatsApp message format",
            icon: "fas fa-sms",
            color: "bg-purple-500"
          }
        ]
      });

    } catch (error) {
      console.error("Error sending reminders:", error);
      res.status(500).json({ error: "Failed to send reminders" });
    }
  });

  // Get dashboard data
  app.get("/api/dashboard/:playerId", async (req, res) => {
    try {
      const playerId = Number(req.params.playerId);
      const activeGameweek = await storage.getActiveGameweek();
      
      if (!activeGameweek) {
        return res.status(404).json({ error: "No active gameweek" });
      }

      // Get current gameweek fixtures
      const fixtures = await storage.getFixturesByGameweek(activeGameweek.id);
      
      // Get player's predictions for current gameweek
      const allPredictions = await storage.getPredictionsByGameweek(activeGameweek.id);
      const playerPredictions = allPredictions.filter(p => p.playerId === playerId);
      
      // Get league table from previous completed gameweek
      const gameweeks = await storage.getGameweeks();
      const completedGameweeks = gameweeks
        .filter(gw => gw.isComplete)
        .sort((a, b) => {
          // Always sort by ID first (most recent gameweek)
          return b.id - a.id;
        });
      
      let leagueTable: any[] = [];
      if (completedGameweeks.length > 0) {
        const latestGameweek = completedGameweeks[0];
        const scores = await storage.getWeeklyScoresByGameweek(latestGameweek.id);
        const players = await storage.getPlayers();
        const playersMap = new Map(players.map(p => [p.id, p]));
        
        leagueTable = scores
          .map(score => ({
            ...score,
            player: playersMap.get(score.playerId),
          }))
          .filter(entry => entry.player)
          .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      }
      
      // Get recent results
      const completedFixtures = await storage.getFixtures();
      const recentResults = completedFixtures
        .filter(f => f.isComplete)
        .sort((a, b) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime())
        .slice(0, 5);

      res.json({
        activeGameweek,
        fixtures,
        predictions: playerPredictions,
        leagueTable: leagueTable.slice(0, 5), // Top 5 for mini table
        recentResults,
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to load dashboard data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper function to calculate points for predictions on a fixture
async function calculatePredictionPoints(fixtureId: number) {
  const fixture = (await storage.getFixtures()).find(f => f.id === fixtureId);
  if (!fixture || !fixture.isComplete) return;

  const predictions = (await storage.getPredictions()).filter(p => p.fixtureId === fixtureId);
  
  for (const prediction of predictions) {
    let points = 0;
    
    // Check for correct score (5 points)
    if (prediction.homeScore === fixture.homeScore && prediction.awayScore === fixture.awayScore) {
      points = 5;
    }
    // Check for correct result (3 points)
    else {
      const predictedResult = prediction.homeScore > prediction.awayScore ? 'home' : 
                             prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
      const actualResult = fixture.homeScore! > fixture.awayScore! ? 'home' :
                          fixture.homeScore! < fixture.awayScore! ? 'away' : 'draw';
      
      if (predictedResult === actualResult) {
        points = 3;
      }
    }
    
    // Double points if joker was played
    if (prediction.isJoker) {
      points *= 2;
    }
    
    await storage.updatePredictionPoints(prediction.id, points);
  }
}

// Helper function to calculate weekly scores and determine manager of the week
async function calculateGameweekScores(gameweekId: number) {
  const predictions = await storage.getPredictionsByGameweek(gameweekId);
  const allPlayers = await storage.getPlayers();
  const playerScores = new Map<number, number>();
  
  // Sum up points for each player who submitted predictions
  for (const prediction of predictions) {
    const currentScore = playerScores.get(prediction.playerId) || 0;
    playerScores.set(prediction.playerId, currentScore + (prediction.points || 0));
  }
  
  // Find the lowest score among players who submitted predictions
  let lowestScore = Number.MAX_SAFE_INTEGER;
  const playersWithPredictions = Array.from(playerScores.keys());
  
  if (playersWithPredictions.length > 0) {
    for (const [playerId, score] of Array.from(playerScores.entries())) {
      if (score < lowestScore) {
        lowestScore = score;
      }
    }
  } else {
    // If no one submitted predictions, set lowest score to 0
    lowestScore = 0;
  }
  
  // Give players who didn't submit predictions the same score as the lowest scorer
  for (const player of allPlayers) {
    if (!playerScores.has(player.id)) {
      playerScores.set(player.id, lowestScore);
    }
  }
  
  // Find manager of the week (highest scorer)
  let highestScore = 0;
  let managerOfWeekId = 0;
  
  for (const [playerId, score] of Array.from(playerScores.entries())) {
    if (score > highestScore) {
      highestScore = score;
      managerOfWeekId = playerId;
    }
  }
  
  // Update weekly scores for all players
  for (const [playerId, score] of Array.from(playerScores.entries())) {
    const finalScore = playerId === managerOfWeekId ? score + 5 : score; // +5 bonus for manager of week
    const isManager = playerId === managerOfWeekId;
    await storage.updateWeeklyScore(playerId, gameweekId, finalScore, isManager);
  }
}
