import React, { useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { Badge } from '@/components/Badge';
import { ParentSummary } from '@/components/ParentSummary';
import { Button } from '@/components/ui/button';

export default function CompletionScreen() {
  const { sessionId } = useParams();
  const [, setLocation] = useLocation();
  const { user } = useUser();
  
  // Fetch session data
  const { data: session, isLoading: isSessionLoading } = useQuery({
    queryKey: [`/api/sessions/${sessionId}`],
    queryFn: async () => {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch session');
      return response.json();
    },
    enabled: !!sessionId && !!user
  });
  
  // Fetch topic data
  const { data: topic, isLoading: isTopicLoading } = useQuery({
    queryKey: [`/api/topics/${session?.topicId}`],
    queryFn: async () => {
      const response = await fetch(`/api/topics/${session?.topicId}`);
      if (!response.ok) throw new Error('Failed to fetch topic');
      return response.json();
    },
    enabled: !!session?.topicId
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
  
  // Fetch parent summaries
  const { data: summaries, isLoading: isSummariesLoading } = useQuery({
    queryKey: [`/api/users/${user?.id}/summaries`],
    queryFn: async () => {
      if (!user) throw new Error('User not logged in');
      const response = await fetch(`/api/users/${user.id}/summaries`);
      if (!response.ok) throw new Error('Failed to fetch summaries');
      return response.json();
    },
    enabled: !!user
  });
  
  // Redirect if no user
  useEffect(() => {
    if (!user) {
      setLocation('/');
    }
  }, [user, setLocation]);
  
  const handleContinueToDashboard = () => {
    setLocation('/dashboard');
  };
  
  const handlePreviewDayTwo = () => {
    // Get the next topic (e.g., from Fractions to Decimals)
    if (topic && topic.id) {
      // Assuming topics are ordered by id
      setLocation(`/learning/${topic.id + 1}`);
    } else {
      setLocation('/dashboard');
    }
  };
  
  const isLoading = isSessionLoading || isTopicLoading || isBadgesLoading || isSummariesLoading;
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading your achievements...</span>
      </div>
    );
  }
  
  if (!session || !topic || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-bold text-primary mb-4">Error</h1>
        <p className="text-neutral-600 mb-6">Could not load completion details.</p>
        <Button onClick={() => setLocation('/dashboard')}>
          Return to Dashboard
        </Button>
      </div>
    );
  }
  
  // Find the badge for this topic
  const topicBadge = badges?.find(b => b.badgeName.includes(topic.name));
  
  // Calculate session metrics
  const accuracy = session.questionsCorrect > 0 
    ? Math.round((session.questionsCorrect / session.questionsAttempted) * 100) 
    : 0;
  
  // Find the summary for this session
  const sessionSummary = summaries?.find(s => s.sessionId === parseInt(sessionId));
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 p-6 flex flex-col justify-center items-center">
        <div className="badge-animation mb-8">
          <Badge 
            name={topicBadge?.badgeName || `${topic.name} Explorer`} 
            size="lg"
            xpPoints={session.xpEarned || 25}
          />
        </div>

        <h1 className="text-3xl font-bold font-heading text-primary text-center mb-2">
          {topicBadge?.badgeName || `${topic.name} Explorer`} Unlocked!
        </h1>
        <p className="text-neutral-600 text-center mb-6">
          You completed today's goal with {accuracy}% accuracy
        </p>

        <div className="w-full bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="font-heading font-medium text-lg mb-4">Today's Achievement</h2>

          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-primary bg-opacity-10 rounded-full flex items-center justify-center text-primary mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Completed {session.questionsAttempted} questions</p>
                <p className="text-sm text-neutral-500">Topic: {topic.name}</p>
              </div>
            </div>
            <span className="text-success font-medium">{accuracy}%</span>
          </div>

          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-secondary bg-opacity-10 rounded-full flex items-center justify-center text-secondary mr-3 streak-flame">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <p className="font-medium">Learning Streak</p>
                <p className="text-sm text-neutral-500">Keep it going!</p>
              </div>
            </div>
            <span className="text-secondary font-medium">{user.streak} day{user.streak !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {sessionSummary && (
          <ParentSummary
            username={user.name}
            topicName={topic.name}
            accuracy={accuracy}
            streak={user.streak}
            className="mb-6"
          />
        )}

        <Button 
          onClick={handleContinueToDashboard} 
          className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200 mb-3"
        >
          Continue to Dashboard
        </Button>
        <button 
          onClick={handlePreviewDayTwo} 
          className="text-primary font-medium"
        >
          Preview Day 2 →
        </button>
      </div>
    </div>
  );
}
