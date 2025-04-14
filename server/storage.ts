import { 
  users, topics, questions, userProgress, userBadges, userSessions, parentSummaries,
  type User, type InsertUser, 
  type Topic, type InsertTopic,
  type Question, type InsertQuestion,
  type UserProgress, type InsertUserProgress,
  type UserBadge, type InsertUserBadge,
  type UserSession, type InsertUserSession,
  type ParentSummary, type InsertParentSummary
} from "@shared/schema";

// Interface for storage CRUD operations
export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<User>): Promise<User | undefined>;
  
  // Topics
  getTopic(id: number): Promise<Topic | undefined>;
  getTopicsBySubject(subject: string): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: number, topicData: Partial<Topic>): Promise<Topic | undefined>;
  
  // Questions
  getQuestion(id: number): Promise<Question | undefined>;
  getQuestionsByTopic(topicId: number): Promise<Question[]>;
  getQuestionsByTopicAndDifficulty(topicId: number, difficulty: number): Promise<Question[]>;
  createQuestion(question: InsertQuestion): Promise<Question>;
  
  // User Progress
  getUserProgress(userId: number, topicId: number): Promise<UserProgress | undefined>;
  getUserProgressByUser(userId: number): Promise<UserProgress[]>;
  createUserProgress(progress: InsertUserProgress): Promise<UserProgress>;
  updateUserProgress(userId: number, topicId: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined>;
  
  // Badges
  getUserBadges(userId: number): Promise<UserBadge[]>;
  createUserBadge(badge: InsertUserBadge): Promise<UserBadge>;
  
  // Sessions
  createUserSession(session: InsertUserSession): Promise<UserSession>;
  updateUserSession(id: number, sessionData: Partial<UserSession>): Promise<UserSession | undefined>;
  getUserSessions(userId: number): Promise<UserSession[]>;
  getUserSession(id: number): Promise<UserSession | undefined>;
  
  // Parent summaries
  createParentSummary(summary: InsertParentSummary): Promise<ParentSummary>;
  getParentSummariesByUser(userId: number): Promise<ParentSummary[]>;
  updateParentSummary(id: number, summaryData: Partial<ParentSummary>): Promise<ParentSummary | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private topics: Map<number, Topic>;
  private questions: Map<number, Question>;
  private userProgress: Map<string, UserProgress>;
  private userBadges: Map<number, UserBadge>;
  private userSessions: Map<number, UserSession>;
  private parentSummaries: Map<number, ParentSummary>;
  
  private currentIds: {
    users: number;
    topics: number;
    questions: number;
    userProgress: number;
    userBadges: number;
    userSessions: number;
    parentSummaries: number;
  };

  constructor() {
    this.users = new Map();
    this.topics = new Map();
    this.questions = new Map();
    this.userProgress = new Map();
    this.userBadges = new Map();
    this.userSessions = new Map();
    this.parentSummaries = new Map();
    
    this.currentIds = {
      users: 1,
      topics: 1,
      questions: 1,
      userProgress: 1,
      userBadges: 1,
      userSessions: 1,
      parentSummaries: 1
    };
    
    // Initialize with some math topics
    this.initializeData();
  }

  private initializeData() {
    // Add math topics
    const topics = [
      { name: "Fractions", subject: "Mathematics", order: 1, isLocked: false },
      { name: "Decimals", subject: "Mathematics", order: 2, isLocked: true },
      { name: "Percentages", subject: "Mathematics", order: 3, isLocked: true }
    ];
    
    topics.forEach(topic => this.createTopic(topic));
    
    // Add fraction questions with different difficulty levels
    const fractionTopic = Array.from(this.topics.values()).find(t => t.name === "Fractions");
    if (fractionTopic) {
      const fractionQuestions = [
        {
          topicId: fractionTopic.id,
          text: "What is 1/4 + 2/4 equal to?",
          options: ["1/2", "3/4", "3/8", "Cannot add"],
          correctOption: 1,
          difficulty: 1,
          hint: "When adding fractions with the same denominator, add the numerators and keep the denominator the same."
        },
        {
          topicId: fractionTopic.id,
          text: "If you have 3/4 of a pizza and eat 1/4, how much do you have left?",
          options: ["1/2", "1/4", "2/4", "1/8"],
          correctOption: 0,
          difficulty: 1,
          hint: "Try visualizing the pizza. If you start with 3/4 of the whole pizza and remove 1/4 of the whole pizza, how many pieces are left?"
        },
        {
          topicId: fractionTopic.id,
          text: "Which fraction is equivalent to 2/6?",
          options: ["1/3", "2/3", "4/6", "1/6"],
          correctOption: 0,
          difficulty: 2,
          hint: "Simplify by finding the greatest common divisor of 2 and 6, then divide both the numerator and denominator by it."
        }
      ];
      
      fractionQuestions.forEach(question => this.createQuestion(question));
    }
    
    // Add decimal questions
    const decimalTopic = Array.from(this.topics.values()).find(t => t.name === "Decimals");
    if (decimalTopic) {
      const decimalQuestions = [
        {
          topicId: decimalTopic.id,
          text: "Convert 0.25 to a fraction in its simplest form.",
          options: ["1/4", "2/5", "25/100", "1/25"],
          correctOption: 0,
          difficulty: 1,
          hint: "To convert a decimal to a fraction, place the decimal number over a power of 10."
        },
        {
          topicId: decimalTopic.id,
          text: "What is 0.7 + 0.35?",
          options: ["0.105", "1.05", "10.5", "1.05"],
          correctOption: 1,
          difficulty: 1,
          hint: "Line up the decimal points before adding."
        }
      ];
      
      decimalQuestions.forEach(question => this.createQuestion(question));
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const now = new Date();
    const user: User = { 
      ...insertUser, 
      id,
      xpPoints: 0,
      streak: 0,
      lastActive: now
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, userData: Partial<User>): Promise<User | undefined> {
    const user = await this.getUser(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Topic methods
  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async getTopicsBySubject(subject: string): Promise<Topic[]> {
    return Array.from(this.topics.values())
      .filter(topic => topic.subject === subject)
      .sort((a, b) => a.order - b.order);
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = this.currentIds.topics++;
    const topic: Topic = { ...insertTopic, id };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: number, topicData: Partial<Topic>): Promise<Topic | undefined> {
    const topic = await this.getTopic(id);
    if (!topic) return undefined;
    
    const updatedTopic = { ...topic, ...topicData };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  // Question methods
  async getQuestion(id: number): Promise<Question | undefined> {
    return this.questions.get(id);
  }

  async getQuestionsByTopic(topicId: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.topicId === topicId);
  }

  async getQuestionsByTopicAndDifficulty(topicId: number, difficulty: number): Promise<Question[]> {
    return Array.from(this.questions.values())
      .filter(question => question.topicId === topicId && question.difficulty === difficulty);
  }

  async createQuestion(insertQuestion: InsertQuestion): Promise<Question> {
    const id = this.currentIds.questions++;
    const question: Question = { ...insertQuestion, id };
    this.questions.set(id, question);
    return question;
  }

  // User Progress methods
  async getUserProgress(userId: number, topicId: number): Promise<UserProgress | undefined> {
    const key = `${userId}_${topicId}`;
    return this.userProgress.get(key);
  }

  async getUserProgressByUser(userId: number): Promise<UserProgress[]> {
    return Array.from(this.userProgress.values())
      .filter(progress => progress.userId === userId);
  }

  async createUserProgress(insertProgress: InsertUserProgress): Promise<UserProgress> {
    const id = this.currentIds.userProgress++;
    const now = new Date();
    const progress: UserProgress = { 
      ...insertProgress, 
      id,
      questionsAttempted: 0,
      questionsCorrect: 0,
      lastAttempted: now
    };
    
    const key = `${progress.userId}_${progress.topicId}`;
    this.userProgress.set(key, progress);
    return progress;
  }

  async updateUserProgress(userId: number, topicId: number, progressData: Partial<UserProgress>): Promise<UserProgress | undefined> {
    const key = `${userId}_${topicId}`;
    const progress = this.userProgress.get(key);
    if (!progress) return undefined;
    
    const updatedProgress = { ...progress, ...progressData, lastAttempted: new Date() };
    this.userProgress.set(key, updatedProgress);
    return updatedProgress;
  }

  // User Badge methods
  async getUserBadges(userId: number): Promise<UserBadge[]> {
    return Array.from(this.userBadges.values())
      .filter(badge => badge.userId === userId);
  }

  async createUserBadge(insertBadge: InsertUserBadge): Promise<UserBadge> {
    const id = this.currentIds.userBadges++;
    const now = new Date();
    const badge: UserBadge = { 
      ...insertBadge, 
      id, 
      dateEarned: now 
    };
    this.userBadges.set(id, badge);
    return badge;
  }

  // User Session methods
  async createUserSession(insertSession: InsertUserSession): Promise<UserSession> {
    const id = this.currentIds.userSessions++;
    const now = new Date();
    const session: UserSession = { 
      ...insertSession, 
      id,
      startTime: now,
      endTime: null,
      questionsAttempted: 0,
      questionsCorrect: 0,
      xpEarned: 0,
      summary: null
    };
    this.userSessions.set(id, session);
    return session;
  }

  async updateUserSession(id: number, sessionData: Partial<UserSession>): Promise<UserSession | undefined> {
    const session = await this.getUserSession(id);
    if (!session) return undefined;
    
    const updatedSession = { ...session, ...sessionData };
    this.userSessions.set(id, updatedSession);
    return updatedSession;
  }

  async getUserSessions(userId: number): Promise<UserSession[]> {
    return Array.from(this.userSessions.values())
      .filter(session => session.userId === userId);
  }

  async getUserSession(id: number): Promise<UserSession | undefined> {
    return this.userSessions.get(id);
  }

  // Parent Summary methods
  async createParentSummary(insertSummary: InsertParentSummary): Promise<ParentSummary> {
    const id = this.currentIds.parentSummaries++;
    const summary: ParentSummary = { 
      ...insertSummary, 
      id,
      sent: false,
      sentAt: null
    };
    this.parentSummaries.set(id, summary);
    return summary;
  }

  async getParentSummariesByUser(userId: number): Promise<ParentSummary[]> {
    return Array.from(this.parentSummaries.values())
      .filter(summary => summary.userId === userId);
  }

  async updateParentSummary(id: number, summaryData: Partial<ParentSummary>): Promise<ParentSummary | undefined> {
    const summary = this.parentSummaries.get(id);
    if (!summary) return undefined;
    
    const updatedSummary = { ...summary, ...summaryData };
    this.parentSummaries.set(id, updatedSummary);
    return updatedSummary;
  }
}

export const storage = new MemStorage();
