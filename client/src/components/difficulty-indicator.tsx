import { calculateMatchDifficulty, type MatchDifficulty } from "@shared/premierLeagueTeams";
import { Trophy, Target, TrendingUp, AlertCircle, Zap } from "lucide-react";

interface DifficultyIndicatorProps {
  homeTeam: string;
  awayTeam: string;
  size?: "small" | "medium" | "large";
  showLabel?: boolean;
  className?: string;
}

const DifficultyIndicator = ({ 
  homeTeam, 
  awayTeam, 
  size = "medium", 
  showLabel = true,
  className = ""
}: DifficultyIndicatorProps) => {
  const difficulty = calculateMatchDifficulty(homeTeam, awayTeam);
  console.log('DifficultyIndicator render:', { homeTeam, awayTeam, difficulty });
  
  const getIcon = (level: MatchDifficulty['level']) => {
    const iconClass = size === "small" ? "w-3 h-3" : size === "medium" ? "w-4 h-4" : "w-5 h-5";
    
    switch (level) {
      case 'very-easy':
        return <Target className={iconClass} />;
      case 'easy':
        return <TrendingUp className={iconClass} />;
      case 'medium':
        return <AlertCircle className={iconClass} />;
      case 'hard':
        return <Trophy className={iconClass} />;
      case 'very-hard':
        return <Zap className={iconClass} />;
    }
  };
  
  const sizeClasses = {
    small: "px-2 py-0.5 text-xs",
    medium: "px-2.5 py-1 text-sm",
    large: "px-3 py-1.5 text-base"
  };
  
  return (
    <div 
      className={`inline-flex items-center gap-1 rounded-full font-medium ${difficulty.bgColor} ${difficulty.color} ${sizeClasses[size]} ${className}`}
      data-testid={`difficulty-${difficulty.level}`}
      title={`Prediction Difficulty: ${difficulty.label} (${difficulty.score}/10)`}
    >
      {getIcon(difficulty.level)}
      {showLabel && <span>{difficulty.label}</span>}
    </div>
  );
};

export default DifficultyIndicator;
