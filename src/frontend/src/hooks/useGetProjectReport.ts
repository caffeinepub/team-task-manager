import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Report } from '../backend';

export function useGetProjectReport() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Report>({
    queryKey: ['projectReport'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getProjectReport();
    },
    enabled: !!actor && !actorFetching,
  });
}
