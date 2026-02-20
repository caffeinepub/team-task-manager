import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TaskPriority, CustomField } from '../backend';

interface CreateTemplateParams {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  customFields: CustomField[];
}

export function useCreateTaskTemplate() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, title, description, priority, customFields }: CreateTemplateParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createTaskTemplate(id, title, description, priority, customFields);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taskTemplates'] });
    },
  });
}
