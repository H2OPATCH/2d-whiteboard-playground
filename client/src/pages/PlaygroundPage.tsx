import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Playground, InsertPlayground } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Loader2, Plus, Edit, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { formatRelativeDate } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PlaygroundPage() {
  const [, setLocation] = useLocation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPlayground, setCurrentPlayground] = useState<Playground | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  
  const { toast } = useToast();

  // Get all playgrounds
  const {
    data: playgrounds = [] as Playground[],
    isLoading,
    refetch
  } = useQuery<Playground[]>({
    queryKey: ["/api/playgrounds"],
    refetchOnWindowFocus: false
  });

  // Create a new playground
  const { mutate: createPlayground, isPending: isCreating } = useMutation({
    mutationFn: async (playgroundData: InsertPlayground) => {
      const response = await apiRequest("/api/playgrounds", { 
        method: "POST", 
        body: playgroundData 
      });
      return response as Playground;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Playground created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/playgrounds"] });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to create playground", 
        variant: "destructive" 
      });
    }
  });

  // Update a playground
  const { mutate: updatePlayground, isPending: isUpdating } = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertPlayground> }) => {
      const response = await apiRequest(`/api/playgrounds/${id}`, { 
        method: "PATCH", 
        body: data 
      });
      return response as Playground;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Playground updated successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/playgrounds"] });
      resetForm();
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to update playground", 
        variant: "destructive" 
      });
    }
  });

  // Delete a playground
  const { mutate: deletePlayground, isPending: isDeleting } = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest(`/api/playgrounds/${id}`, { method: "DELETE" });
      return response as boolean;
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Playground deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/playgrounds"] });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: "Failed to delete playground", 
        variant: "destructive" 
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const playgroundData = {
      name,
      description: description || null
    };

    if (isEditing && currentPlayground) {
      updatePlayground({ 
        id: currentPlayground.id, 
        data: playgroundData 
      });
    } else {
      createPlayground(playgroundData);
    }
  };

  const handleEdit = (playground: Playground) => {
    setCurrentPlayground(playground);
    setName(playground.name);
    setDescription(playground.description || "");
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this playground?")) {
      deletePlayground(id);
    }
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setCurrentPlayground(null);
    setIsEditing(false);
    setDialogOpen(false);
  };

  const openPlayground = (id: number) => {
    setLocation(`/playground/${id}`);
  };

  return (
    <div className="h-full flex flex-col p-4 md:p-6 overflow-auto bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Playgrounds</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Playground
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{isEditing ? "Edit Playground" : "Create New Playground"}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? "Update your playground details below." 
                  : "Add a new playground to organize your creative ideas."}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    placeholder="Playground name" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (optional)</Label>
                  <Textarea
                    id="description"
                    placeholder="Brief description of this playground"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                  />
                </div>
              </div>
              <DialogFooter className="mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={isCreating || isUpdating || !name.trim()} 
                  className="ml-2"
                >
                  {(isCreating || isUpdating) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isEditing ? "Update" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : playgrounds.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-md shadow">
          <h3 className="text-lg font-medium mb-2">No playgrounds yet</h3>
          <p className="text-gray-500 mb-6">Create your first playground to get started!</p>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Playground
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {playgrounds.map((playground) => (
            <Card key={playground.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-start">
                  <span className="truncate">{playground.name}</span>
                </CardTitle>
                <CardDescription>
                  {formatRelativeDate(playground.updatedAt)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 line-clamp-3">
                  {playground.description || "No description"}
                </p>
              </CardContent>
              <CardFooter className="flex justify-between pt-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openPlayground(playground.id)}
                >
                  Open
                </Button>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(playground)}
                    disabled={isDeleting}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDelete(playground.id)}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 text-accent" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}