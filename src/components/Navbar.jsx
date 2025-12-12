import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHistory, FaHome, FaVideo, FaUserCircle } from 'react-icons/fa';
import '../styles.css';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* ---------- Top Navbar ---------- */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2 fixed-top">
        <div className="container">
          {/* Brand */}
          <Link className="navbar-brand fw-bold text-primary" to="/">
            Streamify
          </Link>

          {/* Links */}
          <div className="collapse navbar-collapse" id="navMain">
            <ul className="navbar-nav me-auto">
              <li className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
                <Link className="nav-link" to="/">Home</Link>
              </li>
              {user && (
                <>
                  <li className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/dashboard">Dashboard</Link>
                  </li>
                  <li className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
                    <Link className="nav-link" to="/history">History</Link>
                  </li>
                </>
              )}
            </ul>

            {/* ---------- Right side (User Section) ---------- */}
            <ul className="navbar-nav ms-auto align-items-center">
              {user ? (
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="/profile"
                    style={{ fontWeight: 500, color: '#f8f9fa' }}
                  >
                    <div className="position-relative nav-avatar d-flex align-items-center justify-content-center">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt="avatar"
                          className="rounded-circle"
                          onError={(e) => (e.target.src = '')}
                          style={{
                            width: 38,
                            height: 38,
                            objectFit: 'cover',
                            border: '2px solid #0d6efd',
                          }}
                        />
                      ) : (
                        <FaUserCircle
                          size={38}
                          className="text-secondary"
                          style={{
                            background: '#222',
                            borderRadius: '50%',
                            padding: '4px',
                          }}
                        />
                      )}
                    </div>
                    <span className="d-none d-sm-inline">{user.name}</span>
                  </Link>
                </li>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/login">Login</Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/register">Register</Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </nav>

      {/* ---------- Bottom Nav (Mobile) ---------- */}
      {user && (
        <div className="bottom-nav d-lg-none">
          <button onClick={() => navigate('/')} className={location.pathname === '/' ? 'active' : ''}>
            <FaHome />
            <span>Home</span>
          </button>
          <button onClick={() => navigate('/dashboard')} className={location.pathname === '/dashboard' ? 'active' : ''}>
            <FaVideo />
            <span>Dashboard</span>
          </button>
          <button onClick={() => navigate('/history')} className={location.pathname === '/history' ? 'active' : ''}>
            <FaHistory />
            <span>History</span>
          </button>
          <button onClick={() => navigate('/profile')} className={location.pathname === '/profile' ? 'active' : ''}>
            {user.avatar ? (
              <img
                src={user.avatar}
                alt="avatar"
                className="rounded-circle"
                style={{ width: 24, height: 24, objectFit: 'cover', border: '1px solid #0d6efd' }}
              />
            ) : (
              <FaUserCircle />
            )}
            <span>Profile</span>
          </button>
        </div>
      )}
    </>
  );
}
