import { useState, useRef, useEffect } from "react";
import { PlaygroundItem } from "@shared/schema";
import { Trash2, Edit3, Link, Image, FileText, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface PlaygroundItemProps {
  item: PlaygroundItem;
  onMove: (id: number, posX: number, posY: number) => void;
  onDelete: (id: number) => void;
  onContentChange: (id: number, content: string) => void;
  onRichContentChange: (id: number, richContent: any) => void;
  scale: number;
  isUpdating: boolean;
}

export default function PlaygroundItemComponent({ 
  item, 
  onMove, 
  onDelete, 
  onContentChange,
  onRichContentChange,
  scale,
  isUpdating 
}: PlaygroundItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [mediaUrl, setMediaUrl] = useState(item.mediaUrl || "");
  const itemRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle item dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === contentRef.current) return;
    if (isEditing) return;
    
    e.stopPropagation();
    setIsDragging(true);
    
    const itemRect = itemRef.current?.getBoundingClientRect();
    if (itemRect) {
      setDragOffset({
        x: e.clientX - itemRect.left,
        y: e.clientY - itemRect.top
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || isUpdating) return;
    
    const canvasRect = itemRef.current?.parentElement?.getBoundingClientRect();
    if (!canvasRect) return;
    
    const x = (e.clientX - canvasRect.left) / scale - dragOffset.x / scale;
    const y = (e.clientY - canvasRect.top) / scale - dragOffset.y / scale;
    
    if (itemRef.current) {
      itemRef.current.style.left = `${x}px`;
      itemRef.current.style.top = `${y}px`;
    }
  };

  const handleMouseUp = () => {
    if (isDragging && itemRef.current) {
      const left = parseInt(itemRef.current.style.left);
      const top = parseInt(itemRef.current.style.top);
      onMove(item.id, left, top);
    }
    setIsDragging(false);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerText;
    onContentChange(item.id, newContent);
  };

  const handleMediaUrlChange = () => {
    onRichContentChange(item.id, { mediaUrl });
  };

  // Add event listeners for mouse events
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, scale]);

  // Apply styles based on item type
  let className = "absolute rounded-lg shadow-sm cursor-move";
  let contentClassName = "font-merriweather";
  let style: React.CSSProperties = {
    left: `${item.positionX}px`,
    top: `${item.positionY}px`,
    width: item.width ? `${item.width}px` : 'auto',
    height: item.height ? `${item.height}px` : 'auto',
    ...(item.style as React.CSSProperties || {})
  };

  const renderItemContent = () => {
    if (item.type === 'image' || item.mediaType === 'image') {
      return (
        <img 
          src={item.mediaUrl || ''} 
          alt="Playground image" 
          className="w-full h-auto"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300x200?text=Image+Error';
          }}
        />
      );
    } else if (item.type === 'video' || item.mediaType === 'video') {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 p-2">
          {item.mediaUrl ? (
            <video 
              src={item.mediaUrl} 
              controls 
              className="max-w-full max-h-full"
            />
          ) : (
            <div className="text-center text-gray-500">
              <Video className="w-10 h-10 mx-auto mb-2" />
              <p>Video placeholder</p>
            </div>
          )}
        </div>
      );
    } else if (item.type === 'pdf' || item.mediaType === 'pdf') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 p-4">
          <FileText className="w-10 h-10 text-primary mb-2" />
          <p className="text-center">{item.content || 'PDF Document'}</p>
          {item.mediaUrl && (
            <a 
              href={item.mediaUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="mt-2 text-blue-500 underline text-sm"
            >
              Open PDF
            </a>
          )}
        </div>
      );
    } else {
      return (
        <div
          ref={contentRef}
          contentEditable={!isDragging && !isUpdating}
          onBlur={handleContentChange}
          suppressContentEditableWarning={true}
          className={contentClassName}
        >
          {item.content}
        </div>
      );
    }
  };

  // Apply specific styles based on item type
  if (item.type === 'text') {
    className += " bg-white p-3";
  } else if (item.type === 'sticky') {
    className += " bg-yellow-100 p-3";
  } else if (item.type === 'shape') {
    className += " bg-primary bg-opacity-10 rounded-full flex items-center justify-center";
    contentClassName += " text-center";
  } else if (item.type === 'image' || item.type === 'video' || item.type === 'pdf') {
    className += " overflow-hidden";
  } else if (item.type === 'flowchart') {
    className += " bg-white p-3 border-2 border-primary";
  }

  return (
    <div
      ref={itemRef}
      className={className}
      style={style}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {renderItemContent()}

      {showControls && (
        <div className="absolute top-1 right-1 flex space-x-1">
          {(item.type === 'image' || item.type === 'video' || item.type === 'pdf') && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bg-white bg-opacity-70 rounded-full h-6 w-6 p-1 shadow-sm"
                  disabled={isUpdating}
                >
                  <Edit3 className="h-full w-full text-gray-600" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="mediaUrl">Media URL</Label>
                    <Input
                      id="mediaUrl"
                      placeholder="https://example.com/media.jpg"
                      value={mediaUrl}
                      onChange={(e) => setMediaUrl(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleMediaUrlChange} disabled={isUpdating}>
                    Update Media
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            className="bg-white bg-opacity-70 rounded-full h-6 w-6 p-1 shadow-sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(item.id);
            }}
            disabled={isUpdating}
          >
            <Trash2 className="h-full w-full text-accent" />
          </Button>
        </div>
      )}
    </div>
  );
}