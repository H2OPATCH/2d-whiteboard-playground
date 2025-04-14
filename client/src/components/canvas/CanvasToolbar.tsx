import { 
  FileText, 
  Image, 
  StickyNote, 
  Square, 
  Link2 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface CanvasToolbarProps {
  activeTool: string | null;
  onSelectTool: (tool: string | null) => void;
}

export default function CanvasToolbar({ activeTool, onSelectTool }: CanvasToolbarProps) {
  const tools = [
    { id: 'text', icon: FileText, label: 'Text' },
    { id: 'sticky', icon: StickyNote, label: 'Sticky Note' },
    { id: 'shape', icon: Square, label: 'Shape' },
    { id: 'image', icon: Image, label: 'Image' },
    { id: 'connector', icon: Link2, label: 'Connector' }
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-3 flex space-x-2 overflow-x-auto">
      <TooltipProvider>
        {tools.map((tool) => (
          <Tooltip key={tool.id}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn(
                  "flex items-center p-2 rounded whitespace-nowrap",
                  activeTool === tool.id && "bg-gray-200"
                )}
                onClick={() => onSelectTool(activeTool === tool.id ? null : tool.id)}
              >
                <tool.icon className="h-5 w-5 mr-2" />
                <span>{tool.label}</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{tool.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
