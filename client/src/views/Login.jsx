import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterStore } from '../hooks/useDisasterStore';

const RESOURCE_OPTIONS = ['medical', 'food', 'rescue'];

export default function Login() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useDisasterStore();
  const [tab, setTab] = useState('admin');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // NGO Login
  const [loginName, setLoginName] = useState('');
  const [loginPass, setLoginPass] = useState('');

  // Registration
  const [regName, setRegName] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regLoc, setRegLoc] = useState('');
  const [regCap, setRegCap] = useState('');
  const [regResources, setRegResources] = useState([]);
  const [regPhone, setRegPhone] = useState('');

  const clearMessages = () => { setError(''); setSuccess(''); };

  const handleAdminLogin = () => {
    if (!password.trim()) return setError('Please enter the admin password');
    if (password === 'admin') {
      navigate('/admin');
    } else {
      setError('Incorrect admin password');
    }
  };

  const handleNgoLogin = async () => {
    if (!loginName.trim()) return setError('Please enter your NGO name');
    if (!loginPass.trim()) return setError('Please enter your password');
    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/ngos/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: loginName, password: loginPass })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('ngoInfo', JSON.stringify(data.ngo));
        navigate('/ngo');
      } else {
        setError(data.message || 'Invalid credentials');
      }
    } catch (e) {
      setError('Cannot connect to server. Is it running?');
    } finally { setLoading(false); }
  };

  const handleRegister = async () => {
    // Validation
    if (!regName.trim()) return setError('NGO name is required');
    if (regName.trim().length < 2) return setError('NGO name must be at least 2 characters');
    if (!regPass.trim()) return setError('Password is required');
    if (regPass.length < 4) return setError('Password must be at least 4 characters');
    if (!regLoc.trim()) return setError('Location is required (e.g., "Mumbai" or "Koramangala, Bengaluru")');
    if (!regCap || parseInt(regCap) < 1) return setError('Capacity must be at least 1');
    if (parseInt(regCap) > 50000) return setError('Capacity cannot exceed 50,000');
    if (regResources.length === 0) return setError('Select at least one resource type');

    setLoading(true);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';
      const res = await fetch(`${apiUrl}/ngos/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          password: regPass,
          location: regLoc.trim(),
          capacity: parseInt(regCap),
          resources: regResources,
          phone: regPhone.trim(),
        })
      });
      const data = await res.json();
      if (data.success) {
        setTab('ngo');
        setLoginName(regName);
        setLoginPass(regPass);
        setSuccess('✅ Registration successful! You can now login.');
        setError('');
        // Clear registration fields
        setRegName(''); setRegPass(''); setRegLoc(''); setRegCap(''); setRegResources([]); setRegPhone('');
      } else {
        setError(data.message || 'Registration failed');
      }
    } catch (e) {
      setError('Cannot connect to server. Is it running?');
    } finally { setLoading(false); }
  };

  const toggleResource = (r) => {
    setRegResources(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
    clearMessages();
  };

  const handleKeyDown = (e, handler) => {
    if (e.key === 'Enter') handler();
  };

  return (
    <div style={styles.wrap}>
      {/* Animated grid background */}
      <div style={styles.gridBg} />
      
      {/* Floating particles */}
      <div style={styles.particle1} />
      <div style={styles.particle2} />
      <div style={styles.particle3} />

      <div style={styles.card}>
        {/* Top accent */}
        <div style={styles.accentLine} />

        {/* Header */}
        <div style={styles.header}>
          <div style={styles.logoSection}>
            <div style={styles.logoIcon}>
              <span style={styles.dot} />
            </div>
            <div>
              <div style={styles.logoText}>CRISIS GRID</div>
              <div style={styles.logoSub}>DISASTER RESPONSE SYSTEM</div>
            </div>
          </div>
          <button onClick={toggleTheme} style={styles.themeBtn} className="theme-ignore-invert" title="Toggle theme">
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
        
        {/* Tab switcher */}
        <div style={styles.tabs}>
          {[
            { id: 'admin', label: '🛡️ ADMIN', color: '#ff4545' },
            { id: 'ngo', label: '🏢 NGO LOGIN', color: '#4fc3f7' },
            { id: 'register', label: '➕ REGISTER', color: '#00e676' },
          ].map(t => (
            <button
              key={t.id}
              style={{
                ...styles.tabBtn,
                borderBottomColor: tab === t.id ? t.color : 'transparent',
                color: tab === t.id ? '#e8eaf0' : '#6b7394',
                background: tab === t.id ? 'rgba(255,255,255,.03)' : 'transparent',
              }}
              onClick={() => { setTab(t.id); clearMessages(); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div style={styles.body}>
          {/* Messages */}
          {error && <div style={styles.errorBox}>{error}</div>}
          {success && <div style={styles.successBox}>{success}</div>}

          {/* ─── ADMIN TAB ─── */}
          {tab === 'admin' && (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>ADMIN PASSWORD</label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Enter admin password"
                  value={password}
                  onChange={e => { setPassword(e.target.value); clearMessages(); }}
                  onKeyDown={e => handleKeyDown(e, handleAdminLogin)}
                  autoFocus
                />
              </div>
              <button style={{...styles.btn, ...styles.btnRed}} onClick={handleAdminLogin} disabled={loading}>
                {loading ? 'CONNECTING...' : '🛡️ LOGIN AS ADMIN'}
              </button>
            </>
          )}

          {/* ─── NGO LOGIN TAB ─── */}
          {tab === 'ngo' && (
            <>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>NGO NAME</label>
                <input
                  style={styles.input}
                  placeholder="Enter your registered NGO name"
                  value={loginName}
                  onChange={e => { setLoginName(e.target.value); clearMessages(); }}
                  onKeyDown={e => { if (e.key === 'Enter') document.getElementById('ngo-pass')?.focus(); }}
                  autoFocus
                />
              </div>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>PASSWORD</label>
                <input
                  id="ngo-pass"
                  style={styles.input}
                  type="password"
                  placeholder="Enter your password"
                  value={loginPass}
                  onChange={e => { setLoginPass(e.target.value); clearMessages(); }}
                  onKeyDown={e => handleKeyDown(e, handleNgoLogin)}
                />
              </div>
              <button style={{...styles.btn, ...styles.btnBlue}} onClick={handleNgoLogin} disabled={loading}>
                {loading ? 'AUTHENTICATING...' : '🏢 LOGIN AS NGO'}
              </button>
              <div style={styles.hint}>
                Don't have an account? <span style={styles.hintLink} onClick={() => { setTab('register'); clearMessages(); }}>Register here</span>
              </div>
            </>
          )}

          {/* ─── REGISTER TAB ─── */}
          {tab === 'register' && (
            <>
              <div style={styles.sectionTitle}>ORGANIZATION DETAILS</div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>NGO NAME <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  placeholder="e.g., Red Cross Mumbai"
                  value={regName}
                  onChange={e => { setRegName(e.target.value); clearMessages(); }}
                  maxLength={50}
                  autoFocus
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>PASSWORD <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  type="password"
                  placeholder="Min. 4 characters"
                  value={regPass}
                  onChange={e => { setRegPass(e.target.value); clearMessages(); }}
                  maxLength={50}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>CONTACT PHONE</label>
                <input
                  style={styles.input}
                  type="tel"
                  placeholder="e.g., +91 98765 43210"
                  value={regPhone}
                  onChange={e => { setRegPhone(e.target.value.replace(/[^0-9+\- ]/g, '')); clearMessages(); }}
                  maxLength={15}
                />
              </div>

              <div style={styles.divider} />
              <div style={styles.sectionTitle}>DEPLOYMENT INFO</div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>BASE LOCATION <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  placeholder="e.g., Koramangala, Bengaluru"
                  value={regLoc}
                  onChange={e => { setRegLoc(e.target.value); clearMessages(); }}
                  maxLength={100}
                />
                <div style={styles.fieldHint}>📍 Accepts city names, areas, or full addresses</div>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>INITIAL CAPACITY (people) <span style={styles.required}>*</span></label>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="e.g., 500"
                  value={regCap}
                  onChange={e => {
                    const v = e.target.value;
                    if (v === '' || (parseInt(v) >= 0 && parseInt(v) <= 50000)) {
                      setRegCap(v);
                      clearMessages();
                    }
                  }}
                  min={1}
                  max={50000}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>RESOURCE CAPABILITIES <span style={styles.required}>*</span></label>
                <div style={styles.checkboxRow}>
                  {RESOURCE_OPTIONS.map(r => {
                    const selected = regResources.includes(r);
                    const icons = { medical: '🏥', food: '🍞', rescue: '🚁' };
                    const colors = { medical: '#4fc3f7', food: '#00e676', rescue: '#ff8c00' };
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleResource(r)}
                        style={{
                          ...styles.checkBtn,
                          borderColor: selected ? colors[r] : 'rgba(38,46,68,.6)',
                          background: selected ? colors[r] + '15' : 'rgba(26,32,48,.4)',
                          color: selected ? colors[r] : '#6b7394',
                        }}
                      >
                        <span style={{ fontSize: 16 }}>{icons[r]}</span>
                        <span>{r.toUpperCase()}</span>
                        {selected && <span style={{ fontSize: 10 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
                <div style={styles.fieldHint}>Select the types of aid your NGO can provide</div>
              </div>

              <button style={{...styles.btn, ...styles.btnGreen}} onClick={handleRegister} disabled={loading}>
                {loading ? 'REGISTERING...' : '➕ REGISTER NGO'}
              </button>

              <div style={styles.hint}>
                Already registered? <span style={styles.hintLink} onClick={() => { setTab('ngo'); clearMessages(); }}>Login here</span>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          Crisis Grid v1.0 — Disaster Response Command System
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrap: {
    height: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#090b10',
    position: 'relative',
    overflow: 'hidden',
  },
  gridBg: {
    position: 'absolute', inset: 0, pointerEvents: 'none',
    backgroundImage: `
      linear-gradient(rgba(38, 46, 68, 0.08) 1px, transparent 1px),
      linear-gradient(90deg, rgba(38, 46, 68, 0.08) 1px, transparent 1px)
    `,
    backgroundSize: '40px 40px',
  },
  particle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(255,69,69,.06) 0%, transparent 70%)',
    top: '10%', left: '10%', animation: 'pulse 6s ease-in-out infinite',
    pointerEvents: 'none',
  },
  particle2: {
    position: 'absolute', width: 250, height: 250, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(79,195,247,.05) 0%, transparent 70%)',
    bottom: '15%', right: '10%', animation: 'pulse 8s ease-in-out infinite 2s',
    pointerEvents: 'none',
  },
  particle3: {
    position: 'absolute', width: 200, height: 200, borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(0,230,118,.04) 0%, transparent 70%)',
    top: '50%', left: '60%', animation: 'pulse 7s ease-in-out infinite 1s',
    pointerEvents: 'none',
  },
  card: {
    position: 'relative', zIndex: 10,
    background: 'rgba(17,22,34,0.85)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(38,46,68,0.6)',
    borderRadius: 16,
    width: 420,
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,.05)',
  },
  accentLine: {
    height: 2,
    background: 'linear-gradient(90deg, #ff4545, #ff8c00, #ffd600, #00e676, #4fc3f7)',
    borderRadius: '16px 16px 0 0',
  },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '20px 24px 0',
  },
  logoSection: { display: 'flex', alignItems: 'center', gap: 12 },
  logoIcon: {
    width: 38, height: 38, borderRadius: 10,
    background: 'rgba(255,69,69,.08)', border: '1px solid rgba(255,69,69,.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  dot: {
    width: 10, height: 10, borderRadius: '50%',
    background: '#ff4545', boxShadow: '0 0 12px rgba(255,69,69,.6)',
    animation: 'pulse 2s ease-in-out infinite', display: 'inline-block',
  },
  logoText: {
    fontFamily: 'var(--font-mono)', fontSize: 16, fontWeight: 700,
    color: '#ff4545', letterSpacing: 3,
  },
  logoSub: {
    fontFamily: 'var(--font-mono)', fontSize: 8, color: '#6b7394',
    letterSpacing: 2, marginTop: 2,
  },
  themeBtn: {
    fontFamily: 'var(--font-mono)', fontSize: 16, padding: '6px 10px', borderRadius: 8,
    border: '1px solid rgba(255,255,255,.08)', background: 'rgba(255,255,255,.03)',
    color: '#e8eaf0', cursor: 'pointer', transition: 'all .2s',
  },
  tabs: {
    display: 'flex', margin: '20px 24px 0', gap: 0,
    borderBottom: '1px solid rgba(38,46,68,.4)',
  },
  tabBtn: {
    flex: 1, padding: '10px 4px', fontSize: 9, fontWeight: 700,
    border: 'none', borderBottom: '2px solid transparent',
    background: 'transparent', color: '#6b7394', cursor: 'pointer',
    fontFamily: 'var(--font-mono)', letterSpacing: 0.8,
    transition: 'all .2s',
  },
  body: {
    display: 'flex', flexDirection: 'column', gap: 14,
    padding: '20px 24px',
  },
  sectionTitle: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700,
    color: '#6b7394', letterSpacing: 1.5, marginTop: 4,
    display: 'flex', alignItems: 'center', gap: 8,
  },
  divider: {
    height: 1, background: 'rgba(38,46,68,.4)', margin: '4px 0',
  },
  fieldGroup: {
    display: 'flex', flexDirection: 'column', gap: 5,
  },
  label: {
    fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 600,
    color: '#9aa0b8', letterSpacing: 1,
  },
  required: { color: '#ff4545' },
  input: {
    background: 'rgba(26,32,48,.5)',
    border: '1px solid rgba(38,46,68,.6)',
    color: '#e8eaf0',
    padding: '11px 14px',
    borderRadius: 8,
    outline: 'none',
    fontSize: 13,
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color .2s, box-shadow .2s',
  },
  fieldHint: {
    fontFamily: 'var(--font-mono)', fontSize: 9, color: '#6b7394',
    marginTop: 2,
  },
  checkboxRow: {
    display: 'flex', gap: 8,
  },
  checkBtn: {
    flex: 1, padding: '10px 6px', borderRadius: 8,
    border: '1px solid rgba(38,46,68,.6)',
    background: 'rgba(26,32,48,.4)',
    cursor: 'pointer', fontFamily: 'var(--font-mono)',
    fontSize: 9, fontWeight: 600, letterSpacing: 0.5,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
    transition: 'all .2s',
  },
  btn: {
    width: '100%', padding: '13px 16px', border: 'none', borderRadius: 10,
    color: '#fff', fontFamily: 'var(--font-mono)', fontSize: 11,
    fontWeight: 700, letterSpacing: 1.5, cursor: 'pointer',
    transition: 'all .25s', marginTop: 4,
  },
  btnRed: {
    background: 'linear-gradient(135deg, #ff4545, #d50000)',
    boxShadow: '0 4px 20px rgba(255,69,69,.25)',
  },
  btnBlue: {
    background: 'linear-gradient(135deg, #4fc3f7, #0288d1)',
    boxShadow: '0 4px 20px rgba(79,195,247,.25)',
  },
  btnGreen: {
    background: 'linear-gradient(135deg, #00e676, #00a152)',
    boxShadow: '0 4px 20px rgba(0,230,118,.25)',
  },
  errorBox: {
    color: '#ff4545', fontSize: 11, textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    background: 'rgba(255,69,69,.08)', border: '1px solid rgba(255,69,69,.2)',
    padding: '8px 12px', borderRadius: 6,
    animation: 'slideUp .2s ease-out',
  },
  successBox: {
    color: '#00e676', fontSize: 11, textAlign: 'center',
    fontFamily: 'var(--font-mono)',
    background: 'rgba(0,230,118,.08)', border: '1px solid rgba(0,230,118,.2)',
    padding: '8px 12px', borderRadius: 6,
    animation: 'slideUp .2s ease-out',
  },
  hint: {
    textAlign: 'center', fontSize: 11, color: '#6b7394',
    fontFamily: 'var(--font-mono)',
  },
  hintLink: {
    color: '#4fc3f7', cursor: 'pointer', textDecoration: 'underline',
  },
  footer: {
    textAlign: 'center', padding: '12px 24px 16px',
    fontFamily: 'var(--font-mono)', fontSize: 8, color: '#3a4460',
    letterSpacing: 1, borderTop: '1px solid rgba(38,46,68,.3)',
  },
};
