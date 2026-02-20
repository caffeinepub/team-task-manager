import { Task, TimeEntry } from '../backend';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { formatDate } from '../utils/taskUtils';
import { formatDuration } from '../utils/timeUtils';
import { Clock } from 'lucide-react';

interface TaskTimeLogDisplayProps {
  task: Task;
  showDetails?: boolean;
}

export default function TaskTimeLogDisplay({ task, showDetails = false }: TaskTimeLogDisplayProps) {
  const { data: users = [] } = useGetAllUsers();

  const getUserName = (principal: string) => {
    const user = users.find((u) => u.principal === principal);
    return user?.name || 'Unknown User';
  };

  const totalMinutes = task.timeEntries.reduce((sum, entry: TimeEntry) => {
    if (entry.duration) {
      return sum + Number(entry.duration);
    }
    return sum;
  }, 0);

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Clock className="w-4 h-4" />
        <span>Time logged: {formatDuration(totalMinutes)}</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Time Logs</h4>
        <span className="text-sm text-muted-foreground">Total: {formatDuration(totalMinutes)}</span>
      </div>
      {task.timeEntries.length === 0 ? (
        <p className="text-sm text-muted-foreground">No time entries yet.</p>
      ) : (
        <div className="space-y-2">
          {task.timeEntries.map((entry: TimeEntry, index: number) => (
            <div key={index} className="flex items-center justify-between text-sm p-2 rounded-lg bg-muted/50">
              <div>
                <p className="font-medium">{getUserName(entry.user.toString())}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(entry.startTime)}
                  {entry.endTime && ` - ${formatDate(entry.endTime)}`}
                </p>
              </div>
              <span className="font-medium">
                {entry.duration ? formatDuration(Number(entry.duration)) : 'In progress...'}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
