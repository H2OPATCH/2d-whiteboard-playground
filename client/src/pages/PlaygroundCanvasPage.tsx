import { useState, useRef, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { 
  PlaygroundItem, 
  InsertPlaygroundItem, 
  Playground 
} from "@shared/schema";
import { 
  ChevronLeft, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  RotateCw,
  Loader2,
  Edit,
  Check,
  X,
  Trash2,
  CornerRightDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest, getQueryFn } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";
import { debounce } from "@/lib/utils";
import PlaygroundToolbar from "@/components/playground/PlaygroundToolbar";
import PlaygroundItemComponent from "@/components/playground/PlaygroundItem";

export default function PlaygroundCanvasPage() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  
  // State
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [isEditing, setIsEditing] = useState(false);
  const [playgroundName, setPlaygroundName] = useState("");
  const [playgroundDescription, setPlaygroundDescription] = useState("");
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  
  // Fetch playground data
  const { 
    data: playground,
    isLoading: isLoadingPlayground,
    isError: isPlaygroundError
  } = useQuery({
    queryKey: [`/api/playgrounds/${id}`],
    retry: false,
    enabled: !!id,
    queryFn: getQueryFn({
      on401: "throw"
    })
  });
  
  // Fetch playground items
  const { 
    data: items = [],
    isLoading: isLoadingItems,
    isError: isItemsError
  } = useQuery({
    queryKey: [`/api/playgrounds/${id}/items`],
    retry: false,
    enabled: !!id,
    queryFn: getQueryFn({
      on401: "throw"
    })
  });
  
  // Create item mutation
  const { mutate: createItem, isPending: isCreatingItem } = useMutation({
    mutationFn: (item: InsertPlaygroundItem) => 
      apiRequest(`/api/playgrounds/${id}/items`, { method: "POST", body: item }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playgrounds/${id}/items`] });
      toast({ title: "Success", description: "Item added to canvas" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to add item to canvas", 
        variant: "destructive" 
      });
    }
  });
  
  // Update item mutation
  const { mutate: updateItem, isPending: isUpdatingItem } = useMutation({
    mutationFn: ({ itemId, updates }: { itemId: number, updates: Partial<InsertPlaygroundItem> }) =>
      apiRequest(`/api/playgrounds/${id}/items/${itemId}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playgrounds/${id}/items`] });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update item", 
        variant: "destructive" 
      });
    }
  });
  
  // Delete item mutation
  const { mutate: deleteItem, isPending: isDeletingItem } = useMutation({
    mutationFn: (itemId: number) =>
      apiRequest(`/api/playgrounds/${id}/items/${itemId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playgrounds/${id}/items`] });
      toast({ title: "Success", description: "Item deleted" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to delete item", 
        variant: "destructive" 
      });
    }
  });
  
  // Update playground mutation
  const { mutate: updatePlayground, isPending: isUpdatingPlayground } = useMutation({
    mutationFn: (updates: Partial<Playground>) =>
      apiRequest(`/api/playgrounds/${id}`, { method: "PATCH", body: updates }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playgrounds/${id}`] });
      setIsEditing(false);
      toast({ title: "Success", description: "Playground updated" });
    },
    onError: () => {
      toast({ 
        title: "Error", 
        description: "Failed to update playground", 
        variant: "destructive" 
      });
    }
  });
  
  // Set initial state from data
  useEffect(() => {
    if (playground) {
      setPlaygroundName(playground.name);
      setPlaygroundDescription(playground.description || "");
    }
  }, [playground]);
  
  // Handle canvas click for adding new items
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!activeTool || !canvasRef.current || isCreatingItem) return;
    
    // Don't create new item if clicking on an existing item
    if ((e.target as HTMLElement).closest('.playground-item')) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Default item properties
    let item: InsertPlaygroundItem = {
      playgroundId: Number(id),
      type: activeTool,
      content: getDefaultContent(activeTool),
      positionX: x,
      positionY: y,
      width: getDefaultWidth(activeTool),
      height: getDefaultHeight(activeTool),
      style: {},
      richContent: {},
      connectionData: {},
      mediaUrl: null,
      mediaType: null,
    };
    
    createItem(item);
  };
  
  // Get default content based on type
  const getDefaultContent = (type: string): string => {
    switch (type) {
      case 'text':
        return 'Double-click to edit text';
      case 'sticky':
        return 'Sticky note';
      case 'shape':
        return '';
      case 'connector':
        return '';
      case 'flowchart':
        return 'Flowchart item';
      default:
        return '';
    }
  };
  
  // Get default width based on type
  const getDefaultWidth = (type: string): number | null => {
    switch (type) {
      case 'text':
        return 200;
      case 'sticky':
        return 200;
      case 'shape':
        return 100;
      case 'flowchart':
        return 200;
      default:
        return null;
    }
  };
  
  // Get default height based on type
  const getDefaultHeight = (type: string): number | null => {
    switch (type) {
      case 'text':
        return null;
      case 'sticky':
        return 200;
      case 'shape':
        return 100;
      case 'flowchart':
        return 80;
      default:
        return null;
    }
  };
  
  // Handle zooming
  const handleZoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2));
  };
  
  const handleZoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };
  
  // Handle item updating
  const handleItemMove = useCallback(
    debounce((id: number, posX: number, posY: number) => {
      updateItem({
        itemId: id,
        updates: {
          positionX: posX,
          positionY: posY
        }
      });
    }, 500),
    [updateItem]
  );
  
  // Handle content change
  const handleContentChange = useCallback(
    debounce((id: number, content: string) => {
      updateItem({
        itemId: id,
        updates: { content }
      });
    }, 500),
    [updateItem]
  );
  
  // Handle rich content change
  const handleRichContentChange = useCallback(
    (id: number, richContent: any) => {
      updateItem({
        itemId: id,
        updates: { richContent }
      });
    },
    [updateItem]
  );
  
  // Handle media content change
  const handleMediaContentChange = useCallback(
    (id: number, mediaUrl: string, mediaType: string) => {
      updateItem({
        itemId: id,
        updates: { mediaUrl, mediaType }
      });
    },
    [updateItem]
  );
  
  // Handle save playground details
  const handleSaveDetails = () => {
    updatePlayground({
      name: playgroundName,
      description: playgroundDescription || null
    });
  };
  
  // Handle cancel editing
  const handleCancelEdit = () => {
    if (playground) {
      setPlaygroundName(playground.name);
      setPlaygroundDescription(playground.description || "");
    }
    setIsEditing(false);
  };
  
  // Navigation back to playgrounds list
  const handleBack = () => {
    navigate('/playground');
  };
  
  // Loading state
  if (isLoadingPlayground) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin mx-auto mb-4 text-primary" />
          <p>Loading playground...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (isPlaygroundError) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Playground Not Found</h2>
        <p className="text-gray-600 mb-6">
          The playground you're looking for could not be found or you don't have access to it.
        </p>
        <Button onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Playgrounds
        </Button>
      </div>
    );
  }
  
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  className="w-60 h-8"
                  value={playgroundName}
                  onChange={(e) => setPlaygroundName(e.target.value)}
                  placeholder="Playground name"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleSaveDetails}
                  disabled={!playgroundName.trim() || isUpdatingPlayground}
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleCancelEdit}
                  disabled={isUpdatingPlayground}
                >
                  <X className="h-4 w-4 text-accent" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold">
                  {playground?.name}
                </h1>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleZoomOut} disabled={scale <= 0.5}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm">{Math.round(scale * 100)}%</span>
            <Button variant="outline" size="sm" onClick={handleZoomIn} disabled={scale >= 2}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Description when editing */}
        {isEditing && (
          <div className="mt-2 px-2">
            <Label htmlFor="description" className="sr-only">Description</Label>
            <Input
              id="description"
              value={playgroundDescription}
              onChange={(e) => setPlaygroundDescription(e.target.value)}
              placeholder="Description (optional)"
              className="h-8"
            />
          </div>
        )}
        
        {/* Description display when not editing */}
        {!isEditing && playground?.description && (
          <p className="text-sm text-muted-foreground mt-1 px-12">
            {playground.description}
          </p>
        )}
      </div>
      
      {/* Toolbar */}
      <PlaygroundToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      
      {/* Canvas */}
      <div className="flex-1 overflow-auto relative bg-gray-100" onClick={handleCanvasClick}>
        <div 
          ref={canvasRef}
          className="h-[2000px] w-[2000px] absolute top-0 left-0 transform-gpu"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            transform: `scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {isLoadingItems ? (
            <div className="absolute top-5 left-5 bg-white p-4 rounded-md shadow-md">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            items.map((item) => (
              <PlaygroundItemComponent
                key={item.id}
                item={item}
                onMove={handleItemMove}
                onDelete={deleteItem}
                onContentChange={handleContentChange}
                onRichContentChange={handleRichContentChange}
                scale={scale}
                isUpdating={isUpdatingItem || isDeletingItem}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}