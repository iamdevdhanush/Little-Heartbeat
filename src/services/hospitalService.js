const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const GOOGLE_PLACES_BASE_URL = 'https://maps.googleapis.com/maps/api/place';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const d = R * c;
  return d;
};

export const searchNearbyHospitals = async (latitude, longitude, radiusKm = 10) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return getOfflineHospitals(latitude, longitude);
  }

  try {
    const radiusMeters = radiusKm * 1000;
    const url = `${GOOGLE_PLACES_BASE_URL}/nearbysearch/json?location=${latitude},${longitude}&radius=${radiusMeters}&type=hospital&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      const hospitals = data.results.slice(0, 10).map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity || place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        distance: calculateDistance(
          latitude, longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        isOpen: place.opening_hours?.open_now,
        rating: place.rating || null,
        types: place.types || [],
        is24Hours: place.opening_hours?.open_now === undefined,
      }));

      hospitals.sort((a, b) => a.distance - b.distance);
      return hospitals;
    }

    return getOfflineHospitals(latitude, longitude);
  } catch (error) {
    console.error('Google Places API error:', error);
    return getOfflineHospitals(latitude, longitude);
  }
};

export const searchHospitalsByQuery = async (query, latitude, longitude) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return searchOfflineHospitals(query);
  }

  try {
    const url = `${GOOGLE_PLACES_BASE_URL}/textsearch/json?query=hospital+${encodeURIComponent(query)}&location=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.results) {
      const hospitals = data.results.slice(0, 10).map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        distance: calculateDistance(
          latitude, longitude,
          place.geometry.location.lat,
          place.geometry.location.lng
        ),
        isOpen: place.opening_hours?.open_now,
        rating: place.rating || null,
        types: place.types || [],
        is24Hours: place.opening_hours?.open_now === undefined,
      }));

      hospitals.sort((a, b) => a.distance - b.distance);
      return hospitals;
    }

    return searchOfflineHospitals(query);
  } catch (error) {
    console.error('Search error:', error);
    return searchOfflineHospitals(query);
  }
};

const getOfflineHospitals = (latitude, longitude) => {
  const sampleHospitals = [
    {
      id: 'offline-1',
      name: 'City Hospital (Sample)',
      address: 'Main Road, City Center',
      latitude: latitude + 0.01,
      longitude: longitude + 0.01,
      distance: 1.2,
      isOpen: true,
      is24Hours: true,
      isEmergency: true,
      rating: 4.2,
      phone: '108',
    },
    {
      id: 'offline-2',
      name: 'Government Medical College Hospital',
      address: 'Medical Campus, Near Bus Stand',
      latitude: latitude - 0.015,
      longitude: longitude + 0.02,
      distance: 2.5,
      isOpen: true,
      is24Hours: true,
      isEmergency: true,
      rating: 4.5,
      phone: null,
    },
    {
      id: 'offline-3',
      name: 'Women & Child Hospital',
      address: 'Health Colony, Sector 5',
      latitude: latitude + 0.025,
      longitude: longitude - 0.01,
      distance: 3.8,
      isOpen: true,
      is24Hours: false,
      isEmergency: true,
      rating: 4.7,
      phone: null,
    },
    {
      id: 'offline-4',
      name: 'Private Nursing Home',
      address: 'Green Park, Main Street',
      latitude: latitude - 0.02,
      longitude: longitude - 0.02,
      distance: 4.2,
      isOpen: false,
      is24Hours: false,
      isEmergency: false,
      rating: 3.8,
      phone: null,
    },
  ];

  return sampleHospitals.map(h => ({
    ...h,
    distance: calculateDistance(latitude, longitude, h.latitude, h.longitude),
  })).sort((a, b) => a.distance - b.distance);
};

const searchOfflineHospitals = (query) => {
  const allHospitals = [
    { name: 'Civil Hospital', type: 'government' },
    { name: 'District Hospital', type: 'government' },
    { name: 'Medical College Hospital', type: 'teaching' },
    { name: 'Women Hospital', type: 'specialized' },
    { name: 'Private Hospital', type: 'private' },
  ];

  return allHospitals
    .filter(h => h.name.toLowerCase().includes(query.toLowerCase()))
    .map((h, i) => ({
      id: `search-${i}`,
      name: h.name,
      address: `Search result for "${query}"`,
      latitude: 0,
      longitude: 0,
      distance: null,
      isOpen: true,
      isEmergency: true,
      type: h.type,
    }));
};

export const getDirectionsUrl = (latitude, longitude, destLat, destLon) => {
  return `https://www.google.com/maps/dir/?api=1&origin=${latitude},${longitude}&destination=${destLat},${destLon}&travelmode=driving`;
};

export const getHospitalDetails = async (placeId) => {
  if (!GOOGLE_PLACES_API_KEY) {
    return null;
  }

  try {
    const url = `${GOOGLE_PLACES_BASE_URL}/details/json?place_id=${placeId}&key=${GOOGLE_PLACES_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status === 'OK' && data.result) {
      return {
        phone: data.result.formatted_phone_number,
        website: data.result.website,
        openingHours: data.result.opening_hours?.weekday_text,
        reviews: data.result.reviews?.slice(0, 5),
      };
    }
    return null;
  } catch (error) {
    console.error('Details error:', error);
    return null;
  }
};

export const sortByDistance = (hospitals, userLat, userLon) => {
  return hospitals
    .map(h => ({
      ...h,
      distance: calculateDistance(userLat, userLon, h.latitude, h.longitude),
    }))
    .sort((a, b) => a.distance - b.distance);
};

export const sortByRating = (hospitals) => {
  return [...hospitals].sort((a, b) => (b.rating || 0) - (a.rating || 0));
};

export const filter24Hours = (hospitals) => {
  return hospitals.filter(h => h.is24Hours || h.isEmergency);
};

export const getIndianHospitals = (region) => {
  const regionHospitals = {
    north_india: [
      { name: 'AIIMS New Delhi', phone: '011-26588500', is24Hours: true, isEmergency: true },
      { name: 'Safdarjung Hospital', phone: '011-26715000', is24Hours: true, isEmergency: true },
    ],
    south_india: [
      { name: 'NIMHANS Bangalore', phone: '080-26995000', is24Hours: true, isEmergency: true },
      { name: 'CMC Vellore', phone: '0416-2282000', is24Hours: true, isEmergency: true },
    ],
    west_india: [
      { name: 'KEM Hospital Mumbai', phone: '022-24136051', is24Hours: true, isEmergency: true },
      { name: 'SGPGI Lucknow', phone: '0522-2668700', is24Hours: true, isEmergency: true },
    ],
    east_india: [
      { name: 'PGIMER Chandigarh', phone: '0172-2746018', is24Hours: true, isEmergency: true },
      { name: 'IPGMER Kolkata', phone: '033-22041110', is24Hours: true, isEmergency: true },
    ],
    other: [
      { name: 'District Hospital', phone: '108', is24Hours: true, isEmergency: true },
    ],
  };

  return regionHospitals[region] || regionHospitals.other;
};
