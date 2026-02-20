import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '../backend';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { isOverdue, getDaysOverdue, formatDate } from '../utils/taskUtils';
import { AlertCircle, User, Calendar } from 'lucide-react';

interface OverdueTasksListProps {
  tasks: Task[];
}

export default function OverdueTasksList({ tasks }: OverdueTasksListProps) {
  const { data: projects = [] } = useGetAllProjects();
  const { data: users = [] } = useGetAllUsers();

  const overdueTasks = tasks.filter((task) => isOverdue(task)).sort((a, b) => getDaysOverdue(b) - getDaysOverdue(a));

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  const getUserName = (principal: string) => {
    const user = users.find((u) => u.principal === principal);
    return user?.name || 'Unknown User';
  };

  if (overdueTasks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-[oklch(0.65_0.15_145)]">
            <AlertCircle className="w-5 h-5" />
            Overdue Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">No overdue tasks. Great work!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="w-5 h-5" />
          Overdue Tasks ({overdueTasks.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdueTasks.map((task) => {
            const daysOverdue = getDaysOverdue(task);
            return (
              <div key={task.id} className="p-4 rounded-lg border border-destructive bg-destructive/5">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex-1">
                    <div className="font-medium">{task.title}</div>
                    {task.description && <p className="text-sm text-muted-foreground mt-1">{task.description}</p>}
                  </div>
                  <Badge variant="destructive">{daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue</Badge>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4" />
                    <span>{getUserName(task.assignedEmployee.toString())}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>Due: {formatDate(task.dueDate)}</span>
                  </div>
                  <div>Project: {getProjectName(task.projectId)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
