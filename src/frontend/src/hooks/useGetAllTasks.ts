import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Task } from '../backend';

export function useGetAllTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['allTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTasks();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}
