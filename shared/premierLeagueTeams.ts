export interface PremierLeagueTeam {
  id: string;
  name: string;
  shortName: string;
  badgePath: string;
  primaryColor: string;
  secondaryColor: string;
}

export const PREMIER_LEAGUE_TEAMS: PremierLeagueTeam[] = [
  {
    id: 'arsenal',
    name: 'Arsenal',
    shortName: 'ARS',
    badgePath: '@assets/generated_images/Arsenal_FC_badge_c9c55cad.png',
    primaryColor: '#DC143C',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'aston-villa',
    name: 'Aston Villa',
    shortName: 'AVL',
    badgePath: '@assets/generated_images/Aston_Villa_badge_de451a89.png',
    primaryColor: '#7A003C',
    secondaryColor: '#95BFE5'
  },
  {
    id: 'bournemouth',
    name: 'AFC Bournemouth',
    shortName: 'BOU',
    badgePath: '@assets/generated_images/Bournemouth_FC_badge_7725e371.png',
    primaryColor: '#DA020E',
    secondaryColor: '#000000'
  },
  {
    id: 'brentford',
    name: 'Brentford',
    shortName: 'BRE',
    badgePath: '@assets/generated_images/Brentford_FC_badge_4dbea0d4.png',
    primaryColor: '#D20000',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'brighton',
    name: 'Brighton & Hove Albion',
    shortName: 'BHA',
    badgePath: '@assets/generated_images/Brighton_FC_badge_c95f8c2f.png',
    primaryColor: '#0057B8',
    secondaryColor: '#FFCD00'
  },
  {
    id: 'burnley',
    name: 'Burnley',
    shortName: 'BUR',
    badgePath: '@assets/generated_images/Burnley_FC_badge_8779ed43.png',
    primaryColor: '#6C1D45',
    secondaryColor: '#99D6EA'
  },
  {
    id: 'chelsea',
    name: 'Chelsea',
    shortName: 'CHE',
    badgePath: '@assets/generated_images/Chelsea_FC_badge_ecba08da.png',
    primaryColor: '#034694',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'crystal-palace',
    name: 'Crystal Palace',
    shortName: 'CRY',
    badgePath: '@assets/generated_images/Crystal_Palace_badge_6fb932f6.png',
    primaryColor: '#1B458F',
    secondaryColor: '#C4122E'
  },
  {
    id: 'everton',
    name: 'Everton',
    shortName: 'EVE',
    badgePath: '@assets/generated_images/Everton_FC_badge_76fb8550.png',
    primaryColor: '#003399',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'fulham',
    name: 'Fulham',
    shortName: 'FUL',
    badgePath: '@assets/generated_images/Fulham_FC_badge_bc1421e1.png',
    primaryColor: '#FFFFFF',
    secondaryColor: '#000000'
  },
  {
    id: 'liverpool',
    name: 'Liverpool',
    shortName: 'LIV',
    badgePath: '@assets/generated_images/Liverpool_FC_badge_db6fd83a.png',
    primaryColor: '#C8102E',
    secondaryColor: '#F6EB61'
  },
  {
    id: 'luton',
    name: 'Luton Town',
    shortName: 'LUT',
    badgePath: '@assets/generated_images/Luton_Town_badge_5f526675.png',
    primaryColor: '#F78F1E',
    secondaryColor: '#002D5C'
  },
  {
    id: 'manchester-city',
    name: 'Manchester City',
    shortName: 'MCI',
    badgePath: '@assets/generated_images/Manchester_City_badge_cdd480cd.png',
    primaryColor: '#6CABDD',
    secondaryColor: '#1C2C5B'
  },
  {
    id: 'manchester-united',
    name: 'Manchester United',
    shortName: 'MUN',
    badgePath: '@assets/generated_images/Manchester_United_badge_f70bef44.png',
    primaryColor: '#DA020E',
    secondaryColor: '#FBE122'
  },
  {
    id: 'newcastle',
    name: 'Newcastle United',
    shortName: 'NEW',
    badgePath: '@assets/generated_images/Newcastle_United_badge_2613b454.png',
    primaryColor: '#241F20',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'nottingham-forest',
    name: 'Nottingham Forest',
    shortName: 'NFO',
    badgePath: '@assets/generated_images/Nottingham_Forest_badge_6626154e.png',
    primaryColor: '#DD0000',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'sheffield-united',
    name: 'Sheffield United',
    shortName: 'SHU',
    badgePath: '@assets/generated_images/Sheffield_United_badge_8a8218e2.png',
    primaryColor: '#EE2737',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'tottenham',
    name: 'Tottenham Hotspur',
    shortName: 'TOT',
    badgePath: '@assets/generated_images/Tottenham_Hotspur_badge_525f19f9.png',
    primaryColor: '#132257',
    secondaryColor: '#FFFFFF'
  },
  {
    id: 'west-ham',
    name: 'West Ham United',
    shortName: 'WHU',
    badgePath: '@assets/generated_images/West_Ham_United_badge_1af01d20.png',
    primaryColor: '#7A263A',
    secondaryColor: '#1BB1E7'
  },
  {
    id: 'wolves',
    name: 'Wolverhampton Wanderers',
    shortName: 'WOL',
    badgePath: '@assets/generated_images/Wolves_FC_badge_05aea6d1.png',
    primaryColor: '#FDB914',
    secondaryColor: '#231F20'
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
    'aston villa': 'aston-villa'
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