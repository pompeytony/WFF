export interface PremierLeagueTeam {
  id: string;
  name: string;
  shortName: string;
  badgePath: string;
  primaryColor: string;
  secondaryColor: string;
  strengthRating: number; // 1-10 scale: 10 = strongest (Man City, Liverpool), 1 = weakest
}

export const PREMIER_LEAGUE_TEAMS: PremierLeagueTeam[] = [
  {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    badgePath: '@assets/generated_images/Arsenal_FC_badge_c9c55cad.png',
    primaryColor: '#DC143C',
    secondaryColor: '#FFFFFF',
    strengthRating: 9
  },
  {
    id: 'aston-villa',
    name: 'Aston Villa',
    shortName: 'AVL',
    badgePath: '@assets/generated_images/Aston_Villa_badge_de451a89.png',
    primaryColor: '#7A003C',
    secondaryColor: '#95BFE5',
    strengthRating: 7
  },
  {
    id: 'bournemouth',
    name: 'AFC Bournemouth',
    shortName: 'BOU',
    badgePath: '@assets/generated_images/Bournemouth_FC_badge_7725e371.png',
    primaryColor: '#DA020E',
    secondaryColor: '#000000',
    strengthRating: 5
  },
  {
    id: 'brentford',
    name: 'Brentford',
    shortName: 'BRE',
    badgePath: '@assets/generated_images/Brentford_FC_badge_4dbea0d4.png',
    primaryColor: '#D20000',
    secondaryColor: '#FFFFFF',
    strengthRating: 5
  },
  {
    id: 'brighton',
    name: 'Brighton & Hove Albion',
    shortName: 'BHA',
    badgePath: '@assets/generated_images/Brighton_FC_badge_c95f8c2f.png',
    primaryColor: '#0057B8',
    secondaryColor: '#FFCD00',
    strengthRating: 6
  },
  {
    id: 'burnley',
    name: 'Burnley',
    shortName: 'BUR',
    badgePath: '@assets/generated_images/Burnley_FC_badge_8779ed43.png',
    primaryColor: '#6C1D45',
    secondaryColor: '#99D6EA',
    strengthRating: 3
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    shortName: 'CHE',
    badgePath: '@assets/generated_images/Chelsea_FC_badge_ecba08da.png',
    primaryColor: '#034694',
    secondaryColor: '#FFFFFF',
    strengthRating: 8
  },
  {
    id: 'crystal-palace',
    name: 'Crystal Palace',
    shortName: 'CRY',
    badgePath: '@assets/generated_images/Crystal_Palace_badge_6fb932f6.png',
    primaryColor: '#1B458F',
    secondaryColor: '#C4122E',
    strengthRating: 5
  },
  {
    id: 'everton',
    name: 'Everton',
    shortName: 'EVE',
    badgePath: '@assets/generated_images/Everton_FC_badge_76fb8550.png',
    primaryColor: '#003399',
    secondaryColor: '#FFFFFF',
    strengthRating: 4
  },
  {
    id: 'fulham',
    name: 'Fulham',
    shortName: 'FUL',
    badgePath: '@assets/generated_images/Fulham_FC_badge_bc1421e1.png',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000',
    strengthRating: 5
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    badgePath: '@assets/generated_images/Liverpool_FC_badge_db6fd83a.png',
    primaryColor: '#C8102E',
    secondaryColor: '#F6EB61',
    strengthRating: 10
  },
  {
    id: 'luton',
    name: 'Luton Town',
    shortName: 'LUT',
    badgePath: '@assets/generated_images/Luton_Town_badge_5f526675.png',
    primaryColor: '#F78F1E',
    secondaryColor: '#002D5C',
    strengthRating: 2
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'MCI',
    badgePath: '@assets/generated_images/Manchester_City_badge_cdd480cd.png',
    primaryColor: '#6CABDD',
    secondaryColor: '#1C2C5B',
    strengthRating: 10
  },
  {
    id: 'manchester-united',
    name: 'Manchester United',
    shortName: 'MUN',
    badgePath: '@assets/generated_images/Manchester_United_badge_f70bef44.png',
    primaryColor: '#DA020E',
    secondaryColor: '#FBE122',
    strengthRating: 7
  },
  {
    id: 'newcastle',
    name: 'Newcastle United',
    shortName: 'NEW',
    badgePath: '@assets/generated_images/Newcastle_United_badge_2613b454.png',
    primaryColor: '#241F20',
    secondaryColor: '#FFFFFF',
    strengthRating: 8
  },
  {
    id: 'nottingham-forest',
    name: 'Nottingham Forest',
    shortName: 'NFO',
    badgePath: '@assets/generated_images/Nottingham_Forest_badge_6626154e.png',
    primaryColor: '#DD0000',
    secondaryColor: '#FFFFFF',
    strengthRating: 6
  },
  {
    id: 'sheffield-united',
    name: 'Sheffield United',
    shortName: 'SHU',
    badgePath: '@assets/generated_images/Sheffield_United_badge_8a8218e2.png',
    primaryColor: '#EE2737',
    secondaryColor: '#FFFFFF',
    strengthRating: 3
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    shortName: 'TOT',
    badgePath: '@assets/generated_images/Tottenham_Hotspur_badge_525f19f9.png',
    primaryColor: '#132257',
    secondaryColor: '#FFFFFF',
    strengthRating: 8
  },
  {
    id: 'west-ham',
    name: 'West Ham United',
    shortName: 'WHU',
    badgePath: '@assets/generated_images/West_Ham_United_badge_1af01d20.png',
    primaryColor: '#7A263A',
    secondaryColor: '#1BB1E7',
    strengthRating: 5
  },
  {
    id: 'wolves',
    name: 'Wolverhampton Wanderers',
    shortName: 'WOL',
    badgePath: '@assets/generated_images/Wolves_FC_badge_05aea6d1.png',
    primaryColor: '#FDB914',
    secondaryColor: '#231F20',
    strengthRating: 4
  },
  {
    id: 'sunderland',
    name: 'Sunderland',
    shortName: 'SUN',
    badgePath: '/badges/Sunderland_AFC_badge_a1b2c3d4.svg',
    primaryColor: '#DC143C',
    secondaryColor: '#FFFFFF',
    strengthRating: 4
  },
  {
    id: 'leeds-united',
    name: 'Leeds United',
    shortName: 'LEE',
    badgePath: '/badges/Leeds_United_badge_e5f6g7h8.svg',
    primaryColor: '#1D428A',
    secondaryColor: '#FFCD00',
    strengthRating: 5
  }
];

