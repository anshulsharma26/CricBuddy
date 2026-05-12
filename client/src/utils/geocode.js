// Reverse geocoding using OpenStreetMap Nominatim (free, no API key needed)
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`,
      {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'CricBuddy-App/1.0'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Geocoding request failed');
    }

    const data = await response.json();
    const address = data.address;

    if (!address) return '';

    // Build a readable location string: "City/Town, State, Country"
    const parts = [];

    // City/Town/Village
    const city = address.city || address.town || address.village || address.suburb || address.county || '';
    if (city) parts.push(city);

    // State/Region
    const state = address.state || address.region || '';
    if (state) parts.push(state);

    // Country
    const country = address.country || '';
    if (country) parts.push(country);

    return parts.join(', ') || data.display_name || '';
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return '';
  }
};
