export const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

export const haversineDistance = (
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
): number => {
  const R = 6371000; // meters
  const dLat = toRadians(destination.lat - origin.lat);
  const dLng = toRadians(destination.lng - origin.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(origin.lat)) *
      Math.cos(toRadians(destination.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
