import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Project, Task } from '../backend';
import { calculateProjectProgress } from '../utils/taskUtils';
import { FolderKanban } from 'lucide-react';

interface ProjectProgressCardProps {
  project: Project;
  tasks: Task[];
}

export default function ProjectProgressCard({ project, tasks }: ProjectProgressCardProps) {
  const projectTasks = tasks.filter((task) => task.projectId === project.id);
  const progress = calculateProjectProgress(projectTasks);
  const taskCount = projectTasks.length;
  const completedCount = projectTasks.filter((task) => Number(task.progress) === 100).length;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FolderKanban className="w-5 h-5 text-[oklch(0.65_0.19_85)]" />
          {project.name}
        </CardTitle>
        {project.description && <CardDescription>{project.description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {completedCount} of {taskCount} task{taskCount !== 1 ? 's' : ''} completed
          </span>
          <span className="font-medium">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardContent>
    </Card>
  );
}
