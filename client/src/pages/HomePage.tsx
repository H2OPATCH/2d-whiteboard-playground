import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  CheckSquare,
  FileText,
  Lightbulb,
  PenTool,
  ArrowRight,
  Clock,
  Star,
  Plus,
  Calendar
} from 'lucide-react';
import { formatRelativeDate } from '@/lib/utils';
import { Task, Note, Playground } from '@shared/schema';

// Define activity type for recent activities
type ActivityType = 'task' | 'note' | 'canvas' | 'playground';
interface Activity {
  id: number;
  type: ActivityType;
  title: string;
  date: Date;
  priority?: 'high' | 'medium' | 'low';
}

// Priority badge component
function PriorityBadge({ priority }: { priority: 'high' | 'medium' | 'low' }) {
  const colors = {
    high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  };

  return (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[priority]}`}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)}
    </span>
  );
}

// Icon component based on activity type
function ActivityIcon({ type }: { type: ActivityType }) {
  const iconProps = { className: 'h-5 w-5' };
  
  switch (type) {
    case 'task':
      return <CheckSquare {...iconProps} />;
    case 'note':
      return <FileText {...iconProps} />;
    case 'canvas':
      return <Lightbulb {...iconProps} />;
    case 'playground':
      return <PenTool {...iconProps} />;
    default:
      return <Clock {...iconProps} />;
  }
}

export default function HomePage() {
  const [, navigate] = useLocation();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [priorityItems, setPriorityItems] = useState<Activity[]>([]);

  // Fetch tasks
  const { data: tasks = [] } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
    refetchOnWindowFocus: false
  });

  // Fetch notes
  const { data: notes = [] } = useQuery<Note[]>({
    queryKey: ['/api/notes'],
    refetchOnWindowFocus: false
  });

  // Fetch playgrounds
  const { data: playgrounds = [] } = useQuery<Playground[]>({
    queryKey: ['/api/playgrounds'],
    refetchOnWindowFocus: false
  });

  // Create activities list when data changes
  useEffect(() => {
    const newActivities: Activity[] = [
      // Convert tasks to activities
      ...tasks.map(task => ({
        id: task.id,
        type: 'task' as ActivityType,
        title: task.text,
        date: new Date(task.createdAt || new Date()),
        priority: task.priority as 'high' | 'medium' | 'low' || 'medium'
      })),
      
      // Convert notes to activities
      ...notes.map(note => ({
        id: note.id,
        type: 'note' as ActivityType,
        title: note.title,
        date: new Date(note.updatedAt),
        priority: note.priority as 'high' | 'medium' | 'low' || 'medium'
      })),
      
      // Convert playgrounds to activities
      ...playgrounds.map(playground => ({
        id: playground.id,
        type: 'playground' as ActivityType,
        title: playground.name,
        date: new Date(playground.updatedAt),
        priority: 'medium' as 'high' | 'medium' | 'low'
      }))
    ];
    
    // Sort by date (most recent first)
    newActivities.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    setActivities(newActivities);
    
    // Set priority items (high priority first, then medium, then low)
    const newPriorityItems = [...newActivities].sort((a, b) => {
      const priorityValues = { high: 3, medium: 2, low: 1 };
      const aPriority = priorityValues[a.priority || 'medium'];
      const bPriority = priorityValues[b.priority || 'medium'];
      return bPriority - aPriority;
    }).slice(0, 5); // Get the top 5 items
    
    setPriorityItems(newPriorityItems);
  }, [tasks, notes, playgrounds]);

  // Handle navigation when clicking on a card
  const navigateToItem = (type: ActivityType, id: number) => {
    switch (type) {
      case 'task':
        navigate('/tasks');
        break;
      case 'note':
        navigate('/notes');
        break;
      case 'canvas':
        navigate('/canvas');
        break;
      case 'playground':
        navigate(`/playground/${id}`);
        break;
    }
  };

  return (
    <div className="container py-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-center dark:text-white">Productivity Dashboard</h1>
      
      {/* Feature Navigation Cards */}
      <Tabs defaultValue="all" className="mb-10">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 mb-4 bg-transparent">
          <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white">
            All
          </TabsTrigger>
          <TabsTrigger value="tasks" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white">
            Tasks
          </TabsTrigger>
          <TabsTrigger value="notes" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white">
            Notes
          </TabsTrigger>
          <TabsTrigger value="playground" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground dark:data-[state=active]:bg-primary dark:data-[state=active]:text-white">
            Playground
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate('/tasks')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Tasks</span>
                  <CheckSquare className="h-6 w-6 text-primary dark:text-primary" />
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Manage your to-do lists</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm dark:text-gray-300">{tasks.length} tasks total</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full dark:text-gray-300 dark:hover:bg-gray-700">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate('/notes')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Notes</span>
                  <FileText className="h-6 w-6 text-primary dark:text-primary" />
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Capture your ideas</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm dark:text-gray-300">{notes.length} notes total</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full dark:text-gray-300 dark:hover:bg-gray-700">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate('/canvas')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Canvas</span>
                  <Lightbulb className="h-6 w-6 text-primary dark:text-primary" />
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Create visual diagrams</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm dark:text-gray-300">Visual workspace</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full dark:text-gray-300 dark:hover:bg-gray-700">
                  <span>Open Canvas</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="cursor-pointer hover:shadow-md transition-shadow duration-200 dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate('/playground')}>
              <CardHeader className="pb-2">
                <CardTitle className="flex justify-between items-center">
                  <span>Playground</span>
                  <PenTool className="h-6 w-6 text-primary dark:text-primary" />
                </CardTitle>
                <CardDescription className="dark:text-gray-400">Infinite canvas for creativity</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm dark:text-gray-300">{playgrounds.length} playgrounds total</p>
              </CardContent>
              <CardFooter>
                <Button variant="ghost" className="w-full dark:text-gray-300 dark:hover:bg-gray-700">
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="tasks">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Your Tasks</h2>
              <Button onClick={() => navigate('/tasks')} className="dark:bg-primary dark:text-white">
                <Plus className="h-4 w-4 mr-2" /> New Task
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {tasks.slice(0, 6).map(task => (
                <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate('/tasks')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-start">
                      <span className="truncate dark:text-white">{task.text}</span>
                      {task.priority && <PriorityBadge priority={task.priority as 'high' | 'medium' | 'low'} />}
                    </CardTitle>
                  </CardHeader>
                  <CardFooter className="pt-2 flex justify-between">
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <CheckSquare className="h-4 w-4 mr-1" />
                      <span>{task.completed ? 'Completed' : 'Pending'}</span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {task.createdAt && formatRelativeDate(task.createdAt)}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {tasks.length === 0 && (
              <div className="text-center py-10 dark:text-gray-400">
                <p>No tasks yet. Create your first one!</p>
              </div>
            )}
            {tasks.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => navigate('/tasks')} className="dark:text-white dark:border-gray-600">
                  View All Tasks
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="notes">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Your Notes</h2>
              <Button onClick={() => navigate('/notes')} className="dark:bg-primary dark:text-white">
                <Plus className="h-4 w-4 mr-2" /> New Note
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {notes.slice(0, 6).map(note => (
                <Card key={note.id} className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate('/notes')}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex justify-between items-start">
                      <span className="truncate dark:text-white">{note.title}</span>
                      {note.priority && <PriorityBadge priority={note.priority as 'high' | 'medium' | 'low'} />}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 dark:text-gray-400">
                      {note.content}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatRelativeDate(note.updatedAt)}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {notes.length === 0 && (
              <div className="text-center py-10 dark:text-gray-400">
                <p>No notes yet. Create your first one!</p>
              </div>
            )}
            {notes.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => navigate('/notes')} className="dark:text-white dark:border-gray-600">
                  View All Notes
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="playground">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold dark:text-white">Your Playgrounds</h2>
              <Button onClick={() => navigate('/playground')} className="dark:bg-primary dark:text-white">
                <Plus className="h-4 w-4 mr-2" /> New Playground
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {playgrounds.slice(0, 6).map(playground => (
                <Card key={playground.id} className="hover:shadow-md transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700" onClick={() => navigate(`/playground/${playground.id}`)}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base dark:text-white">
                      {playground.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 dark:text-gray-400">
                      {playground.description || 'No description'}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="pt-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatRelativeDate(playground.updatedAt)}
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
            {playgrounds.length === 0 && (
              <div className="text-center py-10 dark:text-gray-400">
                <p>No playgrounds yet. Create your first one!</p>
              </div>
            )}
            {playgrounds.length > 6 && (
              <div className="text-center mt-4">
                <Button variant="outline" onClick={() => navigate('/playground')} className="dark:text-white dark:border-gray-600">
                  View All Playgrounds
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Content Area */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Priority Column */}
        <div className="col-span-1">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Star className="h-5 w-5 mr-2 text-yellow-500" />
                Priority Items
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Items requiring your attention</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              {priorityItems.length > 0 ? (
                priorityItems.map(item => (
                  <div 
                    key={`${item.type}-${item.id}`} 
                    className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => navigateToItem(item.type, item.id)}
                  >
                    <div className={`p-2 rounded-full mr-3 ${
                      item.type === 'task' ? 'bg-blue-100 dark:bg-blue-900' : 
                      item.type === 'note' ? 'bg-green-100 dark:bg-green-900' : 
                      item.type === 'canvas' ? 'bg-purple-100 dark:bg-purple-900' : 
                      'bg-amber-100 dark:bg-amber-900'
                    }`}>
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1 dark:text-white">{item.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {item.type.charAt(0).toUpperCase() + item.type.slice(1)} • {formatRelativeDate(item.date)}
                      </p>
                    </div>
                    <PriorityBadge priority={item.priority || 'medium'} />
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No priority items yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Recent Activity */}
        <div className="col-span-1 md:col-span-2">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                Recent Activity
              </CardTitle>
              <CardDescription className="dark:text-gray-400">Your latest updates across all sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                {/* Activity timeline */}
                <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700"></div>
                
                <div className="space-y-6 ml-2">
                  {activities.length > 0 ? (
                    activities.slice(0, 10).map((activity, index) => (
                      <div 
                        key={`${activity.type}-${activity.id}-${index}`} 
                        className="relative pl-6 cursor-pointer"
                        onClick={() => navigateToItem(activity.type, activity.id)}
                      >
                        <div className={`absolute left-0 p-1 rounded-full border-4 border-white dark:border-gray-800 ${
                          activity.type === 'task' ? 'bg-blue-500' : 
                          activity.type === 'note' ? 'bg-green-500' : 
                          activity.type === 'canvas' ? 'bg-purple-500' : 
                          'bg-amber-500'
                        }`} />
                        
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <h4 className="text-sm font-medium dark:text-white">{activity.title}</h4>
                            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                              • {formatRelativeDate(activity.date)}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                            {activity.type === 'task' ? 'Added a new task' : 
                             activity.type === 'note' ? 'Updated a note' : 
                             activity.type === 'canvas' ? 'Modified canvas' : 
                             'Updated playground'}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                      No recent activities
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            {activities.length > 10 && (
              <CardFooter>
                <Button variant="ghost" className="w-full dark:text-gray-300 dark:hover:bg-gray-700">
                  View All Activity
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Calendar Section */}
          <Card className="mt-6 dark:bg-gray-800 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center dark:text-white">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Today's Overview
              </CardTitle>
              <CardDescription className="dark:text-gray-400">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <h4 className="text-lg font-bold text-blue-700 dark:text-blue-300">{tasks.filter(t => !t.completed).length}</h4>
                  <p className="text-sm text-blue-600 dark:text-blue-400">Pending Tasks</p>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <h4 className="text-lg font-bold text-green-700 dark:text-green-300">{notes.length}</h4>
                  <p className="text-sm text-green-600 dark:text-green-400">Total Notes</p>
                </div>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
                  <h4 className="text-lg font-bold text-amber-700 dark:text-amber-300">{playgrounds.length}</h4>
                  <p className="text-sm text-amber-600 dark:text-amber-400">Playgrounds</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}