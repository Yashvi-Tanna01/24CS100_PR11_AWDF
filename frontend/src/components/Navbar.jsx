import React from 'react';
import './Navbar.css';

function Navbar({ user, onOpenAuth, onLogout }) {
  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        <div className="navbar-brand">
          <div className="brand-icon">🐳</div>
          <div>
            <h1 className="brand-title">TaskFlow <span>Dockerized</span></h1>
            <p className="brand-sub">Practical 11 &bull; Maitri Sheta (D25CS120)</p>
          </div>
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-profile-badge">
              <div className="user-avatar">{user.name ? user.name[0].toUpperCase() : 'M'}</div>
              <div className="user-meta">
                <span className="user-name">{user.name}</span>
                <span className="user-id">ID: {user.studentId || 'D25CS120'} &bull; Containerized 🚀</span>
              </div>
              <button className="logout-btn" onClick={onLogout} title="Log Out">
                Logout
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <span className="unauth-pill">Guest &bull; Compose Active</span>
              <button className="login-trigger-btn" onClick={onOpenAuth}>
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
