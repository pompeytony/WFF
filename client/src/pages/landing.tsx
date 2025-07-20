import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Landing() {
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
            onClick={() => window.location.href = '/api/login'}
          >
            <i className="fas fa-sign-in-alt mr-2"></i>
            Sign In to Play
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