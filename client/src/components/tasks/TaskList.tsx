import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import TaskItem from "./TaskItem";
import { Skeleton } from "@/components/ui/skeleton";

export default function TaskList() {
  const [newTaskText, setNewTaskText] = useState("");
  const { toast } = useToast();

  // Fetch tasks
  const { 
    data: tasks = [], 
    isLoading,
    isError 
  } = useQuery<Task[]>({ 
    queryKey: ['/api/tasks'] 
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (text: string) => 
      apiRequest('POST', '/api/tasks', { text, completed: false }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setNewTaskText("");
      toast({
        title: "Task created",
        description: "Your task has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to create task",
        description: "There was an error creating your task. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<Task> }) =>
      apiRequest('PATCH', `/api/tasks/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: () => {
      toast({
        title: "Failed to update task",
        description: "There was an error updating your task. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/tasks/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "Your task has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete task",
        description: "There was an error deleting your task. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim()) {
      createTaskMutation.mutate(newTaskText);
    }
  };

  const handleToggleComplete = (id: number, completed: boolean) => {
    updateTaskMutation.mutate({ id, updates: { completed } });
  };

  const handleDeleteTask = (id: number) => {
    deleteTaskMutation.mutate(id);
  };

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-accent">Error loading tasks. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Task Creation */}
      <div className="bg-white rounded-lg p-4 shadow mb-4">
        <form onSubmit={handleCreateTask} className="flex items-center">
          <Input
            type="text"
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1 p-2 mr-2 focus:ring-primary"
            disabled={createTaskMutation.isPending}
          />
          <Button 
            type="submit" 
            disabled={createTaskMutation.isPending || !newTaskText.trim()}
            style={{ backgroundColor: '#2B2D42' }}
          >
            Add
          </Button>
        </form>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow">
              <div className="flex items-center">
                <Skeleton className="h-5 w-5 rounded-sm mr-3" />
                <Skeleton className="h-5 flex-1" />
                <Skeleton className="h-5 w-5 ml-2" />
              </div>
            </div>
          ))
        ) : tasks.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500">
            <p>No tasks yet. Add a task to get started!</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDeleteTask}
              isPending={updateTaskMutation.isPending || deleteTaskMutation.isPending}
            />
          ))
        )}
      </div>
    </div>
  );
}
