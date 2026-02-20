import { useMemo, useState } from 'react';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { useGetAllProjects } from '../hooks/useGetAllProjects';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Task } from '../backend';
import { formatDate, getPriorityBadgeColor, getPriorityLabel } from '../utils/taskUtils';
import { calculateGanttPosition, getTimelineRange } from '../utils/ganttUtils';
import { GanttChart, ZoomIn, ZoomOut } from 'lucide-react';

type ZoomLevel = 'daily' | 'weekly' | 'monthly';

export default function GanttChartPage() {
  const { data: tasks = [], isLoading } = useGetAllTasks();
  const { data: projects = [] } = useGetAllProjects();
  const [zoomLevel, setZoomLevel] = useState<ZoomLevel>('weekly');

  const { startDate, endDate, totalDays } = useMemo(() => getTimelineRange(tasks), [tasks]);

  const getProjectName = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    return project?.name || 'Unknown Project';
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading Gantt chart...</div>;
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <GanttChart className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No tasks to display in Gantt chart.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GanttChart className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
          <h1 className="text-3xl font-bold">Gantt Chart</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={zoomLevel === 'daily' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('daily')}
          >
            Daily
          </Button>
          <Button
            variant={zoomLevel === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={zoomLevel === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setZoomLevel('monthly')}
          >
            Monthly
          </Button>
        </div>
      </div>

      <Card className="p-6 overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="space-y-4">
            {tasks.map((task: Task) => {
              const { left, width } = calculateGanttPosition(task, startDate, totalDays);
              const progress = Number(task.progress);

              return (
                <div key={task.id} className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-48 flex-shrink-0">
                      <p className="text-sm font-medium truncate">{task.title}</p>
                      <p className="text-xs text-muted-foreground">{getProjectName(task.projectId)}</p>
                    </div>
                    <div className="flex-1 relative h-8">
                      <div
                        className="absolute h-full rounded-lg bg-muted border border-border"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      >
                        <div
                          className="h-full rounded-lg bg-[oklch(0.65_0.19_85)] transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    <div className="w-32 flex-shrink-0 flex items-center gap-2">
                      <Badge className={`${getPriorityBadgeColor(task.priority)} text-xs`}>
                        {getPriorityLabel(task.priority)}
                      </Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Card>

      <div className="text-sm text-muted-foreground">
        <p>
          Timeline: {formatDate(BigInt(startDate * 1_000_000))} - {formatDate(BigInt(endDate * 1_000_000))}
        </p>
        <p>Total duration: {totalDays} days</p>
      </div>
    </div>
  );
}
