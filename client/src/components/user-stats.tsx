import { useQuery } from "@tanstack/react-query";

interface UserStatsProps {
  playerId: number;
}

const UserStats = ({ playerId }: UserStatsProps) => {
  const { data: predictions } = useQuery({
    queryKey: ["/api/predictions", { playerId }],
  });

  // Calculate stats from predictions
  const stats = {
    totalPoints: predictions?.reduce((sum: number, p: any) => sum + (p.points || 0), 0) || 0,
    correctScores: predictions?.filter((p: any) => p.points === 5 || p.points === 10).length || 0,
    correctResults: predictions?.filter((p: any) => p.points === 3 || p.points === 6).length || 0,
    weeklyRank: "1st", // This would normally come from the league table calculation
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-football-navy mb-4">
        <i className="fas fa-chart-line mr-2 text-football-green"></i>
        Your Stats
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center p-4 bg-football-green bg-opacity-10 rounded-lg">
          <div className="text-2xl font-bold text-football-navy font-mono">{stats.totalPoints}</div>
          <div className="text-sm text-gray-600">Total Points</div>
        </div>
        <div className="text-center p-4 bg-football-gold bg-opacity-10 rounded-lg">
          <div className="text-2xl font-bold text-football-navy font-mono">{stats.weeklyRank}</div>
          <div className="text-sm text-gray-600">Current Rank</div>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <div className="text-2xl font-bold text-football-navy font-mono">{stats.correctScores}</div>
          <div className="text-sm text-gray-600">Correct Scores</div>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <div className="text-2xl font-bold text-football-navy font-mono">{stats.correctResults}</div>
          <div className="text-sm text-gray-600">Correct Results</div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
