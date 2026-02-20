import { useParams, useNavigate } from '@tanstack/react-router';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { useGetCallerUserRole } from '../hooks/useGetCallerUserRole';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import TaskCommentsSection from '../components/TaskCommentsSection';
import TaskActivityFeed from '../components/TaskActivityFeed';
import TaskAttachmentsSection from '../components/TaskAttachmentsSection';
import TaskDependencyIndicator from '../components/TaskDependencyIndicator';
import TaskTimeLogDisplay from '../components/TaskTimeLogDisplay';
import TimeTrackingControls from '../components/TimeTrackingControls';
import RecurrencePatternDisplay from '../components/RecurrencePatternDisplay';
import CustomFieldDisplay from '../components/CustomFieldDisplay';
import { formatDate, getPriorityBadgeColor, getPriorityLabel, isOverdue } from '../utils/taskUtils';
import { UserRole, TaskStatus } from '../backend';
import { ArrowLeft, Calendar, User, Bell, AlertCircle } from 'lucide-react';

export default function TaskDetailPage() {
  const { taskId } = useParams({ from: '/task/$taskId' });
  const navigate = useNavigate();
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const { data: projects = [] } = useGetAllProjects();
  const { data: users = [] } = useGetAllUsers();
  const { data: userRole } = useGetCallerUserRole();

  const task = tasks.find((t) => t.id === taskId);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading task details...</div>;
  }

  if (!task) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Task not found.</p>
        <Button onClick={() => navigate({ to: '/tasks' })}>Go Back</Button>
      </div>
    );
  }

  const project = projects.find((p) => p.id === task.projectId);
  const assignee = users.find((u) => u.principal === task.assignedEmployee.toString());
  const overdue = isOverdue(task);
  const progress = Number(task.progress);
  const hasReminder = Number(task.reminderDate) > 0;
  const isAdmin = userRole === UserRole.admin;

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.completed:
        return <Badge className="bg-[oklch(0.65_0.15_145)] hover:bg-[oklch(0.60_0.15_145)]">Completed</Badge>;
      case TaskStatus.inProgress:
        return <Badge className="bg-[oklch(0.65_0.19_85)] hover:bg-[oklch(0.60_0.19_85)]">In Progress</Badge>;
      case TaskStatus.pending:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: isAdmin ? '/tasks' : '/my-tasks' })}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="space-y-6 bg-card border border-border rounded-lg p-6">
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold flex items-center gap-3">
                {task.title}
                {overdue && <AlertCircle className="w-6 h-6 text-destructive" />}
              </h1>
              {task.description && <p className="text-muted-foreground mt-2">{task.description}</p>}
            </div>
            <div className="flex gap-2">
              <Badge className={getPriorityBadgeColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
              {getStatusBadge(task.status)}
            </div>
          </div>

          <div className="flex flex-wrap gap-4 text-sm">
            {assignee && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>{assignee.name}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span className={overdue ? 'text-destructive font-medium' : ''}>Due: {formatDate(task.dueDate)}</span>
            </div>
            {hasReminder && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Bell className="w-4 h-4" />
                <span>Reminder: {formatDate(task.reminderDate)}</span>
              </div>
            )}
            {project && <div className="text-muted-foreground">Project: {project.name}</div>}
          </div>

          {task.recurring && <RecurrencePatternDisplay recurring={task.recurring} />}

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          <TimeTrackingControls task={task} />
        </div>

        <Separator />

        <TaskTimeLogDisplay task={task} showDetails />

        <Separator />

        <TaskDependencyIndicator task={task} />

        <Separator />

        <CustomFieldDisplay fields={task.customFields} />

        <Separator />

        <TaskAttachmentsSection task={task} />

        <Separator />

        <TaskCommentsSection task={task} />

        <Separator />

        <TaskActivityFeed task={task} />
      </div>
    </div>
  );
}
