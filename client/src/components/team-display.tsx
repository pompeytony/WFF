import { getPremierLeagueTeamByName } from "@shared/premierLeagueTeams";

// Import all badge images that actually exist
import arsenalBadge from "@assets/generated_images/Arsenal_FC_badge_c9c55cad.png";
import astonVillaBadge from "@assets/generated_images/Aston_Villa_badge_de451a89.png";
import bournemouthBadge from "@assets/generated_images/Bournemouth_FC_badge_7725e371.png";
import brentfordBadge from "@assets/generated_images/Brentford_FC_badge_4dbea0d4.png";
import brightonBadge from "@assets/generated_images/Brighton_FC_badge_c95f8c2f.png";
import burnleyBadge from "@assets/generated_images/Burnley_FC_badge_8779ed43.png";
import chelseaBadge from "@assets/generated_images/Chelsea_FC_badge_ecba08da.png";
import crystalPalaceBadge from "@assets/generated_images/Crystal_Palace_badge_6fb932f6.png";
import evertonBadge from "@assets/generated_images/Everton_FC_badge_76fb8550.png";
import fulhamBadge from "@assets/generated_images/Fulham_FC_badge_bc1421e1.png";
import liverpoolBadge from "@assets/generated_images/Liverpool_FC_badge_db6fd83a.png";
import lutonBadge from "@assets/generated_images/Luton_Town_badge_5f526675.png";
import manchesterCityBadge from "@assets/generated_images/Manchester_City_badge_cdd480cd.png";
import manchesterUnitedBadge from "@assets/generated_images/Manchester_United_badge_f70bef44.png";
import newcastleBadge from "@assets/generated_images/Newcastle_United_badge_2613b454.png";
import nottinghamForestBadge from "@assets/generated_images/Nottingham_Forest_badge_6626154e.png";
import sheffieldUnitedBadge from "@assets/generated_images/Sheffield_United_badge_8a8218e2.png";
import tottenhamBadge from "@assets/generated_images/Tottenham_Hotspur_badge_525f19f9.png";
import westHamBadge from "@assets/generated_images/West_Ham_United_badge_1af01d20.png";
import wolvesBadge from "@assets/generated_images/Wolves_FC_badge_05aea6d1.png";

// Badge map - only for teams with available badges
const badgeMap: Record<string, string> = {
  arsenal: arsenalBadge,
  'aston-villa': astonVillaBadge,
  bournemouth: bournemouthBadge,
  brentford: brentfordBadge,
  brighton: brightonBadge,
  burnley: burnleyBadge,
  chelsea: chelseaBadge,
  'crystal-palace': crystalPalaceBadge,
  everton: evertonBadge,
  fulham: fulhamBadge,
  'luton-town': lutonBadge,
  liverpool: liverpoolBadge,
  'manchester-city': manchesterCityBadge,
  'manchester-united': manchesterUnitedBadge,
  newcastle: newcastleBadge,
  'nottingham-forest': nottinghamForestBadge,
  'sheffield-united': sheffieldUnitedBadge,
  tottenham: tottenhamBadge,
  'west-ham': westHamBadge,
  wolves: wolvesBadge,
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
        <img 
          src={badgeUrl} 
          alt={`${team.name} badge`} 
          className={`${sizeClasses[size]} mr-2 flex-shrink-0`}
          onError={(e) => {
            console.error(`Failed to load badge for ${team.name}:`, badgeUrl);
            // Hide the image on error and show fallback icon instead
            e.currentTarget.style.display = 'none';
          }}
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