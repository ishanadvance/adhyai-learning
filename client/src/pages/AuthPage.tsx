import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { useUser } from '@/context/UserContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useLocation } from 'wouter';
import { SiGoogle } from 'react-icons/si';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const userLoginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  userType: z.enum(["student", "parent"])
});

const parentLoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

export default function AuthPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user, login, register } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setLocation('/dashboard');
    }
  }, [user, setLocation]);

  const loginForm = useForm<z.infer<typeof userLoginSchema>>({
    resolver: zodResolver(userLoginSchema),
    defaultValues: {
      username: '',
      password: '',
      userType: 'student'
    }
  });

  const parentForm = useForm<z.infer<typeof parentLoginSchema>>({
    resolver: zodResolver(parentLoginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  const handleLoginSubmit = async (values: z.infer<typeof userLoginSchema>) => {
    try {
      if (values.userType === 'parent') {
        // Handle parent login differently if needed
        toast({
          title: "Parent Login",
          description: "Parent login functionality coming soon!",
          variant: "default",
        });
        return;
      }
      
      await login(values.username, values.password);
      // If login is successful, the useEffect will redirect
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Login Failed",
        description: "Invalid credentials. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleParentLoginSubmit = async (values: z.infer<typeof parentLoginSchema>) => {
    // Simulate parent login
    toast({
      title: "Parent Login",
      description: "Parent login functionality coming soon!",
      variant: "default",
    });
  };

  const handleGoogleSignIn = () => {
    setIsGoogleLoading(true);
    
    // Simulate Google sign-in with a timeout
    setTimeout(() => {
      toast({
        title: "Google Sign In",
        description: "Google sign-in functionality coming soon!",
        variant: "default",
      });
      setIsGoogleLoading(false);
    }, 1500);
  };

  const handleSignUpClick = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left side - Auth form */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-center">
          <div className="mb-8 text-center">
            <div className="h-16 bg-primary text-white flex items-center justify-center rounded-lg mb-4">
              <h1 className="text-2xl font-bold">Adhyai</h1>
            </div>
            <h1 className="text-3xl font-bold font-heading text-primary">Welcome Back!</h1>
            <p className="text-neutral-600 mt-2">Continue your learning journey</p>
          </div>

          <Tabs defaultValue="student" className="mb-6">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="student">Student Login</TabsTrigger>
              <TabsTrigger value="parent">Parent Login</TabsTrigger>
            </TabsList>
            
            <TabsContent value="student">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Student Login</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your learning dashboard
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form className="space-y-4" id="login-form">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-700 font-medium">Username</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username" 
                                {...field} 
                                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-700 font-medium">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Enter your password" 
                                {...field} 
                                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Password should be at least 6 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit"
                    form="login-form"
                    onClick={loginForm.handleSubmit(handleLoginSubmit)}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Sign In
                  </Button>
                  
                  <div className="relative flex items-center w-full my-2">
                    <div className="flex-grow border-t border-neutral-300"></div>
                    <span className="mx-4 text-neutral-600 text-sm">or</span>
                    <div className="flex-grow border-t border-neutral-300"></div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2 border border-neutral-300 py-3 px-4 rounded-lg hover:bg-neutral-50"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SiGoogle className="h-4 w-4 text-primary" />
                    )}
                    Sign in with Google
                  </Button>
                  
                  <p className="text-center text-neutral-500 text-sm mt-4">
                    Don't have an account?{' '}
                    <button 
                      onClick={handleSignUpClick}
                      className="text-primary font-medium hover:underline"
                    >
                      Sign Up
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="parent">
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Parent Login</CardTitle>
                  <CardDescription>
                    Access your child's learning progress
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...parentForm}>
                    <form className="space-y-4" id="parent-form">
                      <FormField
                        control={parentForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-700 font-medium">Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="parent@example.com" 
                                {...field} 
                                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={parentForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-neutral-700 font-medium">Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password"
                                placeholder="Enter your password" 
                                {...field} 
                                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary"
                              />
                            </FormControl>
                            <FormDescription className="text-xs">
                              Password should be at least 6 characters long.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  <Button 
                    type="submit"
                    form="parent-form"
                    onClick={parentForm.handleSubmit(handleParentLoginSubmit)}
                    className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 px-4 rounded-lg transition duration-200"
                  >
                    Sign In
                  </Button>
                  
                  <div className="relative flex items-center w-full my-2">
                    <div className="flex-grow border-t border-neutral-300"></div>
                    <span className="mx-4 text-neutral-600 text-sm">or</span>
                    <div className="flex-grow border-t border-neutral-300"></div>
                  </div>
                  
                  <Button 
                    variant="outline"
                    onClick={handleGoogleSignIn}
                    disabled={isGoogleLoading}
                    className="w-full flex items-center justify-center gap-2 border border-neutral-300 py-3 px-4 rounded-lg hover:bg-neutral-50"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <SiGoogle className="h-4 w-4 text-primary" />
                    )}
                    Sign in with Google
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
          
          <div className="text-center text-neutral-500 text-sm mt-4">
            <p>By continuing, you accept our <a href="#" className="text-primary">Terms</a> and <a href="#" className="text-primary">Privacy Policy</a></p>
          </div>
        </div>
        
        {/* Right side - Hero section */}
        <div className="hidden md:block md:w-1/2 bg-primary">
          <div className="flex flex-col items-center justify-center h-full p-8 text-white">
            <h2 className="text-3xl font-bold mb-6">Personalized Learning Journey</h2>
            <p className="text-lg mb-8 text-center">
              Adhyai adapts to your learning pace and style, making education more engaging and effective.
            </p>
            <div className="bg-white/10 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-medium mb-4">Key Features</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Personalized learning paths</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Real-time progress tracking</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Smart difficulty adjustments</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Parent progress updates</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}