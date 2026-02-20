import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';
import { Time, TaskPriority, RecurringTask, CustomField } from '../backend';

interface CreateTaskParams {
  id: string;
  title: string;
  description: string;
  assignedEmployee: string;
  projectId: string;
  dueDate: Time;
  reminderDate: Time;
  priority: TaskPriority;
  dependencies: string[];
  recurring: RecurringTask | null;
  customFields: CustomField[];
}

export function useCreateTask() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      title,
      description,
      assignedEmployee,
      projectId,
      dueDate,
      reminderDate,
      priority,
      dependencies,
      recurring,
      customFields,
    }: CreateTaskParams) => {
      if (!actor) throw new Error('Actor not available');
      const employeePrincipal = Principal.fromText(assignedEmployee);
      await actor.createTask(
        id,
        title,
        description,
        employeePrincipal,
        dueDate,
        projectId,
        reminderDate,
        priority,
        dependencies,
        recurring,
        customFields
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
    },
  });
}
