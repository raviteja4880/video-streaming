import React, { useState } from 'react';
import api from '../api/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

export default function RegisterVerify() {
  const [step, setStep] = useState('register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [busy, setBusy] = useState(false);
  const nav = useNavigate();

  /** Register new user */
  const handleRegister = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/users/register', { name, email, password });
      if (data?.user?.email) {
        setEmail(data.user.email);
        setStep('verify');
        toast.success('Registration successful! Check your email for OTP.');
      } else {
        toast.warn('Something went wrong, please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setBusy(false);
    }
  };

  /** Verify OTP */
  const handleVerify = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/users/verify-otp', { email, code: otp });
      toast.success(data.message || 'Email verified successfully!');
      setTimeout(() => nav('/login', { replace: true }), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP');
    } finally {
      setBusy(false);
    }
  };

  /** Resend OTP */
  const handleResend = async () => {
    setBusy(true);
    try {
      const { data } = await api.post('/users/resend-otp', { email });
      toast.info(data.message || 'OTP resent to your email.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center">
      <div className="auth-card p-4 rounded shadow">
        {step === 'register' ? (
          <form onSubmit={handleRegister}>
            <h3 className="mb-4 text-center text-light">Create Account</h3>

            <div className="mb-3">
              <label className="form-label text-secondary">Full Name</label>
              <input
                className="form-control bg-dark text-light border-secondary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter your name"
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary">Email</label>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="mb-4">
              <label className="form-label text-secondary">Password</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Choose a strong password"
              />
            </div>

            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? 'Registering...' : 'Register'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerify}>
            <h3 className="mb-4 text-center text-light">Verify Email</h3>

            <div className="mb-3">
              <label className="form-label text-secondary">Email</label>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                value={email}
                readOnly
              />
            </div>

            <div className="mb-3">
              <label className="form-label text-secondary">Enter OTP</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter the 6-digit code"
              />
            </div>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary flex-fill" disabled={busy}>
                {busy ? 'Verifying...' : 'Verify OTP'}
              </button>
              <button
                type="button"
                className="btn btn-outline-light flex-fill"
                onClick={handleResend}
                disabled={busy}
              >
                Resend OTP
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
