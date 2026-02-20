import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useGetAssignedTasks } from '../hooks/useGetAssignedTasks';
import { useOverdueTaskNotification } from '../hooks/useOverdueTaskNotification';
import { formatDate, getDaysOverdue } from '../utils/taskUtils';
import { AlertCircle } from 'lucide-react';

export default function OverdueTaskNotificationModal() {
  const { data: tasks = [] } = useGetAssignedTasks();
  const { shouldShow, overdueTasks, dismiss } = useOverdueTaskNotification(tasks);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (shouldShow && overdueTasks.length > 0) {
      setOpen(true);
    }
  }, [shouldShow, overdueTasks]);

  const handleDismiss = () => {
    dismiss();
    setOpen(false);
  };

  const handleViewTasks = () => {
    setOpen(false);
    window.location.hash = '/my-tasks';
  };

  if (!shouldShow || overdueTasks.length === 0) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertCircle className="w-5 h-5" />
            You Have Overdue Tasks
          </DialogTitle>
          <DialogDescription>
            You have {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''} that need your attention.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {overdueTasks.map((task) => {
            const daysOverdue = getDaysOverdue(task);
            return (
              <div key={task.id} className="p-3 rounded-lg border border-destructive bg-destructive/5">
                <div className="font-medium">{task.title}</div>
                <div className="text-sm text-muted-foreground mt-1">
                  Due: {formatDate(task.dueDate)} ({daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue)
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleDismiss} className="flex-1">
            Dismiss
          </Button>
          <Button onClick={handleViewTasks} className="flex-1">
            View My Tasks
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
