import { Restaurant, SearchFilters } from '../types/restaurant';
import { haversineDistance } from '../utils/location';
 codex/create-product-requirements-document-for-app-e56982
import { GOOGLE_MAPS_API_KEY } from '../config/apiKeys';
=======
  main

type FetchNearbyRestaurantsArgs = {
  latitude: number;
  longitude: number;
  filters: SearchFilters;
  excludePlaceIds?: string[];
};

const GOOGLE_PLACES_BASE = 'https://maps.googleapis.com/maps/api/place';
const PHOTO_MAX_WIDTH = 800;

interface PlacesNearbyResult {
  results: Array<{
    place_id: string;
    name: string;
    rating?: number;
    user_ratings_total?: number;
    price_level?: number;
    business_status?: string;
    opening_hours?: { open_now?: boolean };
    photos?: Array<{ photo_reference: string }>;
    geometry: { location: { lat: number; lng: number } };
    vicinity?: string;
    types?: string[];
  }>;
  status: string;
  next_page_token?: string;
}

interface PlaceDetailsResult {
  result?: {
    formatted_phone_number?: string;
    formatted_address?: string;
    website?: string;
  };
  status: string;
}

const buildPhotoUrl = (reference: string) =>
 codex/create-product-requirements-document-for-app-e56982
  `${GOOGLE_PLACES_BASE}/photo?maxwidth=${PHOTO_MAX_WIDTH}&photo_reference=${reference}&key=${GOOGLE_MAPS_API_KEY}`;
=======
  `${GOOGLE_PLACES_BASE}/photo?maxwidth=${PHOTO_MAX_WIDTH}&photo_reference=${reference}&key=${process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY}`;
 main

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const fetchNearbyPage = async (
  url: string,
  excludePlaceIds: Set<string>,
  origin: { lat: number; lng: number },
): Promise<{ restaurants: Restaurant[]; nextPageToken?: string }> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Google Places API 請求失敗');
  }
  const data = (await response.json()) as PlacesNearbyResult;
  if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
    throw new Error(`Google Places API 回傳狀態：${data.status}`);
  }
  if (!data.results?.length) {
    return { restaurants: [], nextPageToken: undefined };
  }
  const restaurants = data.results
    .filter((result) => !excludePlaceIds.has(result.place_id))
    .map((result) => ({
      id: result.place_id,
      name: result.name,
      rating: result.rating ?? 0,
      userRatingsTotal: result.user_ratings_total ?? 0,
      priceLevel: result.price_level as Restaurant['priceLevel'],
      categories: result.types ?? [],
      openingNow: result.opening_hours?.open_now,
      photoUrl: result.photos?.[0]?.photo_reference
        ? buildPhotoUrl(result.photos[0].photo_reference)
        : undefined,
      distanceMeters: haversineDistance(origin, result.geometry.location),
      address: result.vicinity ?? '',
      location: result.geometry.location,
    }));
  return { restaurants, nextPageToken: data.next_page_token };
};

const fetchPlaceDetails = async (placeId: string) => {
  const params = new URLSearchParams({
    place_id: placeId,
    
    codex/create-product-requirements-document-for-app-e56982
    key: GOOGLE_MAPS_API_KEY,

    key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
 main
    language: 'zh-TW',
    fields: 'formatted_phone_number,formatted_address,website',
  });
  const response = await fetch(`${GOOGLE_PLACES_BASE}/details/json?${params.toString()}`);
  if (!response.ok) {
    throw new Error('Place details 請求失敗');
  }
  const data = (await response.json()) as PlaceDetailsResult;
  if (data.status !== 'OK') {
    throw new Error(`Place details 錯誤：${data.status}`);
  }
  return data.result ?? {};
};

export const fetchNearbyRestaurants = async ({
  latitude,
  longitude,
  filters,
  excludePlaceIds = [],
}: FetchNearbyRestaurantsArgs): Promise<Restaurant[]> => {
  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: filters.radiusMeters.toString(),
 codex/create-product-requirements-document-for-app-e56982
    key: GOOGLE_MAPS_API_KEY,
=======
    key: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
 main
    language: 'zh-TW',
  });

  if (filters.openNow) {
    params.append('opennow', 'true');
  }

  if (filters.priceLevels.length) {
    params.append('minprice', Math.min(...filters.priceLevels).toString());
    params.append('maxprice', Math.max(...filters.priceLevels).toString());
  }

  if (filters.categories.length) {
    params.append('keyword', filters.categories.join(' '));
  }

  const baseUrl = `${GOOGLE_PLACES_BASE}/nearbysearch/json?${params.toString()}`;
  const excludeSet = new Set(excludePlaceIds);
  const aggregated: Restaurant[] = [];
  let pageToken: string | undefined;

 codex/create-product-requirements-document-for-app-e56982
  const apiKey = GOOGLE_MAPS_API_KEY;
=======
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';
 main

  for (let i = 0; i < 3; i += 1) {
    const url = pageToken
      ? `${GOOGLE_PLACES_BASE}/nearbysearch/json?pagetoken=${pageToken}&key=${apiKey}`
      : baseUrl;
    const { restaurants, nextPageToken } = await fetchNearbyPage(url, excludeSet, {
      lat: latitude,
      lng: longitude,
    });
    aggregated.push(
      ...restaurants.filter(
        (restaurant) =>
          restaurant.rating >= filters.minRating &&
          restaurant.userRatingsTotal >= filters.minUserRatings,
      ),
    );
    if (aggregated.length >= 20 || !nextPageToken) {
      break;
    }
    pageToken = nextPageToken;
    await delay(1500);
  }

  const detailed = await Promise.all(
    aggregated.map(async (restaurant) => {
      try {
        const details = await fetchPlaceDetails(restaurant.id);
        return {
          ...restaurant,
          phoneNumber: details.formatted_phone_number,
          address: details.formatted_address ?? restaurant.address,
          website: details.website,
        };
      } catch (error) {
        console.warn('Failed to fetch place details', error);
        return restaurant;
      }
    }),
  );

  return detailed;
};
