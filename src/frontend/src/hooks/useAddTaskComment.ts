import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface AddCommentParams {
  taskId: string;
  content: string;
}

export function useAddTaskComment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, content }: AddCommentParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addTaskComment(taskId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}
