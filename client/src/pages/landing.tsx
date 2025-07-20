import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient, setAuthToken } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const { toast } = useToast();

  // Fetch existing players for dropdown
  const { data: players } = useQuery({
    queryKey: ["/api/players/public"],
    enabled: showLogin && !isNewUser,
  });

  const existingPlayerLoginMutation = useMutation({
    mutationFn: async (data: { email: string }) => {
      const response = await apiRequest("POST", "/api/auth/existing-login", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Login response:", data);
      if (data.token) {
        setAuthToken(data.token);
      }
      toast({
        title: "Welcome back!",
        description: `Good to see you again, ${data.user?.name}!`,
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    },
  });

  const newPlayerLoginMutation = useMutation({
    mutationFn: async (data: { name: string; email: string }) => {
      const response = await apiRequest("POST", "/api/auth/simple-login", data);
      return response.json();
    },
    onSuccess: (data) => {
      console.log("Login response:", data);
      if (data.token) {
        setAuthToken(data.token);
      }
      toast({
        title: "Welcome!",
        description: "You've successfully joined the league",
      });
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
        window.location.reload();
      }, 1000);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    },
  });

  const handleExistingPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const playersArray = Array.isArray(players) ? players : [];
    const selectedPlayer = playersArray.find((p: any) => p.id.toString() === selectedPlayerId);
    if (selectedPlayer && email.trim()) {
      if (selectedPlayer.email.toLowerCase() !== email.toLowerCase()) {
        toast({
          title: "Email mismatch",
          description: "The email doesn't match the selected player",
          variant: "destructive",
        });
        return;
      }
      existingPlayerLoginMutation.mutate({ email: selectedPlayer.email });
    }
  };

  const handleNewPlayerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      newPlayerLoginMutation.mutate({ name: name.trim(), email: email.trim() });
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-football-navy via-blue-900 to-football-navy flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              {isNewUser ? "Join the League" : "Sign In"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!isNewUser ? (
              // Existing player login
              <form onSubmit={handleExistingPlayerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="player-select" className="text-white font-medium mb-2 block">
                    Select Your Name
                  </Label>
                  <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900">
                      <SelectValue placeholder="Choose your name from the list" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(players) && players.map((player: any) => (
                        <SelectItem key={player.id} value={player.id.toString()}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="email" className="text-white font-medium mb-2 block">
                    Confirm Your Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email to confirm"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-red-accent hover:bg-red-accent-dark text-white font-semibold"
                    disabled={existingPlayerLoginMutation.isPending || !selectedPlayerId}
                  >
                    {existingPlayerLoginMutation.isPending && (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    )}
                    Sign In
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => setIsNewUser(true)}
                  >
                    I'm a New Player
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => setShowLogin(false)}
                  >
                    Back
                  </Button>
                </div>
              </form>
            ) : (
              // New player registration
              <form onSubmit={handleNewPlayerSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-white font-medium mb-2 block">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-white font-medium mb-2 block">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Button 
                    type="submit" 
                    className="w-full bg-red-accent hover:bg-red-accent-dark text-white font-semibold"
                    disabled={newPlayerLoginMutation.isPending}
                  >
                    {newPlayerLoginMutation.isPending && (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    )}
                    Join League
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => {
                      setIsNewUser(false);
                      setName("");
                      setEmail("");
                    }}
                  >
                    Back to Existing Players
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10"
                    onClick={() => setShowLogin(false)}
                  >
                    Back to Home
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-blue-dark via-royal-blue to-royal-blue-light">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚽ Williams Friends & Family League
          </h1>
          <p className="text-xl text-white mb-8">
            Predict match results, compete with friends, and climb the leaderboard!
          </p>
          
          <Button 
            className="bg-red-accent hover:bg-red-accent-dark text-white px-8 py-3 text-lg font-semibold border-2 border-white shadow-lg"
            onClick={() => setShowLogin(true)}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Sign In / Join League
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-royal-blue-dark text-center">
                <i className="fas fa-futbol text-red-accent text-3xl mb-3 block"></i>
                Make Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-center">
                Predict the exact scores of upcoming matches and use your joker wisely for double points!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-royal-blue-dark text-center">
                <i className="fas fa-trophy text-red-accent text-3xl mb-3 block"></i>
                Compete & Win
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-center">
                Climb the league table and become Manager of the Week. Track your progress throughout the season!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-sm border-2 border-white shadow-xl">
            <CardHeader>
              <CardTitle className="text-royal-blue-dark text-center">
                <i className="fas fa-users text-red-accent text-3xl mb-3 block"></i>
                Play with Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 text-center">
                Join your friends in exciting prediction battles and see who knows football best!
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-football-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-football-navy font-bold text-xl">1</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Sign In</h3>
              <p className="text-blue-100 text-sm">Join the league with your account</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-football-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-football-navy font-bold text-xl">2</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Predict</h3>
              <p className="text-blue-100 text-sm">Submit your score predictions</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-football-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-football-navy font-bold text-xl">3</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Watch</h3>
              <p className="text-blue-100 text-sm">Follow the matches and results</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-football-gold rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-football-navy font-bold text-xl">4</span>
              </div>
              <h3 className="text-white font-semibold mb-2">Win</h3>
              <p className="text-blue-100 text-sm">Earn points and climb the table!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}