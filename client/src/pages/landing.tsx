import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Landing() {
  const [showLogin, setShowLogin] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (data: { name: string; email: string }) =>
      apiRequest("POST", "/api/auth/simple-login", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Welcome!",
        description: "You've successfully joined the league",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to sign in",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && email.trim()) {
      loginMutation.mutate({ name: name.trim(), email: email.trim() });
    }
  };

  if (showLogin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-football-navy via-blue-900 to-football-navy flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white text-center text-2xl">
              Join the League
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-white">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-white">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                  required
                />
              </div>
              <div className="space-y-2">
                <Button 
                  type="submit" 
                  className="w-full bg-football-green hover:bg-green-600"
                  disabled={loginMutation.isPending}
                >
                  {loginMutation.isPending && (
                    <i className="fas fa-spinner fa-spin mr-2"></i>
                  )}
                  Join League
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
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-football-navy via-blue-900 to-football-navy">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚽ Fantasy Football League
          </h1>
          <p className="text-xl text-blue-100 mb-8">
            Predict match results, compete with friends, and climb the leaderboard!
          </p>
          
          <Button 
            className="bg-football-green hover:bg-green-600 text-white px-8 py-3 text-lg"
            onClick={() => setShowLogin(true)}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Join the League
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                <i className="fas fa-futbol text-football-gold text-3xl mb-3 block"></i>
                Make Predictions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-center">
                Predict the exact scores of upcoming matches and use your joker wisely for double points!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                <i className="fas fa-trophy text-football-gold text-3xl mb-3 block"></i>
                Compete & Win
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-center">
                Climb the league table and become Manager of the Week. Track your progress throughout the season!
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader>
              <CardTitle className="text-white text-center">
                <i className="fas fa-users text-football-gold text-3xl mb-3 block"></i>
                Play with Friends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-100 text-center">
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