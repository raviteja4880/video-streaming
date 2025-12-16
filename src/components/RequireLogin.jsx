import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaLock, FaArrowRight } from "react-icons/fa";

export default function RequireLogin({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const getPageName = () => {
    const path = location.pathname.toLowerCase();
    if (path.includes("dashboard")) return "dashboard";
    if (path.includes("history")) return "history";
    if (path.includes("profile")) return "profile page";
    if (path.includes("upload")) return "upload videos";
    return "this page";
  };

  // Wait for auth to initialize (critical for production)
  if (loading) {
    return (
      <div className="vh-100 d-flex flex-column justify-content-center align-items-center text-light bg-dark">
        <div className="spinner-border text-info mb-3" role="status" />
        <h6 className="fw-semibold text-info">Checking authentication...</h6>
      </div>
    );
  }

  // Not logged in -> show custom message
  if (!user) {
    return (
      <div
        className="d-flex flex-column justify-content-center align-items-center text-center text-light"
        style={{
          minHeight: "80vh",
          backgroundColor: "#0d0d0d",
          padding: "2rem 1rem",
        }}
      >
        <div
          className="d-flex align-items-center justify-content-center mb-3"
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "rgba(0,188,212,0.1)",
            boxShadow: "0 0 12px rgba(0,188,212,0.3)",
          }}
        >
          <FaLock size={36} color="#00bcd4" />
        </div>

        <h4 className="fw-bold mb-3" style={{ color: "#00bcd4" }}>
          Login Required
        </h4>

        <p
          className="mb-4"
          style={{
            color: "#bbb",
            maxWidth: "420px",
            fontSize: "1rem",
            lineHeight: "1.6",
          }}
        >
          You need to{" "}
          <span style={{ color: "#00bcd4", fontWeight: "600" }}>log in</span> to
          access your <strong>{getPageName()}</strong>.  
          Don’t worry, it only takes a few seconds!
        </p>

        <button
          className="btn fw-semibold d-flex align-items-center justify-content-center gap-2"
          onClick={() =>
            navigate("/login", { state: { from: location.pathname } })
          }
          style={{
            background: "linear-gradient(135deg, #007bff 0%, #00bcd4 100%)",
            border: "none",
            color: "#fff",
            padding: "0.65rem 1.8rem",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(0, 188, 212, 0.3)",
            fontSize: "1rem",
            transition: "all 0.3s ease",
          }}
        >
          Go to Login <FaArrowRight />
        </button>
      </div>
    );
  }

  return children;
}
