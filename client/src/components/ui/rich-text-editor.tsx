import React from 'react';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  content,
  onChange,
  readOnly = false
}) => {
  return (
    <div
      className={cn(
        "w-full h-full p-2 bg-white dark:bg-gray-700 rounded-md shadow-md",
        "prose dark:prose-invert max-w-none"
      )}
      contentEditable={!readOnly}
      suppressContentEditableWarning
      onInput={(e) => onChange(e.currentTarget.innerHTML)}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}; 