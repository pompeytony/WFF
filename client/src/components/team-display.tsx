import { getPremierLeagueTeamByName } from "@shared/premierLeagueTeams";

// Badge map using public asset paths
const badgeMap: Record<string, string> = {
  arsenal: '/badges/Arsenal_FC_badge_c9c55cad.png',
  'aston-villa': '/badges/Aston_Villa_badge_de451a89.png',
  bournemouth: '/badges/Bournemouth_FC_badge_7725e371.png',
  brentford: '/badges/Brentford_FC_badge_4dbea0d4.png',
  brighton: '/badges/Brighton_FC_badge_c95f8c2f.png',
  burnley: '/badges/Burnley_FC_badge_8779ed43.png',
  chelsea: '/badges/Chelsea_FC_badge_ecba08da.png',
  'crystal-palace': '/badges/Crystal_Palace_badge_6fb932f6.png',
  everton: '/badges/Everton_FC_badge_76fb8550.png',
  fulham: '/badges/Fulham_FC_badge_bc1421e1.png',
  'luton-town': '/badges/Luton_Town_badge_5f526675.png',
  liverpool: '/badges/Liverpool_FC_badge_db6fd83a.png',
  'manchester-city': '/badges/Manchester_City_badge_cdd480cd.png',
  'manchester-united': '/badges/Manchester_United_badge_f70bef44.png',
  newcastle: '/badges/Newcastle_United_badge_2613b454.png',
  'nottingham-forest': '/badges/Nottingham_Forest_badge_6626154e.png',
  'sheffield-united': '/badges/Sheffield_United_badge_8a8218e2.png',
  tottenham: '/badges/Tottenham_Hotspur_badge_525f19f9.png',
  'west-ham': '/badges/West_Ham_United_badge_1af01d20.png',
  wolves: '/badges/Wolves_FC_badge_05aea6d1.png',
};

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
    const badgeUrl = badgeMap[team.id];
    return (
      <div className={`flex items-center ${className}`} data-testid={`team-display-${team.id}`}>
        {badgeUrl ? (
          <img 
            src={badgeUrl} 
            alt={`${team.name} badge`} 
            className={`${sizeClasses[size]} mr-2 flex-shrink-0`}
            onError={(e) => {
              // Hide the image on error and show fallback icon instead
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <div className={`${sizeClasses[size]} mr-2 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0`}>
            <i className="fas fa-shield-alt text-gray-400 text-xs"></i>
          </div>
        )}
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