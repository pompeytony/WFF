import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Fixture } from "@shared/schema";

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  const { data: fixtures } = useQuery({
    queryKey: ["/api/fixtures"],
  });

  const { data: gameweeks } = useQuery({
    queryKey: ["/api/gameweeks"],
  });

  const updateResultMutation = useMutation({
    mutationFn: async ({ fixtureId, homeScore, awayScore }: { fixtureId: number; homeScore: number; awayScore: number }) => {
      return apiRequest("PATCH", `/api/fixtures/${fixtureId}/result`, { homeScore, awayScore });
    },
    onSuccess: () => {
      toast({
        title: "Result updated successfully!",
        description: "Points have been calculated automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      setSelectedFixture(null);
      setHomeScore("");
      setAwayScore("");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating result",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const calculateScoresMutation = useMutation({
    mutationFn: async (gameweekId: number) => {
      return apiRequest("POST", `/api/calculate-scores/${gameweekId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Scores calculated successfully!",
        description: "All weekly scores have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-scores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error calculating scores",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleUpdateResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixture || homeScore === "" || awayScore === "") {
      toast({
        title: "Missing information",
        description: "Please select a fixture and enter both scores",
        variant: "destructive",
      });
      return;
    }

    updateResultMutation.mutate({
      fixtureId: selectedFixture.id,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
    });
  };

  const incompleteFixtures = fixtures?.filter((f: any) => !f.isComplete) || [];
  const completedGameweeks = gameweeks?.filter((gw: any) => gw.isComplete) || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-football-navy mb-2">
          <i className="fas fa-cog mr-2 text-football-green"></i>
          Admin Panel
        </h1>
        <p className="text-gray-600">Manage fixtures, update results, and calculate scores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fixture Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-football-navy">
              <i className="fas fa-futbol mr-2 text-football-green"></i>
              Fixture Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-football-green hover:bg-green-600">
                  <i className="fas fa-edit mr-2"></i>
                  Update Results
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Update Match Result</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateResult} className="space-y-4">
                  <div>
                    <Label htmlFor="fixture-select">Select Fixture</Label>
                    <Select onValueChange={(value) => {
                      const fixture = incompleteFixtures.find((f: any) => f.id === parseInt(value));
                      setSelectedFixture(fixture || null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a fixture to update" />
                      </SelectTrigger>
                      <SelectContent>
                        {incompleteFixtures.map((fixture: any) => (
                          <SelectItem key={fixture.id} value={fixture.id.toString()}>
                            {fixture.homeTeam} vs {fixture.awayTeam}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFixture && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold">{selectedFixture.homeTeam} vs {selectedFixture.awayTeam}</h3>
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <div>
                          <Label htmlFor="home-score">{selectedFixture.homeTeam}</Label>
                          <Input
                            id="home-score"
                            type="number"
                            min="0"
                            max="20"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="w-20 text-center"
                          />
                        </div>
                        <span className="text-2xl font-bold text-gray-400">-</span>
                        <div>
                          <Label htmlFor="away-score">{selectedFixture.awayTeam}</Label>
                          <Input
                            id="away-score"
                            type="number"
                            min="0"
                            max="20"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="w-20 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-football-green hover:bg-green-600"
                    disabled={updateResultMutation.isPending || !selectedFixture}
                  >
                    {updateResultMutation.isPending ? "Updating..." : "Update Result"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button variant="outline" className="w-full">
              <i className="fas fa-plus mr-2"></i>
              Add New Fixtures
            </Button>
          </CardContent>
        </Card>

        {/* Score Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-football-navy">
              <i className="fas fa-calculator mr-2 text-football-gold"></i>
              Score Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Calculate Weekly Scores</Label>
              <div className="space-y-2 mt-2">
                {completedGameweeks.map((gameweek: any) => (
                  <div key={gameweek.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{gameweek.name}</span>
                    <Button
                      size="sm"
                      onClick={() => calculateScoresMutation.mutate(gameweek.id)}
                      disabled={calculateScoresMutation.isPending}
                      className="bg-football-gold hover:bg-yellow-600"
                    >
                      <i className="fas fa-calculator mr-1"></i>
                      Calculate
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/players">
              <Button variant="outline" className="w-full">
                <i className="fas fa-users mr-2"></i>
                Manage Players
              </Button>
            </Link>

            <Button variant="outline" className="w-full">
              <i className="fas fa-chart-bar mr-2"></i>
              Generate Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Fixtures Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-football-navy">
            <i className="fas fa-list mr-2 text-football-green"></i>
            Fixture Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!fixtures || fixtures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No fixtures available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Match</th>
                    <th className="text-center py-3 px-4">Kickoff</th>
                    <th className="text-center py-3 px-4">Score</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fixtures.slice(0, 10).map((fixture: any) => (
                    <tr key={fixture.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-semibold">{fixture.homeTeam} vs {fixture.awayTeam}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-sm">
                          {new Date(fixture.kickoffTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {fixture.isComplete ? (
                          <div className="font-bold font-mono">{fixture.homeScore} - {fixture.awayScore}</div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          fixture.isComplete
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {fixture.isComplete ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Admin;
