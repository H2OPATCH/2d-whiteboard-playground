import { useState } from "react";
import NoteList from "@/components/notes/NoteList";
import NoteEditor from "@/components/notes/NoteEditor";
import { Note } from "@shared/schema";

export default function NotesPage() {
  const [selectedNote, setSelectedNote] = useState<Note | undefined>(undefined);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const handleNewNote = () => {
    setSelectedNote(undefined);
    setIsEditorOpen(true);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setIsEditorOpen(true);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
  };

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-semibold">Notes</h1>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        <NoteList 
          onNewNote={handleNewNote} 
          onSelectNote={handleSelectNote} 
        />
      </div>

      <NoteEditor 
        note={selectedNote} 
        isOpen={isEditorOpen} 
        onClose={handleCloseEditor} 
      />
    </div>
  );
}
