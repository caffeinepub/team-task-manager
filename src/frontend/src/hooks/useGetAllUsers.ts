import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';

interface UserWithPrincipal {
  principal: string;
  name: string;
  role: string;
}

export function useGetAllUsers() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserWithPrincipal[]>({
    queryKey: ['allUsers'],
    queryFn: async () => {
      if (!actor) return [];
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}
