import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FaHeart, FaShareAlt, FaEye, FaTrashAlt } from 'react-icons/fa';
import './Video.css';

export default function Video() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [text, setText] = useState('');
  const { user } = useAuth();
  const videoRef = useRef(null);
  const watchTimeRef = useRef(0);

  /** Load video, comments & related */
  const load = async () => {
    try {
      const [v, c, all] = await Promise.all([
        api.get(`/videos/${id}`),
        api.get(`/comments/${id}`),
        api.get(`/videos`),
      ]);
      setVideo(v.data);
      setComments(c.data);
      setRelated(all.data.filter((vid) => vid._id !== id).slice(0, 6));
    } catch (err) {
      toast.error('Failed to load video');
    }
  };

  /** Register unique view */
  const registerView = async () => {
    try {
      const viewedKey = `viewed_${id}_${user?.id || 'guest'}`;
      if (!localStorage.getItem(viewedKey)) {
        await api.post(`/videos/${id}/view`);
        localStorage.setItem(viewedKey, 'true');
      }
    } catch (err) {
      console.error('View count failed:', err);
    }
  };

  /** Watch time tracking */
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      registerView();
    };

    // Track every second watched
    const trackInterval = setInterval(() => {
      if (video && !video.paused && !video.ended) {
        watchTimeRef.current += 1;
      }
    }, 1000);

    const sendWatchTime = async () => {
      if (watchTimeRef.current > 0) {
        try {
          await api.post(`/videos/${id}/watchtime`, {
            secondsWatched: watchTimeRef.current,
          });
        } catch {
          toast.error('Failed to record watch time');
        }
        watchTimeRef.current = 0;
      }
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', sendWatchTime);
    window.addEventListener('beforeunload', sendWatchTime);

    return () => {
      clearInterval(trackInterval);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', sendWatchTime);
      window.removeEventListener('beforeunload', sendWatchTime);
    };
  }, [id]);

  useEffect(() => {
    load();
  }, [id]);

  /** Like video */
  const like = async () => {
    try {
      await api.post(`/videos/${id}/like`);
      load();
    } catch {
      toast.error('Failed to like video');
    }
  };

  /** Share video */
  const share = async () => {
    try {
      await api.post(`/videos/${id}/share`);
      if (navigator.share) {
        await navigator.share({ title: video.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.info('Video link copied');
      }
    } catch {
      toast.error('Failed to share video');
    }
  };

  /** Add comment */
  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/comments/${id}`, { text });
      setText('');
      load();
    } catch {
      toast.error('Failed to post comment');
    }
  };

  /** Delete comment */
  const delComment = async (cid) => {
    const c = comments.find((c) => c._id === cid);
    if (!c) return;
    if (!user || String(c.user?._id) !== String(user.id || user._id)) {
      toast.warn('You can only delete your own comments');
      return;
    }
    try {
      await api.delete(`/comments/item/${cid}`);
      load();
    } catch {
      toast.error('Failed to delete comment');
    }
  };

  /** Time ago formatting */
  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  if (!video) return <div className="loading">Loading...</div>;

  const likedByUser = user && video.likes?.includes(user.id || user._id);

  return (
    <div className="video-page container-fluid py-4">
      <div className="row gx-5 gy-4">
        {/* MAIN VIDEO SECTION */}
        <div className="col-lg-8">
          <div className="video-player-container shadow-sm mb-3">
            <video
              ref={videoRef}
              className="video-player"
              src={video.url}
              controls
              poster={video.thumbnail || ''}
            />
          </div>

          <h3 className="video-title mt-3">{video.title}</h3>
          <p className="text-secondary small mb-1">
            Uploaded {video.createdAt ? timeAgo(video.createdAt) : ''}
          </p>

          {/* Divider before description */}
          <hr className="video-divider" />
          <h6 className="text-light mb-2">Description</h6>
          <p className="text-secondary video-description">{video.description}</p>

          {/* Actions */}
          <div className="d-flex align-items-center gap-3 mt-3 video-actions">
            <button
              className={`btn btn-like ${likedByUser ? 'liked' : ''}`}
              onClick={like}
            >
              <FaHeart className="me-2" /> {video.likes?.length || 0}
            </button>

            <button className="btn btn-share" onClick={share}>
              <FaShareAlt className="me-2" /> Share
            </button>

            <div className="text-secondary d-flex align-items-center gap-1">
              <FaEye /> {video.views || 0} views
            </div>
          </div>

          {/* COMMENTS SECTION */}
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
                  <div key={c._id} className="comment-item d-flex align-items-start">
                    <img
                      src={
                        c.user?.avatar ||
                        'https://ui-avatars.com/api/?name=' +
                          encodeURIComponent(c.user?.name || 'User')
                      }
                      alt={c.user?.name}
                      className="comment-avatar me-3"
                    />
                    <div className="comment-body flex-grow-1">
                      <div className="comment-header">
                        <div className="comment-info">
                          <small className="comment-author">
                            {c.user?.name || 'Unknown User'}
                          </small>
                          <small className="comment-timestamp">
                            {c.createdAt ? timeAgo(c.createdAt) : ''}
                          </small>
                        </div>
                        {user &&
                          c.user &&
                          String(c.user._id) === String(user.id || user._id) && (
                            <button
                              className="icon-delete-btn"
                              title="Delete comment"
                              onClick={() => delComment(c._id)}
                            >
                              <FaTrashAlt size={15} />
                            </button>
                          )}
                      </div>
                      <p className="comment-text mb-0">{c.text}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-secondary small">
                  No comments yet. Be the first!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* RELATED VIDEOS */}
        <div className="col-lg-4">
          <div className="related-section p-3 rounded shadow-sm">
            <h5 className="mb-3 text-light">Related Videos</h5>
            <div className="related-list">
              {related.map((rv) => (
                <Link
                  key={rv._id}
                  to={`/video/${rv._id}`}
                  className="related-item d-flex mb-3 text-decoration-none"
                >
                  <div className="related-thumb me-3">
                    <video src={rv.url} muted poster={rv.thumbnail || ''}></video>
                  </div>
                  <div className="related-info">
                    <p className="related-title text-light mb-1">{rv.title}</p>
                    <small className="text-secondary">
                      {rv.user?.name || 'Unknown'}
                    </small>
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
