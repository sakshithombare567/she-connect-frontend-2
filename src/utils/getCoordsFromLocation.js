// Utility to get coordinates from a location string using Nominatim API
export async function getCoordsFromLocation(location) {
  if (!location || location.length < 3) return null;
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}&limit=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data && data.length > 0) {
      return [parseFloat(data[0].lat), parseFloat(data[0].lon)];
    }
    return null;
  } catch (e) {
    return null;
  }
}
