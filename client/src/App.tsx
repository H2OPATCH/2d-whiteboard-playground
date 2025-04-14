import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import TasksPage from "@/pages/TasksPage";
import NotesPage from "@/pages/NotesPage";
import CanvasPage from "@/pages/CanvasPage";
import PlaygroundPage from "@/pages/PlaygroundPage";
import PlaygroundCanvasPage from "@/pages/PlaygroundCanvasPage";
import { Sidebar } from "@/components/ui/sidebar";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 h-full overflow-hidden ml-0 md:ml-64 transition-all duration-300">
          <div className="h-full p-2 pt-16 md:pt-2">
            <Switch>
              <Route path="/" component={TasksPage} />
              <Route path="/tasks" component={TasksPage} />
              <Route path="/notes" component={NotesPage} />
              <Route path="/canvas" component={CanvasPage} />
              <Route path="/playground" component={PlaygroundPage} />
              <Route path="/playground/:id" component={PlaygroundCanvasPage} />
              <Route component={NotFound} />
            </Switch>
          </div>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
