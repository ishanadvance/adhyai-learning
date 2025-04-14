import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { ProgressBar } from '@/components/ProgressBar';
import { Badge } from '@/components/Badge';
import { StreakCalendar } from '@/components/StreakCalendar';
import { NavigationBar } from '@/components/NavigationBar';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/UserContext';

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const { user } = useUser();
  
  // Redirect if no user
  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);
  
  // Fetch topics data
  const { data: topics, isLoading: isTopicsLoading } = useQuery({
    queryKey: ['/api/topics', { subject: user?.currentSubject }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ subject: user?.currentSubject || 'Mathematics' });
      const response = await fetch(`/api/topics?${searchParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch topics');
      return response.json();
    },
    enabled: !!user
  });
  
  // Fetch user progress
  const { data: userProgress, isLoading: isProgressLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/progress`],
    queryFn: async () => {
      if (!user) throw new Error('User not logged in');
      const response = await fetch(`/api/users/${user.id}/progress`);
      if (!response.ok) throw new Error('Failed to fetch user progress');
      return response.json();
    },
    enabled: !!user
  });
  
  // Fetch user badges
  const { data: badges, isLoading: isBadgesLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/badges`],
    queryFn: async () => {
      if (!user) throw new Error('User not logged in');
      const response = await fetch(`/api/users/${user.id}/badges`);
      if (!response.ok) throw new Error('Failed to fetch badges');
      return response.json();
    },
    enabled: !!user
  });
  
  const handleStartTopic = (topicId: number) => {
    // Check if user has already done a diagnostic for this topic
    const progress = userProgress?.find((p: any) => p.topicId === topicId);
    
    if (progress) {
      // User has already done diagnostic, go to learning session
      setLocation(`/learning/${topicId}`);
    } else {
      // User needs to do diagnostic first
      setLocation(`/diagnostic/${topicId}`);
    }
  };
  
  const isLoading = isTopicsLoading || isProgressLoading || isBadgesLoading || !user;
  
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
        <Button onClick={() => setLocation('/')}>
          Return to Login
        </Button>
      </div>
    );
  }
  
  // Get next unlocked topic
  const nextTopic = topics.find((topic: any) => !topic.isLocked);
  
  // Calculate weekly progress
  const topicsCompletedThisWeek = userProgress?.length || 0;
  const weeklyGoalPercentage = Math.min(100, Math.round((topicsCompletedThisWeek / user.weeklyGoalTopics) * 100));
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm p-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="font-heading font-bold text-lg">Hello, {user.name}!</h1>
            <p className="text-neutral-500 text-sm">Grade {user.grade} • {user.currentSubject} Focus</p>
          </div>
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold">
            {user.name.charAt(0)}
          </div>
        </div>
      </header>

      {/* Main dashboard content */}
      <main className="flex-1 overflow-auto p-4">
        {/* Today's goal card */}
        <div className="bg-primary rounded-xl p-5 text-white mb-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="font-heading font-bold text-xl">Today's Goal</h2>
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
              <span className="text-accent mr-2">⚡</span>
              <span>Target: {user.weeklyGoalMinutes} minutes</span>
            </div>
            {nextTopic && (
              <button 
                onClick={() => handleStartTopic(nextTopic.id)} 
                className="px-4 py-2 bg-white text-primary font-medium rounded-lg"
              >
                Start
              </button>
            )}
          </div>
        </div>

        {/* Learning streak */}
        <StreakCalendar 
          currentStreak={user.streak} 
          className="mb-6" 
        />

        {/* Progress overview */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <h2 className="font-heading font-medium text-lg mb-4">Your Progress</h2>
          
          {topics.map((topic: any) => {
            const topicProgress = userProgress?.find((p: any) => p.topicId === topic.id);
            const masteryPercentage = topicProgress ? topicProgress.masteryPercentage : 0;
            
            return (
              <div key={topic.id} className="mb-4">
                <div className="flex justify-between mb-1">
                  <span className="font-medium">{topic.name}</span>
                  {topic.isLocked ? (
                    <span className="text-neutral-500">Locked</span>
                  ) : topicProgress ? (
                    <span className="text-success">{masteryPercentage}% Mastery</span>
                  ) : (
                    <span className="text-neutral-500">0% Mastery</span>
                  )}
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      topic.isLocked 
                        ? 'bg-neutral-400' 
                        : topicProgress 
                          ? 'bg-success' 
                          : 'bg-primary'
                    }`} 
                    style={{ width: `${topic.isLocked ? 0 : masteryPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Badges collection */}
        <div className="bg-white rounded-xl shadow-sm p-5 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-heading font-medium text-lg">Your Badges</h2>
            <a href="#" className="text-primary text-sm font-medium">See all</a>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            {badges && badges.length > 0 ? (
              badges.slice(0, 3).map((badge: any) => (
                <Badge 
                  key={badge.id} 
                  name={badge.badgeName}
                  size="sm"
                />
              ))
            ) : (
              <>
                <Badge 
                  name="First Badge"
                  isLocked={true}
                  size="sm"
                />
                <Badge 
                  name="Second Badge"
                  isLocked={true}
                  size="sm"
                />
                <Badge 
                  name="Third Badge"
                  isLocked={true}
                  size="sm"
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Bottom navigation */}
      <NavigationBar />
    </div>
  );
}
