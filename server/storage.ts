import { 
  users, players, gameweeks, fixtures, predictions, weeklyScores, teamStrengthRatings,
  type User, type UpsertUser,
  type Player, type InsertPlayer,
  type Gameweek, type InsertGameweek,
  type Fixture, type InsertFixture,
  type Prediction, type InsertPrediction,
  type WeeklyScore, type InsertWeeklyScore,
  type TeamStrengthRating, type InsertTeamStrengthRating, type UpdateTeamStrengthRating
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray, ne } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Players
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayerByEmail(email: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<void>;
  deletePlayer(id: number): Promise<void>;


  
  // Gameweeks
  getGameweeks(): Promise<Gameweek[]>;
  getActiveGameweek(): Promise<Gameweek | undefined>;
  createGameweek(gameweek: InsertGameweek): Promise<Gameweek>;
  updateGameweekStatus(id: number, isActive?: boolean, isComplete?: boolean): Promise<void>;
  
  // Fixtures
  getFixtures(): Promise<Fixture[]>;
  getFixturesByGameweek(gameweekId: number): Promise<Fixture[]>;
  createFixture(fixture: InsertFixture): Promise<Fixture>;
  updateFixture(id: number, updateData: Partial<InsertFixture>): Promise<void>;
  updateFixtureResult(id: number, homeScore: number, awayScore: number): Promise<void>;
  deleteFixture(id: number): Promise<void>;
  
  // Predictions
  getPredictions(): Promise<Prediction[]>;
  getPredictionsByPlayer(playerId: number): Promise<Prediction[]>;
  getPredictionsByGameweek(gameweekId: number): Promise<Prediction[]>;
  getPredictionByPlayerAndFixture(playerId: number, fixtureId: number): Promise<Prediction | undefined>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePrediction(id: number, prediction: Partial<InsertPrediction>): Promise<void>;
  updatePredictionPoints(id: number, points: number): Promise<void>;
  
  // Weekly Scores
  getWeeklyScores(): Promise<WeeklyScore[]>;
  getWeeklyScoresByGameweek(gameweekId: number): Promise<WeeklyScore[]>;
  createWeeklyScore(weeklyScore: InsertWeeklyScore): Promise<WeeklyScore>;
  updateWeeklyScore(playerId: number, gameweekId: number, totalPoints: number, isManagerOfWeek?: boolean): Promise<void>;

  // Admin operations
  getPredictionsOverview(gameweekId: number): Promise<any>;
  
  // Team Strength Ratings
  getTeamStrengthRatings(): Promise<TeamStrengthRating[]>;
  getTeamStrengthRating(teamName: string): Promise<TeamStrengthRating | undefined>;
  upsertTeamStrengthRating(rating: InsertTeamStrengthRating): Promise<TeamStrengthRating>;
  updateTeamStrengthRating(teamName: string, updates: UpdateTeamStrengthRating): Promise<void>;
  
  // Player Performance
  getPlayerPerformance(playerId: number): Promise<PlayerPerformance>;
  getPlayerFormGuide(playerId: number): Promise<FormGuideEntry[]>;
  
  // Prediction Insights
  getCrowdPredictionInsights(gameweekId?: number): Promise<CrowdAccuracy>;
  
  // Historical Charts
  getPlayerHistoricalPoints(playerId: number): Promise<HistoricalPoint[]>;
  getPlayerComparison(player1Id: number, player2Id: number): Promise<PlayerComparison>;
}

export interface PlayerPerformance {
  playerId: number;
  playerName: string;
  totalPredictions: number;
  completedPredictions: number;
  correctScores: number;
  correctResults: number;
  totalPoints: number;
  averagePointsPerGameweek: number;
  accuracyRate: number;
  scoreAccuracyRate: number;
  bestPredictions: PredictionDetail[];
  worstPredictions: PredictionDetail[];
  gameweekStats: GameweekStat[];
}

export interface PredictionDetail {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  predictedScore: string;
  actualScore: string;
  points: number;
  gameweekName: string;
  wasJoker: boolean;
}

export interface GameweekStat {
  gameweekId: number;
  gameweekName: string;
  points: number;
  predictions: number;
  correctScores: number;
  correctResults: number;
}

export interface FormGuideEntry {
  gameweekId: number;
  gameweekName: string;
  points: number;
  rank: number;
  totalPlayers: number;
}

export interface PredictionInsight {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  gameweekName: string;
  totalPredictions: number;
  mostPredictedScore: string;
  mostPredictedCount: number;
  actualScore: string | null;
  crowdWasRight: boolean | null;
}

export interface CrowdAccuracy {
  totalCompletedFixtures: number;
  crowdCorrectCount: number;
  crowdAccuracyRate: number;
  recentInsights: PredictionInsight[];
}

export interface HistoricalPoint {
  gameweekId: number;
  gameweekName: string;
  points: number;
  cumulativePoints: number;
}

export interface PlayerComparison {
  player1Id: number;
  player1Name: string;
  player2Id: number;
  player2Name: string;
  gameweeks: {
    gameweekId: number;
    gameweekName: string;
    player1Points: number;
    player2Points: number;
    player1Cumulative: number;
    player2Cumulative: number;
  }[];
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private players: Map<number, Player> = new Map();
  private gameweeks: Map<number, Gameweek> = new Map();
  private fixtures: Map<number, Fixture> = new Map();
  private predictions: Map<number, Prediction> = new Map();
  private weeklyScores: Map<string, WeeklyScore> = new Map();
  
  private currentPlayerId = 1;
  private currentGameweekId = 1;
  private currentFixtureId = 1;
  private currentPredictionId = 1;
  private currentWeeklyScoreId = 1;

  constructor() {
    this.initializeTestData();
  }

  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const user: User = {
      id: userData.id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(userData.id, user);
    return user;
  }

