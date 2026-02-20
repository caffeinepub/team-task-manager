import { useMemo, useState } from 'react';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { TaskPriority } from '../backend';
import CreateTaskModal from '../components/CreateTaskModal';
import TaskList from '../components/TaskList';
import TaskFilterControls, { SortOption } from '../components/TaskFilterControls';
import { filterTasksByPriority, sortTasksByPriority, sortTasksByDueDate, sortTasksByReminderDate } from '../utils/taskUtils';
import { ListTodo } from 'lucide-react';

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const filteredAndSortedTasks = useMemo(() => {
    let result = filterTasksByPriority(tasks, selectedPriorities);
    
    switch (sortBy) {
      case 'priority':
        result = sortTasksByPriority(result);
        break;
      case 'dueDate':
        result = sortTasksByDueDate(result);
        break;
      case 'reminderDate':
        result = sortTasksByReminderDate(result);
        break;
    }
    
    return result;
  }, [tasks, selectedPriorities, sortBy]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ListTodo className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
          <h1 className="text-3xl font-bold">All Tasks</h1>
        </div>
        <CreateTaskModal />
      </div>
      
      <TaskFilterControls
        selectedPriorities={selectedPriorities}
        onPrioritiesChange={setSelectedPriorities}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      
      <TaskList tasks={filteredAndSortedTasks} />
    </div>
  );
}
