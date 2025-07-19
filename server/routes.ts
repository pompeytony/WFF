import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPlayerSchema, 
  insertGameweekSchema, 
  insertFixtureSchema, 
  insertPredictionSchema,
  updateFixtureResultSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Players
  app.get("/api/players", async (req, res) => {
    const players = await storage.getPlayers();
    res.json(players);
  });

  app.post("/api/players", async (req, res) => {
    try {
      const playerData = insertPlayerSchema.parse(req.body);
      const player = await storage.createPlayer(playerData);
      res.json(player);
    } catch (error) {
      res.status(400).json({ error: "Invalid player data" });
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

  app.post("/api/gameweeks", async (req, res) => {
    try {
      const gameweekData = insertGameweekSchema.parse(req.body);
      const gameweek = await storage.createGameweek(gameweekData);
      res.json(gameweek);
    } catch (error) {
      res.status(400).json({ error: "Invalid gameweek data" });
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

  app.post("/api/fixtures", async (req, res) => {
    try {
      const fixtureData = insertFixtureSchema.parse(req.body);
      const fixture = await storage.createFixture(fixtureData);
      res.json(fixture);
    } catch (error) {
      res.status(400).json({ error: "Invalid fixture data" });
    }
  });

  app.patch("/api/fixtures/:id/result", async (req, res) => {
    try {
      const fixtureId = Number(req.params.id);
      const resultData = updateFixtureResultSchema.parse(req.body);
      
      await storage.updateFixtureResult(fixtureId, resultData.homeScore, resultData.awayScore);
      
      // Calculate points for all predictions on this fixture
      await calculatePredictionPoints(fixtureId);
      
      res.json({ success: true });
    } catch (error) {
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
        .sort((a, b) => b.totalPoints - a.totalPoints);
      
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
        .sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
      
      let leagueTable = [];
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
          .sort((a, b) => b.totalPoints - a.totalPoints);
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
    // Check for correct result (5 points)
    else {
      const predictedResult = prediction.homeScore > prediction.awayScore ? 'home' : 
                             prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
      const actualResult = fixture.homeScore! > fixture.awayScore! ? 'home' :
                          fixture.homeScore! < fixture.awayScore! ? 'away' : 'draw';
      
      if (predictedResult === actualResult) {
        points = 5;
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
  const playerScores = new Map<number, number>();
  
  // Sum up points for each player
  for (const prediction of predictions) {
    const currentScore = playerScores.get(prediction.playerId) || 0;
    playerScores.set(prediction.playerId, currentScore + prediction.points);
  }
  
  // Find manager of the week (highest scorer)
  let highestScore = 0;
  let managerOfWeekId = 0;
  
  for (const [playerId, score] of playerScores.entries()) {
    if (score > highestScore) {
      highestScore = score;
      managerOfWeekId = playerId;
    }
  }
  
  // Update weekly scores
  for (const [playerId, score] of playerScores.entries()) {
    const finalScore = playerId === managerOfWeekId ? score + 5 : score; // +5 bonus for manager of week
    const isManager = playerId === managerOfWeekId;
    await storage.updateWeeklyScore(playerId, gameweekId, finalScore, isManager);
  }
}
