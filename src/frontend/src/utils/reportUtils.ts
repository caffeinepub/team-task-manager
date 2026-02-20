import { Report } from '../backend';

export function exportReportData(report: Report) {
  const data = {
    completionRate: Number(report.completionRate),
    averageTaskDuration: Number(report.averageTaskDuration),
    onTimeDeliveryPercentage: Number(report.onTimeDeliveryPercentage),
    productivityTrends: report.productivityTrends.map((trend) => ({
      period: trend.period,
      tasksCompleted: Number(trend.tasksCompleted),
      averageCompletionTime: Number(trend.averageCompletionTime),
    })),
    exportedAt: new Date().toISOString(),
  };

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `project-report-${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
