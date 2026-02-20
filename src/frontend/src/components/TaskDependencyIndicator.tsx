import { Task } from '../backend';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { Badge } from '@/components/ui/badge';
import { Link2, CheckCircle, Clock } from 'lucide-react';

interface TaskDependencyIndicatorProps {
  task: Task;
}

export default function TaskDependencyIndicator({ task }: TaskDependencyIndicatorProps) {
  const { data: allTasks = [] } = useGetAllTasks();

  if (task.dependencies.length === 0) {
    return null;
  }

  const dependencyTasks = task.dependencies
    .map((depId) => allTasks.find((t) => t.id === depId))
    .filter((t): t is Task => t !== undefined);

  const allCompleted = dependencyTasks.every((t) => Number(t.progress) === 100);
  const isBlocked = !allCompleted;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Link2 className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Dependencies</span>
        {isBlocked && (
          <Badge variant="outline" className="text-xs">
            Blocked
          </Badge>
        )}
      </div>
      <div className="space-y-1">
        {dependencyTasks.map((depTask) => {
          const completed = Number(depTask.progress) === 100;
          return (
            <div key={depTask.id} className="flex items-center gap-2 text-sm text-muted-foreground">
              {completed ? (
                <CheckCircle className="w-3 h-3 text-[oklch(0.65_0.15_145)]" />
              ) : (
                <Clock className="w-3 h-3 text-[oklch(0.65_0.19_45)]" />
              )}
              <span className={completed ? 'line-through' : ''}>{depTask.title}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
