import { Task } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: Task;
  onToggleComplete: (id: number, completed: boolean) => void;
  onDelete: (id: number) => void;
  isPending: boolean;
}

export default function TaskItem({ task, onToggleComplete, onDelete, isPending }: TaskItemProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow flex items-center">
      <Checkbox
        checked={task.completed}
        onCheckedChange={(checked) => {
          onToggleComplete(task.id, checked as boolean);
        }}
        className="h-5 w-5 mr-3"
        disabled={isPending}
      />
      <span 
        className={cn(
          "flex-1 font-merriweather", 
          task.completed && "line-through text-secondary"
        )}
      >
        {task.text}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onDelete(task.id)}
        className="text-gray-400 hover:text-accent"
        disabled={isPending}
      >
        <Trash2 className="h-5 w-5" />
      </Button>
    </div>
  );
}
