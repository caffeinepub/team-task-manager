import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Project } from '../backend';

export function useGetAllProjects() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Project[]>({
    queryKey: ['allProjects'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllProjects();
    },
    enabled: !!actor && !actorFetching,
  });
}
