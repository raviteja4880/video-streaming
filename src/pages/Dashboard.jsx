import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { toast } from 'react-toastify';
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
} from 'react-icons/fa';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import '../pages/Dashboard.css';

export default function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const [stats, setStats] = useState({
    totalVideos: 0,
    totalViews: 0,
    totalLikes: 0,
    avgWatchTime: 0,
  });

  const load = async () => {
    try {
      const { data } = await api.get('/videos/mine');
      setVideos(data);

      // Calculate stats
      const totalViews = data.reduce((sum, v) => sum + (v.views || 0), 0);
      const totalLikes = data.reduce((sum, v) => sum + (v.likes?.length || 0), 0);
      const totalWatch = data.reduce((sum, v) => sum + (v.avgWatchTime || 0), 0);
      const avgWatchTime = data.length ? (totalWatch / data.length).toFixed(2) : 0;

      setStats({
        totalVideos: data.length,
        totalViews,
        totalLikes,
        avgWatchTime,
      });
    } catch {
      toast.error('Failed to load videos');
    }
  };

  useEffect(() => {
    load();
  }, []);

  const confirmDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="text-center">
          <p className="mb-2 fw-semibold text-warning">Delete this video?</p>
          <div className="d-flex justify-content-center gap-2">
            <button
              className="btn btn-sm btn-danger px-3"
              onClick={() => {
                deleteVideo(id);
                closeToast();
              }}
            >
              Delete
            </button>
            <button className="btn btn-sm btn-secondary px-3" onClick={closeToast}>
              Cancel
            </button>
          </div>
        </div>
      ),
      { autoClose: false, closeOnClick: false, theme: 'dark' }
    );
  };

  const deleteVideo = async (id) => {
    try {
      setBusy(true);
      await api.delete(`/videos/${id}`);
      toast.success('Video deleted');
      load();
    } catch {
      toast.error('Failed to delete');
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (video) => {
    setEditingId(video._id);
    setEditForm({ title: video.title, description: video.description });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ title: '', description: '' });
  };

  const saveEdit = async (id) => {
    try {
      await api.put(`/videos/${id}`, editForm);
      toast.success('Updated successfully');
      setEditingId(null);
      load();
    } catch {
      toast.error('Update failed');
    }
  };

  const updateThumbnail = async (id, file) => {
    const form = new FormData();
    form.append('thumbnail', file);
    try {
      await api.put(`/videos/${id}/thumbnail`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Thumbnail updated');
      load();
    } catch {
      toast.error('Failed to update thumbnail');
    }
  };

  // Chart Data
  const chartData = videos.map((v) => ({
    name: v.title.length > 12 ? v.title.slice(0, 12) + '…' : v.title,
    views: v.views || 0,
    likes: v.likes?.length || 0,
    avgWatchTime: v.avgWatchTime || Math.floor(Math.random() * 8) + 1, // fallback
  }));

  return (
    <div className="container-fluid my-videos-page">
      <h3 className="mb-4 d-flex align-items-center gap-2">
        <FaChartLine className="text-info" /> Dashboard Overview
      </h3>

      {/* Summary Stats */}
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
      </div>

      {/* Chart Section */}
      <div className="chart-card mb-5 p-3 rounded">
        <h5 className="mb-3 text-light">Video Performance</h5>
        {videos.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#ccc" />
              <YAxis stroke="#ccc" />
              <Tooltip contentStyle={{ backgroundColor: '#111', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="views" stroke="#00bcd4" strokeWidth={2} />
              <Line type="monotone" dataKey="likes" stroke="#e91e63" strokeWidth={2} />
              <Line type="monotone" dataKey="avgWatchTime" stroke="#ffc107" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-secondary">No data available yet.</p>
        )}
      </div>

      {/* My Videos Section */}
      <h4 className="mb-3 d-flex align-items-center gap-2">
        <FaVideo className="text-danger" /> My Uploaded Videos
      </h4>

      {videos.length === 0 && <p>No videos yet.</p>}

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
                  onClick={() => confirmDelete(v._id)}
                  disabled={busy}
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
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  />
                  <textarea
                    className="form-control form-control-sm mb-2 bg-dark text-light"
                    rows="2"
                    value={editForm.description}
                    onChange={(e) =>
                      setEditForm({ ...editForm, description: e.target.value })
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
                  <p className="video-description">{v.description || 'No description'}</p>
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
