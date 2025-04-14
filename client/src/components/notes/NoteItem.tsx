import { Note } from "@shared/schema";
import { formatRelativeDate } from "@/lib/utils";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NoteItemProps {
  note: Note;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isPending: boolean;
}

export default function NoteItem({ note, onClick, onDelete, isPending }: NoteItemProps) {
  // Truncate content for preview (max 150 chars)
  const truncatedContent = note.content.length > 150
    ? `${note.content.substring(0, 150)}...`
    : note.content;

  return (
    <div 
      className="bg-white rounded-lg p-4 shadow cursor-pointer hover:shadow-md transition-shadow relative group"
      onClick={onClick}
    >
      <h3 className="font-semibold text-lg mb-2">{note.title}</h3>
      <p className="font-merriweather text-sm text-gray-700 mb-3 line-clamp-3">
        {truncatedContent}
      </p>
      <div className="text-xs text-secondary">
        Updated {formatRelativeDate(note.updatedAt)}
      </div>
      
      {/* Delete button (only shows on hover) */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-accent"
        onClick={onDelete}
        disabled={isPending}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
