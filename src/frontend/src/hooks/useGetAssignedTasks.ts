import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Task } from '../backend';

export function useGetAssignedTasks() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Task[]>({
    queryKey: ['assignedTasks'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAssignedTasks();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30000,
  });
}
