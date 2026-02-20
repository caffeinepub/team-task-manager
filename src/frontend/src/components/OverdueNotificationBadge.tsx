import { Badge } from '@/components/ui/badge';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { isOverdue } from '../utils/taskUtils';
import { Bell } from 'lucide-react';

export default function OverdueNotificationBadge() {
  const { data: tasks = [] } = useGetAllTasks();
  const overdueCount = tasks.filter((task) => isOverdue(task)).length;

  if (overdueCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      <Bell className="w-5 h-5 text-muted-foreground" />
      <Badge
        variant="destructive"
        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
      >
        {overdueCount}
      </Badge>
    </div>
  );
}
