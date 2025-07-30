import { db } from "./db";
import { teams } from "@shared/schema";
import type { InsertTeam } from "@shared/schema";

// Team badge URLs using reliable sources
const BADGE_BASE_URL = "https://logos-world.net/wp-content/uploads/2020/06";

export const teamData: InsertTeam[] = [
  // Premier League Teams
  {
    name: "Arsenal",
    shortName: "ARS",
    badgeUrl: `${BADGE_BASE_URL}/Arsenal-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Aston Villa",
    shortName: "AVL",
    badgeUrl: `${BADGE_BASE_URL}/Aston-Villa-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Brighton & Hove Albion",
    shortName: "BHA",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/brighton-hove-albion-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Burnley",
    shortName: "BUR",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/burnley-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Chelsea",
    shortName: "CHE",
    badgeUrl: `${BADGE_BASE_URL}/Chelsea-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Crystal Palace",
    shortName: "CRY",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/crystal-palace-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Everton",
    shortName: "EVE",
    badgeUrl: `${BADGE_BASE_URL}/Everton-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Fulham",
    shortName: "FUL",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/fulham-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Liverpool",
    shortName: "LIV",
    badgeUrl: `${BADGE_BASE_URL}/Liverpool-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Luton Town",
    shortName: "LUT",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/luton-town-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Manchester City",
    shortName: "MCI",
    badgeUrl: `${BADGE_BASE_URL}/Manchester-City-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Manchester United",
    shortName: "MUN",
    badgeUrl: `${BADGE_BASE_URL}/Manchester-United-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Newcastle United",
    shortName: "NEW",
    badgeUrl: `${BADGE_BASE_URL}/Newcastle-United-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Nottingham Forest",
    shortName: "NFO",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/nottingham-forest-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Sheffield United",
    shortName: "SHU",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/sheffield-united-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Tottenham Hotspur",
    shortName: "TOT",
    badgeUrl: `${BADGE_BASE_URL}/Tottenham-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "West Ham United",
    shortName: "WHU",
    badgeUrl: `${BADGE_BASE_URL}/West-Ham-Logo.png`,
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Wolverhampton Wanderers",
    shortName: "WOL",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/wolverhampton-wanderers-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Brentford",
    shortName: "BRE",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/brentford-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },
  {
    name: "Bournemouth",
    shortName: "BOU",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/bournemouth-vector-logo.png",
    league: "premier-league",
    country: "ENG",
  },

  // Championship Teams (Top 12 most popular)
  {
    name: "Leeds United",
    shortName: "LEE",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/leeds-united-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Leicester City",
    shortName: "LEI",
    badgeUrl: `${BADGE_BASE_URL}/Leicester-City-Logo.png`,
    league: "championship",
    country: "ENG",
  },
  {
    name: "Southampton",
    shortName: "SOU",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/southampton-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Ipswich Town",
    shortName: "IPS",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/ipswich-town-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "West Bromwich Albion",
    shortName: "WBA",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/west-bromwich-albion-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Norwich City",
    shortName: "NOR",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/norwich-city-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Middlesbrough",
    shortName: "MID",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/middlesbrough-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Cardiff City",
    shortName: "CAR",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/cardiff-city-vector-logo.png",
    league: "championship",
    country: "WAL",
  },
  {
    name: "Preston North End",
    shortName: "PNE",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/preston-north-end-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Hull City",
    shortName: "HUL",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/hull-city-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Bristol City",
    shortName: "BRC",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/bristol-city-vector-logo.png",
    league: "championship",
    country: "ENG",
  },
  {
    name: "Birmingham City",
    shortName: "BIR",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/birmingham-city-vector-logo.png",
    league: "championship",
    country: "ENG",
  },

  // League One Teams (Top 8)
  {
    name: "Portsmouth",
    shortName: "POR",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/portsmouth-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Bolton Wanderers",
    shortName: "BOL",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/bolton-wanderers-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Derby County",
    shortName: "DER",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/derby-county-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Barnsley",
    shortName: "BAR",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/barnsley-vector-logo.svg",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Peterborough United",
    shortName: "PET",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/peterborough-united-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Charlton Athletic",
    shortName: "CHA",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/charlton-athletic-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Blackpool",
    shortName: "BLP",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/blackpool-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },
  {
    name: "Wycombe Wanderers",
    shortName: "WYC",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/wycombe-wanderers-vector-logo.png",
    league: "league-one",
    country: "ENG",
  },

  // League Two Teams (Top 6)
  {
    name: "Stockport County",
    shortName: "STO",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/stockport-county-vector-logo.png",
    league: "league-two",
    country: "ENG",
  },
  {
    name: "Wrexham",
    shortName: "WRE",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/wrexham-vector-logo.png",
    league: "league-two",
    country: "WAL",
  },
  {
    name: "Bradford City",
    shortName: "BRA",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/bradford-city-vector-logo.png",
    league: "league-two",
    country: "ENG",
  },
  {
    name: "Doncaster Rovers",
    shortName: "DON",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/doncaster-rovers-vector-logo.png",
    league: "league-two",
    country: "ENG",
  },
  {
    name: "Newport County",
    shortName: "NEW",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/newport-county-vector-logo.png",
    league: "league-two",
    country: "WAL",
  },
  {
    name: "Milton Keynes Dons",
    shortName: "MKD",
    badgeUrl: "https://logoeps.com/wp-content/uploads/2013/03/milton-keynes-dons-vector-logo.png",
    league: "league-two",
    country: "ENG",
  },

  // European National Teams
  {
    name: "England",
    shortName: "ENG",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/England-Logo.png",
    league: "international",
    continent: "europe",
    country: "ENG",
  },
  {
    name: "France",
    shortName: "FRA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/France-Logo.png",
    league: "international",
    continent: "europe",
    country: "FRA",
  },
  {
    name: "Germany",
    shortName: "GER",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Germany-Logo.png",
    league: "international",
    continent: "europe",
    country: "GER",
  },
  {
    name: "Spain",
    shortName: "ESP",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Spain-Logo.png",
    league: "international",
    continent: "europe",
    country: "ESP",
  },
  {
    name: "Italy",
    shortName: "ITA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Italy-Logo.png",
    league: "international",
    continent: "europe",
    country: "ITA",
  },
  {
    name: "Portugal",
    shortName: "POR",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Portugal-Logo.png",
    league: "international",
    continent: "europe",
    country: "POR",
  },
  {
    name: "Netherlands",
    shortName: "NED",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Netherlands-Logo.png",
    league: "international",
    continent: "europe",
    country: "NED",
  },
  {
    name: "Belgium",
    shortName: "BEL",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Belgium-Logo.png",
    league: "international",
    continent: "europe",
    country: "BEL",
  },
  {
    name: "Croatia",
    shortName: "CRO",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Croatia-Logo.png",
    league: "international",
    continent: "europe",
    country: "CRO",
  },
  {
    name: "Poland",
    shortName: "POL",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Poland-Logo.png",
    league: "international",
    continent: "europe",
    country: "POL",
  },
  {
    name: "Denmark",
    shortName: "DEN",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Denmark-Logo.png",
    league: "international",
    continent: "europe",
    country: "DEN",
  },
  {
    name: "Scotland",
    shortName: "SCO",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Scotland-Logo.png",
    league: "international",
    continent: "europe",
    country: "SCO",
  },
  {
    name: "Wales",
    shortName: "WAL",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Wales-Logo.png",
    league: "international",
    continent: "europe",
    country: "WAL",
  },
  {
    name: "Republic of Ireland",
    shortName: "IRL",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Ireland-Logo.png",
    league: "international",
    continent: "europe",
    country: "IRL",
  },
  {
    name: "Northern Ireland",
    shortName: "NIR",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Northern-Ireland-Logo.png",
    league: "international",
    continent: "europe",
    country: "NIR",
  },

  // South American National Teams
  {
    name: "Brazil",
    shortName: "BRA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Brazil-Logo.png",
    league: "international",
    continent: "south-america",
    country: "BRA",
  },
  {
    name: "Argentina",
    shortName: "ARG",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Argentina-Logo.png",
    league: "international",
    continent: "south-america",
    country: "ARG",
  },
  {
    name: "Uruguay",
    shortName: "URU",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Uruguay-Logo.png",
    league: "international",
    continent: "south-america",
    country: "URU",
  },
  {
    name: "Colombia",
    shortName: "COL",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Colombia-Logo.png",
    league: "international",
    continent: "south-america",
    country: "COL",
  },
  {
    name: "Chile",
    shortName: "CHI",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Chile-Logo.png",
    league: "international",
    continent: "south-america",
    country: "CHI",
  },
  {
    name: "Peru",
    shortName: "PER",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Peru-Logo.png",
    league: "international",
    continent: "south-america",
    country: "PER",
  },

  // African National Teams
  {
    name: "Morocco",
    shortName: "MAR",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Morocco-Logo.png",
    league: "international",
    continent: "africa",
    country: "MAR",
  },
  {
    name: "Senegal",
    shortName: "SEN",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Senegal-Logo.png",
    league: "international",
    continent: "africa",
    country: "SEN",
  },
  {
    name: "Nigeria",
    shortName: "NGA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Nigeria-Logo.png",
    league: "international",
    continent: "africa",
    country: "NGA",
  },
  {
    name: "Ghana",
    shortName: "GHA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Ghana-Logo.png",
    league: "international",
    continent: "africa",
    country: "GHA",
  },
  {
    name: "Cameroon",
    shortName: "CMR",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Cameroon-Logo.png",
    league: "international",
    continent: "africa",
    country: "CMR",
  },
  {
    name: "Tunisia",
    shortName: "TUN",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Tunisia-Logo.png",
    league: "international",
    continent: "africa",
    country: "TUN",
  },

  // Asian National Teams
  {
    name: "Japan",
    shortName: "JPN",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Japan-Logo.png",
    league: "international",
    continent: "asia",
    country: "JPN",
  },
  {
    name: "South Korea",
    shortName: "KOR",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/South-Korea-Logo.png",
    league: "international",
    continent: "asia",
    country: "KOR",
  },
  {
    name: "Australia",
    shortName: "AUS",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Australia-Logo.png",
    league: "international",
    continent: "asia",
    country: "AUS",
  },
  {
    name: "Iran",
    shortName: "IRN",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Iran-Logo.png",
    league: "international",
    continent: "asia",
    country: "IRN",
  },
  {
    name: "Saudi Arabia",
    shortName: "KSA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Saudi-Arabia-Logo.png",
    league: "international",
    continent: "asia",
    country: "KSA",
  },

  // North American National Teams
  {
    name: "United States",
    shortName: "USA",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/United-States-Logo.png",
    league: "international",
    continent: "north-america",
    country: "USA",
  },
  {
    name: "Mexico",
    shortName: "MEX",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Mexico-Logo.png",
    league: "international",
    continent: "north-america",
    country: "MEX",
  },
  {
    name: "Canada",
    shortName: "CAN",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Canada-Logo.png",
    league: "international",
    continent: "north-america",
    country: "CAN",
  },
  {
    name: "Costa Rica",
    shortName: "CRC",
    badgeUrl: "https://logos-world.net/wp-content/uploads/2020/06/Costa-Rica-Logo.png",
    league: "international",
    continent: "north-america",
    country: "CRC",
  },
];

export async function seedTeams() {
  console.log("🏆 Seeding teams database...");
  
  try {
    // Check if teams already exist
    const existingTeams = await db.select().from(teams).limit(1);
    if (existingTeams.length > 0) {
      console.log("✅ Teams already exist, skipping seed");
      return;
    }

    // Insert all teams
    await db.insert(teams).values(teamData);
    
    console.log(`✅ Successfully seeded ${teamData.length} teams`);
    console.log("📊 Teams breakdown:");
    console.log(`  - Premier League: ${teamData.filter(t => t.league === 'premier-league').length}`);
    console.log(`  - Championship: ${teamData.filter(t => t.league === 'championship').length}`);
    console.log(`  - League One: ${teamData.filter(t => t.league === 'league-one').length}`);
    console.log(`  - League Two: ${teamData.filter(t => t.league === 'league-two').length}`);
    console.log(`  - International: ${teamData.filter(t => t.league === 'international').length}`);
    
  } catch (error) {
    console.error("❌ Error seeding teams:", error);
    throw error;
  }
}