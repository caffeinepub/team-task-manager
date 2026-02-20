import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { ExternalBlob } from '../backend';

interface AddAttachmentParams {
  taskId: string;
  attachment: ExternalBlob;
}

export function useAddTaskAttachment() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ taskId, attachment }: AddAttachmentParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.addTaskAttachment(taskId, attachment);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allTasks'] });
      queryClient.invalidateQueries({ queryKey: ['assignedTasks'] });
      queryClient.invalidateQueries({ queryKey: ['task'] });
    },
  });
}
