import { Task, TaskStatus } from '../backend';
import { formatDate } from '../utils/taskUtils';
import { Activity } from 'lucide-react';

interface TaskActivityFeedProps {
  task: Task;
}

export default function TaskActivityFeed({ task }: TaskActivityFeedProps) {
  const activities: Array<{ type: string; description: string; timestamp: bigint }> = [];

  // Add status change activities
  if (task.status === TaskStatus.completed) {
    activities.push({
      type: 'status',
      description: 'Task marked as completed',
      timestamp: BigInt(Date.now() * 1_000_000),
    });
  } else if (task.status === TaskStatus.inProgress && Number(task.progress) > 0) {
    activities.push({
      type: 'status',
      description: 'Task started',
      timestamp: BigInt(Date.now() * 1_000_000),
    });
  }

  // Add progress updates
  if (Number(task.progress) > 0 && Number(task.progress) < 100) {
    activities.push({
      type: 'progress',
      description: `Progress updated to ${task.progress}%`,
      timestamp: BigInt(Date.now() * 1_000_000),
    });
  }

  // Add comments as activities
  task.comments.forEach((comment) => {
    activities.push({
      type: 'comment',
      description: 'Added a comment',
      timestamp: comment.timestamp,
    });
  });

  // Add time entries as activities
  task.timeEntries.forEach((entry) => {
    if (entry.endTime) {
      activities.push({
        type: 'time',
        description: 'Logged time',
        timestamp: entry.endTime,
      });
    }
  });

  // Sort by timestamp descending
  const sortedActivities = activities.sort((a, b) => Number(b.timestamp) - Number(a.timestamp));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Activity className="w-5 h-5" />
        <h3 className="text-lg font-semibold">Activity Feed</h3>
      </div>

      {sortedActivities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No activity yet.</p>
      ) : (
        <div className="space-y-2">
          {sortedActivities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 text-sm p-2 rounded-lg bg-muted/30">
              <div className="w-2 h-2 rounded-full bg-[oklch(0.65_0.19_85)] mt-1.5" />
              <div className="flex-1">
                <p>{activity.description}</p>
                <p className="text-xs text-muted-foreground">{formatDate(activity.timestamp)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
