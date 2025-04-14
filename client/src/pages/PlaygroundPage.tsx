import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Playground } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useMobile } from "@/hooks/use-mobile";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatRelativeDate } from "@/lib/utils";

export default function PlaygroundPage() {
  const [selectedPlayground, setSelectedPlayground] = useState<Playground | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPlaygroundName, setNewPlaygroundName] = useState("");
  const [newPlaygroundDescription, setNewPlaygroundDescription] = useState("");
  const { toast } = useToast();
  const isMobile = useMobile();
  
  // Fetch playgrounds
  const { 
    data: playgrounds = [], 
    isLoading,
    isError 
  } = useQuery<Playground[]>({ 
    queryKey: ['/api/playgrounds'] 
  });

  // Create playground mutation
  const createPlaygroundMutation = useMutation({
    mutationFn: (playgroundData: { name: string; description: string }) => 
      apiRequest('POST', '/api/playgrounds', playgroundData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playgrounds'] });
      toast({
        title: "Playground created",
        description: "Your playground has been created successfully."
      });
      setIsCreateDialogOpen(false);
      setNewPlaygroundName("");
      setNewPlaygroundDescription("");
    },
    onError: () => {
      toast({
        title: "Failed to create playground",
        description: "There was an error creating your playground. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete playground mutation
  const deletePlaygroundMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/playgrounds/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playgrounds'] });
      setSelectedPlayground(null);
      toast({
        title: "Playground deleted",
        description: "Your playground has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete playground",
        description: "There was an error deleting your playground. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreatePlayground = () => {
    if (!newPlaygroundName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your playground.",
        variant: "destructive"
      });
      return;
    }

    createPlaygroundMutation.mutate({
      name: newPlaygroundName,
      description: newPlaygroundDescription
    });
  };

  const handleDeletePlayground = (id: number) => {
    if (confirm("Are you sure you want to delete this playground? All items inside will also be deleted.")) {
      deletePlaygroundMutation.mutate(id);
    }
  };

  const handleSelectPlayground = (playground: Playground) => {
    setSelectedPlayground(playground);
  };

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-accent">Error loading playgrounds. Please try again later.</p>
      </div>
    );
  }

  // When a playground is selected, redirect to the playground canvas
  useEffect(() => {
    if (selectedPlayground) {
      window.location.href = `/playground/${selectedPlayground.id}`;
    }
  }, [selectedPlayground]);

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-semibold">Playgrounds</h1>
        <p className="text-sm text-gray-500 mt-1">
          Create and manage your creative whiteboarding workspaces
        </p>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        <div className="max-w-3xl mx-auto">
          {/* Create New Playground Button */}
          <Button
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full bg-white rounded-lg p-4 shadow mb-6 text-left border-2 border-dashed border-gray-300 hover:border-primary transition-colors h-auto justify-start"
            variant="ghost"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create a new playground
          </Button>

          {/* Playgrounds Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg p-6 shadow">
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))
            ) : playgrounds.length === 0 ? (
              <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500 col-span-2">
                <p>No playgrounds yet. Create a playground to get started!</p>
              </div>
            ) : (
              playgrounds.map((playground) => (
                <div
                  key={playground.id}
                  className="bg-white rounded-lg p-6 shadow cursor-pointer hover:shadow-md transition-shadow relative group"
                  onClick={() => handleSelectPlayground(playground)}
                >
                  <h3 className="font-semibold text-lg mb-2">{playground.name}</h3>
                  {playground.description && (
                    <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                      {playground.description}
                    </p>
                  )}
                  <div className="text-xs text-secondary">
                    Updated {formatRelativeDate(playground.updatedAt)}
                  </div>
                  
                  {/* Delete button (only shows on hover) */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePlayground(playground.id);
                    }}
                    disabled={deletePlaygroundMutation.isPending}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18"></path>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"></path>
                      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      <line x1="10" y1="11" x2="10" y2="17"></line>
                      <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Mobile FAB */}
        {isMobile && (
          <div className="fixed bottom-6 right-6">
            <Button
              onClick={() => setIsCreateDialogOpen(true)}
              className="w-14 h-14 rounded-full shadow-lg"
              style={{ backgroundColor: '#EF233C' }}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        )}
      </div>

      {/* Create Playground Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Playground</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                placeholder="My Whiteboard Playground"
                value={newPlaygroundName}
                onChange={(e) => setNewPlaygroundName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Write a description of your playground..."
                value={newPlaygroundDescription}
                onChange={(e) => setNewPlaygroundDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost" 
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreatePlayground}
              disabled={createPlaygroundMutation.isPending || !newPlaygroundName.trim()}
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}