import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate, Link } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-toastify";

export default function Login() {
  const { login } = useAuth();
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const nav = useNavigate();
  const loc = useLocation();

  /** LOGIN **/
  const handleLogin = async (e) => {
  e.preventDefault();
  setBusy(true);
  try {
    const res = await api.post("/users/login", { email, password });

    // Normalize keys for AuthContext
    const userData = {
      user: res.data.user || res.data.userInfo,     
      token: res.data.token || res.data.jwtToken,   
    };

    if (!userData.user || !userData.token) {
      throw new Error("Invalid login response — missing token or user");
    }

    login(userData);
    toast.success("Welcome back!");
    nav(loc.state?.from?.pathname || "/", { replace: true });
  } catch (e) {
    toast.error(e.response?.data?.message || e.message);
  } finally {
    setBusy(false);
  }
};

  /** REQUEST RESET OTP **/
  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) return toast.warn("Enter your email first");
    setBusy(true);
    try {
      const { data } = await api.post("/users/forgot-password", { email });
      toast.success(data.message || "OTP sent to your email");
      setStep("verify");
    } catch (err) {
      toast.error(err.response?.data?.message || "Email not found");
    } finally {
      setBusy(false);
    }
  };

  /** VERIFY OTP & RESET PASSWORD **/
  const handleVerifyReset = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post("/users/reset-password", {
        email,
        code: otp,
        newPassword,
      });
      toast.success("Password reset successfully! Logging you in...");
      const res = await api.post("/users/login", {
        email,
        password: newPassword,
      });
      login(res.data);
      nav("/", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP or expired");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-page d-flex align-items-center justify-content-center">
      <div className="auth-card p-4 rounded shadow">
        {step === "login" && (
          <form onSubmit={handleLogin}>
            <h3 className="mb-4 text-center text-light">Welcome Back</h3>
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
                placeholder="Enter your password"
              />
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? "Loading..." : "Login"}
            </button>

            <p className="text-center mt-3 mb-1">
              <button
                type="button"
                className="btn btn-link text-info p-0"
                onClick={() => setStep("forgot")}
              >
                Forgot Password?
              </button>
            </p>

            {/* Register Link */}
            <div className="text-center border-top mt-3 pt-3">
              <small className="text-secondary">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-info text-decoration-none fw-semibold"
                >
                  Register
                </Link>
              </small>
            </div>
          </form>
        )}

        {step === "forgot" && (
          <form onSubmit={handleForgot}>
            <h3 className="mb-4 text-center text-light">Forgot Password</h3>
            <div className="mb-3">
              <label className="form-label text-secondary">Email</label>
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your registered email"
              />
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? "Sending..." : "Send OTP"}
            </button>
            <p className="text-center mt-3 mb-1">
              <button
                type="button"
                className="btn btn-link text-info p-0"
                onClick={() => setStep("login")}
              >
                Back to Login
              </button>
            </p>

            {/* Register Link for Forgot Page */}
            <div className="text-center border-top mt-3 pt-3">
              <small className="text-secondary">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-info text-decoration-none fw-semibold"
                >
                  Register
                </Link>
              </small>
            </div>
          </form>
        )}

        {step === "verify" && (
          <form onSubmit={handleVerifyReset}>
            <h3 className="mb-4 text-center text-light">Verify & Reset</h3>
            <div className="mb-3">
              <label className="form-label text-secondary">OTP Code</label>
              <input
                type="text"
                className="form-control bg-dark text-light border-secondary"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter 6-digit code"
              />
            </div>
            <div className="mb-3">
              <label className="form-label text-secondary">New Password</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                placeholder="Enter new password"
              />
            </div>
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? "Verifying..." : "Confirm & Login"}
            </button>
            <p className="text-center mt-3 mb-1">
              <button
                type="button"
                className="btn btn-link text-info p-0"
                onClick={() => setStep("login")}
              >
                Back to Login
              </button>
            </p>

            {/* Register Link for Verify Page */}
            <div className="text-center border-top mt-3 pt-3">
              <small className="text-secondary">
                Don’t have an account?{" "}
                <Link
                  to="/register"
                  className="text-info text-decoration-none fw-semibold"
                >
                  Register
                </Link>
              </small>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
