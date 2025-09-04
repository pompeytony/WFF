import { useQuery } from "@tanstack/react-query";
import type { Fixture } from "@shared/schema";
import { Link } from "wouter";
import TeamDisplay from "@/components/team-display";

interface RecentResultsProps {
  results: Fixture[];
  playerId: number;
}

const RecentResults = ({ results, playerId }: RecentResultsProps) => {
  const { data: predictions } = useQuery({
    queryKey: ["/api/predictions", { playerId }],
  });

  // Create a map of predictions by fixture ID
  const predictionMap = new Map();
  if (predictions) {
    predictions.forEach((p: any) => {
      predictionMap.set(p.fixtureId, p);
    });
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-football-navy mb-4">
        <i className="fas fa-clock mr-2 text-football-green"></i>
        Recent Results
      </h3>
      <div className="space-y-3">
        {results.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No recent results available</p>
        ) : (
          results.slice(0, 5).map((result) => {
            const prediction = predictionMap.get(result.id);
            const points = prediction?.points || 0;
            
            return (
              <div key={result.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <TeamDisplay teamName={result.homeTeam} size="small" />
                      <div className="font-bold text-football-navy mx-2">
                        {result.homeScore}-{result.awayScore}
                      </div>
                      <TeamDisplay teamName={result.awayTeam} size="small" />
                    </div>
                    {prediction && (
                      <div className="text-gray-500 text-center mt-1">
                        Your prediction: {prediction.homeScore}-{prediction.awayScore}
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded text-sm font-medium text-white ${
                    points === 0 ? 'bg-gray-400' :
                    points >= 5 ? 'bg-football-gold' : 'bg-football-green'
                  }`}>
                    {points > 0 ? `+${points}` : '0'}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {results.length > 0 && (
          <div className="text-center pt-2">
            <Link href="/results">
              <button className="text-football-green hover:text-green-600 text-sm font-medium">
                View All Results <i className="fas fa-arrow-right ml-1"></i>
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentResults;
