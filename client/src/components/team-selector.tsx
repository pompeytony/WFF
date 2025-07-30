import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Team } from "@shared/schema";

interface TeamSelectorProps {
  value?: number;
  onValueChange: (teamId: number) => void;
  placeholder?: string;
}

export function TeamSelector({ value, onValueChange, placeholder = "Select team" }: TeamSelectorProps) {
  const [selectedLeague, setSelectedLeague] = useState("premier-league");

  // Fetch teams based on selected league
  const { data: teams = [], isLoading } = useQuery({
    queryKey: ['/api/teams', { league: selectedLeague }],
    queryFn: async () => {
      const response = await fetch(`/api/teams?league=${selectedLeague}`);
      if (!response.ok) {
        throw new Error('Failed to fetch teams');
      }
      return response.json() as Promise<Team[]>;
    },
  });

  // Fetch international teams by continent
  const { data: europeanTeams = [] } = useQuery({
    queryKey: ['/api/teams', { continent: 'europe' }],
    queryFn: async () => {
      const response = await fetch('/api/teams?continent=europe');
      if (!response.ok) throw new Error('Failed to fetch European teams');
      return response.json() as Promise<Team[]>;
    },
  });

  const { data: otherInternationalTeams = [] } = useQuery({
    queryKey: ['/api/teams', { continent: 'other' }],
    queryFn: async () => {
      const response = await fetch('/api/teams?league=international');
      if (!response.ok) throw new Error('Failed to fetch international teams');
      const allInternational = await response.json() as Team[];
      return allInternational.filter(team => team.continent !== 'europe');
    },
  });

  const selectedTeam = teams.find(team => team.id === value) || 
                      europeanTeams.find(team => team.id === value) ||
                      otherInternationalTeams.find(team => team.id === value);

  return (
    <div className="space-y-4">
      <Tabs value={selectedLeague} onValueChange={setSelectedLeague}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="premier-league">Premier League</TabsTrigger>
          <TabsTrigger value="championship">Championship</TabsTrigger>
          <TabsTrigger value="league-one">League One</TabsTrigger>
          <TabsTrigger value="league-two">League Two</TabsTrigger>
          <TabsTrigger value="europe">European</TabsTrigger>
          <TabsTrigger value="world">International</TabsTrigger>
        </TabsList>

        <TabsContent value="premier-league">
          <TeamList teams={teams} value={value} onValueChange={onValueChange} placeholder={placeholder} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="championship">
          <TeamList teams={teams} value={value} onValueChange={onValueChange} placeholder={placeholder} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="league-one">
          <TeamList teams={teams} value={value} onValueChange={onValueChange} placeholder={placeholder} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="league-two">
          <TeamList teams={teams} value={value} onValueChange={onValueChange} placeholder={placeholder} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="europe">
          <TeamList teams={europeanTeams} value={value} onValueChange={onValueChange} placeholder={placeholder} isLoading={false} />
        </TabsContent>

        <TabsContent value="world">
          <TeamList teams={otherInternationalTeams} value={value} onValueChange={onValueChange} placeholder={placeholder} isLoading={false} />
        </TabsContent>
      </Tabs>

      {selectedTeam && (
        <div className="flex items-center gap-2 p-2 border rounded">
          <img 
            src={selectedTeam.badgeUrl} 
            alt={`${selectedTeam.name} badge`}
            className="w-6 h-6 object-contain"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
          <span className="font-medium">{selectedTeam.name}</span>
          <Badge variant="secondary" className="ml-auto">
            {selectedTeam.shortName}
          </Badge>
        </div>
      )}
    </div>
  );
}

interface TeamListProps {
  teams: Team[];
  value?: number;
  onValueChange: (teamId: number) => void;
  placeholder: string;
  isLoading: boolean;
}

function TeamList({ teams, value, onValueChange, placeholder, isLoading }: TeamListProps) {
  if (isLoading) {
    return <div className="text-center py-4 text-muted-foreground">Loading teams...</div>;
  }

  return (
    <Select value={value?.toString()} onValueChange={(val) => onValueChange(parseInt(val))}>
      <SelectTrigger>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-60">
        {teams.map((team) => (
          <SelectItem key={team.id} value={team.id.toString()}>
            <div className="flex items-center gap-2">
              <img 
                src={team.badgeUrl} 
                alt={`${team.name} badge`}
                className="w-4 h-4 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <span>{team.name}</span>
              <Badge variant="outline" className="ml-auto text-xs">
                {team.shortName}
              </Badge>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}