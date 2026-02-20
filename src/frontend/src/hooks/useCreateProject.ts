import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';

interface CreateProjectParams {
  id: string;
  name: string;
  description: string;
}

export function useCreateProject() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, name, description }: CreateProjectParams) => {
      if (!actor) throw new Error('Actor not available');
      await actor.createProject(id, name, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['allProjects'] });
    },
  });
}
