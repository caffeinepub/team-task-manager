import { useMemo, useState } from 'react';
import { useGetAssignedTasks } from '../hooks/useGetAssignedTasks';
import { TaskPriority } from '../backend';
import EmployeeTaskCard from '../components/EmployeeTaskCard';
import TaskFilterControls, { SortOption } from '../components/TaskFilterControls';
import { filterTasksByPriority, sortTasksByPriority, sortTasksByDueDate, sortTasksByReminderDate } from '../utils/taskUtils';
import { CheckSquare } from 'lucide-react';

export default function MyTasksPage() {
  // Access control is enforced by the backend getAssignedTasks method
  // which filters tasks by caller principal using the authorization component
  const { data: tasks = [], isLoading } = useGetAssignedTasks();
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
    return <div className="text-center py-8 text-muted-foreground">Loading your tasks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <CheckSquare className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
        <h1 className="text-3xl font-bold">My Tasks</h1>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No tasks assigned to you yet.</p>
        </div>
      ) : (
        <>
          <TaskFilterControls
            selectedPriorities={selectedPriorities}
            onPrioritiesChange={setSelectedPriorities}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />
          
          <div className="space-y-4">
            {filteredAndSortedTasks.map((task) => (
              <EmployeeTaskCard key={task.id} task={task} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
