import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface UpdateTaskProgressParams {
  taskId: string;
  progress: bigint;
}

export function useUpdateTaskProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, progress }: UpdateTaskProgressParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.updateTaskProgress(taskId, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
    },
  });
}
