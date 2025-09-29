export type PriceLevel = 0 | 1 | 2 | 3 | 4;

export interface Restaurant {
  id: string;
  name: string;
  rating: number;
  userRatingsTotal: number;
  priceLevel?: PriceLevel;
  categories: string[];
  photoUrl?: string;
  openingNow?: boolean;
  distanceMeters: number;
  address: string;
  phoneNumber?: string;
  website?: string;
  location: {
    lat: number;
    lng: number;
  };
}

export interface SearchFilters {
  radiusMeters: number;
  minRating: number;
  minUserRatings: number;
  priceLevels: PriceLevel[];
  categories: string[];
  openNow: boolean;
  excludedPlaceIds: string[];
}
