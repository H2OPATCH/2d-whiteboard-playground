import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import NoteItem from "./NoteItem";
import { Skeleton } from "@/components/ui/skeleton";
import { useMobile } from "@/hooks/use-mobile";

interface NoteListProps {
  onNewNote: () => void;
  onSelectNote: (note: Note) => void;
}

export default function NoteList({ onNewNote, onSelectNote }: NoteListProps) {
  const { toast } = useToast();
  const isMobile = useMobile();

  // Fetch notes
  const { 
    data: notes = [], 
    isLoading,
    isError 
  } = useQuery<Note[]>({ 
    queryKey: ['/api/notes'] 
  });

  // Delete note mutation
  const deleteNoteMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/notes/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete note",
        description: "There was an error deleting your note. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleDeleteNote = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this note?")) {
      deleteNoteMutation.mutate(id);
    }
  };

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-accent">Error loading notes. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Note Creation */}
      <Button
        onClick={onNewNote}
        className="w-full bg-white rounded-lg p-4 shadow mb-4 text-left border-2 border-dashed border-gray-300 hover:border-primary transition-colors h-auto justify-start"
        variant="ghost"
      >
        <Plus className="h-5 w-5 mr-2" />
        Create a new note
      </Button>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isLoading ? (
          // Loading skeleton
          Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="bg-white rounded-lg p-4 shadow">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-full mb-1" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))
        ) : notes.length === 0 ? (
          <div className="bg-white rounded-lg p-6 shadow text-center text-gray-500 col-span-2">
            <p>No notes yet. Create a note to get started!</p>
          </div>
        ) : (
          notes.map((note) => (
            <NoteItem
              key={note.id}
              note={note}
              onClick={() => onSelectNote(note)}
              onDelete={(e) => handleDeleteNote(note.id, e)}
              isPending={deleteNoteMutation.isPending}
            />
          ))
        )}
      </div>

      {/* Mobile FAB */}
      {isMobile && (
        <div className="fixed bottom-6 right-6">
          <Button
            onClick={onNewNote}
            className="w-14 h-14 rounded-full shadow-lg"
            style={{ backgroundColor: '#EF233C' }}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </div>
      )}
    </div>
  );
}
