import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm py-2">
      <div className="container">
        {/* Brand */}
        <Link className="navbar-brand fw-bold text-primary" to="/">
          Streamify
        </Link>

        {/* Toggle for mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMain"
          aria-controls="navMain"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar Links */}
        <div className="collapse navbar-collapse" id="navMain">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {user && (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/upload">Upload</Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/dashboard">Dashboard</Link>
                </li>
              </>
            )}
          </ul>

          {/* Right Side */}
          <ul className="navbar-nav ms-auto align-items-center">
            {user ? (
              <li className="nav-item">
                <Link
                  className="nav-link d-flex align-items-center gap-2"
                  to="/profile"
                  style={{ fontWeight: 500, color: '#f8f9fa' }}
                >
                  <div
                    className="position-relative"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      overflow: 'hidden',
                      border: '2px solid #fff',
                      boxShadow: '0 0 5px rgba(255,255,255,0.2)',
                      transition: 'transform 0.2s ease, box-shadow 0.3s ease',
                    }}
                  >
                    <img
                      src={user.avatar || 'https://via.placeholder.com/40'}
                      alt="avatar"
                      className="w-100 h-100"
                      style={{
                        objectFit: 'cover',
                        borderRadius: '50%',
                      }}
                      onError={(e) => (e.target.src = 'https://via.placeholder.com/40')}
                    />
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
  );
}
