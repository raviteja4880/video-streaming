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
} from 'react-icons/fa';
import '../pages/Video.css';

export default function MyVideos() {
  const [videos, setVideos] = useState([]);
  const [busy, setBusy] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '' });

  const load = async () => {
    try {
      const { data } = await api.get('/videos/mine');
      setVideos(data);
    } catch {
      toast.error('⚠️ Failed to load videos');
    }
  };

  useEffect(() => {
    load();
  }, []);

  /** Delete video with Toast confirmation */
  const confirmDelete = (id) => {
    toast(
      ({ closeToast }) => (
        <div className="text-center">
          <p className="mb-2 fw-semibold text-warning">
            Proceed to delete this video?
          </p>
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
            <button
              className="btn btn-sm btn-secondary px-3"
              onClick={closeToast}
            >
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
      toast.success('Video deleted successfully');
      load();
    } catch {
      toast.error('Failed to delete video');
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
      toast.success('Video updated');
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

  return (
    <div className="container-fluid my-videos-page">
      <h3 className="mb-4 d-flex align-items-center gap-2">
        <FaVideo className="text-danger" /> My Uploaded Videos
      </h3>

      {videos.length === 0 && <p>No videos yet.</p>}

      <div className="video-grid">
        {videos.map((v) => (
          <div key={v._id} className="video-card">
            {/* Thumbnail / Preview */}
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

            {/* Video details */}
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
                    {v.description || 'No description'}
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
                      onChange={(e) =>
                        updateThumbnail(v._id, e.target.files[0])
                      }
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
