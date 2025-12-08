import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/client'; // ✅ using your existing axios client

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      // Make backend call directly
      const res = await api.post('/users/login', { email, password });

      // Save user + token using context
      login(res.data); 

      // Navigate after login
      const to = loc.state?.from?.pathname || '/';
      nav(to, { replace: true });
    } catch (e) {
      alert(e.response?.data?.message || e.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mx-auto" style={{ maxWidth: 480 }}>
      <h3 className="mb-3">Login</h3>

      <div className="mb-3">
        <label className="form-label">Email</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Password</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <button className="btn btn-primary w-100" disabled={busy}>
        {busy ? 'Loading...' : 'Login'}
      </button>
    </form>
  );
}
