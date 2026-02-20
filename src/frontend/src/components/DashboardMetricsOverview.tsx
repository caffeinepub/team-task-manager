import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Task, Project, TaskStatus } from '../backend';
import { CheckSquare, ListTodo, TrendingUp, FolderOpen } from 'lucide-react';

interface DashboardMetricsOverviewProps {
  tasks: Task[];
  projects: Project[];
}

export default function DashboardMetricsOverview({ tasks, projects }: DashboardMetricsOverviewProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === TaskStatus.completed).length;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const activeProjects = projects.length;

  const metrics = [
    {
      label: 'Total Tasks',
      value: totalTasks,
      icon: ListTodo,
      color: 'text-[oklch(0.65_0.19_85)]',
      bgColor: 'bg-[oklch(0.65_0.19_85)]/10',
    },
    {
      label: 'Completed Tasks',
      value: completedTasks,
      icon: CheckSquare,
      color: 'text-[oklch(0.65_0.15_145)]',
      bgColor: 'bg-[oklch(0.65_0.15_145)]/10',
    },
    {
      label: 'Overall Completion',
      value: `${completionPercentage}%`,
      icon: TrendingUp,
      color: 'text-[oklch(0.65_0.19_45)]',
      bgColor: 'bg-[oklch(0.65_0.19_45)]/10',
    },
    {
      label: 'Active Projects',
      value: activeProjects,
      icon: FolderOpen,
      color: 'text-[oklch(0.60_0.15_220)]',
      bgColor: 'bg-[oklch(0.60_0.15_220)]/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.label} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{metric.label}</CardTitle>
              <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                <Icon className={`w-5 h-5 ${metric.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
