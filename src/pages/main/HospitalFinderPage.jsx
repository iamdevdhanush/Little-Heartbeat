import React, { useState } from 'react';
import HeaderBar from '../../components/common/HeaderBar.jsx';
import { searchNearbyHospitals, searchHospitalsByQuery, getDirectionsUrl } from '../../services/hospitalService.js';
import { useWebGeolocation } from '../../hooks/useWebGeolocation.js';

export default function HospitalFinderPage() {
  const { location, getCurrentPosition } = useWebGeolocation();
  const [hospitals, setHospitals] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    setSearched(true);
    try {
      let loc = location;
      if (!loc) { try { loc = await getCurrentPosition(); } catch { loc = { latitude: 28.6139, longitude: 77.2090 }; } }
      const results = query.trim()
        ? await searchHospitalsByQuery(query, loc.latitude, loc.longitude)
        : await searchNearbyHospitals(loc.latitude, loc.longitude);
      setHospitals(results);
    } catch (error) {
      console.error('Hospital search error:', error);
    }
    setLoading(false);
  };

  return (
    <div>
      <HeaderBar title="Hospital Finder" emoji="🏥" subtitle="Find hospitals near you" />

      {/* Search Bar */}
      <div style={{ padding: '12px 16px', background: 'linear-gradient(to right, #FFF0F5, #EEF4FF)', borderBottom: '1px solid var(--color-border)' }}>
        <div className="flex gap-sm">
          <input
            className="input-field"
            style={{ flex: 1, marginBottom: 0 }}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search hospitals..."
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: '0 16px', background: 'var(--color-primary)', border: 'none', borderRadius: 'var(--radius-lg)', color: '#fff', fontSize: 20, cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : '🔍'}
          </button>
        </div>
      </div>

      <div className="scroll-area">
        {!searched ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏥</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: 8 }}>Find Nearby Hospitals</h2>
            <p style={{ fontSize: 14, color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: 24 }}>
              Search for hospitals or clinics near your location. Tap the search button to find hospitals automatically.
            </p>
            <button onClick={handleSearch} className="btn btn-primary">
              🔍 Find Hospitals Near Me
            </button>
          </div>
        ) : loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 48, gap: 16 }}>
            <span className="spinner spinner-pink" style={{ width: 40, height: 40, borderWidth: 3 }} />
            <p style={{ color: 'var(--color-text-secondary)' }}>Searching for hospitals...</p>
          </div>
        ) : hospitals.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
            <p style={{ color: 'var(--color-text-secondary)' }}>No hospitals found. Try a different search or check your location access.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginBottom: 4 }}>Found {hospitals.length} hospitals</p>
            {hospitals.map((hospital) => (
              <div key={hospital.id} className="hospital-card shadow-sm">
                <div className="flex items-start gap-md">
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: '#FFE4E4', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>🏥</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-sm">
                      <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text-primary)' }}>{hospital.name}</span>
                      {hospital.isOpen !== false && <span style={{ fontSize: 10, background: 'var(--color-risk-low-bg)', color: 'var(--color-risk-low)', padding: '2px 6px', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>OPEN</span>}
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)', marginTop: 2 }}>{hospital.address}</p>
                    <div className="flex gap-md" style={{ marginTop: 4 }}>
                      {hospital.distance && <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-accent)' }}>📍 {hospital.distance.toFixed(1)} km</span>}
                      {hospital.rating && <span style={{ fontSize: 12, color: 'var(--color-warning)' }}>⭐ {hospital.rating}</span>}
                      {hospital.is24Hours && <span style={{ fontSize: 12, color: 'var(--color-success)', fontWeight: 600 }}>24/7</span>}
                    </div>
                  </div>
                </div>
                <div className="flex gap-sm" style={{ marginTop: 12 }}>
                  {hospital.phone && (
                    <a href={`tel:${hospital.phone}`} style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#E8F4FF', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--color-accent)', fontWeight: 600, textDecoration: 'none' }}>
                      📞 Call
                    </a>
                  )}
                  {hospital.latitude !== 0 && (
                    <a
                      href={getDirectionsUrl(location?.latitude || 28.6139, location?.longitude || 77.2090, hospital.latitude, hospital.longitude)}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#FFF0F5', borderRadius: 'var(--radius-lg)', fontSize: 13, color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}
                    >
                      🗺️ Directions
                    </a>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
