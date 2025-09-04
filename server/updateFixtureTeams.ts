import { storage } from './storage';
import { getPremierLeagueTeamByName } from '../shared/premierLeagueTeams';

/**
 * Update existing fixtures to use standardized Premier League team names
 */
export async function updateExistingFixtureTeams() {
  console.log('🔄 Starting fixture team name updates...');
  
  try {
    // Get all fixtures
    const fixtures = await storage.getFixtures();
    let updatedCount = 0;
    
    for (const fixture of fixtures) {
      let needsUpdate = false;
      let newHomeTeam = fixture.homeTeam;
      let newAwayTeam = fixture.awayTeam;
      
      // Try to match home team
      const homeTeamMatch = getPremierLeagueTeamByName(fixture.homeTeam);
      if (homeTeamMatch && homeTeamMatch.name !== fixture.homeTeam) {
        newHomeTeam = homeTeamMatch.name;
        needsUpdate = true;
      }
      
      // Try to match away team
      const awayTeamMatch = getPremierLeagueTeamByName(fixture.awayTeam);
      if (awayTeamMatch && awayTeamMatch.name !== fixture.awayTeam) {
        newAwayTeam = awayTeamMatch.name;
        needsUpdate = true;
      }
      
      // Update fixture if needed
      if (needsUpdate) {
        console.log(`📝 Updating fixture ${fixture.id}: ${fixture.homeTeam} vs ${fixture.awayTeam} → ${newHomeTeam} vs ${newAwayTeam}`);
        
        // Update the fixture
        await storage.updateFixture(fixture.id, {
          homeTeam: newHomeTeam,
          awayTeam: newAwayTeam,
          kickoffTime: fixture.kickoffTime,
          gameweekId: fixture.gameweekId
        });
        
        updatedCount++;
      }
    }
    
    console.log(`✅ Fixture team name update complete! Updated ${updatedCount} fixtures.`);
    return { success: true, updatedCount };
    
  } catch (error) {
    console.error('❌ Error updating fixture team names:', error);
    return { success: false, error: error.message };
  }
}