  private initializeTestData() {
    // Create test players
    const testPlayers = [
      { name: "John Smith", email: "john@example.com" },
      { name: "Sarah Johnson", email: "sarah@example.com" },
      { name: "Mike Wilson", email: "mike@example.com" },
      { name: "Emma Davis", email: "emma@example.com" },
      { name: "Tom Brown", email: "tom@example.com" },
    ];

    testPlayers.forEach(player => {
      const id = this.currentPlayerId++;
      this.players.set(id, { ...player, id, phoneNumber: null, isAdmin: false });
    });

    // Create active gameweek
    const gameweek: Gameweek = {
      id: this.currentGameweekId++,
      name: "Gameweek 15",
      type: "premier-league",
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      isActive: true,
      isComplete: false,
    };
    this.gameweeks.set(gameweek.id, gameweek);

    // Create test fixtures
    const testFixtures = [
      { homeTeam: "Arsenal", awayTeam: "Chelsea", kickoffTime: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      { homeTeam: "Liverpool", awayTeam: "Manchester City", kickoffTime: new Date(Date.now() + 26 * 60 * 60 * 1000) },
      { homeTeam: "Manchester United", awayTeam: "Tottenham", kickoffTime: new Date(Date.now() + 28 * 60 * 60 * 1000) },
      { homeTeam: "Newcastle", awayTeam: "Brighton", kickoffTime: new Date(Date.now() + 30 * 60 * 60 * 1000) },
      { homeTeam: "Aston Villa", awayTeam: "West Ham", kickoffTime: new Date(Date.now() + 32 * 60 * 60 * 1000) },
      { homeTeam: "Crystal Palace", awayTeam: "Everton", kickoffTime: new Date(Date.now() + 34 * 60 * 60 * 1000) },
      { homeTeam: "Fulham", awayTeam: "Brentford", kickoffTime: new Date(Date.now() + 36 * 60 * 60 * 1000) },
      { homeTeam: "Nottingham Forest", awayTeam: "Wolves", kickoffTime: new Date(Date.now() + 38 * 60 * 60 * 1000) },
      { homeTeam: "Sheffield United", awayTeam: "Burnley", kickoffTime: new Date(Date.now() + 40 * 60 * 60 * 1000) },
      { homeTeam: "Bournemouth", awayTeam: "Luton Town", kickoffTime: new Date(Date.now() + 42 * 60 * 60 * 1000) },
    ];

    testFixtures.forEach(fixture => {
      const id = this.currentFixtureId++;
      this.fixtures.set(id, {
        ...fixture,
        id,
        gameweekId: gameweek.id,
        homeScore: null,
        awayScore: null,
        isComplete: false,
      });
    });

    // Create some previous gameweek with results
    const prevGameweek: Gameweek = {
      id: this.currentGameweekId++,
      name: "Gameweek 14",
      type: "premier-league",
      deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: false,
      isComplete: true,
    };
    this.gameweeks.set(prevGameweek.id, prevGameweek);

    // Create some completed fixtures for previous week
    const prevFixtures = [
      { homeTeam: "Arsenal", awayTeam: "Liverpool", homeScore: 2, awayScore: 1 },
      { homeTeam: "Chelsea", awayTeam: "Brighton", homeScore: 3, awayScore: 0 },
    ];

    prevFixtures.forEach(fixture => {
      const id = this.currentFixtureId++;
      this.fixtures.set(id, {
        ...fixture,
        id,
        gameweekId: prevGameweek.id,
        kickoffTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isComplete: true,
      });
    });

    // Create weekly scores
    const playerIds = Array.from(this.players.keys());
    const scores = [247, 235, 222, 218, 205];
    playerIds.forEach((playerId, index) => {
      const weeklyScore: WeeklyScore = {
        id: this.currentWeeklyScoreId++,
        playerId,
        gameweekId: prevGameweek.id,
        totalPoints: scores[index] || 200 - index * 5,
        isManagerOfWeek: index === 0,
      };
      this.weeklyScores.set(`${playerId}-${prevGameweek.id}`, weeklyScore);
    });
  }

  // Players
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayerByEmail(email: string): Promise<Player | undefined> {
    return Array.from(this.players.values()).find(p => p.email === email);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const newPlayer: Player = { ...player, id, phoneNumber: player.phoneNumber || null, isAdmin: false };
    this.players.set(id, newPlayer);
    
    // After creating the player, give them catch-up points if the season has started
    await this.allocateCatchUpPointsMemory(id);
    
    return newPlayer;
  }

  private async allocateCatchUpPointsMemory(newPlayerId: number): Promise<void> {
    // Get all completed gameweeks
    const completedGameweeks = Array.from(this.gameweeks.values())
      .filter(gw => gw.isComplete)
      .sort((a, b) => a.id - b.id);

    if (completedGameweeks.length === 0) {
      // No completed gameweeks yet, no catch-up needed
      return;
    }

    // Get all players (excluding the newly created one)
    const allPlayers = Array.from(this.players.values())
      .filter(p => p.id !== newPlayerId);

    if (allPlayers.length === 0) {
      // First player in the league, no catch-up needed
      return;
    }

    // Calculate total points for each existing player
    const playerTotals = allPlayers.map(p => {
      const scores = Array.from(this.weeklyScores.values())
        .filter(score => score.playerId === p.id);
      
      const total = scores.reduce((sum, score) => sum + (score.totalPoints || 0), 0);
      return { playerId: p.id, totalPoints: total };
    });

    // Find the lowest total points
    const lowestTotal = Math.max(0, Math.min(...playerTotals.map(pt => pt.totalPoints)));

    // Distribute the catch-up points evenly across all completed gameweeks
    // Even if lowestTotal is 0, we still create weekly score entries for consistency
    const pointsPerGameweek = lowestTotal > 0 ? Math.floor(lowestTotal / completedGameweeks.length) : 0;
    const remainder = lowestTotal > 0 ? lowestTotal % completedGameweeks.length : 0;

    // Create weekly score entries for the new player
    for (let i = 0; i < completedGameweeks.length; i++) {
      const gameweek = completedGameweeks[i];
      // Give extra point to first gameweeks to handle remainder
      const points = pointsPerGameweek + (i < remainder ? 1 : 0);
      
      const weeklyScore: WeeklyScore = {
        id: this.currentWeeklyScoreId++,
        playerId: newPlayerId,
        gameweekId: gameweek.id,
        totalPoints: points,
        isManagerOfWeek: false,
      };
      this.weeklyScores.set(`${newPlayerId}-${gameweek.id}`, weeklyScore);
    }
  }

  async updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<void> {
    const player = this.players.get(id);
    if (player) {
      Object.assign(player, updates);
    }
  }

  async deletePlayer(id: number): Promise<void> {
    // Delete player and related data
    this.players.delete(id);
    
    // Delete all predictions for this player
    const predictionsToDelete = Array.from(this.predictions.entries())
      .filter(([_, prediction]) => prediction.playerId === id)
      .map(([predictionId]) => predictionId);
    
    predictionsToDelete.forEach(predictionId => {
      this.predictions.delete(predictionId);
    });
    
    // Delete all weekly scores for this player
    const scoresToDelete = Array.from(this.weeklyScores.entries())
      .filter(([_, score]) => score.playerId === id)
      .map(([key]) => key);
    
    scoresToDelete.forEach(key => {
      this.weeklyScores.delete(key);
    });
  }

  // Gameweeks
  async getGameweeks(): Promise<Gameweek[]> {
    return Array.from(this.gameweeks.values());
  }

  async getActiveGameweek(): Promise<Gameweek | undefined> {
    return Array.from(this.gameweeks.values()).find(gw => gw.isActive);
  }

  async createGameweek(gameweek: InsertGameweek): Promise<Gameweek> {
    const id = this.currentGameweekId++;
    const newGameweek: Gameweek = { 
      ...gameweek, 
      id, 
      isActive: false, 
      isComplete: false,
      deadline: gameweek.deadline ? new Date(gameweek.deadline) : null
    };
    this.gameweeks.set(id, newGameweek);
    return newGameweek;
  }

  async updateGameweekStatus(id: number, isActive?: boolean, isComplete?: boolean): Promise<void> {
    const gameweek = this.gameweeks.get(id);
    if (gameweek) {
      if (isActive !== undefined) gameweek.isActive = isActive;
      if (isComplete !== undefined) gameweek.isComplete = isComplete;
    }
  }

  // Fixtures
  async getFixtures(): Promise<Fixture[]> {
    return Array.from(this.fixtures.values());
  }

  async getFixturesByGameweek(gameweekId: number): Promise<Fixture[]> {
    return Array.from(this.fixtures.values()).filter(f => f.gameweekId === gameweekId);
  }

  async createFixture(fixture: InsertFixture): Promise<Fixture> {
    const id = this.currentFixtureId++;
    const newFixture: Fixture = {
      ...fixture,
      id,
      homeScore: null,
      awayScore: null,
      isComplete: false,
    };
    this.fixtures.set(id, newFixture);
    return newFixture;
  }

  async updateFixture(id: number, updateData: Partial<InsertFixture>): Promise<void> {
    const fixture = this.fixtures.get(id);
    if (fixture) {
      Object.assign(fixture, updateData);
    }
  }

  async updateFixtureResult(id: number, homeScore: number, awayScore: number): Promise<void> {
    const fixture = this.fixtures.get(id);
    if (fixture) {
      fixture.homeScore = homeScore;
      fixture.awayScore = awayScore;
      fixture.isComplete = true;
    }
  }

  async deleteFixture(id: number): Promise<void> {
    this.fixtures.delete(id);
    // Also delete associated predictions
    const predictionsToDelete = Array.from(this.predictions.entries())
      .filter(([_, p]) => p.fixtureId === id)
      .map(([key, _]) => key);
    predictionsToDelete.forEach(key => this.predictions.delete(key));
  }

  // Predictions
  async getPredictions(): Promise<Prediction[]> {
    return Array.from(this.predictions.values());
  }

  async getPredictionsByPlayer(playerId: number): Promise<Prediction[]> {
    return Array.from(this.predictions.values()).filter(p => p.playerId === playerId);
  }

  async getPredictionsByGameweek(gameweekId: number): Promise<Prediction[]> {
    const fixtureIds = Array.from(this.fixtures.values())
      .filter(f => f.gameweekId === gameweekId)
      .map(f => f.id);
    return Array.from(this.predictions.values()).filter(p => fixtureIds.includes(p.fixtureId));
  }

  async getPredictionByPlayerAndFixture(playerId: number, fixtureId: number): Promise<Prediction | undefined> {
    return Array.from(this.predictions.values()).find(p => p.playerId === playerId && p.fixtureId === fixtureId);
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const id = this.currentPredictionId++;
    const newPrediction: Prediction = { 
      ...prediction, 
      id, 
      points: 0,
      isJoker: prediction.isJoker || false 
    };
    this.predictions.set(id, newPrediction);
    return newPrediction;
  }

  async updatePrediction(id: number, prediction: Partial<InsertPrediction>): Promise<void> {
    const existing = this.predictions.get(id);
    if (existing) {
      Object.assign(existing, prediction);
    }
  }

  async updatePredictionPoints(id: number, points: number): Promise<void> {
    const prediction = this.predictions.get(id);
    if (prediction) {
      prediction.points = points;
    }
  }

  // Weekly Scores
  async getWeeklyScores(): Promise<WeeklyScore[]> {
    return Array.from(this.weeklyScores.values());
  }

  async getWeeklyScoresByGameweek(gameweekId: number): Promise<WeeklyScore[]> {
    return Array.from(this.weeklyScores.values()).filter(ws => ws.gameweekId === gameweekId);
  }

  async createWeeklyScore(weeklyScore: InsertWeeklyScore): Promise<WeeklyScore> {
    const id = this.currentWeeklyScoreId++;
    const newWeeklyScore: WeeklyScore = {
      ...weeklyScore,
      id,
      totalPoints: weeklyScore.totalPoints || 0,
      isManagerOfWeek: false,
    };
    const key = `${weeklyScore.playerId}-${weeklyScore.gameweekId}`;
    this.weeklyScores.set(key, newWeeklyScore);
    return newWeeklyScore;
  }

  async updateWeeklyScore(playerId: number, gameweekId: number, totalPoints: number, isManagerOfWeek = false): Promise<void> {
    const key = `${playerId}-${gameweekId}`;
    const existing = this.weeklyScores.get(key);
    if (existing) {
      existing.totalPoints = totalPoints;
      existing.isManagerOfWeek = isManagerOfWeek;
    } else {
      await this.createWeeklyScore({ playerId, gameweekId, totalPoints });
    }
  }

  // Admin operations
  async getPredictionsOverview(gameweekId: number): Promise<any> {
    // Get all players
    const allPlayers = Array.from(this.players.values());
    
    // Get all fixtures for this gameweek
    const gameweekFixtures = Array.from(this.fixtures.values())
      .filter(f => f.gameweekId === gameweekId);
    
    // Get all predictions for this gameweek
    const gameweekPredictions = Array.from(this.predictions.values())
      .filter(p => {
        const fixture = this.fixtures.get(p.fixtureId);
        return fixture && fixture.gameweekId === gameweekId;
      });

    // Calculate player statistics
    const playerStats = new Map();
    allPlayers.forEach(player => {
      playerStats.set(player.id, {
        id: player.id,
        name: player.name,
        email: player.email,
        predictionsCount: 0
      });
    });

    gameweekPredictions.forEach(prediction => {
      const stats = playerStats.get(prediction.playerId);
      if (stats) {
        stats.predictionsCount++;
      }
    });

    const playersCompleted = Array.from(playerStats.values())
      .filter(player => player.predictionsCount === gameweekFixtures.length);
    
    const playersPending = Array.from(playerStats.values())
      .filter(player => player.predictionsCount < gameweekFixtures.length);

    // Calculate fixture breakdown
    const fixtureBreakdown = gameweekFixtures.map(fixture => {
      const fixturePredictions = gameweekPredictions.filter(p => p.fixtureId === fixture.id);
      const missingPlayers = allPlayers.filter(player => 
        !fixturePredictions.some(p => p.playerId === player.id)
      );

      return {
        id: fixture.id,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        kickoffTime: fixture.kickoffTime,
        predictionsCount: fixturePredictions.length,
        missingPlayers: missingPlayers.map(p => ({ id: p.id, name: p.name }))
      };
    });

    return {
      summary: {
        totalPlayers: allPlayers.length,
        playersSubmitted: playersCompleted.length,
        playersPending: playersPending.length,
      },
      totalFixtures: gameweekFixtures.length,
      playersCompleted,
      playersPending,
      fixtureBreakdown
    };
  }

  // Team Strength Ratings (not implemented for MemStorage)
  async getTeamStrengthRatings(): Promise<TeamStrengthRating[]> {
    return [];
  }

  async getTeamStrengthRating(teamName: string): Promise<TeamStrengthRating | undefined> {
    return undefined;
  }

  async upsertTeamStrengthRating(rating: InsertTeamStrengthRating): Promise<TeamStrengthRating> {
    throw new Error("MemStorage does not support team strength ratings");
  }

  async updateTeamStrengthRating(teamName: string, updates: UpdateTeamStrengthRating): Promise<void> {
    throw new Error("MemStorage does not support team strength ratings");
  }

  async getPlayerPerformance(playerId: number): Promise<PlayerPerformance> {
    throw new Error("MemStorage does not support player performance statistics");
  }

  async getPlayerFormGuide(playerId: number): Promise<FormGuideEntry[]> {
    throw new Error("MemStorage does not support form guide");
  }

  async getCrowdPredictionInsights(gameweekId?: number): Promise<CrowdAccuracy> {
    throw new Error("MemStorage does not support prediction insights");
  }

  async getPlayerHistoricalPoints(playerId: number): Promise<HistoricalPoint[]> {
    throw new Error("MemStorage does not support historical charts");
  }

  async getPlayerComparison(player1Id: number, player2Id: number): Promise<PlayerComparison> {
    throw new Error("MemStorage does not support player comparisons");
  }
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getPlayers(): Promise<Player[]> {
    return await db.select().from(players);
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async getPlayerByEmail(email: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.email, email));
    return player || undefined;
  }

