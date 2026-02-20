import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { calculateProjectProgress } from '../utils/taskUtils';
import { FolderKanban } from 'lucide-react';

export default function ProjectList() {
  const { data: projects = [], isLoading: projectsLoading } = useGetAllProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();

  if (projectsLoading || tasksLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading projects...</div>;
  }

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <FolderKanban className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">No projects yet. Create your first project to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {projects.map((project) => {
        const projectTasks = tasks.filter((task) => task.projectId === project.id);
        const progress = calculateProjectProgress(projectTasks);
        const taskCount = projectTasks.length;

        return (
          <Card key={project.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-[oklch(0.65_0.19_85)]" />
                {project.name}
              </CardTitle>
              {project.description && <CardDescription>{project.description}</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{taskCount} task{taskCount !== 1 ? 's' : ''}</span>
                <span className="font-medium">{progress}% complete</span>
              </div>
              <Progress value={progress} className="h-2" />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
