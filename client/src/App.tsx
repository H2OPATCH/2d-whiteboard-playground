import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import NotFound from "@/pages/not-found";
import TasksPage from "@/pages/TasksPage";
import NotesPage from "@/pages/NotesPage";
import CanvasPage from "@/pages/CanvasPage";
import { Sidebar } from "@/components/ui/sidebar";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="h-screen flex flex-col md:flex-row overflow-hidden bg-background">
        <Sidebar />
        <div className="flex-1 h-full overflow-hidden">
          <Switch>
            <Route path="/" component={TasksPage} />
            <Route path="/tasks" component={TasksPage} />
            <Route path="/notes" component={NotesPage} />
            <Route path="/canvas" component={CanvasPage} />
            <Route component={NotFound} />
          </Switch>
        </div>
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
