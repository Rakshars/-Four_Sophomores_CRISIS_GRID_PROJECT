import React, { useState, useRef } from 'react';

const PRIORITY_MAP = { medical: 'HIGH', food: 'MEDIUM', rescue: 'CRITICAL' };

export default function SOSForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ loc: '', type: 'medical', people: '', description: '' });
  const [flash, setFlash] = useState(false);
  const [locLoading, setLocLoading] = useState(false);
  const [locStatus, setLocStatus] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // ── GPS: get real-world coordinates then reverse-geocode to address ──
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setLocStatus('❌ Geolocation not supported by your browser');
      return;
    }
    setLocLoading(true);
    setLocStatus('📡 Detecting location...');
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          // Reverse-geocode via Nominatim (no key needed)
          const url = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;
          const res = await fetch(url, { headers: { 'User-Agent': 'CrisisGridApp/1.0' } });
          const data = await res.json();
          const addr = data.address;
          // Build a readable location string: neighbourhood/suburb/city
          const parts = [
            addr.neighbourhood || addr.suburb || addr.quarter,
            addr.city_district || addr.city || addr.town || addr.village,
            addr.state,
          ].filter(Boolean);
          const locStr = parts.length > 0 ? parts.join(', ') : `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          set('loc', locStr);
          setLocStatus(`✅ Location set: ${locStr}`);
        } catch (e) {
          // If reverse-geocode fails, fall back to raw coords (server can handle these)
          const locStr = `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
          set('loc', locStr);
          setLocStatus(`✅ Coords set: ${locStr}`);
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
    await onSubmit(form);
    setForm({ loc: '', type: 'medical', people: '', description: '' });
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
        {/* Location row with GPS button */}
        <div style={styles.fieldWrap}>
          <div style={styles.fieldLabel}>📍 LOCATION</div>
          <div style={styles.locRow}>
            <input
              id="sos-location"
              style={{ ...styles.input, flex: 1 }}
              value={form.loc}
              onChange={e => { set('loc', e.target.value); setLocStatus(''); }}
              placeholder="Area, city or full address"
              required
            />
            <button
              type="button"
              style={{ ...styles.gpsBtn, opacity: locLoading ? 0.6 : 1 }}
              onClick={handleUseMyLocation}
              disabled={locLoading}
              title="Use my current GPS location"
            >
              {locLoading ? <span style={styles.spinner} /> : '📡'}
            </button>
          </div>
          {locStatus && (
            <div style={{ ...styles.locStatus, color: locStatus.startsWith('✅') ? '#00e676' : locStatus.startsWith('📡') ? '#4fc3f7' : '#ff4545' }}>
              {locStatus}
            </div>
          )}
        </div>

        {/* Type + People */}
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
              max={10000}
              value={form.people}
              onChange={e => set('people', e.target.value)}
              placeholder="0"
              required
            />
          </div>
        </div>

        {/* Description */}
        <div style={styles.fieldWrap}>
          <div style={styles.fieldLabel}>📝 SITUATION (optional)</div>
          <textarea
            id="sos-description"
            style={{ ...styles.input, height: 52, resize: 'none' }}
            value={form.description}
            onChange={e => set('description', e.target.value)}
            placeholder="Brief description of the emergency..."
          />
        </div>

        <button
          id="sos-submit"
          type="submit"
          style={{
            ...styles.submitBtn,
            opacity: loading ? 0.6 : 1,
            background: flash
              ? 'linear-gradient(135deg, #00e676, #00c853)'
              : 'linear-gradient(135deg, #ff4545 0%, #c62828 100%)',
            boxShadow: flash
              ? '0 0 24px rgba(0,230,118,.4)'
              : '0 4px 20px rgba(255, 69, 69, .3)',
          }}
          disabled={loading || !form.loc.trim() || !form.people}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
              <span style={styles.spinner} /> TRANSMITTING...
            </span>
          ) : flash ? '✅ SOS TRANSMITTED' : '⚡ SEND SOS REQUEST'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: {
    padding: '14px 14px 12px',
    borderBottom: '1px solid rgba(38, 46, 68, .6)',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 10,
    color: '#6b7394',
    letterSpacing: 1.5,
    marginBottom: 12,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  labelDot: {
    width: 6, height: 6, borderRadius: '50%',
    background: '#ff4545',
    animation: 'pulse 2s ease-in-out infinite',
    display: 'inline-block',
  },
  priorityPill: {
    marginLeft: 'auto', padding: '2px 8px', borderRadius: 6,
    fontSize: 9, fontWeight: 700, letterSpacing: 0.8,
    border: '1px solid',
  },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  fieldWrap: { display: 'flex', flexDirection: 'column', gap: 4 },
  fieldLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: 9, color: '#6b7394', letterSpacing: 0.8,
  },
  locRow: { display: 'flex', gap: 6 },
  input: {
    width: '100%',
    padding: '9px 12px',
    background: 'rgba(26, 32, 48, .6)',
    border: '1px solid rgba(38, 46, 68, .6)',
    borderRadius: 8,
    color: '#e8eaf0',
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    outline: 'none',
    transition: 'border-color .2s, box-shadow .2s',
    boxSizing: 'border-box',
  },
  gpsBtn: {
    padding: '0 12px',
    background: 'rgba(79,195,247,.1)',
    border: '1px solid rgba(79,195,247,.3)',
    borderRadius: 8,
    color: '#4fc3f7',
    cursor: 'pointer',
    fontSize: 16,
    flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'all .2s',
  },
  locStatus: {
    fontFamily: 'var(--font-mono)', fontSize: 9,
    animation: 'slideUp .2s ease-out',
  },
  spinner: {
    display: 'inline-block', width: 12, height: 12,
    border: '2px solid rgba(255,255,255,.3)',
    borderTop: '2px solid #fff', borderRadius: '50%',
    animation: 'spin .8s linear infinite',
  },
  submitBtn: {
    width: '100%',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #ff4545 0%, #c62828 100%)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontFamily: 'var(--font-mono)',
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: 1.5,
    cursor: 'pointer',
    transition: 'all .25s ease',
    boxShadow: '0 4px 20px rgba(255, 69, 69, .3)',
  },
};
