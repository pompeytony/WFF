import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Gameweek } from "@shared/schema";

const LeagueTable = () => {
  const { data: gameweeks, isLoading: gameweeksLoading } = useQuery<Gameweek[]>({
    queryKey: ["/api/gameweeks"],
  });

  // Get the most recent gameweek (completed or active)
  const sortedGameweeks = gameweeks?.sort((a, b) => b.id - a.id) || [];
  const latestGameweek = sortedGameweeks[0];

  const { data: leagueTable, isLoading: leagueLoading } = useQuery({
    queryKey: ["/api/weekly-scores", { gameweekId: latestGameweek?.id }],
    enabled: !!latestGameweek,
  });

  const isLoading = gameweeksLoading || leagueLoading;

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="bg-gray-200 h-8 w-48 mb-6 rounded"></div>
          <div className="bg-gray-200 h-96 rounded-xl"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-football-navy">
            <i className="fas fa-trophy mr-2 text-football-gold"></i>
            League Table
            {latestGameweek && (
              <span className="text-lg font-normal text-gray-600 ml-2">
                - {latestGameweek.name}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!leagueTable || leagueTable.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No league data available</p>
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
                  {leagueTable.map((entry: any, index: number) => (
                    <tr key={entry.id} className="border-b hover:bg-gray-50">
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
                          {entry.totalPoints}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {entry.isManagerOfWeek && (
                          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-football-gold bg-opacity-20 text-football-navy">
                            <i className="fas fa-star mr-1 text-football-gold"></i>
                            Manager of Week
                          </div>
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
    </main>
  );
};

export default LeagueTable;