/**
 * Get Premier League team by name (case-insensitive, handles variations)
 */
export function getPremierLeagueTeamByName(teamName: string): PremierLeagueTeam | null {
  const normalizedName = teamName.toLowerCase().trim();
  
  // Direct name matches
  const directMatch = PREMIER_LEAGUE_TEAMS.find(team => 
    team.name.toLowerCase() === normalizedName ||
    team.shortName.toLowerCase() === normalizedName
  );
  
  if (directMatch) return directMatch;
  
  // Handle common variations and partial matches
  const variations: Record<string, string> = {
    'man city': 'manchester-city',
    'man utd': 'manchester-united',
    'man united': 'manchester-united',
    'spurs': 'tottenham',
    'wolves': 'wolves',
    'brighton': 'brighton',
    'crystal palace': 'crystal-palace',
    'west ham': 'west-ham',
    'newcastle': 'newcastle',
    'nottm forest': 'nottingham-forest',
    'sheff utd': 'sheffield-united',
    'sheffield utd': 'sheffield-united',
    'luton': 'luton',
    'burnley': 'burnley',
    'brentford': 'brentford',
    'bournemouth': 'bournemouth',
    'afc bournemouth': 'bournemouth',
    'everton': 'everton',
    'fulham': 'fulham',
    'arsenal': 'arsenal',
    'chelsea': 'chelsea',
    'liverpool': 'liverpool',
    'aston villa': 'aston-villa',
    'sunderland': 'sunderland',
    'sunderland afc': 'sunderland',
    'leeds': 'leeds-united',
    'leeds united': 'leeds-united',
    'leeds utd': 'leeds-united'
  };
  
  const variationId = variations[normalizedName];
  if (variationId) {
    return PREMIER_LEAGUE_TEAMS.find(team => team.id === variationId) || null;
  }
  
  // Partial match fallback
  return PREMIER_LEAGUE_TEAMS.find(team => 
    team.name.toLowerCase().includes(normalizedName) ||
    normalizedName.includes(team.name.toLowerCase().split(' ')[0])
  ) || null;
}

/**
 * Check if a gameweek type supports Premier League teams
 */
export function gameweekSupportsPremierLeagueTeams(gameweekType: string): boolean {
  return gameweekType === 'premier-league';
}

/**
 * Get all Premier League team names for dropdown options
 */
