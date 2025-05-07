import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useUser } from '@/context/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useLocation } from 'wouter';
import { FractionIcon, DecimalIcon, PercentageIcon } from '@/lib/icons';
import { SiGoogle } from 'react-icons/si';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const userInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  grade: z.string().refine((val) => !isNaN(parseInt(val)), {
    message: "Please select a grade"
  }),
  language: z.string().min(1, "Please select a language")
});

interface OnboardingStepsProps {
  onComplete: () => void;
}

export function OnboardingSteps({ onComplete }: OnboardingStepsProps) {
  const [step, setStep] = useState(1);
  const { register } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [weeklyGoal, setWeeklyGoal] = useState(3); // Default: 3 topics per week
  const [subject, setSubject] = useState('Mathematics'); // Default: Mathematics

  const form = useForm<z.infer<typeof userInfoSchema>>({
    resolver: zodResolver(userInfoSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      grade: '8',
      language: 'english'
    }
  });

  const handleStep1Submit = () => {
    if (form.formState.isValid) {
      setStep(2);
    } else {
      form.trigger();
    }
  };

  const handleGoogleSignUp = () => {
    setIsGoogleLoading(true);

    // Simulate Google sign-in with a timeout
    setTimeout(() => {
      toast({
        title: "Google Sign Up",
        description: "Google sign-up functionality coming soon!",
        variant: "default",
      });
      setIsGoogleLoading(false);
    }, 1500);
  };

  const handleLoginClick = () => {
    setLocation('/auth');
  };

  const handleStep2Submit = async () => {
    try {
      const formValues = form.getValues();

      await register({
        username: formValues.email, // quick fix: alias email to username
        email: formValues.email,
        name: formValues.name,
        password: formValues.password,
        grade: parseInt(formValues.grade),
        language: formValues.language,
        weeklyGoalTopics: weeklyGoal,
        weeklyGoalMinutes: 15,
        currentSubject: subject
      });

      setStep(3);
      onComplete();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  const renderStep1 = () => (
    <div id="step1" className="min-h-screen flex flex-col p-6 bg-gray-900">
      <div className="mb-8 text-center">
        <div className="h-16 bg-primary text-white flex items-center justify-center rounded-lg mb-4">
          <h1 className="text-2xl font-bold">Adhyai</h1>
        </div>
        <h1 className="text-3xl font-bold font-heading text-blue-400">Welcome to Adhyai!</h1>
        <p className="text-white mt-2">Let's personalize your learning journey</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-6 mb-6">
          <Form {...form}>
            <form onSubmit={(e) => { e.preventDefault(); handleStep1Submit(); }} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Your Name</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Aarav" 
                        {...field} 
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Email</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Add your email" 
                        {...field} 
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password"
                        placeholder="Create a password" 
                        {...field} 
                        className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-300">
                      Password should be at least 6 characters long. Use a mix of letters and numbers for better security.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Your Grade</FormLabel>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pr-10 rounded-lg border border-neutral-700 bg-gray-900 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...field}
                      >
                        <option value="6">Grade 6</option>
                        <option value="7">Grade 7</option>
                        <option value="8">Grade 8</option>
                        <option value="9">Grade 9</option>
                        <option value="10">Grade 10</option>
                        <option value="11">Grade 11</option>
                        <option value="12">Grade 12</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white">
                        ▼
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white font-medium">Preferred Language</FormLabel>
                    <div className="relative">
                      <select
                        className="w-full px-4 py-3 pr-10 rounded-lg border border-neutral-700 bg-gray-900 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        {...field}
                      >
                        <option value="english">English</option>
                      </select>
                      <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-white">
                        ▼
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded-lg transition duration-200 border border-white"
              >
                Sign Up
              </Button>
            </form>
          </Form>

          <div className="relative flex items-center w-full my-6">
            <div className="flex-grow border-t border-white/30"></div>
            <span className="mx-4 text-white text-sm">or</span>
            <div className="flex-grow border-t border-white/30"></div>
          </div>

          <Button 
            variant="outline"
            onClick={handleGoogleSignUp}
            disabled={isGoogleLoading}
            className="w-full flex items-center justify-center gap-2 border border-white py-3 px-4 rounded-lg hover:bg-gray-800 text-white"
          >
            {isGoogleLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SiGoogle className="h-4 w-4 text-blue-400" />
            )}
            Sign up with Google
          </Button>

          <div className="text-center mt-6">
            <p className="text-white text-sm">
              Already have an account?{' '}
              <button 
                onClick={handleLoginClick}
                className="text-blue-400 font-medium hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

        <div className="text-center text-white text-sm mt-4">
          <p>By continuing, you accept our <a href="#" className="text-blue-400">Terms</a> and <a href="#" className="text-blue-400">Privacy Policy</a></p>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div id="step2" className="min-h-screen flex flex-col p-6 bg-gray-900">
      <div className="mb-8">
        <h1 className="text-2xl font-bold font-heading text-blue-400 text-center">Let's set your learning goals</h1>
        <p className="text-white mt-2 text-center">We'll help you stay on track!</p>
      </div>

      <div className="flex-1 flex flex-col justify-center">
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-md p-6 mb-6">
          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Weekly Learning Goal</label>
            <div className="p-4 bg-gray-700 rounded-lg">
              <p className="text-center font-heading font-bold text-xl text-blue-400">
                {weeklyGoal} topics/week, 15 mins/day
              </p>
              <div className="mt-3">
                <input 
                  type="range" 
                  min="1" 
                  max="5" 
                  value={weeklyGoal} 
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-xs text-white mt-1">
                  <span>Beginner</span>
                  <span>Balanced</span>
                  <span>Advanced</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-white font-medium mb-3">Subject Focus</label>
            <div className="grid grid-cols-2 gap-3">
              <button 
                className={`p-4 rounded-lg border-2 ${subject === 'Mathematics' ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600 bg-gray-700'} flex flex-col items-center`}
                onClick={() => setSubject('Mathematics')}
              >
                <span className="text-4xl mb-2">📐</span>
                <span className={`font-medium ${subject === 'Mathematics' ? 'text-blue-400' : 'text-white'}`}>Mathematics</span>
              </button>
              <button 
                className={`p-4 rounded-lg border-2 ${subject === 'Science' ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600 bg-gray-700'} flex flex-col items-center`}
                onClick={() => setSubject('Science')}
              >
                <span className="text-4xl mb-2">🧪</span>
                <span className={`font-medium ${subject === 'Science' ? 'text-blue-400' : 'text-white'}`}>Science</span>
              </button>
              <button 
                className={`p-4 rounded-lg border-2 ${subject === 'English' ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600 bg-gray-700'} flex flex-col items-center`}
                onClick={() => setSubject('English')}
              >
                <span className="text-4xl mb-2">📚</span>
                <span className={`font-medium ${subject === 'English' ? 'text-blue-400' : 'text-white'}`}>English</span>
              </button>
              <button 
                className={`p-4 rounded-lg border-2 ${subject === 'History' ? 'border-blue-400 bg-blue-900/30' : 'border-gray-600 bg-gray-700'} flex flex-col items-center`}
                onClick={() => setSubject('History')}
              >
                <span className="text-4xl mb-2">🏛️</span>
                <span className={`font-medium ${subject === 'History' ? 'text-blue-400' : 'text-white'}`}>History</span>
              </button>
            </div>
          </div>

          <Button 
            onClick={handleStep2Submit} 
            className="w-full bg-primary hover:bg-primary/80 text-white font-bold py-3 px-4 rounded-lg transition duration-200 border border-white"
          >
            Start Learning
          </Button>
        </div>

        <button 
          onClick={() => setStep(1)} 
          className="text-center text-blue-400 font-medium hover:underline mt-2"
        >
          Go Back
        </button>
      </div>
    </div>
  );

  switch (step) {
    case 1:
      return renderStep1();
    case 2:
      return renderStep2();
    default:
      return null;
  }
}
