import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Task, TaskStatus } from '../backend';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { isOverdue, formatDate, getPriorityBadgeColor, getPriorityLabel } from '../utils/taskUtils';
import { User, Calendar, AlertCircle, Bell } from 'lucide-react';

interface TasksByEmployeeViewProps {
  tasks: Task[];
}

export default function TasksByEmployeeView({ tasks }: TasksByEmployeeViewProps) {
  const { data: projects = [] } = useGetAllProjects();
  const { data: users = [] } = useGetAllUsers();

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
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

  const employeesWithTasks = users
    .map((user) => ({
      user,
      tasks: tasks.filter((task) => task.assignedEmployee.toString() === user.principal),
    }))
    .filter((item) => item.tasks.length > 0);

  if (employeesWithTasks.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No tasks assigned to employees yet.</div>;
  }

  return (
    <div className="space-y-6">
      {employeesWithTasks.map(({ user, tasks: employeeTasks }) => (
        <Card key={user.principal}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-[oklch(0.65_0.19_85)]" />
              {user.name}
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({employeeTasks.length} task{employeeTasks.length !== 1 ? 's' : ''})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {employeeTasks.map((task) => {
                const overdue = isOverdue(task);
                const progress = Number(task.progress);
                const hasReminder = Number(task.reminderDate) > 0;

                return (
                  <div
                    key={task.id}
                    className={`p-4 rounded-lg border ${overdue ? 'border-destructive bg-destructive/5' : 'bg-muted/50'}`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <div className="font-medium flex items-center gap-2">
                          {task.title}
                          {overdue && <AlertCircle className="w-4 h-4 text-destructive" />}
                        </div>
                        {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getPriorityBadgeColor(task.priority)}>
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm mb-3">
                      <div className="text-muted-foreground">Project: {getProjectName(task.projectId)}</div>
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
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
