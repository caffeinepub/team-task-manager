import { Task } from '../backend';

export function getTimelineRange(tasks: Task[]) {
  if (tasks.length === 0) {
    const now = Date.now();
    return {
      startDate: now,
      endDate: now + 30 * 86400000,
      totalDays: 30,
    };
  }

  const dueDates = tasks.map((task) => Number(task.dueDate) / 1_000_000);
  const startDate = Math.min(...dueDates);
  const endDate = Math.max(...dueDates);
  const totalDays = Math.ceil((endDate - startDate) / 86400000) || 1;

  return { startDate, endDate, totalDays };
}

export function calculateGanttPosition(task: Task, timelineStart: number, totalDays: number) {
  const taskDueDate = Number(task.dueDate) / 1_000_000;
  const taskStartDate = taskDueDate - 7 * 86400000; // Assume 7 days before due date as start

  const left = ((taskStartDate - timelineStart) / (totalDays * 86400000)) * 100;
  const width = (7 / totalDays) * 100;

  return {
    left: Math.max(0, Math.min(left, 100)),
    width: Math.max(1, Math.min(width, 100 - left)),
  };
}
