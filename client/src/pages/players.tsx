import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const playerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
});

type PlayerFormData = z.infer<typeof playerSchema>;

export default function Players() {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: players, isLoading } = useQuery({
    queryKey: ["/api/players"],
  });

  const form = useForm<PlayerFormData>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const addPlayerMutation = useMutation({
    mutationFn: (data: PlayerFormData) =>
      apiRequest("/api/players", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player added successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add player",
        variant: "destructive",
      });
    },
  });

  const deletePlayerMutation = useMutation({
    mutationFn: (playerId: number) =>
      apiRequest(`/api/players/${playerId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/players"] });
      toast({
        title: "Success",
        description: "Player removed successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove player",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PlayerFormData) => {
    addPlayerMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <i className="fas fa-spinner fa-spin text-3xl text-football-gold mb-4"></i>
            <p className="text-gray-600">Loading players...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-football-navy">
            <i className="fas fa-users mr-3 text-football-gold"></i>
            Manage Players
          </h1>
          <p className="text-gray-600 mt-2">Add, edit, and manage league participants</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-football-green hover:bg-green-600">
              <i className="fas fa-plus mr-2"></i>
              Add Player
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Player</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter player's full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="Enter player's email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={addPlayerMutation.isPending}
                    className="bg-football-green hover:bg-green-600"
                  >
                    {addPlayerMutation.isPending && (
                      <i className="fas fa-spinner fa-spin mr-2"></i>
                    )}
                    Add Player
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-football-navy">
              <i className="fas fa-list mr-2 text-football-gold"></i>
              Current Players ({players?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!players || players.length === 0 ? (
              <div className="text-center py-12">
                <i className="fas fa-users text-6xl text-gray-300 mb-4"></i>
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Players Yet</h3>
                <p className="text-gray-500 mb-6">Add your first player to get started with the league</p>
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  className="bg-football-green hover:bg-green-600"
                >
                  <i className="fas fa-plus mr-2"></i>
                  Add First Player
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {players.map((player: any) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-football-navy rounded-full flex items-center justify-center">
                        <i className="fas fa-user text-white"></i>
                      </div>
                      <div>
                        <h3 className="font-semibold text-football-navy">{player.name}</h3>
                        <p className="text-gray-600 text-sm">{player.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <i className="fas fa-edit mr-1"></i>
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          if (confirm(`Are you sure you want to remove ${player.name}? This will delete all their predictions and scores.`)) {
                            deletePlayerMutation.mutate(player.id);
                          }
                        }}
                        disabled={deletePlayerMutation.isPending}
                        className="text-red-600 hover:bg-red-50 border-red-200"
                      >
                        <i className="fas fa-trash mr-1"></i>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {players && players.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-football-navy">
                <i className="fas fa-chart-bar mr-2 text-football-gold"></i>
                Player Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-football-green/10 rounded-lg">
                  <div className="text-2xl font-bold text-football-green">{players.length}</div>
                  <div className="text-sm text-gray-600">Total Players</div>
                </div>
                <div className="text-center p-4 bg-football-gold/10 rounded-lg">
                  <div className="text-2xl font-bold text-football-gold">5</div>
                  <div className="text-sm text-gray-600">Active This Week</div>
                </div>
                <div className="text-center p-4 bg-football-navy/10 rounded-lg">
                  <div className="text-2xl font-bold text-football-navy">12</div>
                  <div className="text-sm text-gray-600">Avg Predictions</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}