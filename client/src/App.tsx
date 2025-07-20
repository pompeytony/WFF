import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/navigation";
import Dashboard from "@/pages/dashboard";
import LeagueTable from "@/pages/league-table";
import Results from "@/pages/results";
import Admin from "@/pages/admin";
import Players from "@/pages/players";
import Landing from "@/pages/landing";
import NotFound from "@/pages/not-found";

function Router() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-football-navy mb-4"></i>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Landing />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-royal-blue-dark text-white shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-red-accent rounded-lg flex items-center justify-center">
                <i className="fas fa-futbol text-white text-xl"></i>
              </div>
              <div>
                <h1 className="text-2xl font-bold">Williams Friends & Family League</h1>
                <p className="text-gray-300 text-sm">Gameweek 15 • Premier League</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">Welcome back,</p>
                <p className="font-semibold">{user?.name || user?.email || 'Player'}</p>
              </div>
              <div className="w-10 h-10 bg-football-gray rounded-full flex items-center justify-center">
                <i className="fas fa-user text-gray-300"></i>
              </div>
              <button
                onClick={() => {
                  const token = localStorage.getItem('auth_token');
                  fetch('/api/auth/logout', { 
                    method: 'POST',
                    headers: {
                      Authorization: `Bearer ${token}`
                    }
                  })
                    .then(() => {
                      localStorage.removeItem('auth_token');
                      window.location.reload();
                    });
                }}
                className="text-sm text-gray-300 hover:text-white"
              >
                <i className="fas fa-sign-out-alt mr-1"></i>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <Navigation />

      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/league-table" component={LeagueTable} />
        <Route path="/results" component={Results} />
        <Route path="/admin" component={Admin} />
        <Route path="/players" component={Players} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
