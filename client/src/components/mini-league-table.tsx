import { Link } from "wouter";

interface LeagueEntry {
  id: number;
  playerId: number;
  gameweekId: number;
  totalPoints: number;
  isManagerOfWeek: boolean;
  player: {
    id: number;
    name: string;
    email: string;
  };
}

interface MiniLeagueTableProps {
  data: LeagueEntry[];
}

const MiniLeagueTable = ({ data }: MiniLeagueTableProps) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-xl font-bold text-football-navy mb-4">
          <i className="fas fa-trophy mr-2 text-football-gold"></i>
          League Table
        </h3>
        <p className="text-gray-500 text-center py-8">No league data available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-football-navy mb-4">
        <i className="fas fa-trophy mr-2 text-football-gold"></i>
        League Table
      </h3>
      <div className="space-y-3">
        {data.map((entry, index) => (
          <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm text-white ${
                index === 0 ? 'bg-football-green' : 'bg-football-gray'
              }`}>
                {index + 1}
              </div>
              <div>
                <div className="font-semibold text-football-navy">{entry.player.name}</div>
                {entry.isManagerOfWeek && (
                  <div className="text-sm text-gray-500">Manager of the Week</div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-football-navy font-mono">{entry.totalPoints}</div>
              <div className="text-sm text-football-green">
                {index === 0 ? '+15' : index === 1 ? '+8' : '+12'}
              </div>
            </div>
          </div>
        ))}

        <div className="text-center pt-2">
          <Link href="/league-table">
            <button className="text-football-green hover:text-green-600 text-sm font-medium">
              View Full Table <i className="fas fa-arrow-right ml-1"></i>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default MiniLeagueTable;
