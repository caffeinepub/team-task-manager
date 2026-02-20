import { useGetProjectReport } from '../hooks/useGetProjectReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDuration } from '../utils/timeUtils';
import { exportReportData } from '../utils/reportUtils';
import { BarChart3, Download, TrendingUp, Clock, Target } from 'lucide-react';

export default function ReportsPage() {
  const { data: report, isLoading } = useGetProjectReport();

  const handleExport = () => {
    if (report) {
      exportReportData(report);
    }
  };

  if (isLoading) {
    return <div className="text-center py-8 text-muted-foreground">Loading reports...</div>;
  }

  if (!report) {
    return <div className="text-center py-8 text-muted-foreground">No report data available.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-[oklch(0.65_0.19_85)]" />
          <h1 className="text-3xl font-bold">Reports & Analytics</h1>
        </div>
        <Button onClick={handleExport}>
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(report.completionRate)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed successfully</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Task Duration</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatDuration(Number(report.averageTaskDuration))}</div>
            <p className="text-xs text-muted-foreground mt-1">Average time per task</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{Number(report.onTimeDeliveryPercentage)}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tasks completed on time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productivity Trends</CardTitle>
        </CardHeader>
        <CardContent>
          {report.productivityTrends.length === 0 ? (
            <p className="text-sm text-muted-foreground">No productivity trend data available yet.</p>
          ) : (
            <div className="space-y-3">
              {report.productivityTrends.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{trend.period}</p>
                    <p className="text-sm text-muted-foreground">
                      {Number(trend.tasksCompleted)} tasks completed
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{formatDuration(Number(trend.averageCompletionTime))}</p>
                    <p className="text-xs text-muted-foreground">Avg completion time</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
