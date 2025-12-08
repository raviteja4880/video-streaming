import React, { useState } from 'react'
import api from '../api/client'
import { useNavigate } from 'react-router-dom'

export default function RegisterVerify() {
  const [step, setStep] = useState('register') // 'register' | 'verify'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState('')
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')
  const nav = useNavigate()

  /** Register new user */
  const handleRegister = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const { data } = await api.post('/auth/register', { name, email, password })
      if (data?.user?.email) {
        setEmail(data.user.email) // ensure email filled
        setStep('verify') // move to verify step
        setMsg('Registration successful! Check your email for OTP.')
      } else {
        setMsg('Something went wrong, please try again.')
      }
    } catch (err) {
      setMsg(err.response?.data?.message || err.message)
    } finally {
      setBusy(false)
    }
  }

  /** Verify OTP */
  const handleVerify = async (e) => {
    e.preventDefault()
    setBusy(true)
    setMsg('')
    try {
      const { data } = await api.post('/auth/verify-otp', { email, code: otp })
      setMsg(data.message || 'Email verified successfully!')
      setTimeout(() => nav('/login', { replace: true }), 1500)
    } catch (err) {
      setMsg(err.response?.data?.message || err.message)
    } finally {
      setBusy(false)
    }
  }

  /** Resend OTP */
  const handleResend = async () => {
    setBusy(true)
    setMsg('')
    try {
      const { data } = await api.post('/auth/resend-otp', { email })
      setMsg(data.message || 'OTP resent to your email.')
    } catch (err) {
      setMsg(err.response?.data?.message || err.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto" style={{ maxWidth: 480 }}>
      {step === 'register' ? (
        <form onSubmit={handleRegister}>
          <h3 className="mb-3 text-center">Create Account</h3>

          <div className="mb-3">
            <label className="form-label">Full Name</label>
            <input
              className="form-control"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
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
              placeholder="Choose a strong password"
            />
          </div>

          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? 'Registering...' : 'Register'}
          </button>

          {msg && <div className="alert alert-info mt-3 text-center">{msg}</div>}
        </form>
      ) : (
        <form onSubmit={handleVerify}>
          <h3 className="mb-3 text-center">Verify Email</h3>

          <div className="mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              readOnly
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Enter OTP</label>
            <input
              type="text"
              className="form-control"
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

          {msg && <div className="alert alert-secondary mt-3 text-center">{msg}</div>}
        </form>
      )}
    </div>
  )
}
