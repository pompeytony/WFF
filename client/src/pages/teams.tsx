import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Team } from "@shared/schema";

export default function TeamsPage() {
  // Fetch all teams
  const { data: allTeams = [], isLoading } = useQuery({
    queryKey: ['/api/teams'],
    queryFn: async () => {
      const response = await fetch('/api/teams');
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return response.json() as Promise<Team[]>;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading teams...</div>
      </div>
    );
  }

  // Group teams by league and continent
  const premierLeagueTeams = allTeams.filter(team => team.league === 'premier-league');
  const championshipTeams = allTeams.filter(team => team.league === 'championship');
  const leagueOneTeams = allTeams.filter(team => team.league === 'league-one');
  const leagueTwoTeams = allTeams.filter(team => team.league === 'league-two');
  const europeanTeams = allTeams.filter(team => team.league === 'international' && team.continent === 'europe');
  const otherInternationalTeams = allTeams.filter(team => team.league === 'international' && team.continent !== 'europe');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            Teams Database
          </h1>
          <p className="text-blue-100 text-lg">
            Browse all {allTeams.length} teams organized by league and continent
          </p>
        </div>

        <Tabs defaultValue="premier-league" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="premier-league">
              Premier League ({premierLeagueTeams.length})
            </TabsTrigger>
            <TabsTrigger value="championship">
              Championship ({championshipTeams.length})
            </TabsTrigger>
            <TabsTrigger value="league-one">
              League One ({leagueOneTeams.length})
            </TabsTrigger>
            <TabsTrigger value="league-two">
              League Two ({leagueTwoTeams.length})
            </TabsTrigger>
            <TabsTrigger value="european">
              European ({europeanTeams.length})
            </TabsTrigger>
            <TabsTrigger value="international">
              International ({otherInternationalTeams.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="premier-league">
            <TeamsGrid teams={premierLeagueTeams} title="Premier League Teams" />
          </TabsContent>

          <TabsContent value="championship">
            <TeamsGrid teams={championshipTeams} title="Championship Teams" />
          </TabsContent>

          <TabsContent value="league-one">
            <TeamsGrid teams={leagueOneTeams} title="League One Teams" />
          </TabsContent>

          <TabsContent value="league-two">
            <TeamsGrid teams={leagueTwoTeams} title="League Two Teams" />
          </TabsContent>

          <TabsContent value="european">
            <TeamsGrid teams={europeanTeams} title="European National Teams" />
          </TabsContent>

          <TabsContent value="international">
            <InternationalTeamsGrid teams={otherInternationalTeams} title="International Teams" />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

interface TeamsGridProps {
  teams: Team[];
  title: string;
}

function TeamsGrid({ teams, title }: TeamsGridProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="bg-white/90 hover:bg-white transition-colors">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <img 
                  src={team.badgeUrl} 
                  alt={`${team.name} badge`}
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/placeholder-badge.svg';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm truncate">{team.name}</h3>
                  <Badge variant="secondary" className="text-xs">
                    {team.shortName}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function InternationalTeamsGrid({ teams, title }: TeamsGridProps) {
  // Group international teams by continent
  const teamsByContinent = teams.reduce((acc, team) => {
    const continent = team.continent || 'other';
    if (!acc[continent]) acc[continent] = [];
    acc[continent].push(team);
    return acc;
  }, {} as Record<string, Team[]>);

  const continentNames = {
    'south-america': 'South America',
    'africa': 'Africa',
    'asia': 'Asia',
    'north-america': 'North America',
    'oceania': 'Oceania',
    'other': 'Other'
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {Object.entries(teamsByContinent).map(([continent, continentTeams]) => (
        <div key={continent} className="mb-8">
          <h3 className="text-xl font-semibold text-blue-100 mb-3">
            {continentNames[continent as keyof typeof continentNames] || continent} ({continentTeams.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {continentTeams.map((team) => (
              <Card key={team.id} className="bg-white/90 hover:bg-white transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <img 
                      src={team.badgeUrl} 
                      alt={`${team.name} badge`}
                      className="w-12 h-12 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-badge.svg';
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate">{team.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {team.shortName}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}