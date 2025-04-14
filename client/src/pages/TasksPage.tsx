import TaskList from "@/components/tasks/TaskList";

export default function TasksPage() {
  return (
    <div className="h-full flex flex-col">
      <header className="bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-semibold">Tasks</h1>
      </header>
      
      <div className="flex-1 overflow-auto p-4">
        <TaskList />
      </div>
    </div>
  );
}
