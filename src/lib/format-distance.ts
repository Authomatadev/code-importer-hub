/**
 * Formats a distance value intelligently.
 * Shows meters when < 1km, otherwise shows km with appropriate precision.
 */
export function formatDistance(distanceKm: number | null | undefined): string {
  if (!distanceKm || distanceKm === 0) return "";
  
  // If less than 1 km, show in meters
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  
  // If whole number or close to it, show without decimals
  if (Math.abs(distanceKm - Math.round(distanceKm)) < 0.01) {
    return `${Math.round(distanceKm)} km`;
  }
  
  // Otherwise show with one decimal
  return `${distanceKm.toFixed(1)} km`;
}
