import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Restaurant, SearchFilters } from '../types/restaurant';
import { fetchNearbyRestaurants } from '../services/googlePlaces';
import { chooseWeightedRandom } from '../utils/random';

interface PickerState {
  loading: boolean;
  error?: string;
  current?: Restaurant;
  history: Restaurant[];
}

interface UseRestaurantPickerProps {
  latitude?: number;
  longitude?: number;
  filters: SearchFilters;
  blacklist?: string[];
}

export const useRestaurantPicker = ({
  latitude,
  longitude,
  filters,
  blacklist = [],
}: UseRestaurantPickerProps) => {
  const [state, setState] = useState<PickerState>({ loading: false, history: [] });
  const recentIdsRef = useRef<string[]>([]);

  const fetchAndPick = useCallback(async () => {
    if (!latitude || !longitude) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: undefined }));
    try {
      const restaurants = await fetchNearbyRestaurants({
        latitude,
        longitude,
        filters,
        excludePlaceIds: [...filters.excludedPlaceIds, ...recentIdsRef.current, ...blacklist],
      });

      if (!restaurants.length) {
        setState((prev) => ({ ...prev, loading: false, error: '找不到符合條件的餐廳' }));
        return;
      }

      const weights = restaurants.map((restaurant) =>
        restaurant.rating * Math.log(restaurant.userRatingsTotal + 1),
      );
      const selected = chooseWeightedRandom(restaurants, weights);
      recentIdsRef.current = [selected.id, ...recentIdsRef.current].slice(0, 3);

      setState((prev) => ({
        loading: false,
        history: [selected, ...prev.history].slice(0, 20),
        current: selected,
        error: undefined,
      }));
    } catch (error) {
      console.error(error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      }));
    }
  }, [blacklist, filters, latitude, longitude]);

  const reroll = useCallback(() => {
    if (!state.history.length) {
      void fetchAndPick();
      return;
    }
    const remaining = state.history.filter(
      (restaurant) => !recentIdsRef.current.includes(restaurant.id) && !blacklist.includes(restaurant.id),
    );
    if (!remaining.length) {
      void fetchAndPick();
      return;
    }
    const weights = remaining.map((restaurant) =>
      restaurant.rating * Math.log(restaurant.userRatingsTotal + 1),
    );
    const selected = chooseWeightedRandom(remaining, weights);
    recentIdsRef.current = [selected.id, ...recentIdsRef.current].slice(0, 3);
    setState((prev) => ({
      ...prev,
      current: selected,
      history: [selected, ...prev.history.filter((r) => r.id !== selected.id)].slice(0, 20),
    }));
  }, [blacklist, fetchAndPick, state.history]);

  useEffect(() => {
    recentIdsRef.current = [];
    setState({ loading: false, history: [] });
    if (latitude && longitude) {
      void fetchAndPick();
    }
  }, [fetchAndPick, latitude, longitude]);

  return useMemo(
    () => ({
      loading: state.loading,
      error: state.error,
      current: state.current,
      history: state.history,
      reroll,
      refresh: fetchAndPick,
    }),
    [state.loading, state.error, state.current, state.history, reroll, fetchAndPick],
  );
};
