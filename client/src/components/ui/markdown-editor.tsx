import React from 'react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  content,
  onChange,
  readOnly = false
}) => {
  return (
    <div
      className={cn(
        "w-full h-full p-2 bg-white dark:bg-gray-700 rounded-md shadow-md",
        "flex items-center justify-center"
      )}
    >
      <textarea
        className="w-full h-full resize-none bg-transparent outline-none font-mono"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        readOnly={readOnly}
        placeholder="Enter markdown content..."
      />
    </div>
  );
}; 