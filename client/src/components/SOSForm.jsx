import React, { useState, useRef, useEffect } from 'react';

const PRIORITY_MAP = { medical: 'HIGH', food: 'MEDIUM', rescue: 'CRITICAL' };

export default function SOSForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ loc: '', type: 'medical', people: '', description: '' });
  const [flash, setFlash] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locStatus, setLocStatus] = useState('');
  const [verifiedLoc, setVerifiedLoc] = useState(null);

  const set = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    if (k === 'loc') {
      setVerifiedLoc(null); // Reset verification when location changes
      setLocStatus('');
    }
  };

  // ── Manual Geocode Verification ──
  const verifyLocation = async () => {
    if (!form.loc.trim()) return;
    setLocLoading(true);
    setLocStatus('🔍 Verifying address...');
    try {
      const query = form.loc.includes('India') ? form.loc : `${form.loc}, India`;
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'User-Agent': 'CrisisGridApp/1.0' } });
      const data = await res.json();
      
      if (data && data.length > 0) {
        const result = data[0];
        setVerifiedLoc({
          display_name: result.display_name,
          lat: result.lat,
          lon: result.lon
        });
        setLocStatus(`✅ Found: ${result.display_name.split(',').slice(0, 3).join(',')}`);
      } else {
        setLocStatus('❌ Location not found. Please be more specific.');
      }
    } catch (e) {
      setLocStatus('❌ Connection error during verification');
    } finally {
      setLocLoading(false);
    }
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation not supported');
      return;
    }
    setLocLoading(true);
    setLocStatus('📡 Detecting location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          const res = await fetch(url, { headers: { 'User-Agent': 'CrisisGridApp/1.0' } });
          const data = await res.json();
          const addr = data.address;
          const parts = [
            addr.neighbourhood || addr.suburb || addr.quarter,
            addr.city_district || addr.city || addr.town || addr.village,
            addr.state,
          ].filter(Boolean);
          const locStr = parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          set('loc', locStr);
          setVerifiedLoc({ display_name: data.display_name, lat: latitude, lon: longitude });
          setLocStatus(`✅ Location locked via GPS`);
        } catch (e) {
          const locStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          set('loc', locStr);
          setLocStatus(`✅ Coords locked: ${locStr}`);
        }
        setLocLoading(false);
      },
      (err) => {
        setLocStatus(`❌ ${err.message}`);
        setLocLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.loc.trim() || !form.people) return;
    
    // Auto-verify if not verified
    if (!verifiedLoc) {
      await verifyLocation();
      // If still not verified after attempt, we can still allow submission but maybe warn?
      // Actually let's just submit since the server geocodes anyway, but the UI feedback is key.
    }

    await onSubmit(form);
    setForm({ loc: '', type: 'medical', people: '', description: '' });
    setVerifiedLoc(null);
    setLocStatus('');
    setFlash(true);
    setTimeout(() => setFlash(false), 1000);
  };

  const estimatedPriority = PRIORITY_MAP[form.type] || 'MEDIUM';
  const priorityColor = estimatedPriority === 'CRITICAL' ? '#ff3030' : estimatedPriority === 'HIGH' ? '#ff8c00' : '#ffd600';

  return (
    <div style={styles.wrap}>
      <div style={styles.sectionLabel}>
        <span style={styles.labelDot} />
        SOS REQUEST
        {estimatedPriority && (
          <span style={{ ...styles.priorityPill, background: priorityColor + '18', color: priorityColor, borderColor: priorityColor + '44' }}>
            {estimatedPriority}
          </span>
        )}
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldWrap}>
          <div style={styles.fieldLabel}>📍 LOCATION {verifiedLoc && <span style={{color:'#00e676'}}> (VERIFIED)</span>}</div>
          <div style={styles.locRow}>
            <input
              id="sos-location"
              style={{ ...styles.input, flex: 1, borderColor: verifiedLoc ? '#00e676' : 'rgba(38,46,68,0.6)' }}
              value={form.loc}
              onChange={e => set('loc', e.target.value)}
              placeholder="Area, city or full address"
              required
            />
            <button
              type="button"
              style={styles.gpsBtn}
              onClick={handleUseMyLocation}
              disabled={locLoading}
              title="Use GPS"
            >
              📡
            </button>
            <button
              type="button"
              style={{...styles.verifyBtn, background: verifiedLoc ? '#00e676' : 'rgba(79,195,247,0.1)', color: verifiedLoc ? '#000' : '#4fc3f7'}}
              onClick={verifyLocation}
              disabled={locLoading || !form.loc.trim()}
            >
              {locLoading ? '...' : verifiedLoc ? 'CHECKED' : 'VERIFY'}
            </button>
          </div>
          {locStatus && (
            <div style={{ ...styles.locStatus, color: locStatus.startsWith('✅') ? '#00e676' : '#ff4545' }}>
              {locStatus}
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          <div style={styles.fieldWrap}>
            <div style={styles.fieldLabel}>🆘 TYPE</div>
            <select id="sos-type" style={styles.input} value={form.type} onChange={e => set('type', e.target.value)}>
              <option value="medical">🏥 Medical</option>
              <option value="food">🍞 Food</option>
              <option value="rescue">🚁 Rescue</option>
            </select>
          </div>
          <div style={styles.fieldWrap}>
            <div style={styles.fieldLabel}>👥 PEOPLE</div>
            <input
              id="sos-people"
              style={styles.input}
              type="number"
              min={1}
              value={form.people}
              onChange={e => set('people', e.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        <div style={styles.fieldWrap}>
          <div style={styles.fieldLabel}>📝 SITUATION</div>
          <textarea
            id="sos-description"
            style={{ ...styles.input, height: 40, resize: 'none' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Emergency details..."
          />
        </div>

        <button
          id="sos-submit"
          type="submit"
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.6 : 1,
            background: flash ? '#00e676' : 'linear-gradient(135deg, #ff4545 0%, #c62828 100%)',
          }}
          disabled={loading || !form.loc.trim() || !form.people}
        >
          {loading ? 'TRANSMITTING...' : flash ? '✅ SENT' : '⚡ SEND SOS REQUEST'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { padding: '14px', borderBottom: '1px solid rgba(38,46,68,0.6)' },
  sectionLabel: { fontFamily: 'monospace', fontSize: 10, color: '#6b7394', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 },
  labelDot: { width: 6, height: 6, borderRadius: '50%', background: '#ff4545', animation: 'pulse 2s infinite' },
  priorityPill: { marginLeft: 'auto', padding: '2px 8px', borderRadius: 6, fontSize: 9, fontWeight: 700, border: '1px solid' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: { fontFamily: 'monospace', fontSize: 9, color: '#6b7394' },
  locRow: { display: 'flex', gap: 6 },
  input: { width: '100%', padding: '8px 12px', background: 'rgba(26,32,48,0.6)', border: '1px solid rgba(38,46,68,0.6)', borderRadius: 8, color: '#e8eaf0', fontSize: 13, outline: 'none' },
  gpsBtn: { width: 40, background: 'rgba(79,195,247,0.1)', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 8, cursor: 'pointer' },
  verifyBtn: { padding: '0 12px', border: '1px solid rgba(79,195,247,0.3)', borderRadius: 8, cursor: 'pointer', fontSize: 10, fontWeight: 'bold' },
  locStatus: { fontFamily: 'monospace', fontSize: 9, marginTop: 2 },
  submitBtn: { width: '100%', padding: '12px', border: 'none', borderRadius: 10, color: '#fff', fontFamily: 'monospace', fontSize: 12, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(255,69,69,0.3)' },
};
