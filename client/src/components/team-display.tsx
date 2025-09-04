import { getPremierLeagueTeamByName } from "@shared/premierLeagueTeams";

interface TeamDisplayProps {
  teamName: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const TeamDisplay = ({ teamName, size = 'medium', className = '' }: TeamDisplayProps) => {
  const team = getPremierLeagueTeamByName(teamName);
  
  const sizeClasses = {
    small: 'w-4 h-4',
    medium: 'w-5 h-5',
    large: 'w-6 h-6'
  };
  
  const textSizeClasses = {
    small: 'text-sm',
    medium: 'text-base',
    large: 'text-lg'
  };

  if (team) {
    return (
      <div className={`flex items-center ${className}`} data-testid={`team-display-${team.id}`}>
        <img 
          src={team.badgePath.replace('@assets/', '/attached_assets/')} 
          alt={`${team.name} badge`} 
          className={`${sizeClasses[size]} mr-2 flex-shrink-0`}
        />
        <span className={`${textSizeClasses[size]} truncate`}>{teamName}</span>
      </div>
    );
  }

  // Fallback for non-Premier League teams (International matches, etc.)
  return (
    <div className={`flex items-center ${className}`} data-testid={`team-display-fallback`}>
      <div className={`${sizeClasses[size]} mr-2 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0`}>
        <i className="fas fa-shield-alt text-gray-400 text-xs"></i>
      </div>
      <span className={`${textSizeClasses[size]} truncate`}>{teamName}</span>
    </div>
  );
};

export default TeamDisplay;