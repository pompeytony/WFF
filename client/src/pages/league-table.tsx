import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Gameweek } from "@shared/schema";

interface LiveScore {
  playerId: number;
  gameweekId: number;
  totalPoints: number;
  isManagerOfWeek: boolean;
  isLive: boolean;
  player: {
    id: number;
    name: string;
    email: string;
  };
}

interface CumulativeScore {
  playerId: number;
  totalPoints: number;
  isCumulative: boolean;
  player: {
    id: number;
    name: string;
    email: string;
  };
}

const LeagueTable = () => {
  const { data: gameweeks, isLoading: gameweeksLoading } = useQuery<Gameweek[]>({
    queryKey: ["/api/gameweeks"],
  });

  // Get active gameweek for live scoring
  const activeGameweek = gameweeks?.find(gw => gw.isActive && !gw.isComplete);
  
  // Get most recently completed gameweek for final table
  const mostRecentCompletedGameweek = gameweeks?.filter(gw => gw.isComplete)
    .sort((a, b) => b.id - a.id)[0]; // Sort by ID desc to get most recent
  
  // Get live scores for active gameweek
  const { data: liveScores, isLoading: liveLoading } = useQuery<LiveScore[]>({
    queryKey: ["/api/live-scores", activeGameweek?.id],
    queryFn: () => {
      if (!activeGameweek) return Promise.resolve([]);
      return fetch(`/api/live-scores/${activeGameweek.id}`).then(res => res.json());
    },
    enabled: !!activeGameweek,
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  // Get final scores for most recently completed gameweek
  const { data: finalWeeklyScores, isLoading: finalWeeklyLoading } = useQuery<LiveScore[]>({
    queryKey: ["/api/weekly-scores", mostRecentCompletedGameweek?.id],
    queryFn: () => {
      if (!mostRecentCompletedGameweek) return Promise.resolve([]);
      return fetch(`/api/weekly-scores/${mostRecentCompletedGameweek.id}`).then(res => res.json());
    },
    enabled: !!mostRecentCompletedGameweek,
  });

  // Get cumulative scores across all completed gameweeks
  const { data: cumulativeScores, isLoading: cumulativeLoading } = useQuery<CumulativeScore[]>({
    queryKey: ["/api/cumulative-scores"],
  });

  const isLoading = gameweeksLoading || liveLoading || cumulativeLoading || finalWeeklyLoading;

  const renderTable = (
    title: string,
    data: (LiveScore | CumulativeScore)[] | undefined,
    subtitle?: string,
    isLive: boolean = false
  ) => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-football-navy">
          <i className={`fas ${isLive ? 'fa-bolt' : 'fa-trophy'} mr-2 ${isLive ? 'text-football-green' : 'text-football-gold'}`}></i>
          {title}
          {isLive && (
            <Badge variant="outline" className="ml-2 text-football-green border-football-green">
              <i className="fas fa-circle text-green-500 mr-1 animate-pulse"></i>
              LIVE
            </Badge>
          )}
        </CardTitle>
        {subtitle && (
          <p className="text-gray-600">{subtitle}</p>
        )}
      </CardHeader>
      <CardContent>
        {!data || data.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-2">
              {isLive ? "No live scores available" : "No data available"}
            </p>
            <p className="text-sm text-gray-400">
              {isLive 
                ? "Live scores will appear when match results are entered."
                : "Cumulative scores will show once gameweeks are completed."
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Position</th>
                  <th className="text-left py-3 px-4">Player</th>
                  <th className="text-center py-3 px-4">Points</th>
                  <th className="text-center py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.map((entry, index) => (
                  <tr key={entry.playerId} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                        index === 0 ? 'bg-football-gold' : 
                        index === 1 ? 'bg-gray-400' :
                        index === 2 ? 'bg-orange-400' : 'bg-football-gray'
                      }`}>
                        {index + 1}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-semibold text-football-navy">{entry.player.name}</div>
                      <div className="text-sm text-gray-500">{entry.player.email}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <div className="font-bold text-football-navy font-mono text-lg">
                        {entry.totalPoints || 0}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {('isManagerOfWeek' in entry && entry.isManagerOfWeek) && (
                        <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-football-gold bg-opacity-20 text-football-navy">
                          <i className="fas fa-star mr-1 text-football-gold"></i>
                          Manager of Week
                        </div>
                      )}
                      {isLive && entry.totalPoints === 0 && (
                        <div className="text-xs text-gray-400">Awaiting results</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-8">
          <div className="bg-gray-200 h-8 w-48 rounded"></div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-football-navy mb-2">
          <i className="fas fa-chart-line mr-2 text-football-green"></i>
          League Tables
        </h1>
        <p className="text-gray-600">Live scores update as results come in, cumulative shows season totals</p>
      </div>

      {/* Live Weekly Table */}
      {activeGameweek && renderTable(
        `Live Weekly Table - ${activeGameweek.name}`,
        liveScores,
        "Updates in real-time as each match result is entered. Manager of the week bonus (5 points) is added when all matches are complete.",
        true
      )}

      {/* Final Weekly Table - Show most recently completed gameweek */}
      {mostRecentCompletedGameweek && finalWeeklyScores && finalWeeklyScores.length > 0 && renderTable(
        `Final Weekly Table - ${mostRecentCompletedGameweek.name}`,
        finalWeeklyScores,
        "Final standings from the most recently completed gameweek. Manager of the week bonus included."
      )}

      {/* Cumulative League Table */}
      {renderTable(
        "Season Cumulative Table",
        cumulativeScores,
        "Total points accumulated across all completed gameweeks."
      )}

      {!activeGameweek && (!cumulativeScores || cumulativeScores.length === 0) && (
        <div className="text-center py-12">
          <div className="bg-football-gray bg-opacity-10 rounded-lg p-8">
            <i className="fas fa-info-circle text-football-gray text-4xl mb-4"></i>
            <h3 className="text-xl font-semibold text-football-navy mb-2">No Active League Data</h3>
            <p className="text-gray-600 mb-4">
              There are no active gameweeks or completed gameweeks to display.
            </p>
            <p className="text-sm text-gray-500">
              League tables will appear once gameweeks are created and results are entered.
            </p>
          </div>
        </div>
      )}
    </main>
  );
};

export default LeagueTable;