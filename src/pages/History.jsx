import React, { useEffect, useState } from "react";
import api from "../api/client";
import "../pages/history.css";
import { FaTrashAlt, FaClock, FaPlayCircle } from "react-icons/fa";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user history
  const loadHistory = async () => {
    try {
      const { data } = await api.get("/history");
      setHistory(data);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const interval = setInterval(loadHistory, 100000);
    return () => clearInterval(interval);
  }, []);

  // Remove one video
  const removeVideo = async (id) => {
    try {
      await api.delete(`/history/item/${id}`);
      setHistory((prev) => prev.filter((v) => v._id !== id));
    } catch {
      toast.error("Failed to remove video");
    }
  };

  // Clear all
  const clearAll = async () => {
    if (!window.confirm("Clear your entire watch history?")) return;
    try {
      await api.delete("/history");
      setHistory([]);
    } catch {
      toast.error("Failed to clear history");
    }
  };

  // Resume watch logic
  const handleResume = (v) => {
    const video = v.videoId || {};
    const progress = v.totalDuration
      ? (v.watchedSeconds / v.totalDuration) * 100
      : 0;

    const videoId = video._id || v.videoId;

    if (!videoId) {
      toast.warn("Video not available.");
      return;
    }

    if (progress > 5 && progress < 95) {
      if (
        window.confirm(
          `Resume "${video.title}" from ${Math.floor(
            v.watchedSeconds / 60
          )}m ${Math.floor(v.watchedSeconds % 60)}s?`
        )
      ) {
        navigate(`/video/${videoId}?resume=${v.watchedSeconds}`);
      } else {
        navigate(`/video/${videoId}`);
      }
    } else {
      navigate(`/video/${videoId}`);
    }
  };

  if (loading)
    return (
      <div className="container text-light text-center py-5">
        Loading your watch history...
      </div>
    );

  return (
    <div className="container history-page py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="text-light mb-0 d-flex align-items-center gap-2">
          <FaClock /> Watch History
        </h3>
        {history.length > 0 && (
          <button
            className="btn btn-danger btn-sm clear-btn"
            onClick={clearAll}
          >
            <FaTrashAlt className="me-2" /> Clear All
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="text-center text-secondary mt-5">
          <p>No videos watched yet.</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((v) => {
            const video = v.videoId || {};
            const title = video.title || v.title || "Untitled Video";
            const thumbnail =
              v.thumbnail || video.thumbnail || "/assets/default-thumbnail.jpg";
            const url = video.url || v.url;
            const progress =
              v.totalDuration > 0
                ? (v.watchedSeconds / v.totalDuration) * 100
                : 0;

            return (
              <div key={v._id} className="history-card">
                <div
                  className="thumb-wrapper position-relative"
                  onClick={() => handleResume(v)}
                >
                  <video
                    src={url}
                    muted
                    poster={thumbnail}
                    className="history-thumb"
                  />
                  <div className="thumb-overlay">
                    <span>
                      <FaPlayCircle className="me-2" />
                      {progress > 0 && progress < 95
                        ? "Resume Watching"
                        : "Watch Again"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  {progress > 0 && (
                    <div
                      className="watch-progress"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                      }}
                    ></div>
                  )}

                  <button
                    className="remove-btn"
                    title="Remove from history"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeVideo(v._id);
                    }}
                  >
                    <FaTrashAlt />
                  </button>
                </div>

                <div className="history-meta">
                  <h6 className="video-title mb-1">{title}</h6>
                  <small>
                    Watched on{" "}
                    {new Date(v.watchedAt).toLocaleDateString()} at{" "}
                    {new Date(v.watchedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
