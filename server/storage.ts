import { 
  players, gameweeks, fixtures, predictions, weeklyScores,
  type Player, type InsertPlayer,
  type Gameweek, type InsertGameweek,
  type Fixture, type InsertFixture,
  type Prediction, type InsertPrediction,
  type WeeklyScore, type InsertWeeklyScore
} from "@shared/schema";

export interface IStorage {
  // Players
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  
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
}

export class MemStorage implements IStorage {
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
      this.players.set(id, { ...player, id });
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

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const newPlayer: Player = { ...player, id };
    this.players.set(id, newPlayer);
    return newPlayer;
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
      isComplete: false 
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
    const newPrediction: Prediction = { ...prediction, id, points: 0 };
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
}

export const storage = new MemStorage();
