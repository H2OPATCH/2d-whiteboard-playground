import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Note, InsertNote } from "@shared/schema";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { X, Bold, Italic, Underline, Link, Image } from "lucide-react";
import { formatRelativeDate } from "@/lib/utils";

interface NoteEditorProps {
  note?: Note;
  isOpen: boolean;
  onClose: () => void;
}

export default function NoteEditor({ note, isOpen, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { toast } = useToast();
  
  // Reset form when note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
    } else {
      setTitle("");
      setContent("");
    }
  }, [note, isOpen]);

  // Create note mutation
  const createNoteMutation = useMutation({
    mutationFn: (noteData: InsertNote) => 
      apiRequest('POST', '/api/notes', noteData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note created",
        description: "Your note has been created successfully."
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to create note",
        description: "There was an error creating your note. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update note mutation
  const updateNoteMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<InsertNote> }) =>
      apiRequest('PATCH', `/api/notes/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/notes'] });
      toast({
        title: "Note updated",
        description: "Your note has been updated successfully."
      });
      onClose();
    },
    onError: () => {
      toast({
        title: "Failed to update note",
        description: "There was an error updating your note. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSave = () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your note.",
        variant: "destructive"
      });
      return;
    }

    const noteData = {
      title,
      content
    };

    if (note) {
      updateNoteMutation.mutate({ id: note.id, updates: noteData });
    } else {
      createNoteMutation.mutate(noteData as InsertNote);
    }
  };

  const isPending = createNoteMutation.isPending || updateNoteMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
        <div className="p-1 border-b border-gray-200 flex justify-between items-center">
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note Title"
            className="text-xl font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0"
            disabled={isPending}
          />
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-6 w-6" />
          </Button>
        </div>

        <div className="note-toolbar flex flex-wrap gap-2 p-2 border-b border-gray-200">
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Underline className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <Image className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto p-4">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your note content here..."
            className="min-h-[300px] font-merriweather text-base resize-none border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0"
            disabled={isPending}
          />
        </div>

        <div className="flex justify-between items-center p-2 border-t border-gray-200">
          <div className="text-sm text-secondary">
            {note && note.updatedAt ? `Last edited: ${formatRelativeDate(note.updatedAt)}` : ''}
          </div>
          <Button 
            onClick={handleSave} 
            disabled={isPending || !title.trim()}
            style={{ backgroundColor: '#2B2D42' }}
          >
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
