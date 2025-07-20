import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import PredictionForm from "@/components/prediction-form";
import MiniLeagueTable from "@/components/mini-league-table";
import UserStats from "@/components/user-stats";
import RecentResults from "@/components/recent-results";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: dashboardData, isLoading, error } = useQuery({
    queryKey: ["/api/dashboard", user?.id],
    enabled: !!user?.id,
  });

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-gray-200 h-96 rounded-xl"></div>
            <div className="space-y-6">
              <div className="bg-gray-200 h-48 rounded-xl"></div>
              <div className="bg-gray-200 h-48 rounded-xl"></div>
              <div className="bg-gray-200 h-48 rounded-xl"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          <p>Error loading dashboard data</p>
        </div>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          <p>No data available</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <PredictionForm
            gameweek={dashboardData.activeGameweek}
            fixtures={dashboardData.fixtures}
            predictions={dashboardData.predictions}
            playerId={user?.id}
          />
        </div>

        <div className="space-y-6">
          <MiniLeagueTable data={dashboardData.leagueTable} />
          <UserStats playerId={user?.id} />
          <RecentResults results={dashboardData.recentResults} playerId={user?.id} />
        </div>
      </div>
    </main>
  );
};

export default Dashboard;
