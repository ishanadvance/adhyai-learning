import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  name: string;
  grade: number;
  language: string;
  weeklyGoalTopics: number;
  weeklyGoalMinutes: number;
  currentSubject: string;
  xpPoints: number;
  streak: number;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: RegisterUser) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

interface RegisterUser {
  name: string;
  username: string;
  password: string;
  grade: number;
  language: string;
  parentContact?: string;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserContextProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  // Check if user is stored in localStorage on initial render
  useEffect(() => {
    const storedUser = localStorage.getItem("adhyai_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
        localStorage.removeItem("adhyai_user");
      }
    }
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("POST", "/api/login", { username, password });
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("adhyai_user", JSON.stringify(userData));
      setLocation("/dashboard");
      toast({
        title: "Login successful",
        description: `Welcome back, ${userData.name}!`,
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Login failed",
        description: (err as Error).message || "Invalid username or password",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterUser) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("POST", "/api/register", userData);
      const newUser = await response.json();
      setUser(newUser);
      localStorage.setItem("adhyai_user", JSON.stringify(newUser));
      setLocation("/");
      toast({
        title: "Registration successful",
        description: `Welcome to Adhyai, ${newUser.name}!`,
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Registration failed",
        description: (err as Error).message || "Could not create account",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("adhyai_user");
    setLocation("/");
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    setLoading(true);
    setError(null);
    try {
      const response = await apiRequest("PATCH", `/api/users/${user.id}`, userData);
      const updatedUser = await response.json();
      setUser(updatedUser);
      localStorage.setItem("adhyai_user", JSON.stringify(updatedUser));
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      });
    } catch (err) {
      setError(err as Error);
      toast({
        title: "Update failed",
        description: (err as Error).message || "Could not update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContext.Provider value={{ user, loading, error, login, register, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserContextProvider");
  }
  return context;
}
