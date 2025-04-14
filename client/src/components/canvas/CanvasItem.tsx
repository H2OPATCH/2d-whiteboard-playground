import { useState, useRef, useEffect } from "react";
import { CanvasItem } from "@shared/schema";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CanvasItemProps {
  item: CanvasItem;
  onMove: (id: number, posX: number, posY: number) => void;
  onDelete: (id: number) => void;
  onContentChange: (id: number, content: string) => void;
  scale: number;
  isUpdating: boolean;
}

export default function CanvasItemComponent({ 
  item, 
  onMove, 
  onDelete, 
  onContentChange, 
  scale,
  isUpdating 
}: CanvasItemProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showControls, setShowControls] = useState(false);
  const itemRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Handle item dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.target === contentRef.current) return;
    
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
    ...item.style
  };

  if (item.type === 'text') {
    className += " bg-white p-3";
  } else if (item.type === 'sticky') {
    className += " bg-yellow-100 p-3";
  } else if (item.type === 'shape') {
    className += " bg-primary bg-opacity-10 rounded-full flex items-center justify-center";
    contentClassName += " text-center";
  } else if (item.type === 'image') {
    className += " overflow-hidden";
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
      {item.type === 'image' ? (
        <img 
          src={item.content} 
          alt="Canvas image" 
          className="w-full h-auto"
        />
      ) : (
        <div
          ref={contentRef}
          contentEditable={!isDragging && !isUpdating}
          onBlur={handleContentChange}
          suppressContentEditableWarning={true}
          className={contentClassName}
        >
          {item.content}
        </div>
      )}

      {showControls && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-1 right-1 bg-white bg-opacity-70 rounded-full h-6 w-6 p-1 shadow-sm"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          disabled={isUpdating}
        >
          <Trash2 className="h-full w-full text-accent" />
        </Button>
      )}
    </div>
  );
}
