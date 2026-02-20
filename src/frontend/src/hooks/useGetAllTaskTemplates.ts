import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { TaskTemplate } from '../backend';

export function useGetAllTaskTemplates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<TaskTemplate[]>({
    queryKey: ['taskTemplates'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTaskTemplates();
    },
    enabled: !!actor && !actorFetching,
  });
}
