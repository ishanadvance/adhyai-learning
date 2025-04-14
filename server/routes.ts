import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { 
  registerUserSchema, 
  loginSchema, 
  insertUserProgressSchema, 
  insertUserSessionSchema, 
  insertParentSummarySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Prefix all routes with /api
  const apiRouter = app.route('/api');

  // User routes
  app.post('/api/register', async (req: Request, res: Response) => {
    try {
      const userData = registerUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(201).json(userWithoutPassword);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.post('/api/login', async (req: Request, res: Response) => {
    try {
      const loginData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(loginData.username);
      if (!user || user.password !== loginData.password) {
        return res.status(401).json({ message: "Invalid username or password" });
      }
      
      // Update user streak and last active
      const now = new Date();
      const lastActive = user.lastActive;
      const dayDifference = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
      
      let streak = user.streak;
      if (dayDifference === 1) {
        // Consecutive day, increase streak
        streak += 1;
      } else if (dayDifference > 1) {
        // Streak broken
        streak = 1;
      }
      
      await storage.updateUser(user.id, { 
        streak,
        lastActive: now
      });
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json({
        ...userWithoutPassword,
        streak
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.get('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = user;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  app.patch('/api/users/:id', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id, 10);
      const userData = req.body;
      
      // Do not allow updating password through this endpoint
      if (userData.password) {
        delete userData.password;
      }
      
      const updatedUser = await storage.updateUser(userId, userData);
      
      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Remove password from response
      const { password, ...userWithoutPassword } = updatedUser;
      
      return res.status(200).json(userWithoutPassword);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update user" });
    }
  });

  // Topic routes
  app.get('/api/topics', async (req: Request, res: Response) => {
    try {
      const subject = req.query.subject as string;
      
      if (!subject) {
        return res.status(400).json({ message: "Subject is required" });
      }
      
      const topics = await storage.getTopicsBySubject(subject);
      return res.status(200).json(topics);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch topics" });
    }
  });

  app.get('/api/topics/:id', async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.id, 10);
      const topic = await storage.getTopic(topicId);
      
      if (!topic) {
        return res.status(404).json({ message: "Topic not found" });
      }
      
      return res.status(200).json(topic);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch topic" });
    }
  });

  // Question routes
  app.get('/api/topics/:topicId/questions', async (req: Request, res: Response) => {
    try {
      const topicId = parseInt(req.params.topicId, 10);
      const difficulty = req.query.difficulty ? parseInt(req.query.difficulty as string, 10) : undefined;
      
      let questions;
      if (difficulty !== undefined) {
        questions = await storage.getQuestionsByTopicAndDifficulty(topicId, difficulty);
      } else {
        questions = await storage.getQuestionsByTopic(topicId);
      }
      
      return res.status(200).json(questions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch questions" });
    }
  });

  // User Progress routes
  app.get('/api/users/:userId/progress', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const progress = await storage.getUserProgressByUser(userId);
      
      return res.status(200).json(progress);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch user progress" });
    }
  });

  app.post('/api/users/:userId/progress', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const progressData = insertUserProgressSchema.parse({
        ...req.body,
        userId
      });
      
      // Check if progress already exists
      const existingProgress = await storage.getUserProgress(userId, progressData.topicId);
      
      if (existingProgress) {
        return res.status(400).json({ message: "Progress for this topic already exists" });
      }
      
      const progress = await storage.createUserProgress(progressData);
      return res.status(201).json(progress);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user progress" });
    }
  });

  app.patch('/api/users/:userId/progress/:topicId', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const topicId = parseInt(req.params.topicId, 10);
      
      const progressData = req.body;
      
      const updatedProgress = await storage.updateUserProgress(userId, topicId, progressData);
      
      if (!updatedProgress) {
        return res.status(404).json({ message: "Progress not found" });
      }
      
      return res.status(200).json(updatedProgress);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update user progress" });
    }
  });

  // User Badge routes
  app.get('/api/users/:userId/badges', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const badges = await storage.getUserBadges(userId);
      
      return res.status(200).json(badges);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch user badges" });
    }
  });

  app.post('/api/users/:userId/badges', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const badgeData = {
        ...req.body,
        userId
      };
      
      const badge = await storage.createUserBadge(badgeData);
      
      // Update user XP
      const user = await storage.getUser(userId);
      if (user) {
        await storage.updateUser(userId, {
          xpPoints: user.xpPoints + 25 // Award XP for earning a badge
        });
      }
      
      return res.status(201).json(badge);
    } catch (error) {
      return res.status(500).json({ message: "Failed to create user badge" });
    }
  });

  // User Session routes
  app.post('/api/users/:userId/sessions', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const sessionData = insertUserSessionSchema.parse({
        ...req.body,
        userId
      });
      
      const session = await storage.createUserSession(sessionData);
      return res.status(201).json(session);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create user session" });
    }
  });

  app.patch('/api/sessions/:id', async (req: Request, res: Response) => {
    try {
      const sessionId = parseInt(req.params.id, 10);
      const sessionData = req.body;
      
      const updatedSession = await storage.updateUserSession(sessionId, sessionData);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // If the session is being completed, update user XP
      if (sessionData.endTime && updatedSession.xpEarned) {
        const user = await storage.getUser(updatedSession.userId);
        if (user) {
          await storage.updateUser(user.id, {
            xpPoints: user.xpPoints + updatedSession.xpEarned
          });
        }
      }
      
      return res.status(200).json(updatedSession);
    } catch (error) {
      return res.status(500).json({ message: "Failed to update session" });
    }
  });

  app.get('/api/users/:userId/sessions', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const sessions = await storage.getUserSessions(userId);
      
      return res.status(200).json(sessions);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch user sessions" });
    }
  });

  // Parent Summary routes
  app.post('/api/users/:userId/summaries', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const summaryData = insertParentSummarySchema.parse({
        ...req.body,
        userId
      });
      
      const summary = await storage.createParentSummary(summaryData);
      return res.status(201).json(summary);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors });
      }
      return res.status(500).json({ message: "Failed to create parent summary" });
    }
  });

  app.get('/api/users/:userId/summaries', async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId, 10);
      const summaries = await storage.getParentSummariesByUser(userId);
      
      return res.status(200).json(summaries);
    } catch (error) {
      return res.status(500).json({ message: "Failed to fetch parent summaries" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
