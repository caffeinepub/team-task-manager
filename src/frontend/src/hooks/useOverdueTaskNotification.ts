import { useState, useEffect } from 'react';
import { Task } from '../backend';
import { isOverdue } from '../utils/taskUtils';

const STORAGE_KEY = 'overdueTaskNotificationDismissed';

export function useOverdueTaskNotification(tasks: Task[]) {
  const [shouldShow, setShouldShow] = useState(false);

  const overdueTasks = tasks.filter((task) => isOverdue(task));

  useEffect(() => {
    if (overdueTasks.length === 0) {
      setShouldShow(false);
      return;
    }

    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    if (!dismissed) {
      setShouldShow(true);
    }
  }, [overdueTasks.length]);

  const dismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, 'true');
    setShouldShow(false);
  };

  return {
    shouldShow,
    overdueTasks,
    dismiss,
  };
}
