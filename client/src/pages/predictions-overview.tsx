import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Gameweek } from "@shared/schema";

interface PredictionData {
  gameweek: {
    id: number;
    name: string;
    type: string;
    deadline: string | null;
    isActive: boolean;
    isComplete: boolean;
  };
  deadlinePassed: boolean;
  totalPredictions: number;
  totalFixtures: number;
  totalPlayers: number;
  byFixture: FixturePredictions[];
  byPlayer: PlayerPredictions[];
}

interface FixturePredictions {
  fixture: {
    id: number;
    homeTeam: string;
    awayTeam: string;
    kickoffTime: string;
    homeScore: number | null;
    awayScore: number | null;
    isComplete: boolean;
  };
  predictions: {
    player: {
      id: number;
      name: string;
      email: string;
    };
    homeScore: number;
    awayScore: number;
    isJoker: boolean;
    points: number;
  }[];
}

interface PlayerPredictions {
  player: {
    id: number;
    name: string;
    email: string;
  };
  jokerFixture: {
    id: number;
    homeTeam: string;
    awayTeam: string;
  } | null;
  predictions: {
    fixture: {
      id: number;
      homeTeam: string;
      awayTeam: string;
      kickoffTime: string;
      homeScore: number | null;
      awayScore: number | null;
      isComplete: boolean;
    };
    homeScore: number;
    awayScore: number;
    isJoker: boolean;
    points: number;
  }[];
}

