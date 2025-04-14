import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useMobile } from "@/hooks/use-mobile";
import {
  CheckSquare,
  FileText,
  Lightbulb,
  User,
  Menu,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Sidebar() {
  const [location] = useLocation();
  const isMobile = useMobile();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar on mobile when location changes
  useEffect(() => {
    if (isMobile) {
      setIsOpen(false);
    }
  }, [location, isMobile]);

  // Sidebar should always be open on desktop
  useEffect(() => {
    if (!isMobile) {
      setIsOpen(true);
    }
  }, [isMobile]);

  const sidebarItems = [
    {
      name: "Tasks",
      path: "/tasks",
      icon: <CheckSquare className="h-6 w-6" />,
    },
    {
      name: "Notes",
      path: "/notes",
      icon: <FileText className="h-6 w-6" />,
    },
    {
      name: "Canvas",
      path: "/canvas",
      icon: <Lightbulb className="h-6 w-6" />,
    },
    {
      name: "Playground",
      path: "/playground",
      icon: <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="M20.4 14.5L16 10 4 20" />
      </svg>,
    },
  ];

  const activePath = location === "/" ? "/tasks" : location;

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Mobile menu button */}
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50"
          onClick={toggleSidebar}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-full md:w-20 lg:w-64 bg-white border-r border-gray-200 flex flex-col z-40",
          "transition-all duration-300 ease-in-out",
          isMobile && "fixed inset-y-0 left-0",
          isMobile && !isOpen && "-translate-x-full"
        )}
      >
        {/* Logo and Navigation */}
        <div className="flex flex-col h-full">
          <div className="p-4 flex items-center justify-center md:justify-start">
            <span className="hidden lg:block text-primary font-bold text-xl">ProductivityCanvas</span>
            <span className="block md:block lg:hidden text-primary font-bold text-xl">PC</span>
          </div>

          <nav className="flex flex-col w-full mt-4">
            {sidebarItems.map((item) => (
              <Link key={item.path} href={item.path}>
                <a
                  className={cn(
                    "flex items-center p-4 w-full text-left hover:bg-gray-100 transition-colors",
                    "border-l-[3px]",
                    activePath === item.path
                      ? "border-primary bg-opacity-10 bg-primary"
                      : "border-transparent"
                  )}
                >
                  {item.icon}
                  <span className="ml-3 hidden lg:block">{item.name}</span>
                </a>
              </Link>
            ))}
          </nav>

          {/* User Profile */}
          <div className="p-4 mt-auto border-t border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <div className="ml-3 hidden lg:block">
                <p className="text-sm font-medium">User</p>
                <p className="text-xs text-secondary">user@example.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
