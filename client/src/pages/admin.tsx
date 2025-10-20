import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { Fixture, Gameweek } from "@shared/schema";
import { PREMIER_LEAGUE_TEAMS, getPremierLeagueTeamOptions, gameweekSupportsPremierLeagueTeams } from "@shared/premierLeagueTeams";

// Helper functions for UK timezone handling
const convertUTCToUKTime = (utcDateString: string): string => {
  const date = new Date(utcDateString);
  // Convert to UK time by creating a new date with UK timezone formatting
  const ukTime = new Date(date.toLocaleString("en-US", {timeZone: "Europe/London"}));
  
  // Format for datetime-local input (YYYY-MM-DDTHH:mm)
  const year = ukTime.getFullYear();
  const month = String(ukTime.getMonth() + 1).padStart(2, '0');
  const day = String(ukTime.getDate()).padStart(2, '0');
  const hours = String(ukTime.getHours()).padStart(2, '0');
  const minutes = String(ukTime.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const convertUKTimeToUTC = (ukTimeString: string): string => {
  // Create a date assuming the input is in UK timezone
  const inputDate = new Date(ukTimeString);
  
  // Get the current timezone offset for UK (handles GMT/BST automatically)
  const tempDate = new Date();
  const ukOffset = new Date(tempDate.toLocaleString("en-US", {timeZone: "Europe/London"})).getTimezoneOffset();
  const localOffset = tempDate.getTimezoneOffset();
  
  // Calculate the difference and adjust to get UTC
  const offsetDiff = (localOffset - ukOffset) * 60000; // Convert to milliseconds
  const utcTime = new Date(inputDate.getTime() + offsetDiff);
  
  return utcTime.toISOString();
};

const Admin = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFixture, setSelectedFixture] = useState<Fixture | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  
  // Add fixture form state
  const [isAddFixtureOpen, setIsAddFixtureOpen] = useState(false);
  const [newFixture, setNewFixture] = useState({
    homeTeam: "",
    awayTeam: "",
    kickoffTime: "",
    gameweekId: ""
  });
  
  // Edit fixture form state
  const [isEditFixtureOpen, setIsEditFixtureOpen] = useState(false);
  const [editingFixture, setEditingFixture] = useState<any>(null);
  const [showFixturesList, setShowFixturesList] = useState(false);
  
  // Add gameweek form state
  const [isAddGameweekOpen, setIsAddGameweekOpen] = useState(false);
  const [newGameweek, setNewGameweek] = useState({
    name: "",
    type: "premier-league",
    deadline: ""
  });

  // Edit predictions state
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>("");
  const [editingPrediction, setEditingPrediction] = useState<any>(null);
  const [isEditPredictionOpen, setIsEditPredictionOpen] = useState(false);
  const [addingPrediction, setAddingPrediction] = useState<any>(null);
  const [isAddPredictionOpen, setIsAddPredictionOpen] = useState(false);

  const { data: fixtures = [] } = useQuery<Fixture[]>({
    queryKey: ["/api/fixtures"],
  });

  const { data: gameweeks = [] } = useQuery<Gameweek[]>({
    queryKey: ["/api/gameweeks"],
  });

  const { data: players = [] } = useQuery<any[]>({
    queryKey: ["/api/players"],
  });

  // Get active gameweek for prediction editing
  const activeGameweek = gameweeks.find((gw: any) => gw.isActive && !gw.isComplete);

  // Fetch predictions for selected player and active gameweek
  const { data: playerPredictions = [] } = useQuery({
    queryKey: ["/api/predictions", selectedPlayerId, activeGameweek?.id],
    queryFn: async () => {
      if (!selectedPlayerId || !activeGameweek) return [];
      const response = await fetch(`/api/predictions?playerId=${selectedPlayerId}&gameweekId=${activeGameweek.id}`);
      return await response.json();
    },
    enabled: !!selectedPlayerId && !!activeGameweek,
  });

  const updateResultMutation = useMutation({
    mutationFn: async ({ fixtureId, homeScore, awayScore }: { fixtureId: number; homeScore: number; awayScore: number }) => {
      return apiRequest("PATCH", `/api/fixtures/${fixtureId}/result`, { homeScore, awayScore });
    },
    onSuccess: () => {
      toast({
        title: "Result updated successfully!",
        description: "Points have been calculated automatically.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-scores"] });
      setSelectedFixture(null);
      setHomeScore("");
      setAwayScore("");
    },
    onError: (error: any) => {
      toast({
        title: "Error updating result",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const calculateScoresMutation = useMutation({
    mutationFn: async (gameweekId: number) => {
      return apiRequest("POST", `/api/calculate-scores/${gameweekId}`, {});
    },
    onSuccess: () => {
      toast({
        title: "Scores calculated successfully!",
        description: "All weekly scores have been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/weekly-scores"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error calculating scores",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updateFixtureTeamsMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/admin/update-fixture-teams", {});
    },
    onSuccess: (data: any) => {
      toast({
        title: "Team names updated!",
        description: `Successfully updated ${data.updatedCount} fixtures with standardized Premier League team names.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error updating team names",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  // Reminder result state
  const [reminderResult, setReminderResult] = useState<any>(null);
  const [showReminderDialog, setShowReminderDialog] = useState(false);

  const sendRemindersMutation = useMutation({
    mutationFn: async ({ gameweekId, playerIds }: { gameweekId: number; playerIds?: number[] }) => {
      const response = await apiRequest("POST", "/api/admin/send-reminders", {
        gameweekId,
        type: "prediction",
        playerIds
      });
      return await response.json();
    },
    onSuccess: (data: any) => {
      setReminderResult(data);
      setShowReminderDialog(true);
      
      if (data.playersContacted === 0) {
        toast({
          title: "All predictions submitted!",
          description: "No reminders needed - everyone has already submitted their predictions.",
        });
      } else {
        toast({
          title: "Reminders prepared!",
          description: `Templates ready for ${data.playersContacted} players who need reminders`,
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error preparing reminders",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const addFixtureMutation = useMutation({
    mutationFn: async (fixtureData: any) => {
      return apiRequest("POST", "/api/fixtures", fixtureData);
    },
    onSuccess: () => {
      toast({
        title: "Fixture added successfully!",
        description: "The new fixture has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      setIsAddFixtureOpen(false);
      setNewFixture({
        homeTeam: "",
        awayTeam: "",
        kickoffTime: "",
        gameweekId: ""
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error adding fixture",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const editFixtureMutation = useMutation({
    mutationFn: async ({ fixtureId, updateData }: { fixtureId: number; updateData: any }) => {
      return apiRequest("PATCH", `/api/fixtures/${fixtureId}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Fixture updated successfully!",
        description: "The fixture has been modified.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/fixtures"] });
      setIsEditFixtureOpen(false);
      setEditingFixture(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating fixture",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const addGameweekMutation = useMutation({
    mutationFn: async (gameweekData: any) => {
      return apiRequest("POST", "/api/gameweeks", gameweekData);
    },
    onSuccess: () => {
      toast({
        title: "Gameweek created successfully!",
        description: "The new gameweek has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gameweeks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error creating gameweek",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const activateGameweekMutation = useMutation({
    mutationFn: async (gameweekId: number) => {
      return apiRequest("PATCH", `/api/gameweeks/${gameweekId}/activate`, {});
    },
    onSuccess: () => {
      toast({
        title: "Gameweek activated successfully!",
        description: "This gameweek is now active for predictions.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/gameweeks"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error activating gameweek",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const updatePredictionMutation = useMutation({
    mutationFn: async ({ predictionId, updateData }: { predictionId: number; updateData: any }) => {
      return apiRequest("PATCH", `/api/predictions/${predictionId}`, updateData);
    },
    onSuccess: () => {
      toast({
        title: "Prediction updated successfully!",
        description: "The player's prediction has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions", selectedPlayerId, activeGameweek?.id] });
      setIsEditPredictionOpen(false);
      setEditingPrediction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error updating prediction",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const createPredictionMutation = useMutation({
    mutationFn: async (newPrediction: any) => {
      return apiRequest("POST", "/api/predictions", newPrediction);
    },
    onSuccess: () => {
      toast({
        title: "Prediction added successfully!",
        description: "The missing prediction has been added.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/predictions", selectedPlayerId, activeGameweek?.id] });
      setIsAddPredictionOpen(false);
      setAddingPrediction(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error adding prediction",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleUpdateResult = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFixture || homeScore === "" || awayScore === "") {
      toast({
        title: "Missing information",
        description: "Please select a fixture and enter both scores",
        variant: "destructive",
      });
      return;
    }

    updateResultMutation.mutate({
      fixtureId: selectedFixture.id,
      homeScore: parseInt(homeScore),
      awayScore: parseInt(awayScore),
    });
  };

  const handleAddFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFixture.homeTeam || !newFixture.awayTeam || !newFixture.kickoffTime || !newFixture.gameweekId) {
      toast({
        title: "Missing information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    addFixtureMutation.mutate({
      homeTeam: newFixture.homeTeam,
      awayTeam: newFixture.awayTeam,
      kickoffTime: convertUKTimeToUTC(newFixture.kickoffTime),
      gameweekId: parseInt(newFixture.gameweekId),
    });
  };

  const handleAddGameweek = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameweek.name) {
      toast({
        title: "Missing information",
        description: "Please enter a gameweek name",
        variant: "destructive",
      });
      return;
    }

    const gameweekData = {
      name: newGameweek.name,
      type: newGameweek.type,
      ...(newGameweek.deadline && { deadline: new Date(newGameweek.deadline).toISOString() })
    };
    
    addGameweekMutation.mutate(gameweekData);
  };

  const handleEditFixture = (fixture: any) => {
    setEditingFixture(fixture);
    setIsEditFixtureOpen(true);
  };

  const handleUpdateFixture = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFixture) return;

    // Ensure kickoffTime is properly formatted
    let kickoffTimeISO;
    if (typeof editingFixture.kickoffTime === 'string') {
      // If it's a datetime-local string, convert it to UTC
      if (editingFixture.kickoffTime.includes('T')) {
        kickoffTimeISO = convertUKTimeToUTC(editingFixture.kickoffTime);
      } else {
        // If it's already an ISO string, use it directly
        kickoffTimeISO = editingFixture.kickoffTime;
      }
    } else {
      // If it's a Date object, convert to ISO
      kickoffTimeISO = new Date(editingFixture.kickoffTime).toISOString();
    }

    const updateData = {
      homeTeam: editingFixture.homeTeam,
      awayTeam: editingFixture.awayTeam,
      kickoffTime: kickoffTimeISO,
      gameweekId: editingFixture.gameweekId,
    };

    console.log('Updating fixture with data:', updateData);

    editFixtureMutation.mutate({
      fixtureId: editingFixture.id,
      updateData
    });
  };

  const incompleteFixtures = fixtures?.filter((f: any) => !f.isComplete) || [];
  const completedGameweeks = gameweeks?.filter((gw: any) => gw.isComplete) || [];

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-football-navy mb-2">
          <i className="fas fa-cog mr-2 text-football-green"></i>
          Admin Panel
        </h1>
        <p className="text-gray-600">Manage fixtures, update results, and calculate scores</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Fixture Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-football-navy">
              <i className="fas fa-futbol mr-2 text-football-green"></i>
              Fixture Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-football-green hover:bg-green-600">
                  <i className="fas fa-edit mr-2"></i>
                  Enter New Results
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter New Match Result</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateResult} className="space-y-4">
                  <div>
                    <Label htmlFor="fixture-select">Select Fixture</Label>
                    <Select onValueChange={(value) => {
                      const fixture = incompleteFixtures.find((f: any) => f.id === parseInt(value));
                      setSelectedFixture(fixture || null);
                      setHomeScore("");
                      setAwayScore("");
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a fixture to add result" />
                      </SelectTrigger>
                      <SelectContent>
                        {incompleteFixtures.map((fixture: any) => (
                          <SelectItem key={fixture.id} value={fixture.id.toString()}>
                            {fixture.homeTeam} vs {fixture.awayTeam}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFixture && (
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold">{selectedFixture.homeTeam} vs {selectedFixture.awayTeam}</h3>
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <div>
                          <Label htmlFor="home-score">{selectedFixture.homeTeam}</Label>
                          <Input
                            id="home-score"
                            type="number"
                            min="0"
                            max="20"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="w-20 text-center"
                          />
                        </div>
                        <span className="text-2xl font-bold text-gray-400">-</span>
                        <div>
                          <Label htmlFor="away-score">{selectedFixture.awayTeam}</Label>
                          <Input
                            id="away-score"
                            type="number"
                            min="0"
                            max="20"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="w-20 text-center"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-football-green hover:bg-green-600"
                    disabled={updateResultMutation.isPending || !selectedFixture}
                  >
                    {updateResultMutation.isPending ? "Adding..." : "Add Result"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* NEW: Edit Existing Results */}
            <Dialog>
              <DialogTrigger asChild>
                <Button className="w-full bg-football-red hover:bg-red-600" data-testid="button-edit-results">
                  <i className="fas fa-edit mr-2"></i>
                  Edit Existing Results
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Existing Result</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleUpdateResult} className="space-y-4">
                  <div>
                    <Label htmlFor="edit-fixture-select">Select Completed Fixture</Label>
                    <Select onValueChange={(value) => {
                      const fixture = fixtures.find((f: any) => f.id === parseInt(value));
                      setSelectedFixture(fixture || null);
                      if (fixture) {
                        setHomeScore(fixture.homeScore?.toString() || "");
                        setAwayScore(fixture.awayScore?.toString() || "");
                      }
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose a completed fixture to edit" />
                      </SelectTrigger>
                      <SelectContent>
                        {fixtures?.filter((f: any) => f.isComplete).map((fixture: any) => (
                          <SelectItem key={fixture.id} value={fixture.id.toString()}>
                            {fixture.homeTeam} vs {fixture.awayTeam} ({fixture.homeScore}-{fixture.awayScore})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFixture && (
                    <div className="border rounded-lg p-4 bg-red-50">
                      <div className="text-center mb-4">
                        <h3 className="font-semibold">{selectedFixture.homeTeam} vs {selectedFixture.awayTeam}</h3>
                        <p className="text-sm text-red-600 mt-1">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Editing will recalculate all points automatically
                        </p>
                      </div>
                      <div className="flex items-center justify-center space-x-4">
                        <div>
                          <Label htmlFor="edit-home-score">{selectedFixture.homeTeam}</Label>
                          <Input
                            id="edit-home-score"
                            type="number"
                            min="0"
                            max="20"
                            value={homeScore}
                            onChange={(e) => setHomeScore(e.target.value)}
                            className="w-20 text-center"
                            data-testid="input-home-score"
                          />
                        </div>
                        <span className="text-2xl font-bold text-gray-400">-</span>
                        <div>
                          <Label htmlFor="edit-away-score">{selectedFixture.awayTeam}</Label>
                          <Input
                            id="edit-away-score"
                            type="number"
                            min="0"
                            max="20"
                            value={awayScore}
                            onChange={(e) => setAwayScore(e.target.value)}
                            className="w-20 text-center"
                            data-testid="input-away-score"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-football-red hover:bg-red-600"
                    disabled={updateResultMutation.isPending || !selectedFixture}
                    data-testid="button-save-edit"
                  >
                    {updateResultMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isAddFixtureOpen} onOpenChange={setIsAddFixtureOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <i className="fas fa-plus mr-2"></i>
                  Add New Fixtures
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Fixture</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddFixture} className="space-y-4">
                  <div>
                    <Label htmlFor="gameweek-select">Gameweek</Label>
                    <Select onValueChange={(value) => setNewFixture({...newFixture, gameweekId: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gameweek" />
                      </SelectTrigger>
                      <SelectContent>
                        {gameweeks?.map((gameweek: any) => (
                          <SelectItem key={gameweek.id} value={gameweek.id.toString()}>
                            {gameweek.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Dynamic team selection based on gameweek type */}
                  {(() => {
                    const selectedGameweek = gameweeks.find((gw: any) => gw.id.toString() === newFixture.gameweekId);
                    const isPremierLeague = selectedGameweek && gameweekSupportsPremierLeagueTeams(selectedGameweek.type);
                    const teamOptions = getPremierLeagueTeamOptions();

                    if (isPremierLeague) {
                      return (
                        <>
                          <div>
                            <Label htmlFor="home-team">Home Team</Label>
                            <Select onValueChange={(value) => setNewFixture({...newFixture, homeTeam: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select home team" />
                              </SelectTrigger>
                              <SelectContent>
                                {teamOptions.map((team) => (
                                  <SelectItem key={team.value} value={team.value}>
                                    <div className="flex items-center">
                                      <img 
                                        src={team.badge.replace('@assets/', '/attached_assets/')} 
                                        alt={team.label} 
                                        className="w-4 h-4 mr-2" 
                                      />
                                      {team.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label htmlFor="away-team">Away Team</Label>
                            <Select onValueChange={(value) => setNewFixture({...newFixture, awayTeam: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select away team" />
                              </SelectTrigger>
                              <SelectContent>
                                {teamOptions.map((team) => (
                                  <SelectItem key={team.value} value={team.value}>
                                    <div className="flex items-center">
                                      <img 
                                        src={team.badge.replace('@assets/', '/attached_assets/')} 
                                        alt={team.label} 
                                        className="w-4 h-4 mr-2" 
                                      />
                                      {team.label}
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      );
                    } else {
                      return (
                        <>
                          <div>
                            <Label htmlFor="home-team">Home Team</Label>
                            <Input
                              id="home-team"
                              type="text"
                              value={newFixture.homeTeam}
                              onChange={(e) => setNewFixture({...newFixture, homeTeam: e.target.value})}
                              placeholder="e.g. England"
                            />
                          </div>

                          <div>
                            <Label htmlFor="away-team">Away Team</Label>
                            <Input
                              id="away-team"
                              type="text"
                              value={newFixture.awayTeam}
                              onChange={(e) => setNewFixture({...newFixture, awayTeam: e.target.value})}
                              placeholder="e.g. Spain"
                            />
                          </div>
                        </>
                      );
                    }
                  })()}

                  <div>
                    <Label htmlFor="kickoff-time">Kickoff Time (UK Time)</Label>
                    <Input
                      id="kickoff-time"
                      type="datetime-local"
                      value={newFixture.kickoffTime}
                      onChange={(e) => setNewFixture({...newFixture, kickoffTime: e.target.value})}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-red-accent hover:bg-red-accent-dark"
                    disabled={addFixtureMutation.isPending}
                  >
                    {addFixtureMutation.isPending ? "Adding..." : "Add Fixture"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setShowFixturesList(!showFixturesList)}
              data-testid="button-toggle-fixtures-list"
            >
              <i className={`fas ${showFixturesList ? 'fa-chevron-up' : 'fa-chevron-down'} mr-2`}></i>
              {showFixturesList ? 'Hide' : 'Show'} Existing Fixtures
            </Button>

            {/* Fixtures List for Editing */}
            {showFixturesList && (
              <div className="space-y-2 max-h-60 overflow-y-auto border rounded p-2 bg-gray-50">
              {fixtures
                .sort((a: any, b: any) => new Date(b.kickoffTime).getTime() - new Date(a.kickoffTime).getTime())
                .map((fixture: any) => (
                <div key={fixture.id} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="text-sm">
                    <div className="font-medium">{fixture.homeTeam} vs {fixture.awayTeam}</div>
                    <div className="text-gray-500">
                      {new Date(fixture.kickoffTime).toLocaleDateString()} {new Date(fixture.kickoffTime).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-xs text-blue-600">
                      {gameweeks.find((gw: any) => gw.id === fixture.gameweekId)?.name || `Gameweek ${fixture.gameweekId}`}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditFixture(fixture)}
                    data-testid={`button-edit-fixture-${fixture.id}`}
                  >
                    <i className="fas fa-edit mr-1"></i>
                    Edit
                  </Button>
                </div>
              ))}
              </div>
            )}

            {/* Edit Fixture Dialog */}
            <Dialog open={isEditFixtureOpen} onOpenChange={setIsEditFixtureOpen}>
              <DialogContent data-testid="dialog-edit-fixture">
                <DialogHeader>
                  <DialogTitle>Edit Fixture</DialogTitle>
                </DialogHeader>
                {editingFixture && (
                  <form onSubmit={handleUpdateFixture} className="space-y-4">
                    {/* Dynamic team selection for edit form */}
                    {(() => {
                      const editGameweek = gameweeks.find((gw: any) => gw.id === editingFixture.gameweekId);
                      const isEditPremierLeague = editGameweek && gameweekSupportsPremierLeagueTeams(editGameweek.type);
                      const editTeamOptions = getPremierLeagueTeamOptions();

                      if (isEditPremierLeague) {
                        return (
                          <>
                            <div>
                              <Label htmlFor="edit-home-team">Home Team</Label>
                              <Select 
                                onValueChange={(value) => setEditingFixture({...editingFixture, homeTeam: value})}
                                value={editingFixture.homeTeam || ""}
                              >
                                <SelectTrigger data-testid="select-edit-home-team">
                                  <SelectValue placeholder="Select home team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editTeamOptions.map((team) => (
                                    <SelectItem key={team.value} value={team.value}>
                                      <div className="flex items-center">
                                        <img 
                                          src={team.badge.replace('@assets/', '/attached_assets/')} 
                                          alt={team.label} 
                                          className="w-4 h-4 mr-2" 
                                        />
                                        {team.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label htmlFor="edit-away-team">Away Team</Label>
                              <Select 
                                onValueChange={(value) => setEditingFixture({...editingFixture, awayTeam: value})}
                                value={editingFixture.awayTeam || ""}
                              >
                                <SelectTrigger data-testid="select-edit-away-team">
                                  <SelectValue placeholder="Select away team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {editTeamOptions.map((team) => (
                                    <SelectItem key={team.value} value={team.value}>
                                      <div className="flex items-center">
                                        <img 
                                          src={team.badge.replace('@assets/', '/attached_assets/')} 
                                          alt={team.label} 
                                          className="w-4 h-4 mr-2" 
                                        />
                                        {team.label}
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </>
                        );
                      } else {
                        return (
                          <>
                            <div>
                              <Label htmlFor="edit-home-team">Home Team</Label>
                              <Input
                                id="edit-home-team"
                                type="text"
                                value={editingFixture.homeTeam || ""}
                                onChange={(e) => setEditingFixture({...editingFixture, homeTeam: e.target.value})}
                                placeholder="e.g. England"
                                data-testid="input-edit-home-team"
                              />
                            </div>

                            <div>
                              <Label htmlFor="edit-away-team">Away Team</Label>
                              <Input
                                id="edit-away-team"
                                type="text"
                                value={editingFixture.awayTeam || ""}
                                onChange={(e) => setEditingFixture({...editingFixture, awayTeam: e.target.value})}
                                placeholder="e.g. Spain"
                                data-testid="input-edit-away-team"
                              />
                            </div>
                          </>
                        );
                      }
                    })()}

                    <div>
                      <Label htmlFor="edit-kickoff-time">Kickoff Time (UK Time)</Label>
                      <Input
                        id="edit-kickoff-time"
                        type="datetime-local"
                        value={editingFixture.kickoffTime ? convertUTCToUKTime(editingFixture.kickoffTime) : ""}
                        onChange={(e) => setEditingFixture({...editingFixture, kickoffTime: e.target.value})}
                        data-testid="input-edit-kickoff-time"
                      />
                    </div>

                    <div>
                      <Label htmlFor="edit-gameweek">Gameweek</Label>
                      <Select 
                        onValueChange={(value) => setEditingFixture({...editingFixture, gameweekId: parseInt(value)})}
                        value={editingFixture.gameweekId?.toString()}
                      >
                        <SelectTrigger data-testid="select-edit-gameweek">
                          <SelectValue placeholder="Select gameweek" />
                        </SelectTrigger>
                        <SelectContent>
                          {gameweeks?.map((gameweek: any) => (
                            <SelectItem key={gameweek.id} value={gameweek.id.toString()}>
                              {gameweek.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex space-x-2">
                      <Button 
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={() => setIsEditFixtureOpen(false)}
                        data-testid="button-cancel-edit-fixture"
                      >
                        Cancel
                      </Button>
                      <Button 
                        type="submit" 
                        className="flex-1 bg-football-green hover:bg-green-600"
                        disabled={editFixtureMutation.isPending}
                        data-testid="button-update-fixture"
                      >
                        {editFixtureMutation.isPending ? "Updating..." : "Update Fixture"}
                      </Button>
                    </div>
                  </form>
                )}
              </DialogContent>
            </Dialog>

            <Dialog open={isAddGameweekOpen} onOpenChange={setIsAddGameweekOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <i className="fas fa-calendar-plus mr-2"></i>
                  Add New Gameweek
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Gameweek</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddGameweek} className="space-y-4">
                  <div>
                    <Label htmlFor="gameweek-name">Gameweek Name</Label>
                    <Input
                      id="gameweek-name"
                      type="text"
                      value={newGameweek.name}
                      onChange={(e) => setNewGameweek({...newGameweek, name: e.target.value})}
                      placeholder="e.g. Gameweek 16"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gameweek-type">Type</Label>
                    <Select onValueChange={(value) => setNewGameweek({...newGameweek, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="premier-league">Premier League</SelectItem>
                        <SelectItem value="international">International</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="gameweek-deadline">Deadline (Optional)</Label>
                    <Input
                      id="gameweek-deadline"
                      type="datetime-local"
                      value={newGameweek.deadline}
                      onChange={(e) => setNewGameweek({...newGameweek, deadline: e.target.value})}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-royal-blue hover:bg-royal-blue-dark"
                    disabled={addGameweekMutation.isPending}
                  >
                    {addGameweekMutation.isPending ? "Creating..." : "Create Gameweek"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* Gameweek Management */}
        <Card>
          <CardHeader>
            <CardTitle className="text-football-navy">
              <i className="fas fa-calendar mr-2 text-football-gold"></i>
              Gameweek Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Activate Gameweek</Label>
              <div className="space-y-2 mt-2">
                {gameweeks?.map((gameweek: any) => (
                  <div key={gameweek.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <span className="font-medium">{gameweek.name}</span>
                      <span className="ml-2 text-sm text-gray-600">({gameweek.type})</span>
                      {gameweek.isActive && (
                        <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                      )}
                    </div>
                    <Button
                      size="sm"
                      onClick={() => activateGameweekMutation.mutate(gameweek.id)}
                      disabled={activateGameweekMutation.isPending || gameweek.isActive}
                      className="bg-royal-blue hover:bg-royal-blue-dark"
                    >
                      <i className="fas fa-play mr-1"></i>
                      {gameweek.isActive ? "Active" : "Activate"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label>Calculate Weekly Scores</Label>
              <div className="space-y-2 mt-2">
                {completedGameweeks.map((gameweek: any) => (
                  <div key={gameweek.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{gameweek.name}</span>
                    <Button
                      size="sm"
                      onClick={() => calculateScoresMutation.mutate(gameweek.id)}
                      disabled={calculateScoresMutation.isPending}
                      className="bg-football-gold hover:bg-yellow-600"
                    >
                      <i className="fas fa-calculator mr-1"></i>
                      Calculate
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            <Link href="/players">
              <Button variant="outline" className="w-full">
                <i className="fas fa-users mr-2"></i>
                Manage Players
              </Button>
            </Link>

            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => updateFixtureTeamsMutation.mutate()}
              disabled={updateFixtureTeamsMutation.isPending}
            >
              <i className="fas fa-shield-alt mr-2"></i>
              {updateFixtureTeamsMutation.isPending ? "Updating..." : "Update Team Names"}
            </Button>

            <Link href="/predictions-overview">
              <Button variant="outline" className="w-full">
                <i className="fas fa-clipboard-list mr-2"></i>
                View Player Predictions
              </Button>
            </Link>

            <Button variant="outline" className="w-full">
              <i className="fas fa-chart-bar mr-2"></i>
              Generate Reports
            </Button>
          </CardContent>
        </Card>

      </div>

      {/* Send Reminders - Moved to prominent location */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-football-navy">
            <i className="fas fa-bell mr-2 text-football-gold"></i>
            Send Prediction Reminders
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Send prediction reminders for active gameweeks</Label>
            <div className="space-y-2 mt-2">
              {gameweeks?.filter((gw: any) => gw.isActive || !gw.isComplete).map((gameweek: any) => (
                <div key={gameweek.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{gameweek.name}</span>
                    <span className="ml-2 text-sm text-gray-600">({gameweek.type})</span>
                    {gameweek.isActive && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Active</span>
                    )}
                    {gameweek.deadline && (
                      <div className="text-xs text-gray-500 mt-1">
                        Deadline: {new Date(gameweek.deadline).toLocaleDateString('en-GB', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendRemindersMutation.mutate({ gameweekId: gameweek.id })}
                    disabled={sendRemindersMutation.isPending}
                    className="bg-football-gold hover:bg-yellow-600"
                  >
                    <i className="fas fa-bell mr-1"></i>
                    {sendRemindersMutation.isPending ? "Preparing..." : "Send Reminders"}
                  </Button>
                </div>
              ))}
            </div>
            {gameweeks?.filter((gw: any) => gw.isActive || !gw.isComplete).length === 0 && (
              <p className="text-gray-500 text-center py-4">No active gameweeks available for reminders</p>
            )}
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              <i className="fas fa-info-circle mr-2"></i>
              How Reminders Work
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click "Send Reminders" to generate email templates</li>
              <li>• Templates will appear in the browser console</li>
              <li>• Copy the email content and send manually</li>
              <li>• WhatsApp templates are also provided</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Templates Dialog */}
      <Dialog open={showReminderDialog} onOpenChange={setShowReminderDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-football-navy">
              <i className="fas fa-bell mr-2 text-football-gold"></i>
              Reminder Templates Ready
            </DialogTitle>
          </DialogHeader>
          
          {reminderResult && (
            <div className="space-y-6">
              {/* Player Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  <i className="fas fa-users mr-2"></i>
                  Players to Contact ({reminderResult.playersContacted})
                </h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {reminderResult.playerNames?.map((name: string, idx: number) => (
                    <div key={idx} className="flex justify-between">
                      <span>{name}</span>
                      <span className="text-gray-600">{reminderResult.playerEmails?.[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    <i className="fas fa-envelope mr-2"></i>
                    Email Template {reminderResult.emailTemplate ? `(${reminderResult.emailTemplate.length} chars)` : '(empty)'}
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(reminderResult.emailTemplate || '')}
                    className="bg-blue-500 hover:bg-blue-600"
                  >
                    <i className="fas fa-copy mr-1"></i>
                    Copy Email
                  </Button>
                </div>
                <textarea
                  value={reminderResult.emailTemplate || 'No email template available'}
                  readOnly
                  className="w-full h-48 p-3 text-sm bg-white border rounded-lg font-mono"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* WhatsApp Template */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-gray-900">
                    <i className="fab fa-whatsapp mr-2"></i>
                    WhatsApp Message {reminderResult.whatsappMessage ? `(${reminderResult.whatsappMessage.length} chars)` : '(empty)'}
                  </h4>
                  <Button
                    size="sm"
                    onClick={() => navigator.clipboard.writeText(reminderResult.whatsappMessage || '')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <i className="fas fa-copy mr-1"></i>
                    Copy WhatsApp
                  </Button>
                </div>
                <textarea
                  value={reminderResult.whatsappMessage || 'No WhatsApp message available'}
                  readOnly
                  className="w-full h-32 p-3 text-sm bg-white border rounded-lg font-mono"
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Sending Options */}
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  <i className="fas fa-paper-plane mr-2"></i>
                  Sending Options
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {reminderResult.alternatives?.map((alt: any, idx: number) => (
                    <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center mb-2">
                        <div className={`w-8 h-8 ${alt.color} rounded-full flex items-center justify-center mr-3`}>
                          <i className={`${alt.icon} text-white text-sm`}></i>
                        </div>
                        <span className="font-medium">{alt.method}</span>
                      </div>
                      <p className="text-sm text-gray-600">{alt.instruction}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => setShowReminderDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Player Predictions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-football-navy">
            <i className="fas fa-user-edit mr-2 text-football-gold"></i>
            Edit Player Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!activeGameweek ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="text-gray-500">No active gameweek available</p>
              <p className="text-sm text-gray-400 mt-1">Activate a gameweek to edit predictions</p>
            </div>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">
                  <i className="fas fa-info-circle mr-2"></i>
                  Active Gameweek: {activeGameweek.name}
                </h4>
                <p className="text-sm text-blue-800">
                  Edit predictions for players who had submission issues. Changes are saved immediately.
                </p>
              </div>

              <div>
                <Label>Select Player</Label>
                <Select value={selectedPlayerId} onValueChange={setSelectedPlayerId}>
                  <SelectTrigger data-testid="select-player-for-prediction-edit">
                    <SelectValue placeholder="Choose a player to edit predictions" />
                  </SelectTrigger>
                  <SelectContent>
                    {players.map((player: any) => (
                      <SelectItem key={player.id} value={player.id.toString()}>
                        {player.name} ({player.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedPlayerId && (() => {
                // Calculate missing predictions
                const gameweekFixtures = fixtures.filter((f: any) => f.gameweekId === activeGameweek.id);
                const predictedFixtureIds = new Set(playerPredictions.map((p: any) => p.fixtureId));
                const missingFixtures = gameweekFixtures.filter((f: any) => !predictedFixtureIds.has(f.id));

                return (
                  <div className="space-y-4">
                    {/* Existing Predictions */}
                    <div>
                      <Label className="text-green-700">
                        <i className="fas fa-check-circle mr-1"></i>
                        Existing Predictions ({playerPredictions.length})
                      </Label>
                      {playerPredictions.length === 0 ? (
                        <p className="text-gray-500 text-sm mt-2 p-4 bg-gray-50 rounded">
                          No predictions found for this player
                        </p>
                      ) : (
                        <div className="space-y-2 mt-2">
                          {playerPredictions.map((pred: any) => {
                            const fixture = fixtures.find((f: any) => f.id === pred.fixtureId);
                            if (!fixture) return null;
                            
                            return (
                              <div 
                                key={pred.id} 
                                className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 border border-green-200"
                              >
                                <div className="flex-1">
                                  <div className="font-medium">{fixture.homeTeam} vs {fixture.awayTeam}</div>
                                  <div className="text-sm text-gray-600">
                                    Prediction: {pred.homeScore}-{pred.awayScore}
                                    {pred.isJoker && <span className="ml-2 text-football-gold">⭐ Joker</span>}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setEditingPrediction({ ...pred, fixture });
                                    setIsEditPredictionOpen(true);
                                  }}
                                  data-testid={`button-edit-prediction-${pred.id}`}
                                >
                                  <i className="fas fa-edit mr-1"></i>
                                  Edit
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Missing Predictions */}
                    {missingFixtures.length > 0 && (
                      <div>
                        <Label className="text-orange-700">
                          <i className="fas fa-exclamation-triangle mr-1"></i>
                          Missing Predictions ({missingFixtures.length})
                        </Label>
                        <div className="space-y-2 mt-2">
                          {missingFixtures.map((fixture: any) => (
                            <div 
                              key={fixture.id} 
                              className="flex items-center justify-between p-3 bg-orange-50 rounded-lg hover:bg-orange-100 border border-orange-200"
                            >
                              <div className="flex-1">
                                <div className="font-medium">{fixture.homeTeam} vs {fixture.awayTeam}</div>
                                <div className="text-sm text-gray-600">
                                  {new Date(fixture.kickoffTime).toLocaleDateString('en-GB', {
                                    weekday: 'short',
                                    day: 'numeric',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </div>
                              </div>
                              <Button
                                size="sm"
                                variant="default"
                                className="bg-football-gold hover:bg-yellow-600"
                                onClick={() => {
                                  setAddingPrediction({ 
                                    fixture,
                                    homeScore: "0",
                                    awayScore: "0",
                                    isJoker: false
                                  });
                                  setIsAddPredictionOpen(true);
                                }}
                                data-testid={`button-add-prediction-${fixture.id}`}
                              >
                                <i className="fas fa-plus mr-1"></i>
                                Add
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Prediction Dialog */}
      <Dialog open={isEditPredictionOpen} onOpenChange={setIsEditPredictionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Prediction</DialogTitle>
          </DialogHeader>
          {editingPrediction && (
            <form onSubmit={(e) => {
              e.preventDefault();
              updatePredictionMutation.mutate({
                predictionId: editingPrediction.id,
                updateData: {
                  homeScore: parseInt(editingPrediction.homeScore),
                  awayScore: parseInt(editingPrediction.awayScore),
                  isJoker: editingPrediction.isJoker
                }
              });
            }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">
                  {editingPrediction.fixture.homeTeam} vs {editingPrediction.fixture.awayTeam}
                </h3>
                <p className="text-sm text-gray-600">
                  Player: {players.find((p: any) => p.id.toString() === selectedPlayerId)?.name}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div>
                  <Label htmlFor="edit-pred-home">{editingPrediction.fixture.homeTeam}</Label>
                  <Input
                    id="edit-pred-home"
                    type="number"
                    min="0"
                    max="20"
                    value={editingPrediction.homeScore}
                    onChange={(e) => setEditingPrediction({
                      ...editingPrediction,
                      homeScore: e.target.value
                    })}
                    className="w-20 text-center"
                    data-testid="input-edit-pred-home"
                  />
                </div>
                <span className="text-2xl font-bold text-gray-400">-</span>
                <div>
                  <Label htmlFor="edit-pred-away">{editingPrediction.fixture.awayTeam}</Label>
                  <Input
                    id="edit-pred-away"
                    type="number"
                    min="0"
                    max="20"
                    value={editingPrediction.awayScore}
                    onChange={(e) => setEditingPrediction({
                      ...editingPrediction,
                      awayScore: e.target.value
                    })}
                    className="w-20 text-center"
                    data-testid="input-edit-pred-away"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 justify-center p-3 bg-yellow-50 rounded-lg">
                <input
                  type="checkbox"
                  id="edit-pred-joker"
                  checked={editingPrediction.isJoker}
                  onChange={(e) => setEditingPrediction({
                    ...editingPrediction,
                    isJoker: e.target.checked
                  })}
                  className="w-4 h-4"
                  data-testid="checkbox-edit-pred-joker"
                />
                <Label htmlFor="edit-pred-joker" className="cursor-pointer">
                  ⭐ This is my joker (double points)
                </Label>
              </div>

              <div className="bg-orange-50 p-3 rounded text-sm text-orange-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Note: Only one joker per player per gameweek. Checking this will remove joker from other predictions.
              </div>

              <Button 
                type="submit" 
                className="w-full bg-football-gold hover:bg-yellow-600"
                disabled={updatePredictionMutation.isPending}
                data-testid="button-save-prediction-edit"
              >
                {updatePredictionMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Prediction Dialog */}
      <Dialog open={isAddPredictionOpen} onOpenChange={setIsAddPredictionOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Missing Prediction</DialogTitle>
          </DialogHeader>
          {addingPrediction && (
            <form onSubmit={(e) => {
              e.preventDefault();
              createPredictionMutation.mutate({
                playerId: parseInt(selectedPlayerId),
                fixtureId: addingPrediction.fixture.id,
                homeScore: parseInt(addingPrediction.homeScore),
                awayScore: parseInt(addingPrediction.awayScore),
                isJoker: addingPrediction.isJoker
              });
            }} className="space-y-4">
              <div className="text-center mb-4">
                <h3 className="font-semibold">
                  {addingPrediction.fixture.homeTeam} vs {addingPrediction.fixture.awayTeam}
                </h3>
                <p className="text-sm text-gray-600">
                  Player: {players.find((p: any) => p.id.toString() === selectedPlayerId)?.name}
                </p>
              </div>

              <div className="flex items-center justify-center space-x-4">
                <div>
                  <Label htmlFor="add-pred-home">{addingPrediction.fixture.homeTeam}</Label>
                  <Input
                    id="add-pred-home"
                    type="number"
                    min="0"
                    max="20"
                    value={addingPrediction.homeScore}
                    onChange={(e) => setAddingPrediction({
                      ...addingPrediction,
                      homeScore: e.target.value
                    })}
                    className="w-20 text-center"
                    data-testid="input-add-pred-home"
                    required
                  />
                </div>
                <span className="text-2xl font-bold text-gray-400">-</span>
                <div>
                  <Label htmlFor="add-pred-away">{addingPrediction.fixture.awayTeam}</Label>
                  <Input
                    id="add-pred-away"
                    type="number"
                    min="0"
                    max="20"
                    value={addingPrediction.awayScore}
                    onChange={(e) => setAddingPrediction({
                      ...addingPrediction,
                      awayScore: e.target.value
                    })}
                    className="w-20 text-center"
                    data-testid="input-add-pred-away"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 justify-center p-3 bg-yellow-50 rounded-lg">
                <input
                  type="checkbox"
                  id="add-pred-joker"
                  checked={addingPrediction.isJoker}
                  onChange={(e) => setAddingPrediction({
                    ...addingPrediction,
                    isJoker: e.target.checked
                  })}
                  className="w-4 h-4"
                  data-testid="checkbox-add-pred-joker"
                />
                <Label htmlFor="add-pred-joker" className="cursor-pointer">
                  ⭐ This is my joker (double points)
                </Label>
              </div>

              <div className="bg-orange-50 p-3 rounded text-sm text-orange-800">
                <i className="fas fa-exclamation-triangle mr-2"></i>
                Note: Only one joker per player per gameweek. Checking this will remove joker from other predictions.
              </div>

              <Button 
                type="submit" 
                className="w-full bg-football-gold hover:bg-yellow-600"
                disabled={createPredictionMutation.isPending}
                data-testid="button-save-prediction-add"
              >
                {createPredictionMutation.isPending ? "Adding..." : "Add Prediction"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Recent Fixtures Status */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-football-navy">
            <i className="fas fa-list mr-2 text-football-green"></i>
            Fixture Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!fixtures || fixtures.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No fixtures available</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Match</th>
                    <th className="text-center py-3 px-4">Kickoff</th>
                    <th className="text-center py-3 px-4">Score</th>
                    <th className="text-center py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {fixtures.slice(0, 10).map((fixture: any) => (
                    <tr key={fixture.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="font-semibold">{fixture.homeTeam} vs {fixture.awayTeam}</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="text-sm">
                          {new Date(fixture.kickoffTime).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        {fixture.isComplete ? (
                          <div className="font-bold font-mono">{fixture.homeScore} - {fixture.awayScore}</div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          fixture.isComplete
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {fixture.isComplete ? 'Completed' : 'Pending'}
                        </span>
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

export default Admin;
