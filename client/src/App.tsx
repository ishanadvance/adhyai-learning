import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import { UserContextProvider } from "./context/UserContext";
import Onboarding from "./pages/Onboarding";
import DiagnosticTest from "./pages/DiagnosticTest";
import LearningSession from "./pages/LearningSession";
import CompletionScreen from "./pages/CompletionScreen";
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Onboarding} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/diagnostic/:topicId" component={DiagnosticTest} />
      <Route path="/learning/:topicId" component={LearningSession} />
      <Route path="/completion/:sessionId" component={CompletionScreen} />
      <Route path="/dashboard" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <UserContextProvider>
        <div className="max-w-md mx-auto min-h-screen flex flex-col relative">
          <Router />
          <Toaster />
        </div>
      </UserContextProvider>
    </QueryClientProvider>
  );
}

export default App;