export function getPremierLeagueTeamOptions(): Array<{value: string, label: string, badge: string}> {
  return PREMIER_LEAGUE_TEAMS.map(team => ({
    value: team.name,
    label: team.name,
    badge: team.badgePath
  }));
}

/**
 * Difficulty levels for match predictions
 */
export type DifficultyLevel = 'very-easy' | 'easy' | 'medium' | 'hard' | 'very-hard';

export interface MatchDifficulty {
  level: DifficultyLevel;
  score: number; // 1-10 scale
  label: string;
  color: string; // CSS color class
  bgColor: string; // Background color class
}

/**
 * Home advantage boost applied to the home team's strength rating
 * Typical home advantage in football is worth about 1-1.5 rating points
 */
const HOME_ADVANTAGE = 1.2;

/**
 * Get team strength rating from custom ratings map or fallback to default
 */
export function getTeamStrength(
  teamName: string,
  customRatings?: Map<string, number>
): number {
  // Try custom ratings first (from database)
  if (customRatings && customRatings.has(teamName)) {
    return customRatings.get(teamName)!;
  }
  
  // Fallback to hardcoded rating
  const team = getPremierLeagueTeamByName(teamName);
  return team?.strengthRating ?? 5; // Default to 5 if team not found
}

/**
 * Calculate prediction difficulty for a match based on team strengths
 * 
 * Logic:
 * - Applies home advantage boost to the home team (+1.2 rating points)
 * - Very Hard (9-10): Top-tier clash (both rated 8+, base difference <= 1 before home advantage)
 * - Hard (7-8): Evenly matched strong teams (both rated 7+, base difference <= 1 before home advantage)
 * - Very Easy (1-2): Clear mismatch (difference >= 5 with home advantage applied)
 * - Easy (3-4): Strong favorite (difference 3-4 with home advantage applied)
 * - Medium (5-6): Fairly balanced or mid-tier teams (difference 1-2 with home advantage applied)
 * 
 * Note: Hard/Very Hard tiers use base team strength (ignoring home advantage) to identify
 * evenly matched quality fixtures, while all other tiers factor in home advantage to make
 * home games slightly easier and away games slightly harder.
 * 
 * @param homeTeam - Home team name
 * @param awayTeam - Away team name
 * @param customRatings - Optional map of team names to strength ratings (overrides defaults)
 */
export function calculateMatchDifficulty(
  homeTeam: string,
  awayTeam: string,
  customRatings?: Map<string, number>
): MatchDifficulty {
  const home = getPremierLeagueTeamByName(homeTeam);
  const away = getPremierLeagueTeamByName(awayTeam);
  
  // Default for non-Premier League teams or unknown teams
  if (!home || !away) {
    return {
      level: 'medium',
      score: 5,
      label: 'Medium',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100'
    };
  }
  
  const homeStrength = getTeamStrength(homeTeam, customRatings);
  const awayStrength = getTeamStrength(awayTeam, customRatings);
  
  // Calculate base team metrics (without home advantage)
  const averageStrength = (homeStrength + awayStrength) / 2;
  const maxStrength = Math.max(homeStrength, awayStrength);
  const baseDifference = Math.abs(homeStrength - awayStrength);
  
  // Apply home advantage boost to home team for difficulty calculation
  const homeStrengthWithAdvantage = homeStrength + HOME_ADVANTAGE;
  const difference = Math.abs(homeStrengthWithAdvantage - awayStrength);
  
  // Very Hard: Top-tier clash (both teams strong and evenly matched before home advantage)
  if (averageStrength >= 8 && baseDifference <= 1) {
    return {
      level: 'very-hard',
      score: 9,
      label: 'Very Hard',
      color: 'text-red-700',
      bgColor: 'bg-red-100'
    };
  }
  
  // Hard: Evenly matched quality teams (check base difference, not boosted)
  if (averageStrength >= 7 && baseDifference <= 1) {
    return {
      level: 'hard',
      score: 7,
      label: 'Hard',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    };
  }
  
  // Very Easy: Clear mismatch
  if (difference >= 5) {
    return {
      level: 'very-easy',
      score: 2,
      label: 'Very Easy',
      color: 'text-green-700',
      bgColor: 'bg-green-100'
    };
  }
  
  // Easy: Strong favorite
  if (difference >= 3) {
    return {
      level: 'easy',
      score: 3,
      label: 'Easy',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    };
  }
  
  // Medium: Fairly balanced
  return {
    level: 'medium',
    score: 5,
    label: 'Medium',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100'
  };
}