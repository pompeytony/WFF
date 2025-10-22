import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Award, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface PredictionDetail {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  predictedScore: string;
  actualScore: string;
  points: number;
  gameweekName: string;
  wasJoker: boolean;
}

interface GameweekStat {
  gameweekId: number;
  gameweekName: string;
  points: number;
  predictions: number;
  correctScores: number;
  correctResults: number;
}

interface PlayerPerformance {
  playerId: number;
  playerName: string;
  totalPredictions: number;
  completedPredictions: number;
  correctScores: number;
  correctResults: number;
  totalPoints: number;
  averagePointsPerGameweek: number;
  accuracyRate: number;
  scoreAccuracyRate: number;
  bestPredictions: PredictionDetail[];
  worstPredictions: PredictionDetail[];
  gameweekStats: GameweekStat[];
}

export default function Performance() {
  const { data: user } = useQuery<{ id: number; name: string; email: string; isAdmin: boolean }>({ 
    queryKey: ["/api/auth/user"] 
  });

  const { data: performance, isLoading, error } = useQuery<PlayerPerformance>({
    queryKey: [`/api/players/${user?.id}/performance`],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Skeleton className="h-10 w-64 mb-2" />
          <Skeleton className="h-6 w-96" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    // Check if it's a 404 error (no data yet) vs other errors
    // The error message format from queryClient is: "STATUS_CODE: error text"
    const is404 = error instanceof Error && error.message.startsWith("404:");
    
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className={`h-12 w-12 mx-auto mb-4 ${is404 ? 'text-muted-foreground' : 'text-red-600'}`} />
            <h3 className="text-lg font-semibold mb-2">
              {is404 ? 'No Performance Data Yet' : 'Error Loading Performance Data'}
            </h3>
            <p className="text-muted-foreground">
              {is404 
                ? 'Your performance statistics will appear here once you start making predictions and fixtures are completed.' 
                : 'Unable to load your performance statistics. Please try again later.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!performance) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No performance data available</h3>
            <p className="text-muted-foreground">
              Your performance statistics will appear here once you start making predictions.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2" data-testid="text-performance-title">
          Performance Dashboard
        </h1>
        <p className="text-muted-foreground" data-testid="text-player-name">
          Detailed statistics for {performance.playerName}
        </p>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card data-testid="card-total-points">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Points</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-points">{performance.totalPoints}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg {performance.averagePointsPerGameweek} per gameweek
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-accuracy">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Result Accuracy</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-accuracy-rate">{performance.accuracyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.correctResults} of {performance.completedPredictions} correct
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-score-accuracy">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Exact Score Accuracy</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-score-accuracy-rate">{performance.scoreAccuracyRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.correctScores} perfect predictions
            </p>
          </CardContent>
        </Card>

        <Card data-testid="card-predictions-made">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Predictions Made</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold" data-testid="text-total-predictions">{performance.totalPredictions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.completedPredictions} completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Best Predictions */}
      {performance.bestPredictions.length > 0 && (
        <Card className="mb-8" data-testid="card-best-predictions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              Best Predictions
            </CardTitle>
            <CardDescription>Your highest scoring predictions</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Gameweek</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.bestPredictions.map((pred, idx) => (
                  <TableRow key={`${pred.fixtureId}-${idx}`} data-testid={`row-best-prediction-${idx}`}>
                    <TableCell className="font-medium">
                      {pred.homeTeam} vs {pred.awayTeam}
                    </TableCell>
                    <TableCell>{pred.gameweekName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{pred.predictedScore}</span>
                        {pred.wasJoker && (
                          <Badge variant="secondary" className="text-xs">JOKER</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pred.actualScore}</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {pred.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Worst Predictions */}
      {performance.worstPredictions.length > 0 && (
        <Card className="mb-8" data-testid="card-worst-predictions">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-600" />
              Predictions to Learn From
            </CardTitle>
            <CardDescription>Areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Gameweek</TableHead>
                  <TableHead>Predicted</TableHead>
                  <TableHead>Actual</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.worstPredictions.map((pred, idx) => (
                  <TableRow key={`${pred.fixtureId}-${idx}`} data-testid={`row-worst-prediction-${idx}`}>
                    <TableCell className="font-medium">
                      {pred.homeTeam} vs {pred.awayTeam}
                    </TableCell>
                    <TableCell>{pred.gameweekName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{pred.predictedScore}</span>
                        {pred.wasJoker && (
                          <Badge variant="secondary" className="text-xs">JOKER</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{pred.actualScore}</TableCell>
                    <TableCell className="text-right font-bold text-gray-500">
                      {pred.points}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Gameweek Statistics */}
      {performance.gameweekStats.length > 0 && (
        <Card data-testid="card-gameweek-stats">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              Gameweek Breakdown
            </CardTitle>
            <CardDescription>Performance by gameweek</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Gameweek</TableHead>
                  <TableHead className="text-right">Predictions</TableHead>
                  <TableHead className="text-right">Correct Results</TableHead>
                  <TableHead className="text-right">Exact Scores</TableHead>
                  <TableHead className="text-right">Points</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {performance.gameweekStats.map((stat) => (
                  <TableRow key={stat.gameweekId} data-testid={`row-gameweek-${stat.gameweekId}`}>
                    <TableCell className="font-medium">{stat.gameweekName}</TableCell>
                    <TableCell className="text-right">{stat.predictions}</TableCell>
                    <TableCell className="text-right">{stat.correctResults}</TableCell>
                    <TableCell className="text-right">{stat.correctScores}</TableCell>
                    <TableCell className="text-right font-bold">{stat.points}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {performance.totalPredictions === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trophy className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No predictions yet</h3>
            <p className="text-muted-foreground">
              Start making predictions to see your performance statistics!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
