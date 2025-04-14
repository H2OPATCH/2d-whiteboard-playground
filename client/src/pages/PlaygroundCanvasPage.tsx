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
  
  // Fetch playground data with proper typing
  const { 
    data: playground,
    isLoading: isLoadingPlayground,
    isError: isPlaygroundError
  } = useQuery<Playground>({
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
  } = useQuery<PlaygroundItem[]>({
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
      apiRequest('POST', `/api/playgrounds/${id}/items`, {
        ...item,
        positionX: Math.round(item.positionX),
        positionY: Math.round(item.positionY),
        width: item.width ? Math.round(item.width) : null,
        height: item.height ? Math.round(item.height) : null
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/playgrounds/${id}/items`] });
      toast({ title: "Success", description: "Item added to canvas" });
    },
    onError: (error) => {
      console.error('Error creating item:', error);
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
      apiRequest('PATCH', `/api/playgrounds/${id}/items/${itemId}`, updates),
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
      apiRequest('DELETE', `/api/playgrounds/${id}/items/${itemId}`),
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
      apiRequest('PATCH', `/api/playgrounds/${id}`, updates),
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
    const x = Math.round((e.clientX - rect.left) / scale);
    const y = Math.round((e.clientY - rect.top) / scale);
    
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
      case 'image':
      case 'video':
      case 'pdf':
        return 300;
      case 'flowchart':
        return 150;
      default:
        return null;
    }
  };
  
  // Get default height based on type
  const getDefaultHeight = (type: string): number | null => {
    switch (type) {
      case 'text':
        return null; // Auto height for text
      case 'sticky':
        return 200;
      case 'shape':
        return 100;
      case 'image':
      case 'video':
      case 'pdf':
        return 200;
      case 'flowchart':
        return 100;
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
    <div className="h-full flex flex-col overflow-hidden bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-2 px-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleBack} className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700">
              <ChevronLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </Button>
            
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Input
                  className="w-60 h-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  value={playgroundName}
                  onChange={(e) => setPlaygroundName(e.target.value)}
                  placeholder="Playground name"
                />
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleSaveDetails}
                  disabled={!playgroundName.trim() || isUpdatingPlayground}
                  className="text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  <Check className="h-4 w-4" />
                </Button>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={handleCancelEdit}
                  disabled={isUpdatingPlayground}
                  className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  {playground?.name}
                </h1>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  onClick={() => setIsEditing(true)}
                  className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomOut} 
              disabled={scale <= 0.5}
              className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-900 dark:text-gray-100">{Math.round(scale * 100)}%</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleZoomIn} 
              disabled={scale >= 2}
              className="text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
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
              className="h-8 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
            />
          </div>
        )}
        
        {/* Description display when not editing */}
        {!isEditing && playground?.description && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 px-12">
            {playground.description}
          </p>
        )}
      </div>
      
      {/* Toolbar */}
      <PlaygroundToolbar activeTool={activeTool} onSelectTool={setActiveTool} />
      
      {/* Canvas */}
      <div className="flex-1 overflow-auto relative bg-gray-100 dark:bg-gray-800" onClick={handleCanvasClick}>
        <div 
          ref={canvasRef}
          className="absolute top-0 left-0 transform-gpu"
          style={{
            backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)',
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            transform: `scale(${scale})`,
            transformOrigin: '0 0',
            width: '100%',
            height: '100%',
            minWidth: '2000px',
            minHeight: '2000px'
          }}
        >
          {isLoadingItems ? (
            <div className="absolute top-5 left-5 bg-white dark:bg-gray-700 p-4 rounded-md shadow-md">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <div className="relative">
              {items.map((item) => (
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
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}