const PredictionsOverview = () => {
  const [selectedGameweekId, setSelectedGameweekId] = useState<string>("");
  const [viewMode, setViewMode] = useState<"fixture" | "player">("fixture");

  // Fetch all gameweeks for selector
  const { data: gameweeks } = useQuery<Gameweek[]>({
    queryKey: ["/api/gameweeks"],
  });

  // Get active gameweek as default
  const { data: activeGameweek } = useQuery<Gameweek>({
    queryKey: ["/api/gameweeks/active"],
  });

  // Use selected gameweek or default to active gameweek
  const targetGameweekId = selectedGameweekId || activeGameweek?.id?.toString();

  // Fetch public predictions data
  const { data: predictionsData, isLoading, error } = useQuery<PredictionData>({
    queryKey: ["/api/predictions/public", targetGameweekId],
    queryFn: async () => {
      if (!targetGameweekId) return null;
      const response = await fetch(`/api/predictions/public/${targetGameweekId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
        },
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to fetch predictions');
      }
      return response.json();
    },
    enabled: !!targetGameweekId,
  });

  const renderPredictionScore = (homeScore: number, awayScore: number, isJoker: boolean) => (
    <span className={`font-mono text-sm px-2 py-1 rounded ${
      isJoker ? 'bg-football-gold text-white font-bold' : 'bg-gray-100'
    }`}>
      {homeScore}-{awayScore}
      {isJoker && <span className="ml-1">🃏</span>}
    </span>
  );

  const renderFixtureView = () => (
    <div className="space-y-6">
      {predictionsData?.byFixture.map((fixtureData) => (
        <Card key={fixtureData.fixture.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fas fa-futbol text-football-gold"></i>
                <span className="text-football-navy">
                  {fixtureData.fixture.homeTeam} vs {fixtureData.fixture.awayTeam}
                </span>
                {fixtureData.fixture.isComplete && (
                  <Badge className="bg-football-green text-white">
                    Final: {fixtureData.fixture.homeScore}-{fixtureData.fixture.awayScore}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500">
                {new Date(fixtureData.fixture.kickoffTime).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {fixtureData.predictions.map((prediction) => (
                <div
                  key={prediction.player.id}
                  className={`p-3 rounded-lg border ${
                    prediction.isJoker ? 'border-football-gold bg-football-gold/10' : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{prediction.player.name}</span>
                    {fixtureData.fixture.isComplete && (
                      <Badge variant="outline" className="text-xs">
                        {prediction.points}pts
                      </Badge>
                    )}
                  </div>
                  <div className="mt-1">
                    {renderPredictionScore(prediction.homeScore, prediction.awayScore, prediction.isJoker)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderPlayerView = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {predictionsData?.byPlayer.map((playerData) => (
        <Card key={playerData.player.id}>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <i className="fas fa-user text-football-navy"></i>
                <span className="text-football-navy">{playerData.player.name}</span>
              </div>
              {playerData.jokerFixture && (
                <Badge className="bg-football-gold text-white">
                  🃏 {playerData.jokerFixture.homeTeam} vs {playerData.jokerFixture.awayTeam}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {playerData.predictions.map((prediction) => (
                <div
                  key={prediction.fixture.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    prediction.isJoker ? 'bg-football-gold/10 border border-football-gold' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {prediction.fixture.homeTeam} vs {prediction.fixture.awayTeam}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(prediction.fixture.kickoffTime).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {renderPredictionScore(prediction.homeScore, prediction.awayScore, prediction.isJoker)}
                    {prediction.fixture.isComplete && (
                      <Badge variant="outline" className="text-xs">
                        {prediction.points}pts
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="bg-gray-200 h-8 w-64 rounded"></div>
          <div className="bg-gray-200 h-16 rounded-xl"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-xl"></div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-football-navy mb-2">
          <i className="fas fa-eye mr-3 text-football-green"></i>
          Predictions Overview
        </h1>
        <p className="text-gray-600">
          View all player predictions after the submission deadline passes
        </p>
      </div>

      {/* Gameweek Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium whitespace-nowrap">Select Gameweek:</label>
              <Select value={selectedGameweekId} onValueChange={setSelectedGameweekId}>
                <SelectTrigger className="w-64">
                  <SelectValue placeholder="Choose gameweek" />
                </SelectTrigger>
                <SelectContent>
                  {gameweeks?.map((gameweek) => (
                    <SelectItem key={gameweek.id} value={gameweek.id.toString()}>
                      {gameweek.name} ({gameweek.type})
                      {gameweek.isActive && <span className="ml-2 text-green-600">• Active</span>}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {predictionsData && (
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium whitespace-nowrap">View:</label>
                <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "fixture" | "player")}>
                  <TabsList>
                    <TabsTrigger value="fixture">By Fixture</TabsTrigger>
                    <TabsTrigger value="player">By Player</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Error State */}
      {error && (
        <Card>
          <CardContent className="text-center py-12">
            <i className="fas fa-lock text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold text-football-navy mb-2">Predictions Not Available</h3>
            <p className="text-gray-600 mb-4">{(error as Error).message}</p>
            {predictionsData?.deadlinePassed === false && predictionsData?.gameweek?.deadline && (
              <p className="text-sm text-gray-500">
                Predictions will be visible after:{" "}
                <span className="font-medium">
                  {new Date(predictionsData.gameweek.deadline).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* No Gameweek Selected */}
      {!targetGameweekId && !error && (
        <Card>
          <CardContent className="text-center py-12">
            <i className="fas fa-calendar-alt text-4xl text-gray-400 mb-4"></i>
            <h3 className="text-xl font-semibold text-football-navy mb-2">Select a Gameweek</h3>
            <p className="text-gray-600">Choose a gameweek from the dropdown above to view predictions.</p>
          </CardContent>
        </Card>
      )}

      {/* Predictions Data */}
      {predictionsData && !error && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-football-navy">
                    {predictionsData.totalPlayers}
                  </div>
                  <div className="text-sm text-gray-600">Players Participated</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-football-green">
                    {predictionsData.totalFixtures}
                  </div>
                  <div className="text-sm text-gray-600">Fixtures</div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-football-gold">
                    {predictionsData.totalPredictions}
                  </div>
                  <div className="text-sm text-gray-600">Total Predictions</div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Gameweek Info */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-football-navy">
                    {predictionsData.gameweek.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {predictionsData.gameweek.type.replace('-', ' ')} • 
                    {predictionsData.gameweek.isActive ? ' Active' : ''}
                    {predictionsData.gameweek.isComplete ? ' Complete' : ''}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {predictionsData.deadlinePassed ? (
                    <Badge className="bg-football-green text-white">
                      <i className="fas fa-unlock mr-1"></i>
                      Predictions Visible
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-600">
                      <i className="fas fa-clock mr-1"></i>
                      Deadline Pending
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* View Toggle Content */}
          {viewMode === "fixture" ? renderFixtureView() : renderPlayerView()}
        </>
      )}
    </main>
  );
};

export default PredictionsOverview;