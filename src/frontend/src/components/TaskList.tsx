import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Task, TaskStatus } from '../backend';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { isOverdue, formatDate, getPriorityBadgeColor, getPriorityLabel } from '../utils/taskUtils';
import TaskTimeLogDisplay from './TaskTimeLogDisplay';
import { Calendar, User, AlertCircle, Bell, Paperclip } from 'lucide-react';

interface TaskListProps {
  tasks: Task[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { data: projects = [] } = useGetAllProjects();
  const { data: users = [] } = useGetAllUsers();

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getUserName = (principal: string) => {
    const user = users.find((u) => u.principal === principal);
    return user?.name || 'Unknown User';
  };

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

  if (tasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks found.</div>;
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const overdue = isOverdue(task);
        const progress = Number(task.progress);
        const hasReminder = Number(task.reminderDate) > 0;
        const attachmentCount = task.attachments.length;

        return (
          <Link key={task.id} to="/task/$taskId" params={{ taskId: task.id }}>
            <Card className={`cursor-pointer hover:shadow-md transition-shadow ${overdue ? 'border-destructive' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center gap-2">
                      {task.title}
                      {overdue && <AlertCircle className="w-4 h-4 text-destructive" />}
                    </CardTitle>
                    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getPriorityBadgeColor(task.priority)}>{getPriorityLabel(task.priority)}</Badge>
                    {getStatusBadge(task.status)}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span>{getUserName(task.assignedEmployee.toString())}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span className={overdue ? 'text-destructive font-medium' : ''}>
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
                      <span>{attachmentCount} attachment{attachmentCount !== 1 ? 's' : ''}</span>
                    </div>
                  )}
                  <div className="text-muted-foreground">Project: {getProjectName(task.projectId)}</div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                <TaskTimeLogDisplay task={task} />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
