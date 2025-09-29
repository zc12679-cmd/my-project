import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { PriceLevel, SearchFilters } from '../types/restaurant';

interface PreferencesContextValue {
  filters: SearchFilters;
  setFilters: (filters: SearchFilters) => void;
  toggleFavorite: (placeId: string) => void;
  toggleBlacklist: (placeId: string) => void;
  favorites: string[];
  blacklist: string[];
}

export const DEFAULT_FILTERS: SearchFilters = {
  radiusMeters: 1000,
  minRating: 4.2,
  minUserRatings: 50,
  priceLevels: [0, 1, 2, 3],
  categories: [],
  openNow: true,
  excludedPlaceIds: [],
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

const FAVORITES_KEY = 'wwte:favorites';
const BLACKLIST_KEY = 'wwte:blacklist';
const FILTERS_KEY = 'wwte:filters';

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [filters, setFiltersState] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [blacklist, setBlacklist] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [favoritesRaw, blacklistRaw, filtersRaw] = await Promise.all([
          AsyncStorage.getItem(FAVORITES_KEY),
          AsyncStorage.getItem(BLACKLIST_KEY),
          AsyncStorage.getItem(FILTERS_KEY),
        ]);

        if (favoritesRaw) {
          setFavorites(JSON.parse(favoritesRaw));
        }
        if (blacklistRaw) {
          setBlacklist(JSON.parse(blacklistRaw));
        }
        if (filtersRaw) {
          const parsed = JSON.parse(filtersRaw) as SearchFilters;
          setFiltersState({ ...DEFAULT_FILTERS, ...parsed });
        }
      } catch (error) {
        console.warn('Failed to load preferences', error);
      }
    })();
  }, []);

  const setFilters = (nextFilters: SearchFilters) => {
    setFiltersState(nextFilters);
    AsyncStorage.setItem(FILTERS_KEY, JSON.stringify(nextFilters)).catch((error) =>
      console.warn('Failed to persist filters', error),
    );
  };

  const toggleFavorite = (placeId: string) => {
    setFavorites((prev) => {
      const next = prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId];
      AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(next)).catch((error) =>
        console.warn('Failed to persist favorites', error),
      );
      if (!prev.includes(placeId)) {
        setBlacklist((current) => {
          if (!current.includes(placeId)) {
            return current;
          }
          const updated = current.filter((id) => id !== placeId);
          AsyncStorage.setItem(BLACKLIST_KEY, JSON.stringify(updated)).catch((error) =>
            console.warn('Failed to persist blacklist', error),
          );
          return updated;
        });
      }
      return next;
    });
  };

  const toggleBlacklist = (placeId: string) => {
    setBlacklist((prev) => {
      const next = prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId];
      AsyncStorage.setItem(BLACKLIST_KEY, JSON.stringify(next)).catch((error) =>
        console.warn('Failed to persist blacklist', error),
      );
      if (!prev.includes(placeId)) {
        setFavorites((current) => {
          if (!current.includes(placeId)) {
            return current;
          }
          const updated = current.filter((id) => id !== placeId);
          AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated)).catch((error) =>
            console.warn('Failed to persist favorites', error),
          );
          return updated;
        });
      }
      return next;
    });
  };

  const value = useMemo(
    () => ({ filters, setFilters, toggleFavorite, toggleBlacklist, favorites, blacklist }),
    [filters, favorites, blacklist],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
};

export const usePreferences = (): PreferencesContextValue => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within PreferencesProvider');
  }
  return context;
};

export const DEFAULT_PRICE_FILTER: PriceLevel[] = DEFAULT_FILTERS.priceLevels;
