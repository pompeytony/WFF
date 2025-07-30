import { 
  users, players, gameweeks, fixtures, predictions, weeklyScores, teams,
  type User, type UpsertUser,
  type Player, type InsertPlayer,
  type Gameweek, type InsertGameweek,
  type Fixture, type InsertFixture,
  type Prediction, type InsertPrediction,
  type WeeklyScore, type InsertWeeklyScore,
  type Team, type InsertTeam, type InsertFixtureWithTeams
} from "@shared/schema";
import { db } from "./db";
import { eq, and, inArray } from "drizzle-orm";

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

  // Teams
  getTeams(): Promise<Team[]>;
  getTeamsByLeague(league: string): Promise<Team[]>;
  getTeamsByContinent(continent: string): Promise<Team[]>;
  getTeam(id: number): Promise<Team | undefined>;
  
  // Gameweeks
  getGameweeks(): Promise<Gameweek[]>;
  getActiveGameweek(): Promise<Gameweek | undefined>;
  createGameweek(gameweek: InsertGameweek): Promise<Gameweek>;
  updateGameweekStatus(id: number, isActive?: boolean, isComplete?: boolean): Promise<void>;
  
  // Fixtures
  getFixtures(): Promise<Fixture[]>;
  getFixturesByGameweek(gameweekId: number): Promise<Fixture[]>;
  createFixture(fixture: InsertFixture): Promise<Fixture>;
  updateFixtureResult(id: number, homeScore: number, awayScore: number): Promise<void>;
  
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
      this.players.set(id, { ...player, id, isAdmin: false });
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
    const newPlayer: Player = { ...player, id, isAdmin: false };
    this.players.set(id, newPlayer);
    return newPlayer;
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

  async updateFixtureResult(id: number, homeScore: number, awayScore: number): Promise<void> {
    const fixture = this.fixtures.get(id);
    if (fixture) {
      fixture.homeScore = homeScore;
      fixture.awayScore = awayScore;
      fixture.isComplete = true;
    }
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
    return player;
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

  // Teams
  async getTeams(): Promise<Team[]> {
    return await db.select().from(teams).orderBy(teams.league, teams.name);
  }

  async getTeamsByLeague(league: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.league, league)).orderBy(teams.name);
  }

  async getTeamsByContinent(continent: string): Promise<Team[]> {
    return await db.select().from(teams).where(eq(teams.continent, continent)).orderBy(teams.name);
  }

  async getTeam(id: number): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
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

  async updateFixtureResult(id: number, homeScore: number, awayScore: number): Promise<void> {
    await db.update(fixtures)
      .set({ homeScore, awayScore, isComplete: true })
      .where(eq(fixtures.id, id));
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
}

export const storage = new DatabaseStorage();
