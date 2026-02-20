import { Task, Time, TaskPriority } from '../backend';

export function isOverdue(task: Task): boolean {
  if (Number(task.progress) === 100) return false;
  const now = BigInt(Date.now() * 1_000_000);
  return task.dueDate < now;
}

export function getDaysOverdue(task: Task): number {
  const now = Date.now();
  const dueDate = Number(task.dueDate) / 1_000_000;
  const diffMs = now - dueDate;
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function formatDate(time: Time): string {
  const date = new Date(Number(time) / 1_000_000);
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export function calculateProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  const totalProgress = tasks.reduce((sum, task) => sum + Number(task.progress), 0);
  return Math.round(totalProgress / tasks.length);
}

export function filterTasksByPriority(tasks: Task[], priorities: TaskPriority[]): Task[] {
  if (priorities.length === 0) return tasks;
  return tasks.filter((task) => priorities.includes(task.priority));
}

export function sortTasksByPriority(tasks: Task[]): Task[] {
  const priorityOrder = {
    [TaskPriority.critical]: 0,
    [TaskPriority.high]: 1,
    [TaskPriority.medium]: 2,
    [TaskPriority.low]: 3,
  };

  return [...tasks].sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
}

export function sortTasksByDueDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aTime = Number(a.dueDate);
    const bTime = Number(b.dueDate);
    return aTime - bTime;
  });
}

export function sortTasksByReminderDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => {
    const aTime = Number(a.reminderDate);
    const bTime = Number(b.reminderDate);

    if (aTime === 0 && bTime === 0) return 0;
    if (aTime === 0) return 1;
    if (bTime === 0) return -1;

    return aTime - bTime;
  });
}

export function getPriorityBadgeColor(priority: TaskPriority): string {
  switch (priority) {
    case TaskPriority.critical:
      return 'bg-[oklch(0.55_0.22_25)] hover:bg-[oklch(0.50_0.22_25)] text-white';
    case TaskPriority.high:
      return 'bg-[oklch(0.65_0.19_45)] hover:bg-[oklch(0.60_0.19_45)] text-white';
    case TaskPriority.medium:
      return 'bg-[oklch(0.70_0.15_85)] hover:bg-[oklch(0.65_0.15_85)]';
    case TaskPriority.low:
      return 'bg-muted hover:bg-muted/80 text-muted-foreground';
  }
}

export function getPriorityLabel(priority: TaskPriority): string {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

export function isTaskBlocked(task: Task): boolean {
  // This is a simplified check - in a real implementation, you'd need to check if dependencies are completed
  // For now, we'll just check if there are dependencies
  return task.dependencies.length > 0;
}
