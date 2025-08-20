import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { Gameweek, Fixture, Prediction } from "@shared/schema";

// Helper function for UK timezone display
const formatUKTime = (utcDateString: string): string => {
  const date = new Date(utcDateString);
  return date.toLocaleDateString('en-US', {
    timeZone: 'Europe/London',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

interface PredictionFormProps {
  gameweek: Gameweek;
  fixtures: Fixture[];
  predictions: Prediction[];
  playerId: number;
}

const PredictionForm = ({ gameweek, fixtures, predictions, playerId }: PredictionFormProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create a map of existing predictions
  const existingPredictions = new Map(
    predictions.map(p => [p.fixtureId, p])
  );

  const [formData, setFormData] = useState(() => {
    const initial: Record<number, { homeScore: string; awayScore: string; isJoker: boolean }> = {};
    fixtures.forEach(fixture => {
      const existing = existingPredictions.get(fixture.id);
      initial[fixture.id] = {
        homeScore: existing?.homeScore?.toString() || "",
        awayScore: existing?.awayScore?.toString() || "",
        isJoker: existing?.isJoker || false,
      };
    });
    return initial;
  });

  // State for validation dialog
  const [showValidationDialog, setShowValidationDialog] = useState(false);
  const [validationMessage, setValidationMessage] = useState("");
  const [pendingSubmission, setPendingSubmission] = useState<any[]>([]);

  // Track which fields have been changed and submitted
  const [fieldStates, setFieldStates] = useState<Record<number, { homeChanged: boolean; awayChanged: boolean; submitted: boolean }>>(() => {
    const initial: Record<number, { homeChanged: boolean; awayChanged: boolean; submitted: boolean }> = {};
    fixtures.forEach(fixture => {
      const existing = existingPredictions.get(fixture.id);
      initial[fixture.id] = {
        homeChanged: !!existing,
        awayChanged: !!existing,
        submitted: !!existing,
      };
    });
    return initial;
  });

  const submitPredictionsMutation = useMutation({
    mutationFn: async (predictions: any[]) => {
      return apiRequest("POST", "/api/predictions", predictions);
    },
    onSuccess: () => {
      toast({
        title: "Predictions submitted successfully!",
        description: "Your predictions have been saved.",
      });
      
      // Mark all submitted fixtures as submitted
      setFieldStates(prev => {
        const updated = { ...prev };
        fixtures.forEach(fixture => {
          const data = formData[fixture.id];
          if (data.homeScore !== "" && data.awayScore !== "" && 
              !isNaN(parseInt(data.homeScore)) && !isNaN(parseInt(data.awayScore))) {
            updated[fixture.id] = {
              ...updated[fixture.id],
              submitted: true,
            };
          }
        });
        return updated;
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error: any) => {
      toast({
        title: "Error submitting predictions",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (fixtureId: number, field: 'homeScore' | 'awayScore', value: string) => {
    setFormData(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [field]: value,
      },
    }));
    
    // Mark field as changed
    setFieldStates(prev => ({
      ...prev,
      [fixtureId]: {
        ...prev[fixtureId],
        [field === 'homeScore' ? 'homeChanged' : 'awayChanged']: true,
        submitted: false, // Reset submitted state when changed
      },
    }));
  };

  const handleJokerChange = (fixtureId: number, isJoker: boolean) => {
    setFormData(prev => {
      const updated = { ...prev };
      
      // Clear all other jokers first
      Object.keys(updated).forEach(id => {
        updated[Number(id)].isJoker = false;
      });
      
      // Set the new joker
      updated[fixtureId].isJoker = isJoker;
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const predictionsToSubmit = fixtures
      .filter(fixture => {
        const data = formData[fixture.id];
        // Include predictions where both scores are provided (including 0)
        return data.homeScore !== "" && data.awayScore !== "" && 
               !isNaN(parseInt(data.homeScore)) && !isNaN(parseInt(data.awayScore));
      })
      .map(fixture => ({
        playerId,
        fixtureId: fixture.id,
        homeScore: parseInt(formData[fixture.id].homeScore),
        awayScore: parseInt(formData[fixture.id].awayScore),
        isJoker: formData[fixture.id].isJoker,
      }));

    if (predictionsToSubmit.length === 0) {
      toast({
        title: "No predictions to submit",
        description: "Please enter at least one prediction",
        variant: "destructive",
      });
      return;
    }

    // Validation checks
    const missingPredictions = fixtures.length - predictionsToSubmit.length;
    const hasJoker = predictionsToSubmit.some(p => p.isJoker);
    
    let warnings = [];
    if (missingPredictions > 0) {
      warnings.push(`${missingPredictions} prediction${missingPredictions > 1 ? 's' : ''} missing`);
    }
    if (!hasJoker && predictionsToSubmit.length > 0) {
      warnings.push("No joker selected");
    }

    // If there are warnings, show confirmation dialog
    if (warnings.length > 0) {
      const warningText = warnings.join(" and ");
      setValidationMessage(`You have ${warningText}. Are you sure you want to submit your predictions?`);
      setPendingSubmission(predictionsToSubmit);
      setShowValidationDialog(true);
      return;
    }

    // No warnings, submit directly
    submitPredictionsMutation.mutate(predictionsToSubmit);
  };

  const handleConfirmSubmission = () => {
    setShowValidationDialog(false);
    submitPredictionsMutation.mutate(pendingSubmission);
    setPendingSubmission([]);
  };

  const handleCancelSubmission = () => {
    setShowValidationDialog(false);
    setPendingSubmission([]);
  };

  const isDeadlinePassed = gameweek.deadline ? new Date() > new Date(gameweek.deadline) : false;
  const timeToDeadline = gameweek.deadline ? Math.max(0, new Date(gameweek.deadline).getTime() - new Date().getTime()) : Infinity;
  const hoursLeft = gameweek.deadline ? Math.floor(timeToDeadline / (1000 * 60 * 60)) : 999;

  const getTeamAbbreviation = (teamName: string) => {
    const abbrevs: Record<string, string> = {
      'Arsenal': 'ARS',
      'Chelsea': 'CHE',
      'Liverpool': 'LIV',
      'Manchester City': 'MCI',
      'Manchester United': 'MUN',
      'Tottenham': 'TOT',
      'Newcastle': 'NEW',
      'Brighton': 'BHA',
      'Aston Villa': 'AVL',
      'West Ham': 'WHU',
      'Crystal Palace': 'CRY',
      'Everton': 'EVE',
      'Fulham': 'FUL',
      'Brentford': 'BRE',
      'Nottingham Forest': 'NFO',
      'Wolves': 'WOL',
      'Sheffield United': 'SHU',
      'Burnley': 'BUR',
      'Bournemouth': 'BOU',
      'Luton Town': 'LUT',
    };
    return abbrevs[teamName] || teamName.substring(0, 3).toUpperCase();
  };

  const getTeamColor = (teamName: string) => {
    const colors: Record<string, string> = {
      'Arsenal': 'bg-red-500',
      'Chelsea': 'bg-blue-500',
      'Liverpool': 'bg-red-600',
      'Manchester City': 'bg-blue-800',
      'Manchester United': 'bg-red-700',
      'Tottenham': 'bg-white border-2 border-gray-300',
      'Newcastle': 'bg-black',
      'Brighton': 'bg-blue-400',
      'Aston Villa': 'bg-purple-600',
      'West Ham': 'bg-purple-800',
      'Crystal Palace': 'bg-blue-600',
      'Everton': 'bg-blue-700',
      'Fulham': 'bg-black',
      'Brentford': 'bg-red-400',
      'Nottingham Forest': 'bg-red-800',
      'Wolves': 'bg-yellow-600',
      'Sheffield United': 'bg-red-600',
      'Burnley': 'bg-purple-700',
      'Bournemouth': 'bg-red-400',
      'Luton Town': 'bg-orange-500',
    };
    return colors[teamName] || 'bg-gray-500';
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-football-navy">
          <i className="fas fa-clipboard-list mr-2 text-football-green"></i>
          {gameweek.name} Predictions
        </h2>
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">Deadline:</div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            isDeadlinePassed 
              ? "bg-red-100 text-red-800" 
              : hoursLeft < 24 
                ? "bg-red-100 text-red-800" 
                : "bg-green-100 text-green-800"
          }`}>
            <i className="fas fa-clock mr-1"></i>
            {isDeadlinePassed ? "Deadline passed" : `${hoursLeft}h left`}
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-football-green bg-opacity-10 rounded-lg border border-football-green border-opacity-30">
        <h3 className="font-semibold text-football-navy mb-2">
          <i className="fas fa-star mr-2 text-football-gold"></i>Joker Available
        </h3>
        <p className="text-sm text-gray-600">Select one match to double your points this week. Choose wisely!</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {fixtures.map((fixture, index) => {
          const data = formData[fixture.id] || { homeScore: "", awayScore: "", isJoker: false };
          const states = fieldStates[fixture.id] || { homeChanged: false, awayChanged: false, submitted: false };
          const kickoffTime = formatUKTime(fixture.kickoffTime);

          // Helper function to get input styling
          const getInputStyling = (field: 'homeScore' | 'awayScore') => {
            const isHome = field === 'homeScore';
            const hasChanged = isHome ? states.homeChanged : states.awayChanged;
            const value = isHome ? data.homeScore : data.awayScore;
            
            if (states.submitted && value !== "") {
              return "border-green-500 bg-green-50 focus:border-green-600 focus:ring-green-200";
            } else if (hasChanged && value !== "") {
              return "border-orange-500 bg-orange-50 focus:border-orange-600 focus:ring-orange-200";
            }
            return "focus:border-football-green focus:ring-2 focus:ring-football-green focus:ring-opacity-20";
          };

          return (
            <div key={fixture.id} className={`bg-gray-50 rounded-lg p-4 border-2 transition-colors ${
              data.isJoker ? 'border-football-gold bg-football-gold bg-opacity-5' : 'border-gray-200 hover:border-football-green'
            }`}>
              {/* Mobile-first responsive layout */}
              <div className="space-y-3">
                {/* Header with joker and time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="joker"
                      checked={data.isJoker}
                      onChange={(e) => handleJokerChange(fixture.id, e.target.checked)}
                      className="w-4 h-4 text-football-green"
                      disabled={isDeadlinePassed}
                    />
                    <label className={`text-sm font-medium ${data.isJoker ? 'text-football-gold' : 'text-gray-400'}`}>
                      <i className={data.isJoker ? "fas fa-star" : "far fa-star"}></i>
                    </label>
                  </div>
                  <div className="text-sm text-gray-500 font-medium">{kickoffTime}</div>
                </div>

                {/* Teams and scores - mobile optimized */}
                <div className="flex items-center justify-between">
                  {/* Home team */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <div className="text-sm font-semibold text-football-navy truncate">
                      {fixture.homeTeam}
                    </div>
                    <div className={`w-10 h-10 ${getTeamColor(fixture.homeTeam)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-xs font-bold ${
                        fixture.homeTeam === 'Tottenham' ? 'text-gray-700' : 'text-white'
                      }`}>
                        {getTeamAbbreviation(fixture.homeTeam)}
                      </span>
                    </div>
                  </div>

                  {/* Score inputs - centered */}
                  <div className="flex items-center space-x-2 mx-4">
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={data.homeScore}
                      onChange={(e) => handleInputChange(fixture.id, 'homeScore', e.target.value)}
                      className={`w-14 h-10 text-center font-mono text-lg transition-colors ${getInputStyling('homeScore')}`}
                      placeholder="0"
                      disabled={isDeadlinePassed}
                    />
                    <span className="text-gray-400 font-bold text-lg">-</span>
                    <Input
                      type="number"
                      min="0"
                      max="20"
                      value={data.awayScore}
                      onChange={(e) => handleInputChange(fixture.id, 'awayScore', e.target.value)}
                      className={`w-14 h-10 text-center font-mono text-lg transition-colors ${getInputStyling('awayScore')}`}
                      placeholder="0"
                      disabled={isDeadlinePassed}
                    />
                  </div>

                  {/* Away team */}
                  <div className="flex items-center space-x-2 flex-1 min-w-0 justify-end">
                    <div className={`w-10 h-10 ${getTeamColor(fixture.awayTeam)} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`text-xs font-bold ${
                        fixture.awayTeam === 'Tottenham' ? 'text-gray-700' : 'text-white'
                      }`}>
                        {getTeamAbbreviation(fixture.awayTeam)}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-football-navy truncate text-right">
                      {fixture.awayTeam}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-6 border-t space-y-3 sm:space-y-0">
          <div className="text-sm text-gray-500 text-center sm:text-left">
            <i className="fas fa-info-circle mr-2"></i>
            5 points for correct score, 3 points for correct result
          </div>
          <div className="flex space-x-3 justify-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              disabled={isDeadlinePassed}
            >
              Save Draft
            </Button>
            <Button
              type="submit"
              disabled={submitPredictionsMutation.isPending || isDeadlinePassed}
              className="bg-football-green hover:bg-green-600"
            >
              <i className="fas fa-paper-plane mr-2"></i>
              {submitPredictionsMutation.isPending ? "Submitting..." : "Submit Predictions"}
            </Button>
          </div>
        </div>
      </form>

      {/* Validation Dialog */}
      <AlertDialog open={showValidationDialog} onOpenChange={setShowValidationDialog}>
        <AlertDialogContent data-testid="prediction-validation-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <i className="fas fa-exclamation-triangle text-yellow-500 mr-2"></i>
              Check Your Predictions
            </AlertDialogTitle>
            <AlertDialogDescription>
              {validationMessage}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelSubmission} data-testid="button-cancel-submission">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleConfirmSubmission} 
              className="bg-football-green hover:bg-green-600"
              data-testid="button-confirm-submission"
            >
              Submit Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PredictionForm;