  async createPlayer(insertPlayer: InsertPlayer): Promise<Player> {
    const [player] = await db
      .insert(players)
      .values(insertPlayer)
      .returning();
    
    // After creating the player, give them catch-up points if the season has started
    await this.allocateCatchUpPoints(player.id);
    
    return player;
  }

  private async allocateCatchUpPoints(newPlayerId: number): Promise<void> {
    // Get all completed gameweeks
    const completedGameweeks = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.isComplete, true))
      .orderBy(gameweeks.id);

    if (completedGameweeks.length === 0) {
      // No completed gameweeks yet, no catch-up needed
      return;
    }

    // Get all players (excluding the newly created one)
    const allPlayers = await db
      .select()
      .from(players)
      .where(ne(players.id, newPlayerId));

    if (allPlayers.length === 0) {
      // First player in the league, no catch-up needed
      return;
    }

    // Calculate total points for each existing player
    const playerTotals = await Promise.all(
      allPlayers.map(async (p) => {
        const scores = await db
          .select()
          .from(weeklyScores)
          .where(eq(weeklyScores.playerId, p.id));
        
        const total = scores.reduce((sum, score) => sum + (score.totalPoints || 0), 0);
        return { playerId: p.id, totalPoints: total };
      })
    );

    // Find the lowest total points
    const lowestTotal = Math.max(0, Math.min(...playerTotals.map(pt => pt.totalPoints)));

    // Distribute the catch-up points evenly across all completed gameweeks
    // Even if lowestTotal is 0, we still create weekly score entries for consistency
    const pointsPerGameweek = lowestTotal > 0 ? Math.floor(lowestTotal / completedGameweeks.length) : 0;
    const remainder = lowestTotal > 0 ? lowestTotal % completedGameweeks.length : 0;

    // Create weekly score entries for the new player
    for (let i = 0; i < completedGameweeks.length; i++) {
      const gameweek = completedGameweeks[i];
      // Give extra point to first gameweeks to handle remainder
      const points = pointsPerGameweek + (i < remainder ? 1 : 0);
      
      await db.insert(weeklyScores).values({
        playerId: newPlayerId,
        gameweekId: gameweek.id,
        totalPoints: points,
        isManagerOfWeek: false,
      });
    }
  }

  async updatePlayer(id: number, updates: Partial<InsertPlayer>): Promise<void> {
    await db.update(players).set(updates).where(eq(players.id, id));
  }

  async deletePlayer(id: number): Promise<void> {
    // Delete related data first (cascading delete)
    await db.delete(weeklyScores).where(eq(weeklyScores.playerId, id));
    await db.delete(predictions).where(eq(predictions.playerId, id));
    await db.delete(players).where(eq(players.id, id));
  }



  // Gameweeks
  async getGameweeks(): Promise<Gameweek[]> {
    return await db.select().from(gameweeks);
  }

  async getActiveGameweek(): Promise<Gameweek | undefined> {
    const [gameweek] = await db.select().from(gameweeks).where(eq(gameweeks.isActive, true));
    return gameweek || undefined;
  }

  async createGameweek(insertGameweek: InsertGameweek): Promise<Gameweek> {
    console.log("DatabaseStorage createGameweek received:", insertGameweek);
    
    // Transform the data for database insertion
    const gameweekData = {
      name: insertGameweek.name,
      type: insertGameweek.type,
      deadline: insertGameweek.deadline ? new Date(insertGameweek.deadline) : null,
    };
    
    console.log("DatabaseStorage transforming to:", gameweekData);
    
    const [gameweek] = await db
      .insert(gameweeks)
      .values(gameweekData)
      .returning();
    return gameweek;
  }

  async updateGameweekStatus(id: number, isActive?: boolean, isComplete?: boolean): Promise<void> {
    const updates: any = {};
    if (isActive !== undefined) updates.isActive = isActive;
    if (isComplete !== undefined) updates.isComplete = isComplete;
    
    if (Object.keys(updates).length > 0) {
      await db.update(gameweeks).set(updates).where(eq(gameweeks.id, id));
    }
  }

  // Fixtures
  async getFixtures(): Promise<Fixture[]> {
    return await db.select().from(fixtures);
  }

  async getFixturesByGameweek(gameweekId: number): Promise<Fixture[]> {
    return await db.select().from(fixtures).where(eq(fixtures.gameweekId, gameweekId));
  }

  async createFixture(insertFixture: InsertFixture): Promise<Fixture> {
    console.log("DatabaseStorage createFixture received:", insertFixture);
    
    const [fixture] = await db
      .insert(fixtures)
      .values(insertFixture)
      .returning();
    return fixture;
  }

  async updateFixture(id: number, updateData: Partial<InsertFixture>): Promise<void> {
    await db.update(fixtures)
      .set(updateData)
      .where(eq(fixtures.id, id));
  }

  async updateFixtureResult(id: number, homeScore: number, awayScore: number): Promise<void> {
    await db.update(fixtures)
      .set({ homeScore, awayScore, isComplete: true })
      .where(eq(fixtures.id, id));
  }

  async deleteFixture(id: number): Promise<void> {
    // First delete associated predictions
    await db.delete(predictions).where(eq(predictions.fixtureId, id));
    // Then delete the fixture
    await db.delete(fixtures).where(eq(fixtures.id, id));
  }

  // Predictions
  async getPredictions(): Promise<Prediction[]> {
    return await db.select().from(predictions);
  }

  async getPredictionsByPlayer(playerId: number): Promise<Prediction[]> {
    return await db.select().from(predictions).where(eq(predictions.playerId, playerId));
  }

  async getPredictionsByGameweek(gameweekId: number): Promise<Prediction[]> {
    const gameweekFixtures = await db.select({ id: fixtures.id }).from(fixtures).where(eq(fixtures.gameweekId, gameweekId));
    const fixtureIds = gameweekFixtures.map(f => f.id);
    
    if (fixtureIds.length === 0) return [];
    
    return await db.select().from(predictions).where(inArray(predictions.fixtureId, fixtureIds));
  }

  async getPredictionByPlayerAndFixture(playerId: number, fixtureId: number): Promise<Prediction | undefined> {
    const [prediction] = await db.select().from(predictions)
      .where(and(eq(predictions.playerId, playerId), eq(predictions.fixtureId, fixtureId)));
    return prediction || undefined;
  }

  async createPrediction(insertPrediction: InsertPrediction): Promise<Prediction> {
    const [prediction] = await db
      .insert(predictions)
      .values(insertPrediction)
      .returning();
    return prediction;
  }

  async updatePrediction(id: number, prediction: Partial<InsertPrediction>): Promise<void> {
    await db.update(predictions).set(prediction).where(eq(predictions.id, id));
  }

  async updatePredictionPoints(id: number, points: number): Promise<void> {
    await db.update(predictions).set({ points }).where(eq(predictions.id, id));
  }

  // Weekly Scores
  async getWeeklyScores(): Promise<WeeklyScore[]> {
    return await db.select().from(weeklyScores);
  }

  async getWeeklyScoresByGameweek(gameweekId: number): Promise<WeeklyScore[]> {
    return await db.select().from(weeklyScores).where(eq(weeklyScores.gameweekId, gameweekId));
  }

  async createWeeklyScore(insertWeeklyScore: InsertWeeklyScore): Promise<WeeklyScore> {
    const [weeklyScore] = await db
      .insert(weeklyScores)
      .values(insertWeeklyScore)
      .returning();
    return weeklyScore;
  }

  async updateWeeklyScore(playerId: number, gameweekId: number, totalPoints: number, isManagerOfWeek = false): Promise<void> {
    const [existing] = await db.select().from(weeklyScores)
      .where(and(eq(weeklyScores.playerId, playerId), eq(weeklyScores.gameweekId, gameweekId)));
    
    if (existing) {
      await db.update(weeklyScores)
        .set({ totalPoints, isManagerOfWeek })
        .where(and(eq(weeklyScores.playerId, playerId), eq(weeklyScores.gameweekId, gameweekId)));
    } else {
      await this.createWeeklyScore({ playerId, gameweekId, totalPoints });
    }
  }

  // Admin operations
  async getPredictionsOverview(gameweekId: number): Promise<any> {
    // Get all players
    const allPlayers = await db.select().from(players);
    
    // Get all fixtures for this gameweek
    const gameweekFixtures = await db.select()
      .from(fixtures)
      .where(eq(fixtures.gameweekId, gameweekId));
    
    // Get all predictions for this gameweek
    const gameweekPredictions = await db.select({
      id: predictions.id,
      playerId: predictions.playerId,
      fixtureId: predictions.fixtureId,
      playerName: players.name,
      playerEmail: players.email,
    })
    .from(predictions)
    .innerJoin(players, eq(predictions.playerId, players.id))
    .innerJoin(fixtures, eq(predictions.fixtureId, fixtures.id))
    .where(eq(fixtures.gameweekId, gameweekId));

    // Calculate player statistics
    const playerStats = new Map();
    allPlayers.forEach(player => {
      playerStats.set(player.id, {
        id: player.id,
        name: player.name,
        email: player.email,
        predictionsCount: 0
      });
    });

    gameweekPredictions.forEach(prediction => {
      const stats = playerStats.get(prediction.playerId);
      if (stats) {
        stats.predictionsCount++;
      }
    });

    const playersCompleted = Array.from(playerStats.values())
      .filter(player => player.predictionsCount === gameweekFixtures.length);
    
    const playersPending = Array.from(playerStats.values())
      .filter(player => player.predictionsCount < gameweekFixtures.length);

    // Calculate fixture breakdown
    const fixtureBreakdown = await Promise.all(gameweekFixtures.map(async (fixture) => {
      const fixturePredictions = gameweekPredictions.filter(p => p.fixtureId === fixture.id);
      const missingPlayers = allPlayers.filter(player => 
        !fixturePredictions.some(p => p.playerId === player.id)
      );

      return {
        id: fixture.id,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        kickoffTime: fixture.kickoffTime,
        predictionsCount: fixturePredictions.length,
        missingPlayers: missingPlayers.map(p => ({ id: p.id, name: p.name }))
      };
    }));

    return {
      summary: {
        totalPlayers: allPlayers.length,
        playersSubmitted: playersCompleted.length,
        playersPending: playersPending.length,
      },
      totalFixtures: gameweekFixtures.length,
      playersCompleted,
      playersPending,
      fixtureBreakdown
    };
  }

  // Team Strength Ratings
  async getTeamStrengthRatings(): Promise<TeamStrengthRating[]> {
    return await db.select().from(teamStrengthRatings);
  }

  async getTeamStrengthRating(teamName: string): Promise<TeamStrengthRating | undefined> {
    const [rating] = await db
      .select()
      .from(teamStrengthRatings)
      .where(eq(teamStrengthRatings.teamName, teamName));
    return rating || undefined;
  }

  async upsertTeamStrengthRating(rating: InsertTeamStrengthRating): Promise<TeamStrengthRating> {
    const [result] = await db
      .insert(teamStrengthRatings)
      .values(rating)
      .onConflictDoUpdate({
        target: teamStrengthRatings.teamName,
        set: {
          strengthRating: rating.strengthRating,
          updatedAt: new Date(),
          updatedBy: rating.updatedBy,
          notes: rating.notes,
        },
      })
      .returning();
    return result;
  }

  async updateTeamStrengthRating(teamName: string, updates: UpdateTeamStrengthRating): Promise<void> {
    await db
      .update(teamStrengthRatings)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(teamStrengthRatings.teamName, teamName));
  }

  async getPlayerPerformance(playerId: number): Promise<PlayerPerformance> {
    // Get player info
    const player = await this.getPlayer(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Get all predictions for this player with fixture and gameweek details
    const playerPredictions = await db
      .select({
        prediction: predictions,
        fixture: fixtures,
        gameweek: gameweeks,
      })
      .from(predictions)
      .innerJoin(fixtures, eq(predictions.fixtureId, fixtures.id))
      .innerJoin(gameweeks, eq(fixtures.gameweekId, gameweeks.id))
      .where(eq(predictions.playerId, playerId));

    // Calculate statistics
    const completedPredictions = playerPredictions.filter(p => p.fixture.isComplete);
    const totalPredictions = playerPredictions.length;
    const completedCount = completedPredictions.length;

    let correctScores = 0;
    let correctResults = 0;
    let totalPoints = 0;

    completedPredictions.forEach(({ prediction, fixture }) => {
      totalPoints += prediction.points || 0;
      
      if (fixture.homeScore !== null && fixture.awayScore !== null) {
        // Check for correct score (exact match)
        if (prediction.homeScore === fixture.homeScore && prediction.awayScore === fixture.awayScore) {
          correctScores++;
          correctResults++;
        } else {
          // Check for correct result (win/draw/loss)
          const predictedResult = prediction.homeScore > prediction.awayScore ? 'home' : 
                                 prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
          const actualResult = fixture.homeScore > fixture.awayScore ? 'home' :
                              fixture.homeScore < fixture.awayScore ? 'away' : 'draw';
          if (predictedResult === actualResult) {
            correctResults++;
          }
        }
      }
    });

    // Calculate accuracy rates
    const accuracyRate = completedCount > 0 ? (correctResults / completedCount) * 100 : 0;
    const scoreAccuracyRate = completedCount > 0 ? (correctScores / completedCount) * 100 : 0;

    // Get weekly scores for average calculation
    const weeklyScoresData = await db
      .select()
      .from(weeklyScores)
      .where(eq(weeklyScores.playerId, playerId));

    const averagePointsPerGameweek = weeklyScoresData.length > 0 
      ? weeklyScoresData.reduce((sum, ws) => sum + (ws.totalPoints || 0), 0) / weeklyScoresData.length 
      : 0;

    // Get best predictions (top 5 by points)
    const bestPredictions: PredictionDetail[] = completedPredictions
      .filter(p => p.fixture.homeScore !== null && p.fixture.awayScore !== null)
      .sort((a, b) => (b.prediction.points || 0) - (a.prediction.points || 0))
      .slice(0, 5)
      .map(({ prediction, fixture, gameweek }) => ({
        fixtureId: fixture.id,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        predictedScore: `${prediction.homeScore}-${prediction.awayScore}`,
        actualScore: `${fixture.homeScore}-${fixture.awayScore}`,
        points: prediction.points || 0,
        gameweekName: gameweek.name,
        wasJoker: prediction.isJoker || false,
      }));

    // Get worst predictions (bottom 5 by points, including 0 points)
    const worstPredictions: PredictionDetail[] = completedPredictions
      .filter(p => p.fixture.homeScore !== null && p.fixture.awayScore !== null)
      .sort((a, b) => (a.prediction.points || 0) - (b.prediction.points || 0))
      .slice(0, 5)
      .map(({ prediction, fixture, gameweek }) => ({
        fixtureId: fixture.id,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        predictedScore: `${prediction.homeScore}-${prediction.awayScore}`,
        actualScore: `${fixture.homeScore}-${fixture.awayScore}`,
        points: prediction.points || 0,
        gameweekName: gameweek.name,
        wasJoker: prediction.isJoker || false,
      }));

    // Calculate gameweek statistics
    const gameweekStatsMap = new Map<number, {
      gameweekId: number;
      gameweekName: string;
      points: number;
      predictions: number;
      correctScores: number;
      correctResults: number;
    }>();

    playerPredictions.forEach(({ prediction, fixture, gameweek }) => {
      if (!gameweekStatsMap.has(gameweek.id)) {
        gameweekStatsMap.set(gameweek.id, {
          gameweekId: gameweek.id,
          gameweekName: gameweek.name,
          points: 0,
          predictions: 0,
          correctScores: 0,
          correctResults: 0,
        });
      }

      const stat = gameweekStatsMap.get(gameweek.id)!;
      stat.predictions++;

      if (fixture.isComplete && fixture.homeScore !== null && fixture.awayScore !== null) {
        stat.points += prediction.points || 0;

        // Check for correct score
        if (prediction.homeScore === fixture.homeScore && prediction.awayScore === fixture.awayScore) {
          stat.correctScores++;
          stat.correctResults++;
        } else {
          // Check for correct result
          const predictedResult = prediction.homeScore > prediction.awayScore ? 'home' : 
                                 prediction.homeScore < prediction.awayScore ? 'away' : 'draw';
          const actualResult = fixture.homeScore > fixture.awayScore ? 'home' :
                              fixture.homeScore < fixture.awayScore ? 'away' : 'draw';
          if (predictedResult === actualResult) {
            stat.correctResults++;
          }
        }
      }
    });

    const gameweekStats: GameweekStat[] = Array.from(gameweekStatsMap.values())
      .sort((a, b) => a.gameweekId - b.gameweekId);

    return {
      playerId,
      playerName: player.name,
      totalPredictions,
      completedPredictions: completedCount,
      correctScores,
      correctResults,
      totalPoints,
      averagePointsPerGameweek: Math.round(averagePointsPerGameweek * 10) / 10,
      accuracyRate: Math.round(accuracyRate * 10) / 10,
      scoreAccuracyRate: Math.round(scoreAccuracyRate * 10) / 10,
      bestPredictions,
      worstPredictions,
      gameweekStats,
    };
  }

  async getPlayerFormGuide(playerId: number): Promise<FormGuideEntry[]> {
    // Verify player exists
    const player = await this.getPlayer(playerId);
    if (!player) {
      throw new Error(`Player with id ${playerId} not found`);
    }

    // Get all completed gameweeks with their weekly scores, ordered by most recent first
    const completedGameweeks = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.isComplete, true))
      .orderBy(gameweeks.id);

    if (completedGameweeks.length === 0) {
      return [];
    }

    // Get the last 5 completed gameweeks
    const last5Gameweeks = completedGameweeks.slice(-5);

    const formGuide: FormGuideEntry[] = [];

    for (const gameweek of last5Gameweeks) {
      // Get all weekly scores for this gameweek
      const allScores = await db
        .select()
        .from(weeklyScores)
        .where(eq(weeklyScores.gameweekId, gameweek.id));

      // Get the player's score for this gameweek
      const playerScore = allScores.find(s => s.playerId === playerId);

      // If player didn't participate in this gameweek, skip it
      if (!playerScore) {
        continue;
      }

      // Sort scores to determine rank
      const sortedScores = [...allScores].sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0));
      const rank = sortedScores.findIndex(s => s.playerId === playerId) + 1;

      formGuide.push({
        gameweekId: gameweek.id,
        gameweekName: gameweek.name,
        points: playerScore.totalPoints || 0,
        rank,
        totalPlayers: allScores.length,
      });
    }

    return formGuide;
  }

  async getCrowdPredictionInsights(gameweekId?: number): Promise<CrowdAccuracy> {
    // Get completed fixtures (all or for specific gameweek)
    const completedFixtures = gameweekId 
      ? await db
          .select()
          .from(fixtures)
          .where(and(eq(fixtures.isComplete, true), eq(fixtures.gameweekId, gameweekId)))
      : await db
          .select()
          .from(fixtures)
          .where(eq(fixtures.isComplete, true));

    if (completedFixtures.length === 0) {
      return {
        totalCompletedFixtures: 0,
        crowdCorrectCount: 0,
        crowdAccuracyRate: 0,
        recentInsights: [],
      };
    }

    const insights: PredictionInsight[] = [];
    let crowdCorrectCount = 0;

    for (const fixture of completedFixtures) {
      // Get all predictions for this fixture
      const fixturePredictions = await db
        .select()
        .from(predictions)
        .where(eq(predictions.fixtureId, fixture.id));

      if (fixturePredictions.length === 0) continue;

      // Count each unique score prediction
      const scoreCounts = new Map<string, number>();
      fixturePredictions.forEach(pred => {
        const scoreKey = `${pred.homeScore}-${pred.awayScore}`;
        scoreCounts.set(scoreKey, (scoreCounts.get(scoreKey) || 0) + 1);
      });

      // Find most predicted score
      let mostPredictedScore = "";
      let mostPredictedCount = 0;
      scoreCounts.forEach((count, score) => {
        if (count > mostPredictedCount) {
          mostPredictedScore = score;
          mostPredictedCount = count;
        }
      });

      // Check if crowd was right
      const actualScore = fixture.homeScore !== null && fixture.awayScore !== null
        ? `${fixture.homeScore}-${fixture.awayScore}`
        : null;
      
      const crowdWasRight = actualScore === mostPredictedScore;
      if (crowdWasRight) crowdCorrectCount++;

      // Get gameweek name
      const [gameweek] = await db
        .select()
        .from(gameweeks)
        .where(eq(gameweeks.id, fixture.gameweekId));

      insights.push({
        fixtureId: fixture.id,
        homeTeam: fixture.homeTeam,
        awayTeam: fixture.awayTeam,
        gameweekName: gameweek?.name || "Unknown",
        totalPredictions: fixturePredictions.length,
        mostPredictedScore,
        mostPredictedCount,
        actualScore,
        crowdWasRight,
      });
    }

    // Sort by most recent and take last 10
    const recentInsights = insights.slice(-10).reverse();

    return {
      totalCompletedFixtures: completedFixtures.length,
      crowdCorrectCount,
      crowdAccuracyRate: Math.round((crowdCorrectCount / completedFixtures.length) * 100 * 10) / 10,
      recentInsights,
    };
  }

  async getPlayerHistoricalPoints(playerId: number): Promise<HistoricalPoint[]> {
    const player = await this.getPlayer(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Get all completed gameweeks in order
    const completedGameweeks = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.isComplete, true))
      .orderBy(gameweeks.id);

    const historicalPoints: HistoricalPoint[] = [];
    let cumulativePoints = 0;

    for (const gameweek of completedGameweeks) {
      const [weeklyScore] = await db
        .select()
        .from(weeklyScores)
        .where(
          and(
            eq(weeklyScores.playerId, playerId),
            eq(weeklyScores.gameweekId, gameweek.id)
          )
        );

      const points = weeklyScore?.totalPoints || 0;
      cumulativePoints += points;

      historicalPoints.push({
        gameweekId: gameweek.id,
        gameweekName: gameweek.name,
        points,
        cumulativePoints,
      });
    }

    return historicalPoints;
  }

  async getPlayerComparison(player1Id: number, player2Id: number): Promise<PlayerComparison> {
    const [player1, player2] = await Promise.all([
      this.getPlayer(player1Id),
      this.getPlayer(player2Id),
    ]);

    if (!player1 || !player2) {
      throw new Error("One or both players not found");
    }

    // Get all completed gameweeks in order
    const completedGameweeks = await db
      .select()
      .from(gameweeks)
      .where(eq(gameweeks.isComplete, true))
      .orderBy(gameweeks.id);

    const gameweekComparisons: PlayerComparison["gameweeks"] = [];
    let player1Cumulative = 0;
    let player2Cumulative = 0;

    for (const gameweek of completedGameweeks) {
      const [score1, score2] = await Promise.all([
        db
          .select()
          .from(weeklyScores)
          .where(
            and(
              eq(weeklyScores.playerId, player1Id),
              eq(weeklyScores.gameweekId, gameweek.id)
            )
          ),
        db
          .select()
          .from(weeklyScores)
          .where(
            and(
              eq(weeklyScores.playerId, player2Id),
              eq(weeklyScores.gameweekId, gameweek.id)
            )
          ),
      ]);

      const player1Points = score1[0]?.totalPoints || 0;
      const player2Points = score2[0]?.totalPoints || 0;

      player1Cumulative += player1Points;
      player2Cumulative += player2Points;

      gameweekComparisons.push({
        gameweekId: gameweek.id,
        gameweekName: gameweek.name,
        player1Points,
        player2Points,
        player1Cumulative,
        player2Cumulative,
      });
    }

    return {
      player1Id,
      player1Name: player1.name,
      player2Id,
      player2Name: player2.name,
      gameweeks: gameweekComparisons,
    };
  }
}

export const storage = new DatabaseStorage();
