import { useMemo } from 'react';
import { useGetAllTasks } from '../hooks/useGetAllTasks';
import { useGetAllUsers } from '../hooks/useGetAllUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { calculateWorkloadData } from '../utils/workloadUtils';
import { Users, AlertTriangle } from 'lucide-react';

export default function WorkloadViewPage() {
  const { data: tasks = [], isLoading: tasksLoading } = useGetAllTasks();
  const { data: users = [], isLoading: usersLoading } = useGetAllUsers();

  const workloadData = useMemo(() => calculateWorkloadData(tasks, users), [tasks, users]);

  const isLoading = tasksLoading || usersLoading;

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading workload data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Users className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
        <h1 className="text-3xl font-bold">Team Workload</h1>
      </div>

      {workloadData.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No workload data available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workloadData.map((data) => {
            const capacityPercentage = Math.min((data.activeTaskCount / 10) * 100, 100);
            const isOverloaded = data.isOverloaded;

            return (
              <Card key={data.userId} className={isOverloaded ? 'border-[oklch(0.65_0.19_45)]' : ''}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{data.userName}</span>
                    {isOverloaded && <AlertTriangle className="w-5 h-5 text-[oklch(0.65_0.19_45)]" />}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Active Tasks</span>
                      <span className="font-bold text-lg">{data.activeTaskCount}</span>
                    </div>
                    <Progress value={capacityPercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {isOverloaded ? 'Overloaded - Consider redistributing tasks' : 'Capacity within normal range'}
                    </p>
                  </div>
                  {isOverloaded && (
                    <Badge variant="outline" className="w-full justify-center">
                      Needs Attention
                    </Badge>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
