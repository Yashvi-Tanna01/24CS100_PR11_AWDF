import React, { useState, useEffect } from 'react';
import { fetchHealthAPI } from '../services/api';
import './DockerStatusCard.css';

function DockerStatusCard() {
  const [health, setHealth] = useState({
    status: 'checking',
    container: 'task-backend',
    database: { status: 'checking', host: 'mongodb' }
  });
  const [lastCheck, setLastCheck] = useState(null);
  const [checking, setChecking] = useState(false);

  const checkStatus = async () => {
    setChecking(true);
    const data = await fetchHealthAPI();
    setHealth(data);
    setLastCheck(new Date().toLocaleTimeString());
    setChecking(false);
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  const isOnline = health.status === 'healthy' || health.status === 'online';
  const isDbOnline = health.database?.status === 'connected';

  return (
    <div className="docker-card-container">
      <div className="docker-card-header">
        <div className="docker-card-title">
          <span className="docker-logo-badge">🐳 Docker Compose Topology</span>
          <span className="network-pill">Bridge Network: <code>app-network</code></span>
        </div>
        <button
          className="refresh-btn"
          onClick={checkStatus}
          disabled={checking}
          title="Refresh container connectivity"
        >
          {checking ? 'Pinging...' : '⟳ Ping Stack'}
        </button>
      </div>

      <div className="docker-services-grid">
        {/* Service 1: Frontend */}
        <div className="service-tile active">
          <div className="service-tile-top">
            <span className="service-icon">⚛️</span>
            <div className="service-name-wrap">
              <strong>frontend</strong>
              <span className="service-port">:5173</span>
            </div>
            <span className="status-dot online" title="Service active"></span>
          </div>
          <p className="service-desc">React 19 Vite Preview &bull; Multi-Stage Build</p>
          <div className="service-meta">
            <code>task-frontend</code>
            <span className="badge-light">Node 18</span>
          </div>
        </div>

        {/* Link Arrow 1 */}
        <div className="topology-arrow">
          <span className="arrow-line"></span>
          <span className="arrow-label">HTTP Proxy</span>
        </div>

        {/* Service 2: Backend */}
        <div className={`service-tile ${isOnline ? 'active' : 'warning'}`}>
          <div className="service-tile-top">
            <span className="service-icon">🟢</span>
            <div className="service-name-wrap">
              <strong>backend</strong>
              <span className="service-port">:5000</span>
            </div>
            <span className={`status-dot ${isOnline ? 'online' : 'pending'}`} title={isOnline ? 'Backend Online' : 'Connecting'}></span>
          </div>
          <p className="service-desc">Express REST API &bull; JWT Pipeline</p>
          <div className="service-meta">
            <code>task-backend</code>
            <span className={`badge-pill ${isOnline ? 'ok' : 'alert'}`}>
              {isOnline ? 'Healthy' : 'Connecting'}
            </span>
          </div>
        </div>

        {/* Link Arrow 2 */}
        <div className="topology-arrow">
          <span className="arrow-line"></span>
          <span className="arrow-label">DNS mongodb</span>
        </div>

        {/* Service 3: MongoDB */}
        <div className={`service-tile ${isDbOnline ? 'active' : 'neutral'}`}>
          <div className="service-tile-top">
            <span className="service-icon">🍃</span>
            <div className="service-name-wrap">
              <strong>mongodb</strong>
              <span className="service-port">:27017</span>
            </div>
            <span className={`status-dot ${isDbOnline ? 'online' : 'pending'}`} title={isDbOnline ? 'Database Connected' : 'Mongo Service'}></span>
          </div>
          <p className="service-desc">Official Mongo Image &bull; Volume: <code>mongo-data</code></p>
          <div className="service-meta">
            <code>task-mongodb</code>
            <span className="badge-pill db-pill">
              {isDbOnline ? 'Connected' : 'Persistent'}
            </span>
          </div>
        </div>
      </div>

      <div className="docker-footer-info">
        <span>Single Command Launch: <code>docker-compose up --build</code></span>
        {lastCheck && <span className="last-sync">Last ping: {lastCheck}</span>}
      </div>
    </div>
  );
}

export default DockerStatusCard;
