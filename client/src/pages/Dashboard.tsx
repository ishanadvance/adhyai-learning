import React, { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { ProgressBar } from "@/components/ProgressBar";
import { Badge } from "@/components/Badge";
import { StreakCalendar } from "@/components/StreakCalendar";
import { NavigationBar } from "@/components/NavigationBar";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/UserContext";

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();

  useEffect(() => {
    if (!user) setLocation("/");
  }, [user, setLocation]);

  const { data: topics, isLoading: isTopicsLoading } = useQuery({
    queryKey: ["/api/topics", { subject: user?.currentSubject }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        subject: user?.currentSubject || "Mathematics",
      });
      const response = await fetch(`/api/topics?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch topics");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: userProgress, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/progress`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/progress`);
      if (!response.ok) throw new Error("Failed to fetch user progress");
      return response.json();
    },
    enabled: !!user,
  });

  const { data: badges, isLoading: isBadgesLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/badges`],
    queryFn: async () => {
      const response = await fetch(`/api/users/${user.id}/badges`);
      if (!response.ok) throw new Error("Failed to fetch badges");
      return response.json();
    },
    enabled: !!user,
  });

  const handleStartTopic = (topicId: number) => {
    const progress = userProgress?.find((p: any) => p.topicId === topicId);
    setLocation(progress ? `/learning/${topicId}` : `/diagnostic/${topicId}`);
  };

  const isLoading =
    isTopicsLoading || isProgressLoading || isBadgesLoading || !user;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your dashboard...</span>
      </div>
    );
  }

  if (!topics || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">Error</h1>
        <p className="text-neutral-600 mb-6">Could not load dashboard data.</p>
        <Button onClick={() => setLocation("/")}>Return to Login</Button>
      </div>
    );
  }

  const nextTopic = topics.find((topic: any) => !topic.isLocked);
  const topicsCompletedThisWeek = userProgress?.length || 0;
  const weeklyGoalPercentage = Math.min(
    100,
    Math.round((topicsCompletedThisWeek / user.weeklyGoalTopics) * 100),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-gray-800 shadow-md p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-heading font-bold text-lg text-white">
              Hello, {user.name}!
            </h1>
            <p className="text-gray-100 text-sm">
              Grade {user.grade} • {user.currentSubject} Focus
            </p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold border border-white">
            {user.name.charAt(0)}
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-auto p-4">
        {/* Today’s Goal Card */}
        <div className="bg-primary rounded-xl p-5 text-white mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-heading font-bold text-xl">Today’s Goal</h2>
            <span className="px-2 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
              {topicsCompletedThisWeek}/{user.weeklyGoalTopics} weekly topics
            </span>
          </div>
          <p className="mb-3">
            {nextTopic
              ? `Continue learning ${nextTopic.name}`
              : "All topics completed! Great job!"}
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <span className="text-yellow-300 mr-2">⚡</span>
              <span className="text-white font-medium">
                Daily Target: {user.weeklyGoalMinutes} minutes of learning
              </span>
            </div>
            {nextTopic && (
              <button
                onClick={() => handleStartTopic(nextTopic.id)}
                className="px-4 py-2 bg-blue-100 text-blue-900 font-bold rounded-lg border-2 border-white hover:bg-blue-200"
              >
                Start Learning
              </button>
            )}
          </div>
        </div>

        {/* Streak Calendar */}
        <StreakCalendar currentStreak={user.streak} className="mb-6" />

        {/* Progress Section */}
        <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-5 mb-6">
          <h2 className="font-heading font-medium text-lg text-white mb-4">
            Your Progress
          </h2>
          {topics.map((topic: any) => {
            const topicProgress = userProgress?.find(
              (p: any) => p.topicId === topic.id,
            );
            const masteryPercentage = topicProgress
              ? topicProgress.masteryPercentage
              : 0;

            return (
              <div key={topic.id} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-white">{topic.name}</span>
                  {topic.isLocked ? (
                    <span className="text-gray-400">Locked</span>
                  ) : topicProgress ? (
                    <span className="text-green-400">
                      {masteryPercentage}% Mastery
                    </span>
                  ) : (
                    <span className="text-gray-100">0% Mastery</span>
                  )}
                </div>
                <div className="w-full bg-gray-600 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      topic.isLocked
                        ? "bg-gray-500"
                        : topicProgress
                          ? "bg-green-500"
                          : "bg-blue-500"
                    }`}
                    style={{
                      width: `${topic.isLocked ? 0 : masteryPercentage}%`,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges Section */}
        <div className="bg-gray-800 rounded-xl shadow-md border border-gray-700 p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-medium text-lg text-white">
              Your Badges
            </h2>
            <button className="text-blue-400 text-sm font-medium hover:underline">
              See all
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {badges && badges.length > 0 ? (
              badges
                .slice(0, 3)
                .map((badge: any) => (
                  <Badge key={badge.id} name={badge.badgeName} size="sm" />
                ))
            ) : (
              <>
                <Badge name="First Badge" isLocked={true} size="sm" />
                <Badge name="Second Badge" isLocked={true} size="sm" />
                <Badge name="Third Badge" isLocked={true} size="sm" />
              </>
            )}
          </div>
        </div>
      </main>

      <NavigationBar />
    </div>
  );
}
