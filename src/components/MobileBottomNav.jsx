import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaHome, FaVideo, FaHistory, FaUserCircle } from "react-icons/fa";

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="bottom-nav d-lg-none">
      <button
        onClick={() => handleNavigate("/")}
        className={location.pathname === "/" ? "active" : ""}
      >
        <FaHome size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => handleNavigate("/dashboard")}
        className={location.pathname === "/dashboard" ? "active" : ""}
      >
        <FaVideo size={20} />
        <span>Dashboard</span>
      </button>

      <button
        onClick={() => handleNavigate("/history")}
        className={location.pathname === "/history" ? "active" : ""}
      >
        <FaHistory size={20} />
        <span>History</span>
      </button>

      <button
        onClick={() => handleNavigate("/profile")}
        className={location.pathname === "/profile" ? "active" : ""}
      >
        <FaUserCircle size={20} />
        <span>{user ? "Profile" : "Login"}</span>
      </button>
    </div>
  );
}
