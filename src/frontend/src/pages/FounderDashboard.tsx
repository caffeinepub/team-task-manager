import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { TaskPriority } from '../backend';
import ProjectProgressCard from '../components/ProjectProgressCard';
import TasksByProjectView from '../components/TasksByProjectView';
import TasksByEmployeeView from '../components/TasksByEmployeeView';
import OverdueTasksList from '../components/OverdueTasksList';
import TaskFilterControls, { SortOption } from '../components/TaskFilterControls';
import DashboardMetricsOverview from '../components/DashboardMetricsOverview';
import TaskAssignmentsTable from '../components/TaskAssignmentsTable';
import { filterTasksByPriority, sortTasksByPriority, sortTasksByDueDate, sortTasksByReminderDate } from '../utils/taskUtils';
import { LayoutDashboard } from 'lucide-react';

export default function FounderDashboard() {
  const { data: projects = [], isLoading: projectsLoading } = useGetAllProjects();
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const [view, setView] = useState<'project' | 'employee'>('project');
  const [selectedPriorities, setSelectedPriorities] = useState<TaskPriority[]>([]);
  const [sortBy, setSortBy] = useState<SortOption>('priority');

  const isLoading = projectsLoading || tasksLoading;

  const filteredAndSortedTasks = useMemo(() => {
    let result = filterTasksByPriority(tasks, selectedPriorities);
    
    switch (sortBy) {
      case 'priority':
        result = sortTasksByPriority(result);
        break;
      case 'dueDate':
        result = sortTasksByDueDate(result);
        break;
      case 'reminderDate':
        result = sortTasksByReminderDate(result);
        break;
    }
    
    return result;
  }, [tasks, selectedPriorities, sortBy]);

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <LayoutDashboard className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <DashboardMetricsOverview tasks={tasks} projects={projects} />

      <TaskAssignmentsTable tasks={tasks} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectProgressCard key={project.id} project={project} tasks={tasks} />
        ))}
      </div>

      <OverdueTasksList tasks={tasks} />

      <div>
        <TaskFilterControls
          selectedPriorities={selectedPriorities}
          onPrioritiesChange={setSelectedPriorities}
          sortBy={sortBy}
          onSortChange={setSortBy}
        />
        
        <Tabs value={view} onValueChange={(value) => setView(value as 'project' | 'employee')} className="mt-6">
          <TabsList>
            <TabsTrigger value="project">Tasks by Project</TabsTrigger>
            <TabsTrigger value="employee">Tasks by Employee</TabsTrigger>
          </TabsList>
          <TabsContent value="project" className="mt-6">
            <TasksByProjectView tasks={filteredAndSortedTasks} />
          </TabsContent>
          <TabsContent value="employee" className="mt-6">
            <TasksByEmployeeView tasks={filteredAndSortedTasks} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
