import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  language: text("language").notNull(),
  password: text("password").notNull(),
  weeklyGoalTopics: integer("weekly_goal_topics").notNull().default(3),
  weeklyGoalMinutes: integer("weekly_goal_minutes").notNull().default(15),
  currentSubject: text("current_subject").notNull().default("Mathematics"),
  xpPoints: integer("xp_points").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  lastActive: timestamp("last_active").notNull().defaultNow(),
  parentContact: text("parent_contact"),
});

export const topics = pgTable("topics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  order: integer("order").notNull(),
  isLocked: boolean("is_locked").notNull().default(true),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  topicId: integer("topic_id").notNull(),
  text: text("text").notNull(),
  options: jsonb("options").notNull(),
  correctOption: integer("correct_option").notNull(),
  difficulty: integer("difficulty").notNull(),
  hint: text("hint"),
});

export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(), 
  masteryPercentage: integer("mastery_percentage").notNull().default(0),
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  questionsCorrect: integer("questions_correct").notNull().default(0),
  lastAttempted: timestamp("last_attempted").notNull().defaultNow(),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  badgeName: text("badge_name").notNull(),
  badgeDescription: text("badge_description").notNull(),
  dateEarned: timestamp("date_earned").notNull().defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  topicId: integer("topic_id").notNull(),
  startTime: timestamp("start_time").notNull().defaultNow(),
  endTime: timestamp("end_time"),
  questionsAttempted: integer("questions_attempted").notNull().default(0),
  questionsCorrect: integer("questions_correct").notNull().default(0),
  xpEarned: integer("xp_earned").notNull().default(0),
  summary: text("summary"),
});

export const parentSummaries = pgTable("parent_summaries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  sessionId: integer("session_id").notNull(),
  content: text("content").notNull(),
  sent: boolean("sent").notNull().default(false),
  sentAt: timestamp("sent_at"),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  xpPoints: true,
  streak: true,
  lastActive: true,
});

export const insertTopicSchema = createInsertSchema(topics).omit({ 
  id: true 
});

export const insertQuestionSchema = createInsertSchema(questions).omit({ 
  id: true 
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({ 
  id: true, 
  questionsAttempted: true,
  questionsCorrect: true,
  lastAttempted: true
});

export const insertUserBadgeSchema = createInsertSchema(userBadges).omit({ 
  id: true,
  dateEarned: true
});

export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ 
  id: true,
  startTime: true,
  endTime: true,
  questionsAttempted: true,
  questionsCorrect: true,
  xpEarned: true,
  summary: true
});

export const insertParentSummarySchema = createInsertSchema(parentSummaries).omit({ 
  id: true,
  sent: true,
  sentAt: true
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Topic = typeof topics.$inferSelect;
export type InsertTopic = z.infer<typeof insertTopicSchema>;

export type Question = typeof questions.$inferSelect;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type UserBadge = typeof userBadges.$inferSelect;
export type InsertUserBadge = z.infer<typeof insertUserBadgeSchema>;

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;

export type ParentSummary = typeof parentSummaries.$inferSelect;
export type InsertParentSummary = z.infer<typeof insertParentSummarySchema>;

// Custom schema for user registration
export const registerUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  grade: z.number().int().min(6).max(12),
  language: z.string(),
  parentContact: z.string().optional(),
});

// Custom schema for login
export const loginSchema = z.object({
  username: z.string(),
  password: z.string()
});
