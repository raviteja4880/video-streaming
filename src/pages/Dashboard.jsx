import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUpload } from "../context/UploadContext";
import api from "../api/client";
import { toast } from "react-toastify";
import {
  FaTrashAlt,
  FaEdit,
  FaImage,
  FaVideo,
  FaSave,
  FaTimes,
  FaEye,
  FaHeart,
  FaCalendarAlt,
  FaClock,
  FaChartLine,
  FaUpload,
  FaUser,
  FaUserSecret,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import "../pages/Dashboard.css";

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", description: "" });
  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    avgWatchTime: 0,
    totalWatchTime: 0,
    userWatchTime: 0,
    guestWatchTime: 0,
  });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { uploading, progress, uploadVideo, cancelUpload } = useUpload();

  /** Load videos + compute stats */
  const load = async () => {
    try {
      const { data } = await api.get("/videos/mine");
      setVideos(data);

      const totalViews = data.reduce((sum, v) => sum + (v.views || 0), 0);
      const totalLikes = data.reduce((sum, v) => sum + (v.likes?.length || 0), 0);
      const totalWatchTime = data.reduce((sum, v) => sum + (v.totalWatchTime || 0), 0);
      const userWatchTime = data.reduce((sum, v) => sum + (v.userWatchTime || 0), 0);
      const guestWatchTime = data.reduce((sum, v) => sum + (v.guestWatchTime || 0), 0);

      const avgWatchTime = data.length
        ? (totalWatchTime / data.length / 60).toFixed(2)
        : 0;

      setStats({
        totalVideos: data.length,
        totalViews,
        totalLikes,
        avgWatchTime,
        totalWatchTime,
        userWatchTime,
        guestWatchTime,
      });
    } catch {
      toast.error("Failed to load videos");
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Upload handler */
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const maxSizeMB = 200;
    const allowedTypes = ["video/mp4", "video/webm", "video/quicktime", "video/mkv"];

    if (!allowedTypes.includes(selected.type)) {
      toast.error("Invalid file type. Please upload a valid video.");
      e.target.value = "";
      return;
    }
    if (selected.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large! Maximum size is ${maxSizeMB}MB.`);
      e.target.value = "";
      return;
    }

    setFile(selected);
    toast.success(`Selected: ${selected.name}`);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return toast.warn("Please select a video file first!");

    const form = new FormData();
    form.append("video", file);
    form.append("title", title);
    form.append("description", description);

    toast.info("Uploading video... Don’t reload this page.", {
      position: "top-center",
      autoClose: false,
      closeOnClick: false,
      theme: "dark",
    });

    await uploadVideo(form, () => {
      setTitle("");
      setDescription("");
      setFile(null);
      load();
    });
  };

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (uploading) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [uploading]);

  /** Chart data */
  const chartData = videos.map((v) => ({
    name: v.title.length > 10 ? v.title.slice(0, 10) + "…" : v.title,
    views: v.views || 0,
    userWatchTime: (v.userWatchTime || 0) / 60,
    guestWatchTime: (v.guestWatchTime || 0) / 60,
  }));

  /** Video CRUD */
  const deleteVideoConfirmed = async (id) => {
    try {
      setBusy(true);
      await api.delete(`/videos/${id}`);
      toast.success("Video deleted successfully.");
      load();
    } catch {
      toast.error("Failed to delete video.");
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = (id, title) => {
    toast.dismiss();
    toast.warn(
      <div style={{ textAlign: "center" }}>
        <p>Delete <strong>{title || "this video"}</strong> permanently?</p>
        <div className="d-flex justify-content-center gap-2 mt-2">
          <button
            className="btn btn-danger btn-sm px-3"
            onClick={() => {
              toast.dismiss();
              deleteVideoConfirmed(id);
            }}
          >
            Yes, Delete
          </button>
          <button className="btn btn-secondary btn-sm px-3" onClick={() => toast.dismiss()}>
            Cancel
          </button>
        </div>
      </div>,
      { position: "top-center", autoClose: false, theme: "dark" }
    );
  };

  const startEdit = (video) => {
    setEditingId(video._id);
    setEditForm({ title: video.title, description: video.description });
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: "", description: "" });
  };
  const saveEdit = async (id) => {
    try {
      await api.put(`/videos/${id}`, editForm);
      toast.success("Video updated.");
      setEditingId(null);
      load();
    } catch {
      toast.error("Update failed.");
    }
  };

  const updateThumbnail = async (id, file) => {
    const form = new FormData();
    form.append("thumbnail", file);
    try {
      await api.put(`/videos/${id}/thumbnail`, form);
      toast.success("Thumbnail updated.");
      load();
    } catch {
      toast.error("Failed to update thumbnail.");
    }
  };

  return (
    <div className="container-fluid my-videos-page">
      <h3 className="mb-4 d-flex align-items-center gap-2">
        <FaChartLine className="text-info" /> Dashboard Overview
      </h3>

      {/* Upload Section */}
      <div className="upload-card p-4 rounded mb-4">
        <h4 className="text-light mb-3 d-flex align-items-center gap-2">
          <FaUpload /> Upload New Video
        </h4>
        <form onSubmit={handleUpload}>
          <div className="mb-3">
            <label className="form-label text-light">Title</label>
            <input
              className="form-control bg-dark text-light"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={uploading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-light">Description</label>
            <textarea
              className="form-control bg-dark text-light"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="mb-3">
            <label className="form-label text-light">Video File</label>
            <input
              type="file"
              className="form-control bg-dark text-light"
              accept="video/*"
              onChange={handleFileChange}
              required
              disabled={uploading}
            />
          </div>
          {uploading && (
            <div className="mb-3">
              <div className="progress" style={{ height: "10px" }}>
                <div
                  className="progress-bar progress-bar-striped bg-info"
                  role="progressbar"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <small className="text-light">{progress}% uploaded</small>
            </div>
          )}
          <div className="d-flex gap-2">
            <button className="btn btn-primary w-100" disabled={uploading}>
              {uploading ? "Uploading..." : "Upload"}
            </button>
            {uploading && (
              <button type="button" className="btn btn-outline-danger" onClick={cancelUpload}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Stats Section */}
      <div className="stats-grid mb-4">
        <div className="stat-card">
          <FaVideo className="stat-icon text-primary" />
          <div>
            <h5>{stats.totalVideos}</h5>
            <small>Total Videos</small>
          </div>
        </div>

        <div className="stat-card">
          <FaEye className="stat-icon text-success" />
          <div>
            <h5>{stats.totalViews}</h5>
            <small>Total Views</small>
          </div>
        </div>

        <div className="stat-card">
          <FaHeart className="stat-icon text-danger" />
          <div>
            <h5>{stats.totalLikes}</h5>
            <small>Total Likes</small>
          </div>
        </div>

        <div className="stat-card">
          <FaClock className="stat-icon text-warning" />
          <div>
            <h5>{stats.avgWatchTime} min</h5>
            <small>Avg Watch Time</small>
          </div>
        </div>

        <div className="stat-card">
          <FaUser className="stat-icon text-success" />
          <div>
            <h5>{(stats.userWatchTime / 60).toFixed(1)} min</h5>
            <small>Users Watch Time</small>
          </div>
        </div>

        <div className="stat-card">
          <FaUserSecret className="stat-icon text-purple" />
          <div>
            <h5>{(stats.guestWatchTime / 60).toFixed(1)} min</h5>
            <small>Guest Watch Time</small>
          </div>
        </div>
      </div>

      {/* Chart Section */}
<div className="chart-card mb-5 p-3 rounded">
  <h5 className="mb-3 text-light">Watch Time Comparison</h5>
  {videos.length > 0 ? (
    <ResponsiveContainer width="100%" height={340}>
      <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorUser" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#4caf50" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#4caf50" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="colorGuest" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#9c27b0" stopOpacity={0.6} />
            <stop offset="95%" stopColor="#9c27b0" stopOpacity={0.05} />
          </linearGradient>
        </defs>

        <CartesianGrid strokeDasharray="3 3" stroke="#222" />
        <XAxis dataKey="name" stroke="#ccc" />
        <YAxis
          stroke="#ccc"
          domain={[0, "auto"]}
          label={{
            value: "Watch Time (min)",
            angle: -90,
            position: "insideLeft",
            fill: "#aaa",
          }}
        />

        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              const formatTime = (value) => {
                const totalSec = Math.round(value * 60);
                const min = Math.floor(totalSec / 60);
                const sec = totalSec % 60;
                return `${min} min ${sec}s`;
              };
              return (
                <div
                  style={{
                    background: "rgba(0,0,0,0.9)",
                    border: "1px solid #333",
                    borderRadius: "10px",
                    padding: "10px 14px",
                    color: "#fff",
                    boxShadow: "0 0 8px rgba(0, 188, 212, 0.3)",
                  }}
                >
                  <strong style={{ color: "#00bcd4" }}>{label}</strong>
                  {payload.map((entry, index) => (
                    <div
                      key={`item-${index}`}
                      style={{
                        marginTop: "4px",
                        color: entry.color,
                        fontSize: "0.9rem",
                      }}
                    >
                      {entry.name}: <strong>{formatTime(entry.value)}</strong>
                    </div>
                  ))}
                </div>
              );
            }
            return null;
          }}
        />
        <Legend />

        <Area
          type="monotone"
          dataKey="userWatchTime"
          stroke="#4caf50"
          fill="url(#colorUser)"
          strokeWidth={2}
          name="User Watch"
        />
        <Area
          type="monotone"
          dataKey="guestWatchTime"
          stroke="#9c27b0"
          fill="url(#colorGuest)"
          strokeWidth={2}
          name="Guest Watch"
        />
      </AreaChart>
    </ResponsiveContainer>
  ) : (
    <p className="text-secondary">No chart data available yet.</p>
  )}
</div>

      {/* Video List */}
      <h4 className="mb-3 d-flex align-items-center gap-2 text-light">
        <FaVideo className="text-danger" /> My Uploaded Videos
      </h4>
      {videos.length === 0 && <p className="text-light">No videos yet.</p>}

      <div className="video-grid">
        {videos.map((v) => (
          <div key={v._id} className="video-card">
            <div className="video-thumb-container">
              <video src={v.url} muted className="video-thumb" />
              <div className="video-hover-overlay">
                <button
                  className="btn btn-sm btn-light d-flex align-items-center gap-1"
                  onClick={() => startEdit(v)}
                >
                  <FaEdit /> Edit
                </button>
                <button
                  className="btn btn-sm btn-danger d-flex align-items-center gap-1"
                  onClick={() => confirmDelete(v._id, v.title)}
                  disabled={uploading}
                >
                  <FaTrashAlt /> Delete
                </button>
              </div>
            </div>

            <div className="video-meta">
              {editingId === v._id ? (
                <>
                  <input
                    className="form-control form-control-sm mb-2 bg-dark text-light"
                    value={editForm.title}
                    onChange={(e) =>
                      setEditForm({ ...editForm, title: e.target.value })
                    }
                  />
                  <textarea
                    className="form-control form-control-sm mb-2 bg-dark text-light"
                    rows="2"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        description: e.target.value,
                      })
                    }
                  />
                  <div className="d-flex justify-content-between">
                    <button
                      className="btn btn-sm btn-success d-flex align-items-center gap-1"
                      onClick={() => saveEdit(v._id)}
                    >
                      <FaSave /> Save
                    </button>
                    <button
                      className="btn btn-sm btn-secondary d-flex align-items-center gap-1"
                      onClick={cancelEdit}
                    >
                      <FaTimes /> Cancel
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <h6 className="video-title">{v.title}</h6>
                  <p className="video-description">
                    {v.description || "No description"}
                  </p>
                  <div className="video-stats">
                    <span>
                      <FaCalendarAlt className="me-1" />
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                    <span>
                      <FaHeart className="me-1 text-danger" />
                      {v.likes?.length || 0}
                    </span>
                    <span>
                      <FaEye className="me-1 text-info" />
                      {v.views || 0}
                    </span>
                  </div>
                  <label className="btn btn-sm btn-outline-light mt-2 d-flex align-items-center gap-1">
                    <FaImage /> Change Thumbnail
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => updateThumbnail(v._id, e.target.files[0])}
                    />
                  </label>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
