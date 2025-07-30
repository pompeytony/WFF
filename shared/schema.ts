import { pgTable, text, serial, integer, boolean, timestamp, varchar, jsonb, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(), // e.g., "MAN UTD", "ENGLAND"
  badgeUrl: text("badge_url").notNull(), // SVG or PNG URL for team badge
  league: text("league").notNull(), // "premier-league", "championship", "league-one", "league-two", "international"
  continent: text("continent"), // Only for international teams: "europe", "south-america", "africa", "asia", "north-america", "oceania"
  country: text("country"), // Country code for international teams or club location
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  isAdmin: boolean("is_admin").default(false),
});

export const gameweeks = pgTable("gameweeks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // e.g., "Gameweek 15"
  type: text("type").notNull(), // "premier-league", "international", or "mixed"
  deadline: timestamp("deadline"),
  isActive: boolean("is_active").default(false),
  isComplete: boolean("is_complete").default(false),
});

export const fixtures = pgTable("fixtures", {
  id: serial("id").primaryKey(),
  gameweekId: integer("gameweek_id").references(() => gameweeks.id).notNull(),
  homeTeamId: integer("home_team_id").references(() => teams.id), // Make nullable for migration
  awayTeamId: integer("away_team_id").references(() => teams.id), // Make nullable for migration
  kickoffTime: timestamp("kickoff_time").notNull(),
  homeScore: integer("home_score"),
  awayScore: integer("away_score"),
  isComplete: boolean("is_complete").default(false),
  // Keep legacy fields for backwards compatibility during migration
  homeTeam: text("home_team"),
  awayTeam: text("away_team"),
});

export const predictions = pgTable("predictions", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  fixtureId: integer("fixture_id").references(() => fixtures.id).notNull(),
  homeScore: integer("home_score").notNull(),
  awayScore: integer("away_score").notNull(),
  isJoker: boolean("is_joker").default(false),
  points: integer("points").default(0),
});

export const weeklyScores = pgTable("weekly_scores", {
  id: serial("id").primaryKey(),
  playerId: integer("player_id").references(() => players.id).notNull(),
  gameweekId: integer("gameweek_id").references(() => gameweeks.id).notNull(),
  totalPoints: integer("total_points").default(0),
  isManagerOfWeek: boolean("is_manager_of_week").default(false),
});

// Define relations
export const teamsRelations = relations(teams, ({ many }) => ({
  homeFixtures: many(fixtures, { relationName: "homeTeam" }),
  awayFixtures: many(fixtures, { relationName: "awayTeam" }),
}));

export const playersRelations = relations(players, ({ many }) => ({
  predictions: many(predictions),
  weeklyScores: many(weeklyScores),
}));

export const gameweeksRelations = relations(gameweeks, ({ many }) => ({
  fixtures: many(fixtures),
  weeklyScores: many(weeklyScores),
}));

export const fixturesRelations = relations(fixtures, ({ one, many }) => ({
  gameweek: one(gameweeks, {
    fields: [fixtures.gameweekId],
    references: [gameweeks.id],
  }),
  homeTeam: one(teams, {
    fields: [fixtures.homeTeamId],
    references: [teams.id],
    relationName: "homeTeam",
  }),
  awayTeam: one(teams, {
    fields: [fixtures.awayTeamId],
    references: [teams.id],
    relationName: "awayTeam",
  }),
  predictions: many(predictions),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  player: one(players, {
    fields: [predictions.playerId],
    references: [players.id],
  }),
  fixture: one(fixtures, {
    fields: [predictions.fixtureId],
    references: [fixtures.id],
  }),
}));

export const weeklyScoresRelations = relations(weeklyScores, ({ one }) => ({
  player: one(players, {
    fields: [weeklyScores.playerId],
    references: [players.id],
  }),
  gameweek: one(gameweeks, {
    fields: [weeklyScores.gameweekId],
    references: [gameweeks.id],
  }),
}));

export const upsertUserSchema = createInsertSchema(users);

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  email: true,
});

export const insertGameweekSchema = createInsertSchema(gameweeks).pick({
  name: true,
  type: true,
}).extend({
  deadline: z.string().optional(),
});

export const insertFixtureSchema = createInsertSchema(fixtures).pick({
  gameweekId: true,
  homeTeam: true,
  awayTeam: true,
}).extend({
  kickoffTime: z.string().transform(str => new Date(str)),
});

export const insertTeamSchema = createInsertSchema(teams).pick({
  name: true,
  shortName: true,
  badgeUrl: true,
  league: true,
  continent: true,
  country: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).pick({
  playerId: true,
  fixtureId: true,
  homeScore: true,
  awayScore: true,
  isJoker: true,
});

export const insertWeeklyScoreSchema = createInsertSchema(weeklyScores).pick({
  playerId: true,
  gameweekId: true,
  totalPoints: true,
});

export const updateFixtureResultSchema = z.object({
  homeScore: z.number().min(0),
  awayScore: z.number().min(0),
});

// Update fixture schema to support new team-based fixtures
export const insertFixtureWithTeamsSchema = createInsertSchema(fixtures).pick({
  gameweekId: true,
  homeTeamId: true,
  awayTeamId: true,
}).extend({
  kickoffTime: z.string().transform(str => new Date(str)),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Gameweek = typeof gameweeks.$inferSelect;
export type InsertGameweek = z.infer<typeof insertGameweekSchema>;
export type Fixture = typeof fixtures.$inferSelect;
export type InsertFixture = z.infer<typeof insertFixtureSchema>;
export type InsertFixtureWithTeams = z.infer<typeof insertFixtureWithTeamsSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type WeeklyScore = typeof weeklyScores.$inferSelect;
export type InsertWeeklyScore = z.infer<typeof insertWeeklyScoreSchema>;
export type UpdateFixtureResult = z.infer<typeof updateFixtureResultSchema>;
