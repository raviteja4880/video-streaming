import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaShareAlt, FaEye, FaTrashAlt } from 'react-icons/fa';
import './Video.css';

export default function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuth();

  const load = async () => {
    const v = await api.get(`/videos/${id}`);
    setVideo(v.data);

    const c = await api.get(`/comments/${id}`);
    setComments(c.data);

    const all = await api.get(`/videos`);
    setRelated(all.data.filter((vid) => vid._id !== id).slice(0, 6));
  };

  useEffect(() => {
    load();
  }, [id]);

  const like = async () => {
    await api.post(`/videos/${id}/like`);
    load();
  };

  const share = async () => {
    await api.post(`/videos/${id}/share`);
    if (navigator.share) {
      try {
        await navigator.share({ title: video.title, url: window.location.href });
      } catch {}
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied!');
    }
    load();
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    await api.post(`/comments/${id}`, { text });
    setText('');
    load();
  };

  const delComment = async (cid) => {
    await api.delete(`/comments/item/${cid}`);
    load();
  };

  if (!video) return <div className="loading">Loading...</div>;

  return (
    <div className="video-page container-fluid py-4">
      <div className="row gx-5 gy-4">
        {/* 🎥 MAIN CONTENT */}
        <div className="col-lg-8">
          {/* Video player */}
          <div className="video-player-container shadow-sm mb-3">
            <video
              className="video-player"
              src={video.url}
              controls
              poster={video.thumbnail || ''}
            />
          </div>

          <h3 className="video-title mt-3">{video.title}</h3>
          <p className="text-secondary">{video.description}</p>

          {/* Actions */}
          <div className="d-flex align-items-center gap-3 mt-3 video-actions">
            <button className="btn btn-like" onClick={like}>
              <FaHeart className="me-2" /> {video.likes?.length || 0}
            </button>

            <button className="btn btn-share" onClick={share}>
              <FaShareAlt className="me-2" /> Share
            </button>

            <div className="text-secondary d-flex align-items-center gap-1">
              <FaEye /> {video.views || 0} views
            </div>
          </div>

          {/* 💬 Comments Section */}
          <div className="comment-section mt-5 p-3 rounded shadow-sm">
            <h5 className="mb-3 text-light">Comments ({comments.length})</h5>

            {user && (
              <form onSubmit={addComment} className="d-flex mb-3 gap-2">
                <input
                  className="form-control bg-dark text-light border-0"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Add a comment..."
                />
                <button className="btn btn-primary">Post</button>
              </form>
            )}

            <div className="comment-list">
              {comments.length > 0 ? (
                comments.map((c) => (
                  <div key={c._id} className="comment-item position-relative">
                    <div className="d-flex justify-content-between align-items-start">
                      <small className="text-secondary">{c.user?.name}</small>
                      
{(c.user?._id === user?._id || c.user?._id === user?.id) && (
  <button
    className="icon-delete-btn"
    title="Delete comment"
    onClick={() => delComment(c._id)}
  >
    <FaTrashAlt size={15} />
  </button>
)}

                    </div>

                    <p className="comment-text">{c.text}</p>
                  </div>
                ))
              ) : (
                <p className="text-secondary small">No comments yet. Be the first!</p>
              )}
            </div>
          </div>
        </div>

        {/* 📺 RELATED VIDEOS */}
        <div className="col-lg-4">
          <div className="related-section p-3 rounded shadow-sm">
            <h5 className="mb-3 text-light">Related Videos</h5>
            <div className="related-list">
              {related.map((rv) => (
                <Link key={rv._id} to={`/video/${rv._id}`} className="related-item d-flex mb-3 text-decoration-none">
                  <div className="related-thumb me-3">
                    <video src={rv.url} muted poster={rv.thumbnail || ''}></video>
                  </div>
                  <div className="related-info">
                    <p className="related-title text-light mb-1">{rv.title}</p>
                    <small className="text-secondary">{rv.user?.name || 'Unknown'}</small>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
