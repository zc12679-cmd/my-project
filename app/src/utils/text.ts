export const formatDistance = (distanceMeters: number): string => {
  if (distanceMeters < 1000) {
    return `${Math.round(distanceMeters)} 公尺`;
  }
  return `${(distanceMeters / 1000).toFixed(1)} 公里`;
};

export const formatPriceLevel = (priceLevel?: number) => {
  if (priceLevel === undefined) {
    return '';
  }
  return '$'.repeat(priceLevel + 1);
};
