import React, { useState } from "react";
import { OnboardingSteps } from "@/components/OnboardingSteps";
import { useLocation } from "wouter";
import { useUser } from "@/context/UserContext";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Onboarding() {
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [, setLocation] = useLocation();
  const { user } = useUser();

  // Check if user is already logged in
  React.useEffect(() => {
    if (user) {
      setLocation("/dashboard");
    }
  }, [user, setLocation]);

  const { data: topics, isLoading } = useQuery({
    queryKey: ["/api/topics", { subject: "Mathematics" }],
    queryFn: async () => {
      const searchParams = new URLSearchParams({ subject: "Mathematics" });
      const response = await fetch(`/api/topics?${searchParams.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to fetch topics");
      }
      return response.json();
    },
    enabled: onboardingComplete, // Only fetch topics after onboarding is complete
  });

  const handleOnboardingComplete = () => {
    setOnboardingComplete(true);
  };

  React.useEffect(() => {
    if (topics && topics.length > 0) {
      // Find the first unlocked topic
      const firstTopic = topics.find((topic) => !topic.isLocked);
      if (firstTopic) {
        // Redirect to diagnostic test for the first topic
        setLocation(`/diagnostic/${firstTopic.id}`);
      }
    }
  }, [topics, setLocation]);

  if (onboardingComplete && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-white">
          Preparing your learning journey...
        </span>
      </div>
    );
  }

  return <OnboardingSteps onComplete={handleOnboardingComplete} />;
}
