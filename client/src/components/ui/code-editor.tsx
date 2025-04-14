import React from 'react';
import { cn } from '@/lib/utils';

interface CodeEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
  language?: string;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  content,
  onChange,
  readOnly = false,
  language = 'javascript'
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
        placeholder={`Enter ${language} code...`}
      />
    </div>
  );
}; 