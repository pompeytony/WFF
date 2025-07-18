import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Results = () => {
  const { data: fixtures, isLoading } = useQuery({
    queryKey: ["/api/fixtures"],
  });

  // Filter completed fixtures and sort by most recent
  const completedFixtures = fixtures
    ?.filter((f: any) => f.isComplete)
    ?.sort((a: any, b: any) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime()) || [];

  const { data: gameweeks } = useQuery({
    queryKey: ["/api/gameweeks"],
  });

  // Create a map of gameweeks for easy lookup
  const gameweekMap = new Map();
  if (gameweeks) {
    gameweeks.forEach((gw: any) => {
      gameweekMap.set(gw.id, gw);
    });
  }

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
            <i className="fas fa-history mr-2 text-football-green"></i>
            Match Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completedFixtures.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No results available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedFixtures.map((fixture: any) => {
                const gameweek = gameweekMap.get(fixture.gameweekId);
                const kickoffDate = new Date(fixture.kickoffTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={fixture.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-500">
                          <div>{gameweek?.name}</div>
                          <div>{kickoffDate}</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="font-semibold text-football-navy">{fixture.homeTeam}</div>
                        </div>
                        
                        <div className="bg-white rounded-lg px-4 py-2 border border-gray-200">
                          <div className="text-center font-bold text-football-navy text-lg font-mono">
                            {fixture.homeScore} - {fixture.awayScore}
                          </div>
                        </div>
                        
                        <div className="text-left">
                          <div className="font-semibold text-football-navy">{fixture.awayTeam}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
};

export default Results;
