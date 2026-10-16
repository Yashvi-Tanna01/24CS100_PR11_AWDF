import React, { useState } from 'react';
import { registerAPI, loginAPI } from '../services/api';
import './AuthModal.css';

function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('Maitri Sheta');
  const [studentId, setStudentId] = useState('D25CS120');
  const [email, setEmail] = useState('maitri@charusat.ac.in');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let data;
      if (isLogin) {
        data = await loginAPI({ email, password });
      } else {
        data = await registerAPI({ name, studentId, email, password });
      }
      onAuthSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-card">
        <div className="auth-header">
          <div>
            <h2>{isLogin ? 'Welcome Back!' : 'Create New Account'}</h2>
            <p className="auth-student-tag">Student: Maitri Sheta (ID: D25CS120)</p>
          </div>
          <button className="auth-close" onClick={onClose}>&times;</button>
        </div>

        <p className="auth-desc">
          {isLogin
            ? 'Sign in to access your containerized tasks stored in MongoDB.'
            : 'Register a new account. Credentials are saved into the containerized MongoDB database.'}
        </p>

        {error && <div className="auth-alert">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <>
              <div className="auth-input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maitri Sheta"
                  required
                />
              </div>
              <div className="auth-input-group">
                <label>Student ID Number</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="D25CS120"
                  required
                />
              </div>
            </>
          )}

          <div className="auth-input-group">
            <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="maitri@charusat.ac.in"
              required
            />
          </div>

          <div className="auth-input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In & Get Token' : 'Register User')}
          </button>
        </form>

        <div className="auth-toggle">
          {isLogin ? (
            <p>
              Don't have an account?{' '}
              <button onClick={() => { setIsLogin(false); setError(''); }}>
                Register here
              </button>
            </p>
          ) : (
            <p>
              Already registered?{' '}
              <button onClick={() => { setIsLogin(true); setError(''); }}>
                Sign in here
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthModal;
