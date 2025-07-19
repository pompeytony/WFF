import { db } from "./db";
import { players, gameweeks, fixtures, weeklyScores } from "@shared/schema";

export async function seedDatabase() {
  console.log("🌱 Seeding database...");

  try {
    // Check if data already exists
    const existingPlayers = await db.select().from(players);
    if (existingPlayers.length > 0) {
      console.log("📊 Database already has data, skipping seed");
      return;
    }

    // Create test players
    const testPlayers = [
      { name: "John Smith", email: "john@example.com" },
      { name: "Sarah Johnson", email: "sarah@example.com" },
      { name: "Mike Wilson", email: "mike@example.com" },
      { name: "Emma Davis", email: "emma@example.com" },
      { name: "Tom Brown", email: "tom@example.com" },
    ];

    const createdPlayers = await db.insert(players).values(testPlayers).returning();
    console.log(`✅ Created ${createdPlayers.length} players`);

    // Create active gameweek
    const activeGameweek = await db.insert(gameweeks).values({
      name: "Gameweek 15",
      type: "premier-league",
      deadline: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
      isActive: true,
      isComplete: false,
    }).returning();

    console.log(`✅ Created active gameweek: ${activeGameweek[0].name}`);

    // Create test fixtures for active gameweek
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

    const fixturesWithGameweek = testFixtures.map(fixture => ({
      ...fixture,
      gameweekId: activeGameweek[0].id,
    }));

    const createdFixtures = await db.insert(fixtures).values(fixturesWithGameweek).returning();
    console.log(`✅ Created ${createdFixtures.length} fixtures for active gameweek`);

    // Create previous completed gameweek
    const prevGameweek = await db.insert(gameweeks).values({
      name: "Gameweek 14",
      type: "premier-league",
      deadline: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      isActive: false,
      isComplete: true,
    }).returning();

    console.log(`✅ Created completed gameweek: ${prevGameweek[0].name}`);

    // Create some completed fixtures for previous week
    const prevFixtures = [
      { homeTeam: "Arsenal", awayTeam: "Liverpool", homeScore: 2, awayScore: 1, isComplete: true },
      { homeTeam: "Chelsea", awayTeam: "Brighton", homeScore: 3, awayScore: 0, isComplete: true },
    ];

    const completedFixturesWithGameweek = prevFixtures.map(fixture => ({
      ...fixture,
      gameweekId: prevGameweek[0].id,
      kickoffTime: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    }));

    await db.insert(fixtures).values(completedFixturesWithGameweek);
    console.log(`✅ Created ${prevFixtures.length} completed fixtures`);

    // Create weekly scores for previous gameweek
    const scores = [247, 235, 222, 218, 205];
    const weeklyScoreData = createdPlayers.map((player, index) => ({
      playerId: player.id,
      gameweekId: prevGameweek[0].id,
      totalPoints: scores[index] || 200 - index * 5,
      isManagerOfWeek: index === 0,
    }));

    await db.insert(weeklyScores).values(weeklyScoreData);
    console.log(`✅ Created weekly scores for ${createdPlayers.length} players`);

    console.log("🎉 Database seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}