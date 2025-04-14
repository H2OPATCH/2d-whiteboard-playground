import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { PlaygroundItem, Playground } from "@shared/schema";
import { 
  ZoomIn, 
  ZoomOut, 
  RefreshCw, 
  ArrowLeft, 
  Edit, 
  Save, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { debounce } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PlaygroundToolbar from "@/components/playground/PlaygroundToolbar";
import PlaygroundItemComponent from "@/components/playground/PlaygroundItem";
import { useParams, useLocation } from "wouter";

export default function PlaygroundCanvasPage() {
  const params = useParams();
  const playgroundId = parseInt(params.id);
  const [, setLocation] = useLocation();
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch playground data
  const { 
    data: playground, 
    isLoading: isPlaygroundLoading,
    isError: isPlaygroundError
  } = useQuery<Playground>({
    queryKey: ['/api/playgrounds', playgroundId],
    queryFn: () => apiRequest('GET', `/api/playgrounds/${playgroundId}`),
    enabled: !isNaN(playgroundId)
  });

  // Fetch playground items
  const { 
    data: playgroundItems = [], 
    isLoading: isItemsLoading,
    isError: isItemsError 
  } = useQuery<PlaygroundItem[]>({ 
    queryKey: ['/api/playgrounds', playgroundId, 'items'],
    queryFn: () => apiRequest('GET', `/api/playgrounds/${playgroundId}/items`),
    enabled: !isNaN(playgroundId)
  });

  // Update playground title and description
  const updatePlaygroundMutation = useMutation({
    mutationFn: (data: { name?: string, description?: string }) =>
      apiRequest('PATCH', `/api/playgrounds/${playgroundId}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playgrounds', playgroundId] });
      toast({
        title: "Playground updated",
        description: "Your playground has been updated successfully."
      });
      setIsEditingTitle(false);
    },
    onError: () => {
      toast({
        title: "Failed to update playground",
        description: "There was an error updating your playground. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Create playground item mutation
  const createItemMutation = useMutation({
    mutationFn: (item: Omit<PlaygroundItem, 'id'>) => 
      apiRequest('POST', '/api/playground-items', item),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playgrounds', playgroundId, 'items'] });
      toast({
        title: "Item created",
        description: "Playground item has been created successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to create item",
        description: "There was an error creating your playground item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update playground item mutation
  const updateItemMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number, updates: Partial<PlaygroundItem> }) =>
      apiRequest('PATCH', `/api/playground-items/${id}`, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playgrounds', playgroundId, 'items'] });
    },
    onError: () => {
      toast({
        title: "Failed to update item",
        description: "There was an error updating your playground item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete playground item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest('DELETE', `/api/playground-items/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/playgrounds', playgroundId, 'items'] });
      toast({
        title: "Item deleted",
        description: "Playground item has been deleted successfully."
      });
    },
    onError: () => {
      toast({
        title: "Failed to delete item",
        description: "There was an error deleting your playground item. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Initialize edit fields when playground data loads
  useEffect(() => {
    if (playground) {
      setEditTitle(playground.name);
      setEditDescription(playground.description || "");
    }
  }, [playground]);

  // Create a debounced version of the update mutation to prevent too many API calls
  const debouncedUpdateItem = debounce(
    (id: number, updates: Partial<PlaygroundItem>) => {
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
    if (isNaN(playgroundId)) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left) / scale - position.x;
    const y = (e.clientY - rect.top) / scale - position.y;

    let item: Omit<PlaygroundItem, 'id'> = {
      playgroundId,
      type: activeTool,
      content: '',
      positionX: Math.round(x),
      positionY: Math.round(y),
      width: null,
      height: null,
      style: null,
      richContent: null,
      connectionData: null,
      mediaUrl: null,
      mediaType: null,
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
    } else if (activeTool === 'media') {
      // For demo purposes, use a placeholder image URL
      item.content = 'Media Content';
      item.mediaUrl = 'https://via.placeholder.com/300x200?text=Example+Media';
      item.mediaType = 'image';
      item.width = 300;
      item.height = 200;
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

  const handleItemRichContentChange = (id: number, richContent: any) => {
    debouncedUpdateItem(id, { richContent });
  };

  const handleSaveTitle = () => {
    if (!editTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your playground.",
        variant: "destructive"
      });
      return;
    }

    updatePlaygroundMutation.mutate({
      name: editTitle,
      description: editDescription
    });
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

  if (isPlaygroundError || isItemsError) {
    return (
      <div className="text-center py-8">
        <p className="text-accent">Error loading playground. Please try again later.</p>
        <Button 
          variant="outline" 
          className="mt-4" 
          onClick={() => setLocation("/playground")}
        >
          Back to Playgrounds
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/playground")}
            className="mr-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          {isEditingTitle ? (
            <div className="flex flex-col space-y-2">
              <Input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Playground Title"
                className="text-xl font-semibold"
              />
              <Textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="text-sm"
              />
              <div className="flex space-x-2">
                <Button 
                  size="sm" 
                  onClick={handleSaveTitle}
                  disabled={updatePlaygroundMutation.isPending}
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => {
                    setIsEditingTitle(false);
                    setEditTitle(playground?.name || "");
                    setEditDescription(playground?.description || "");
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold group flex items-center">
                {isPlaygroundLoading ? "Loading..." : playground?.name}
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => setIsEditingTitle(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </h1>
              {playground?.description && (
                <p className="text-sm text-gray-500 mt-1">{playground.description}</p>
              )}
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={zoomIn}>
                  <ZoomIn className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom In</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={zoomOut}>
                  <ZoomOut className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Zoom Out</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={resetCanvas}>
                  <RefreshCw className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reset Canvas</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <PlaygroundToolbar activeTool={activeTool} onSelectTool={setActiveTool} />

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
          {!isItemsLoading && playgroundItems.map((item) => (
            <PlaygroundItemComponent
              key={item.id}
              item={item}
              onMove={handleItemMove}
              onDelete={handleItemDelete}
              onContentChange={handleItemContentChange}
              onRichContentChange={handleItemRichContentChange}
              scale={scale}
              isUpdating={updateItemMutation.isPending || deleteItemMutation.isPending}
            />
          ))}
        </div>
      </div>
    </div>
  );
}