import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Target, TrendingUp, Award, Calendar, TrendingDown, Minus, ArrowUp, ArrowDown, Users, BarChart } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

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

interface FormGuideEntry {
  gameweekId: number;
  gameweekName: string;
  points: number;
  rank: number;
  totalPlayers: number;
}

interface PredictionInsight {
  fixtureId: number;
  homeTeam: string;
  awayTeam: string;
  gameweekName: string;
  totalPredictions: number;
  mostPredictedScore: string;
  mostPredictedCount: number;
  actualScore: string | null;
  crowdWasRight: boolean | null;
}

interface CrowdAccuracy {
  totalCompletedFixtures: number;
  crowdCorrectCount: number;
  crowdAccuracyRate: number;
  recentInsights: PredictionInsight[];
}

interface HistoricalPoint {
  gameweekId: number;
  gameweekName: string;
  points: number;
  cumulativePoints: number;
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

  const { data: formGuide, isLoading: formGuideLoading } = useQuery<FormGuideEntry[]>({
    queryKey: [`/api/players/${user?.id}/form-guide`],
    enabled: !!user?.id,
  });

  const { data: crowdInsights, isLoading: crowdInsightsLoading } = useQuery<CrowdAccuracy>({
    queryKey: ["/api/insights/crowd-predictions"],
    enabled: !!user?.id,
  });

  const { data: historicalPoints, isLoading: historicalPointsLoading } = useQuery<HistoricalPoint[]>({
    queryKey: [`/api/players/${user?.id}/historical-points`],
    enabled: !!user?.id,
  });

  // Calculate trend for form guide
  const calculateTrend = () => {
    if (!formGuide || formGuide.length < 2) return null;
    
    // For 2 gameweeks: simple comparison
    if (formGuide.length === 2) {
      const diff = formGuide[1].points - formGuide[0].points;
      if (diff > 2) return "improving";
      if (diff < -2) return "declining";
      return "stable";
    }
    
    // For 3+ gameweeks: split into non-overlapping halves
    const midpoint = Math.floor(formGuide.length / 2);
    const olderPoints = formGuide.slice(0, midpoint).map(g => g.points);
    const recentPoints = formGuide.slice(midpoint).map(g => g.points);
    
    const olderAvg = olderPoints.reduce((a, b) => a + b, 0) / olderPoints.length;
    const recentAvg = recentPoints.reduce((a, b) => a + b, 0) / recentPoints.length;
    
    const diff = recentAvg - olderAvg;
    
    if (diff > 2) return "improving";
    if (diff < -2) return "declining";
    return "stable";
  };

  const trend = calculateTrend();

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

      {/* Form Guide */}
      {formGuide && formGuide.length > 0 && (
        <Card className="mb-8" data-testid="card-form-guide">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Recent Form Guide
                </CardTitle>
                <CardDescription>Last {formGuide.length} gameweeks performance</CardDescription>
              </div>
              {trend && (
                <div className="flex items-center gap-2">
                  {trend === "improving" && (
                    <Badge variant="default" className="bg-green-600 text-white flex items-center gap-1" data-testid="badge-trend-improving">
                      <ArrowUp className="h-3 w-3" />
                      Improving
                    </Badge>
                  )}
                  {trend === "declining" && (
                    <Badge variant="destructive" className="flex items-center gap-1" data-testid="badge-trend-declining">
                      <ArrowDown className="h-3 w-3" />
                      Declining
                    </Badge>
                  )}
                  {trend === "stable" && (
                    <Badge variant="secondary" className="flex items-center gap-1" data-testid="badge-trend-stable">
                      <Minus className="h-3 w-3" />
                      Stable
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {formGuide.map((entry, idx) => (
                <div 
                  key={entry.gameweekId}
                  className="flex flex-col items-center p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  data-testid={`form-guide-entry-${idx}`}
                >
                  <div className="text-sm font-medium text-muted-foreground mb-2">
                    {entry.gameweekName}
                  </div>
                  <div className="text-3xl font-bold mb-1" data-testid={`text-form-points-${idx}`}>
                    {entry.points}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Rank {entry.rank}/{entry.totalPlayers}
                  </div>
                  {idx > 0 && (
                    <div className="mt-2">
                      {entry.points > formGuide[idx - 1].points ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : entry.points < formGuide[idx - 1].points ? (
                        <TrendingDown className="h-4 w-4 text-red-600" />
                      ) : (
                        <Minus className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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

      {/* Crowd Prediction Insights */}
      <Card className="mb-8" data-testid="card-crowd-insights">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Crowd Prediction Insights
              </CardTitle>
              <CardDescription>How often does the crowd get it right?</CardDescription>
            </div>
            {crowdInsights && (
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">{crowdInsights.crowdAccuracyRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {crowdInsights.crowdCorrectCount} of {crowdInsights.totalCompletedFixtures} correct
                </p>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {crowdInsightsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : crowdInsights && crowdInsights.recentInsights.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Match</TableHead>
                  <TableHead>Gameweek</TableHead>
                  <TableHead>Most Predicted</TableHead>
                  <TableHead>Actual Score</TableHead>
                  <TableHead className="text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crowdInsights.recentInsights.map((insight, idx) => (
                  <TableRow key={insight.fixtureId} data-testid={`row-crowd-insight-${idx}`}>
                    <TableCell className="font-medium">
                      {insight.homeTeam} vs {insight.awayTeam}
                    </TableCell>
                    <TableCell>{insight.gameweekName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{insight.mostPredictedScore}</span>
                        <span className="text-xs text-muted-foreground">
                          ({insight.mostPredictedCount}/{insight.totalPredictions})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{insight.actualScore || "-"}</TableCell>
                    <TableCell className="text-right">
                      {insight.crowdWasRight !== null && (
                        <Badge 
                          variant={insight.crowdWasRight ? "default" : "destructive"}
                          className={insight.crowdWasRight ? "bg-green-600" : ""}
                        >
                          {insight.crowdWasRight ? "✓ Correct" : "✗ Wrong"}
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-8 text-center text-muted-foreground" data-testid="crowd-insights-empty">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p>No completed fixtures with predictions yet.</p>
              <p className="text-sm">Crowd insights will appear once fixtures are completed.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Historical Points Chart */}
      <Card className="mb-8" data-testid="card-historical-chart">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-indigo-600" />
            Points Progression
          </CardTitle>
          <CardDescription>Your journey through the season</CardDescription>
        </CardHeader>
        <CardContent>
          {historicalPointsLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-64 w-full" />
            </div>
          ) : historicalPoints && historicalPoints.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={historicalPoints}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="gameweekName" 
                  tick={{ fontSize: 12 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="points" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  name="Gameweek Points"
                  dot={{ r: 4 }}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="cumulativePoints" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Total Points"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-12 text-center text-muted-foreground" data-testid="historical-chart-empty">
              <BarChart className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p>No historical data available yet.</p>
              <p className="text-sm">Your points progression will appear once gameweeks are completed.</p>
            </div>
          )}
        </CardContent>
      </Card>

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
