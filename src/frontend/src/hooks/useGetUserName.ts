import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useGetUserName(principal: Principal) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['userName', principal.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const profile = await actor.getUserProfile(principal);
      return profile?.name || 'Unknown User';
    },
    enabled: !!actor && !actorFetching && !!principal,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}
