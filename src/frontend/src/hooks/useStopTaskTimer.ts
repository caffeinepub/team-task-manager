import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

export function useStopTaskTimer() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (taskId: string) => {
      if (!actor) throw new Error('Actor not available');
      await actor.stopTaskTimer(taskId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}
