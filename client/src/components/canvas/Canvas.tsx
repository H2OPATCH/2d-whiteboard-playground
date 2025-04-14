import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { CanvasItem } from "@shared/schema";
import CanvasToolbar from "./CanvasToolbar";
import CanvasItemComponent from "./CanvasItem";
import { ZoomIn, ZoomOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { debounce } from "@/lib/utils";

export default function Canvas() {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch canvas items
  const { 
    data: canvasItems = [], 
    isLoading,
    isError 
  } = useQuery<CanvasItem[]>({ 
    queryKey: ['/api/canvas-items'] 
  });

  // Create canvas item mutation
  const createItemMutation = useMutation({
    mutationFn: (item: Omit<CanvasItem, 'id'>) => 
      apiRequest('POST', '/api/canvas-items', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvas-items'] });
      toast({
        title: "Item created",
        description: "Canvas item has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to create item",
        description: "There was an error creating your canvas item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update canvas item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<CanvasItem> }) =>
      apiRequest('PATCH', `/api/canvas-items/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvas-items'] });
    },
    onError: () => {
      toast({
        title: "Failed to update item",
        description: "There was an error updating your canvas item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete canvas item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/canvas-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/canvas-items'] });
      toast({
        title: "Item deleted",
        description: "Canvas item has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete item",
        description: "There was an error deleting your canvas item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create a debounced version of the update mutation to prevent too many API calls
  const debouncedUpdateItem = debounce(
    (id: number, updates: Partial<CanvasItem>) => {
      updateItemMutation.mutate({ id, updates });
    },
    500
  );

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Only initiate drag if the canvas background is clicked directly
    if (e.target === canvasRef.current || e.target === containerRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      setPosition(prev => ({ x: prev.x + dx, y: prev.y + dy }));
      setDragStart({ x: e.clientX, y: e.clientY });
    }
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    if (e.target !== canvasRef.current) return;
    if (!activeTool) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale - position.x;
    const y = (e.clientY - rect.top) / scale - position.y;

    let item: Omit<CanvasItem, 'id'> = {
      type: activeTool,
      content: '',
      positionX: Math.round(x),
      positionY: Math.round(y),
      width: null,
      height: null,
      style: null,
      userId: null
    };

    if (activeTool === 'text') {
      item.content = 'Double-click to edit';
      item.width = 200;
      item.height = 100;
      item.style = { backgroundColor: '#FFFFFF' };
    } else if (activeTool === 'sticky') {
      item.content = 'New sticky note';
      item.width = 200;
      item.height = 100;
      item.style = { backgroundColor: '#FFF9C4' };
    } else if (activeTool === 'shape') {
      item.content = 'Shape';
      item.width = 120;
      item.height = 120;
      item.style = { 
        backgroundColor: 'rgba(43, 45, 66, 0.1)', 
        borderRadius: '50%', 
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    }

    createItemMutation.mutate(item);
  };

  const handleItemMove = (id: number, posX: number, posY: number) => {
    debouncedUpdateItem(id, { positionX: posX, positionY: posY });
  };

  const handleItemDelete = (id: number) => {
    deleteItemMutation.mutate(id);
  };

  const handleItemContentChange = (id: number, content: string) => {
    debouncedUpdateItem(id, { content });
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 3));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.1));
  };

  const resetCanvas = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  // Add event listeners for mouse events outside the canvas component
  useEffect(() => {
    const handleMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleMouseUp);
    return () => window.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const canvasTransform = `scale(${scale}) translate(${position.x}px, ${position.y}px)`;

  if (isError) {
    return (
      <div className="text-center py-8">
        <p className="text-accent">Error loading canvas. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Canvas</h1>
        
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={zoomIn}>
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={zoomOut}>
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button variant="outline" size="icon" onClick={resetCanvas}>
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <CanvasToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

      <div 
        ref={containerRef}
        className="canvas-container flex-1 bg-canvas overflow-hidden relative"
        onMouseDown={handleCanvasMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={handleCanvasMouseUp}
        onDoubleClick={handleCanvasDoubleClick}
      >
        <div 
          ref={canvasRef}
          className="canvas-content absolute w-[5000px] h-[5000px] transform-origin-0-0 bg-grid"
          style={{ 
            transform: canvasTransform,
            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2UyZThmMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIiAvPjwvc3ZnPg==")`
          }}
        >
          {!isLoading && canvasItems.map((item) => (
            <CanvasItemComponent
              key={item.id}
              item={item}
              onMove={handleItemMove}
              onDelete={handleItemDelete}
              onContentChange={handleItemContentChange}
              scale={scale}
              isUpdating={updateItemMutation.isPending || deleteItemMutation.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
