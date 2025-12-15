import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaVideo, FaHistory, FaUserCircle } from "react-icons/fa";

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user")); 

  return (
    <div className="bottom-nav d-lg-none">
      <button
        onClick={() => navigate("/")}
        className={location.pathname === "/" ? "active" : ""}
      >
        <FaHome size={20} />
        <span>Home</span>
      </button>

      <button
        onClick={() => (user ? navigate("/dashboard") : navigate("/login"))}
        className={location.pathname === "/dashboard" ? "active" : ""}
      >
        <FaVideo size={20} />
        <span>Dashboard</span>
      </button>

      <button
        onClick={() => (user ? navigate("/history") : navigate("/login"))}
        className={location.pathname === "/history" ? "active" : ""}
      >
        <FaHistory size={20} />
        <span>History</span>
      </button>

      <button
        onClick={() => (user ? navigate("/profile") : navigate("/login"))}
        className={location.pathname === "/profile" ? "active" : ""}
      >
        <FaUserCircle size={20} />
        <span>{user ? "Profile" : "Login"}</span>
      </button>
    </div>
  );
}
