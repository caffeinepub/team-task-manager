import { Task } from '../backend';

interface UserWithPrincipal {
  principal: string;
  name: string;
  role: string;
}

export interface WorkloadData {
  userId: string;
  userName: string;
  activeTaskCount: number;
  isOverloaded: boolean;
}

export function calculateWorkloadData(tasks: Task[], users: UserWithPrincipal[]): WorkloadData[] {
  const OVERLOAD_THRESHOLD = 8;

  const workloadMap = new Map<string, number>();

  tasks.forEach((task) => {
    if (Number(task.progress) < 100) {
      const userId = task.assignedEmployee.toString();
      workloadMap.set(userId, (workloadMap.get(userId) || 0) + 1);
    }
  });

  return users.map((user) => {
    const activeTaskCount = workloadMap.get(user.principal) || 0;
    return {
      userId: user.principal,
      userName: user.name,
      activeTaskCount,
      isOverloaded: activeTaskCount > OVERLOAD_THRESHOLD,
    };
  });
}
