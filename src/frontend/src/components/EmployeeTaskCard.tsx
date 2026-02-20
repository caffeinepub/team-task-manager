import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Task, TaskStatus } from '../backend';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useUpdateTaskProgress } from '../hooks/useUpdateTaskProgress';
import { useSubmitWorkForTask } from '../hooks/useSubmitWorkForTask';
import { isOverdue, formatDate, getPriorityBadgeColor, getPriorityLabel } from '../utils/taskUtils';
import { isTaskBlocked } from '../utils/taskUtils';
import TaskProgressSlider from './TaskProgressSlider';
import TimeTrackingControls from './TimeTrackingControls';
import TaskTimeLogDisplay from './TaskTimeLogDisplay';
import { Calendar, CheckCircle, AlertCircle, Bell, Paperclip, Link2, Send } from 'lucide-react';
import { toast } from 'sonner';

interface EmployeeTaskCardProps {
  task: Task;
}

export default function EmployeeTaskCard({ task }: EmployeeTaskCardProps) {
  const { data: projects = [] } = useGetAllProjects();
  const { mutate: updateProgress, isPending: isUpdatingProgress } = useUpdateTaskProgress();
  const { mutate: submitWork, isPending: isSubmitting } = useSubmitWorkForTask();
  const [localProgress, setLocalProgress] = useState(Number(task.progress));

  const project = projects.find((p) => p.id === task.projectId);
  const overdue = isOverdue(task);
  const isCompleted = task.status === TaskStatus.completed;
  const hasReminder = Number(task.reminderDate) > 0;
  const attachmentCount = task.attachments.length;
  const blocked = isTaskBlocked(task);
  const canSubmit = task.status === TaskStatus.inProgress || task.status === TaskStatus.pending;

  const handleProgressChange = (value: number) => {
    setLocalProgress(value);
  };

  const handleProgressSave = () => {
    updateProgress({ taskId: task.id, progress: BigInt(localProgress) });
  };

  const handleComplete = () => {
    updateProgress({ taskId: task.id, progress: BigInt(100) });
  };

  const handleSubmitWork = () => {
    submitWork(task.id, {
      onSuccess: () => {
        toast.success('Work submitted successfully!', {
          description: 'Your task has been marked as completed.',
        });
      },
      onError: (error: any) => {
        toast.error('Failed to submit work', {
          description: error.message || 'Please try again.',
        });
      },
    });
  };

  return (
    <Card className={overdue && !isCompleted ? 'border-destructive' : ''}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link to="/task/$taskId" params={{ taskId: task.id }}>
              <CardTitle className="text-lg flex items-center gap-2 hover:text-[oklch(0.65_0.19_85)] transition-colors cursor-pointer">
                {task.title}
                {overdue && !isCompleted && <AlertCircle className="w-4 h-4 text-destructive" />}
              </CardTitle>
            </Link>
            {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
          </div>
          <div className="flex gap-2">
            <Badge className={getPriorityBadgeColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
            {isCompleted ? (
              <Badge className="bg-[oklch(0.65_0.15_145)] hover:bg-[oklch(0.60_0.15_145)]">Completed</Badge>
            ) : (
              <Badge className="bg-[oklch(0.65_0.19_85)] hover:bg-[oklch(0.60_0.19_85)]">In Progress</Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span className={overdue && !isCompleted ? 'text-destructive font-medium' : ''}>
              Due: {formatDate(task.dueDate)}
            </span>
          </div>
          {hasReminder && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Bell className="w-4 h-4" />
              <span>Reminder: {formatDate(task.reminderDate)}</span>
            </div>
          )}
          {attachmentCount > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Paperclip className="w-4 h-4" />
              <span>{attachmentCount}</span>
            </div>
          )}
          {task.dependencies.length > 0 && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Link2 className="w-4 h-4" />
              <span>{task.dependencies.length} dependencies</span>
            </div>
          )}
          {project && <div className="text-muted-foreground">Project: {project.name}</div>}
        </div>

        {blocked && (
          <div className="p-2 rounded-lg bg-[oklch(0.65_0.19_45)]/10 border border-[oklch(0.65_0.19_45)]/20">
            <p className="text-sm text-[oklch(0.65_0.19_45)]">This task is blocked by incomplete dependencies</p>
          </div>
        )}

        <TaskTimeLogDisplay task={task} />

        {!isCompleted && (
          <>
            <TimeTrackingControls task={task} />
            {!blocked && <TaskProgressSlider value={localProgress} onChange={handleProgressChange} />}
            {blocked && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className="text-sm font-medium">{localProgress}%</span>
                </div>
                <div className="text-sm text-muted-foreground">Progress updates disabled while task is blocked</div>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleProgressSave}
                disabled={isUpdatingProgress || localProgress === Number(task.progress) || blocked}
                variant="outline"
                className="flex-1"
              >
                {isUpdatingProgress ? 'Saving...' : 'Save Progress'}
              </Button>
              <Button onClick={handleComplete} disabled={isUpdatingProgress || blocked} variant="outline" className="flex-1">
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            </div>
            {canSubmit && !blocked && (
              <Button
                onClick={handleSubmitWork}
                disabled={isSubmitting}
                className="w-full bg-[oklch(0.65_0.15_145)] hover:bg-[oklch(0.60_0.15_145)]"
              >
                {isSubmitting ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Submit Work
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
