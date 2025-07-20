import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";

const PredictionsOverview = () => {
  const [selectedGameweekId, setSelectedGameweekId] = useState<string>("");

  const { data: gameweeks } = useQuery({
    queryKey: ["/api/gameweeks"],
  });

  const { data: activeGameweek } = useQuery({
    queryKey: ["/api/gameweeks/active"],
  });

  // Use selected gameweek or default to active gameweek
  const targetGameweekId = selectedGameweekId || activeGameweek?.id?.toString();

  const { data: predictionsOverview, isLoading } = useQuery({
    queryKey: ["/api/admin/predictions-overview", targetGameweekId],
    enabled: !!targetGameweekId,
  });

  const { data: players } = useQuery({
    queryKey: ["/api/players"],
  });

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-64 rounded mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-football-navy">
          <i className="fas fa-clipboard-list mr-3 text-football-gold"></i>
          Player Predictions Overview
        </h1>
      </div>

      {/* Gameweek Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium">Select Gameweek:</label>
            <Select value={selectedGameweekId} onValueChange={setSelectedGameweekId}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Choose gameweek" />
              </SelectTrigger>
              <SelectContent>
                {gameweeks?.map((gameweek: any) => (
                  <SelectItem key={gameweek.id} value={gameweek.id.toString()}>
                    {gameweek.name} ({gameweek.type})
                    {gameweek.isActive && <span className="ml-2 text-green-600">• Active</span>}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {!predictionsOverview ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">Select a gameweek to view predictions overview</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-royal-blue">
                    {predictionsOverview.summary.totalPlayers}
                  </div>
                  <div className="text-sm text-gray-600">Total Players</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-football-green">
                    {predictionsOverview.summary.playersSubmitted}
                  </div>
                  <div className="text-sm text-gray-600">Submitted</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-accent">
                    {predictionsOverview.summary.playersPending}
                  </div>
                  <div className="text-sm text-gray-600">Pending</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-football-gold">
                    {Math.round((predictionsOverview.summary.playersSubmitted / predictionsOverview.summary.totalPlayers) * 100)}%
                  </div>
                  <div className="text-sm text-gray-600">Completion Rate</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Fixtures Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-football-navy">
                  <i className="fas fa-check-circle mr-2 text-football-green"></i>
                  Players with Complete Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictionsOverview.playersCompleted.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No complete predictions yet</p>
                ) : (
                  <div className="space-y-2">
                    {predictionsOverview.playersCompleted.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="font-medium">{player.name}</span>
                        <Badge variant="secondary" className="bg-football-green text-white">
                          Complete ({player.predictionsCount}/{predictionsOverview.totalFixtures})
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-football-navy">
                  <i className="fas fa-exclamation-triangle mr-2 text-red-accent"></i>
                  Players Needing Reminders
                </CardTitle>
              </CardHeader>
              <CardContent>
                {predictionsOverview.playersPending.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">All players have submitted!</p>
                ) : (
                  <div className="space-y-2">
                    {predictionsOverview.playersPending.map((player: any) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <span className="font-medium">{player.name}</span>
                          <div className="text-sm text-gray-600">{player.email}</div>
                        </div>
                        <Badge variant="destructive">
                          {player.predictionsCount}/{predictionsOverview.totalFixtures}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Fixture by Fixture Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle className="text-football-navy">
                <i className="fas fa-futbol mr-2 text-football-gold"></i>
                Fixture by Fixture Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Fixture</th>
                      <th className="text-center py-3 px-4">Kickoff</th>
                      <th className="text-center py-3 px-4">Predictions</th>
                      <th className="text-center py-3 px-4">Missing Players</th>
                    </tr>
                  </thead>
                  <tbody>
                    {predictionsOverview.fixtureBreakdown.map((fixture: any) => (
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
                          <Badge variant={fixture.predictionsCount === predictionsOverview.summary.totalPlayers ? "secondary" : "destructive"}>
                            {fixture.predictionsCount}/{predictionsOverview.summary.totalPlayers}
                          </Badge>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {fixture.missingPlayers.length === 0 ? (
                            <Badge variant="secondary" className="bg-football-green text-white">All Set</Badge>
                          ) : (
                            <div className="text-sm text-gray-600">
                              {fixture.missingPlayers.slice(0, 3).map((player: any) => player.name).join(", ")}
                              {fixture.missingPlayers.length > 3 && ` +${fixture.missingPlayers.length - 3} more`}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </main>
  );
};

export default PredictionsOverview;