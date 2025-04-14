import React from 'react';
import { CodeEditor } from '@/components/ui/code-editor';
import { MarkdownEditor } from '@/components/ui/markdown-editor';
import { PlaygroundItem as PlaygroundItemType } from '@/types/playground';

interface PlaygroundItemProps {
  item: PlaygroundItemType;
  onUpdate: (item: PlaygroundItemType) => void;
  onDelete: (id: string) => void;
}

export const PlaygroundItem: React.FC<PlaygroundItemProps> = ({
  item,
  onUpdate,
  onDelete
}) => {
  const handleContentChange = (content: string) => {
    onUpdate({
      ...item,
      content
    });
  };

  return (
    <div className="w-full h-full p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{item.title}</h3>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-500 hover:text-red-700"
        >
          Delete
        </button>
      </div>
      {item.type === 'code' ? (
        <CodeEditor
          content={item.content}
          onChange={handleContentChange}
          language={item.language}
        />
      ) : (
        <MarkdownEditor
          content={item.content}
          onChange={handleContentChange}
        />
      )}
    </div>
  );
};

export default PlaygroundItem;