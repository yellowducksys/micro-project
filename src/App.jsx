import React, { useState, useEffect } from 'react';
import './App.css';

export default function App() {
  const [session, setSession] = useState(() => {
    return JSON.parse(localStorage.getItem('portal_session') || '{}');
  });

  const [assets, setAssets] = useState({});
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetError, setAssetError] = useState(false);
  const [requisitions, setRequisitions] = useState(() => {
    return JSON.parse(localStorage.getItem('asset_requests') || '[]');
  });

  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');

  const [loginId, setLoginId] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [regName, setRegName] = useState('');
  const [regId, setRegId] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regMsg, setRegMsg] = useState({ text: '', type: '' });

  const [selectedAsset, setSelectedAsset] = useState(null);
  const [destBase, setDestBase] = useState('');
  const [transferQty, setTransferQty] = useState(1);

  // SVG Fallback Image Placeholder
  const fallbackImage = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%23e2e8f0"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Segoe UI, sans-serif" font-size="32" font-weight="bold" fill="%2394a3b8">Image Not Found</text></svg>`;

  useEffect(() => {
    fetch('/assets.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load assets.json');
        return res.json();
      })
      .then((data) => {
        setAssets(data);
        setLoadingAssets(false);
      })
      .catch((err) => {
        console.error('Error loading military assets:', err);
        setAssetError(true);
        setLoadingAssets(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem('asset_requests', JSON.stringify(requisitions));
  }, [requisitions]);

  const handleLogin = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('portal_users') || '{}');

    if (users[loginId.trim()] && users[loginId.trim()].password === loginPassword.trim()) {
      const newSession = { userId: loginId.trim(), loggedIn: true };
      localStorage.setItem('portal_session', JSON.stringify(newSession));
      setSession(newSession);
      setShowAuthModal(false);
      setLoginError('');
      setLoginId('');
      setLoginPassword('');
    } else {
      setLoginError('Invalid User ID or Password. Access Denied.');
    }
  };

  const handleRegister = (e) => {
    e.preventDefault();
    const users = JSON.parse(localStorage.getItem('portal_users') || '{}');

    if (users[regId.trim()]) {
      setRegMsg({ text: 'User ID already exists! Choose another.', type: 'error' });
      return;
    }

    users[regId.trim()] = { name: regName.trim(), password: regPassword.trim() };
    localStorage.setItem('portal_users', JSON.stringify(users));

    setRegMsg({ text: 'Registration successful! Redirecting to login...', type: 'success' });

    setTimeout(() => {
      setAuthMode('login');
      setRegMsg({ text: '', type: '' });
      setRegName('');
      setRegId('');
      setRegPassword('');
    }, 1500);
  };

  const handleLogout = () => {
    localStorage.removeItem('portal_session');
    setSession({});
  };

  const handleTransferRequest = (e) => {
    e.preventDefault();
    if (!selectedAsset || !destBase) return;

    const newRequest = {
      id: 'REQ-' + Math.floor(1000 + Math.random() * 9000),
      assetName: selectedAsset.name,
      destination: destBase,
      quantity: transferQty,
      date: new Date().toLocaleDateString(),
      status: 'Pending Approval',
    };

    setRequisitions((prev) => [...prev, newRequest]);
    alert(`Requisition Request ${newRequest.id} for ${transferQty} unit(s) of ${selectedAsset.name} submitted successfully!`);
    setSelectedAsset(null);
    setDestBase('');
    setTransferQty(1);
  };

  const formatCategoryTitle = (key) => {
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  // Modal CSS Overlays
  const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    backgroundColor: 'rgba(3, 7, 18, 0.85)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  };

  const modalBoxStyle = {
    backgroundColor: '#0b1329',
    border: '1px solid #1e293b',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '480px',
    boxShadow: '0 0 30px rgba(0, 0, 0, 0.8)',
    color: '#f8fafc',
    position: 'relative',
    maxHeight: '90vh',
    overflowY: 'auto',
  };

  const closeBtnStyle = {
    position: 'absolute',
    top: '12px',
    right: '16px',
    fontSize: '1.6rem',
    cursor: 'pointer',
    color: '#94a3b8',
    border: 'none',
    background: 'none',
  };

  // VIEW 1: LANDING / AUTH PAGE
  if (!session.loggedIn) {
    return (
      <>
        <header className="navbar">
          <div className="logo">DEFENCE PORTAL</div>
          <div className="nav-links">
            <button
              className="btn-secondary"
              onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
            >
              Login / Register
            </button>
          </div>
        </header>

        <main className="intro-container">
          <h1>INDIAN DEFENCE & MILITARY ASSETS PORTAL</h1>
          <p className="subtitle">
            An open-source OSINT repository detailing defence platforms, naval fleet specifications, and ground force assets.
          </p>

          <section className="purpose-card">
            <h2>Purpose of this Platform</h2>
            <p>
              This platform is engineered to serve as a consolidated educational and research dashboard. It brings together non-sensitive specifications sourced from open public domains (Wikipedia & OSINT) into a structured, modern interface.
            </p>
            <p><strong>Note:</strong> Access to the live interactive asset dashboard requires authentication.</p>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
              <button
                className="btn-primary"
                onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
              >
                Access Dashboard (Login)
              </button>
              <button
                className="btn-secondary"
                onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}
              >
                Create Account
              </button>
            </div>
          </section>
        </main>

        {showAuthModal && (
          <div style={modalOverlayStyle} onClick={() => setShowAuthModal(false)}>
            <div style={modalBoxStyle} onClick={(e) => e.stopPropagation()}>
              <button style={closeBtnStyle} onClick={() => setShowAuthModal(false)}>&times;</button>

              {authMode === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#38bdf8' }}>User Authentication</h2>
                  {loginError && <div style={{ color: '#ef4444', fontSize: '0.9rem' }}>{loginError}</div>}

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>User ID / Email</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter User ID"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#070d18', border: '1px solid #1e293b', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Enter Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#070d18', border: '1px solid #1e293b', color: '#fff' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '0.7rem', marginTop: '0.5rem' }}>
                    Login
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Don't have an account?{' '}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setAuthMode('register'); }}
                      style={{ color: '#38bdf8', textDecoration: 'underline' }}
                    >
                      Register here
                    </a>
                  </p>
                </form>
              )}

              {authMode === 'register' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#38bdf8' }}>New User Registration</h2>
                  {regMsg.text && (
                    <div style={{ color: regMsg.type === 'error' ? '#ef4444' : '#10b981', fontSize: '0.9rem' }}>
                      {regMsg.text}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter Full Name"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#070d18', border: '1px solid #1e293b', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>User ID</label>
                    <input
                      type="text"
                      required
                      placeholder="Choose Unique User ID"
                      value={regId}
                      onChange={(e) => setRegId(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#070d18', border: '1px solid #1e293b', color: '#fff' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem' }}>Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Create Password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      style={{ width: '100%', padding: '0.6rem', borderRadius: '6px', background: '#070d18', border: '1px solid #1e293b', color: '#fff' }}
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ padding: '0.7rem', marginTop: '0.5rem' }}>
                    Register Account
                  </button>

                  <p style={{ textAlign: 'center', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                    Already registered?{' '}
                    <a
                      href="#"
                      onClick={(e) => { e.preventDefault(); setAuthMode('login'); }}
                      style={{ color: '#38bdf8', textDecoration: 'underline' }}
                    >
                      Login here
                    </a>
                  </p>
                </form>
              )}
            </div>
          </div>
        )}
      </>
    );
  }

  // VIEW 2: AUTHENTICATED DASHBOARD VIEW
  return (
    <>
      <header className="navbar">
        <div className="logo-container">
          <div className="logo">DEFENCE PORTAL</div>
          <span className="system-status"><span className="pulse-dot"></span> LIVE OSINT FEED</span>
        </div>

        <nav className="nav-links">
          <a href="#aircraft">AIRCRAFT</a>
          <a href="#naval_ships">NAVAL SHIPS</a>
          <a href="#ground_forces">GROUND FORCES</a>
          <a href="#logsContainer">REQUISITION LOGS</a>
        </nav>

        <div className="user-profile">
          <span className="user-id">OFFICER: {session.userId?.toUpperCase()}</span>
          <button className="btn-logout" onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <h1 style={{ marginTop: '2rem', textAlign: 'center', fontSize: '1.8rem', color: '#fff' }}>
        Secured Indian Defence Assets Dashboard
      </h1>
      <div className="subtitle">
        Sourced from open public domains (Wikipedia/OSINT). Displays non-sensitive specifications only.
      </div>

      <div className="dashboard-container" id="dashboard">
        {loadingAssets && (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#38bdf8' }}>
            Retrieving Secure Asset Database...
          </div>
        )}

        {assetError && (
          <div style={{ textAlign: 'center', color: '#ef4444', padding: '20px' }}>
            <h2>Unable to load assets data</h2>
          </div>
        )}

        {!loadingAssets && !assetError && Object.entries(assets).map(([category, assetList]) => (
          <section className="category-section" key={category} id={category}>
            <h2 className="category-title">{formatCategoryTitle(category)}</h2>
            <div className="assets-grid">
              {assetList.map((asset, index) => (
                <div className="asset-card" key={index} onClick={() => setSelectedAsset(asset)} style={{ cursor: 'pointer' }}>
                  <div className="asset-image-container">
                    <img
                      className="asset-image"
                      src={asset.image || fallbackImage}
                      alt={asset.name}
                      onError={(e) => { e.target.src = fallbackImage; }}
                    />
                  </div>
                  <div className="asset-info">
                    <div className="asset-name">{asset.name}</div>
                    <div className="asset-details">
                      <strong>Type:</strong> {asset.type}<br />
                      <strong>Class:</strong> {asset.class || 'N/A'}<br />
                      <strong>Branch:</strong> {asset.branch}
                    </div>
                    <div className="badge-container">
                      <span className="branch-badge">{asset.branch}</span>
                      <span className="status-badge">• ACTIVE</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Requisition Logs Table */}
      <div className="dashboard-container" style={{ marginTop: '2rem', marginBottom: '4rem' }}>
        <h2 className="category-title" id="logsContainer">Active Requisition Logs</h2>
        <div style={{ background: '#0b1329', border: '1px solid #1e293b', borderRadius: '12px', padding: '1rem', overflowX: 'auto' }}>
          <table className="modal-table">
            <thead>
              <tr>
                <th>Request ID</th>
                <th>Asset Name</th>
                <th>Destination</th>
                <th>Quantity</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                    No active asset requisitions found.
                  </td>
                </tr>
              ) : (
                requisitions.map((req) => (
                  <tr key={req.id}>
                    <td><strong>{req.id}</strong></td>
                    <td>{req.assetName}</td>
                    <td>{req.destination}</td>
                    <td>{req.quantity}</td>
                    <td>{req.date}</td>
                    <td><span className="status-badge" style={{ display: 'inline-block' }}>• {req.status}</span></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Specification & Requisition Modal */}
      {selectedAsset && (
        <div style={modalOverlayStyle} onClick={() => setSelectedAsset(null)}>
          <div style={{ ...modalBoxStyle, maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
            <button style={closeBtnStyle} onClick={() => setSelectedAsset(null)}>&times;</button>
            
            <div className="asset-image-container" style={{ borderRadius: '8px', marginBottom: '1rem', height: '220px' }}>
              <img
                src={selectedAsset.image || fallbackImage}
                alt={selectedAsset.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.src = fallbackImage; }}
              />
            </div>

            <h2 style={{ textAlign: 'center', color: '#38bdf8', fontSize: '1.5rem', marginBottom: '0.2rem' }}>
              {selectedAsset.name}
            </h2>
            <p style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.2rem' }}>
              {selectedAsset.type} — {selectedAsset.branch}
            </p>

            <h3 style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '0.5rem', color: '#fff' }}>Key Specifications</h3>
            <table className="modal-table" style={{ marginBottom: '1.5rem' }}>
              <tbody>
                <tr><th>Platform Class</th><td>{selectedAsset.class || 'Standard Operational'}</td></tr>
                <tr><th>Current Base Station</th><td><strong>{selectedAsset.base_camp || 'Sulur Air Force Station'}</strong></td></tr>
                <tr><th>Available Inventory</th><td><strong>{selectedAsset.available_units || 16} Units</strong></td></tr>
                <tr><th>Operational Status</th><td><span className="status-badge">• ACTIVE SERVICE</span></td></tr>
              </tbody>
            </table>

            <div style={{ paddingTop: '1rem', borderTop: '1px solid #1e293b' }}>
              <h3 style={{ fontSize: '1rem', textAlign: 'center', marginBottom: '1rem', color: '#fff' }}>Request Asset Transfer</h3>
              <form onSubmit={handleTransferRequest} style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#94a3b8', textAlign: 'center' }}>
                    Destination Base Camp:
                  </label>
                  <select
                    required
                    value={destBase}
                    onChange={(e) => setDestBase(e.target.value)}
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: '#070d18', color: '#fff', border: '1px solid #1e293b' }}
                  >
                    <option value="">Select Destination Base</option>
                    <option value="Ambala AFS">Ambala Air Force Station</option>
                    <option value="Hasimara AFS">Hasimara Air Force Station</option>
                    <option value="INS Virbahu (Vizag)">INS Virbahu (Vizag)</option>
                    <option value="Northern Command Base">Northern Command Base</option>
                    <option value="Eastern Command HQ">Eastern Command HQ</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '0.4rem', color: '#94a3b8', textAlign: 'center' }}>
                    Units Required:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={selectedAsset.available_units || 16}
                    value={transferQty}
                    onChange={(e) => setTransferQty(e.target.value)}
                    required
                    style={{ width: '100%', padding: '0.65rem', borderRadius: '6px', background: '#070d18', color: '#fff', border: '1px solid #1e293b' }}
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', width: '100%', padding: '0.75rem' }}>
                  Submit Requisition Request
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Expanded Tactical Portal Footer */}
      <footer className="portal-footer">
        <div className="footer-content">
          <div className="footer-brand">
            <h4>DEFENCE PORTAL OSINT</h4>
            <p>Non-sensitive public specifications sourced from open domains for research & educational purposes.</p>
          </div>

          <div className="footer-section">
            <h5>COMPLIANCE & GOALS</h5>
            <p><span className="footer-highlight">UN SDG Alignment:</span> Goal 11 (Sustainable Cities & Communities) — Public Infrastructure & Safety Tracking.</p>
          </div>

          <div className="footer-section">
            <h5>DEVELOPMENT TEAM</h5>
            <p>Engineered by <span className="footer-highlight">Krishna Sah</span> & <span className="footer-highlight">Soham Sapkal</span>.</p>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 Secured Indian Defence Assets Portal. All Rights Reserved.</p>
        </div>
      </footer>
    </>
  );
}