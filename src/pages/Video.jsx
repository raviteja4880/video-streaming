import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaShareAlt,
  FaEye,
  FaTrashAlt,
  FaRedoAlt,
  FaUndoAlt,
} from "react-icons/fa";
import "./Video.css";

export default function Video() {
  const { id } = useParams();
  const { user } = useAuth();
  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [text, setText] = useState("");
  const [animationType, setAnimationType] = useState(null);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const totalWatchedRef = useRef(0);
  const lastPlayTimeRef = useRef(null);
  const lastSyncedRef = useRef(0);
  const syncTimerRef = useRef(null);
  let lastTap = 0;

  /** Load video data */
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
    } catch {
      toast.error("Failed to load video");
    }
  };

  useEffect(() => {
    load();
    totalWatchedRef.current = 0;
    lastPlayTimeRef.current = null;
    lastSyncedRef.current = 0;
    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
  }, [id]);

  /** Register one-time view */
  const registerView = async () => {
    try {
      const key = `viewed_${id}_${user?.id || "guest"}`;
      if (!localStorage.getItem(key)) {
        await api.post(`/videos/${id}/view`);
        localStorage.setItem(key, "true");
      }
    } catch {}
  };

  const addToHistory = async () => {
    if (!user) return;
    try {
      await api.post(`/history/${id}`);
    } catch {}
  };

  const sendWatchTime = async (seconds) => {
    if (seconds <= 0) return;
    try {
      await api.post(`/videos/${id}/watchtime`, { secondsWatched: seconds });
    } catch (err) {
      console.warn("Watch time sync failed:", err.message);
    }
  };

  /** Play tracking */
  const handlePlay = () => {
    registerView();
    addToHistory();
    lastPlayTimeRef.current = Date.now();

    if (!syncTimerRef.current) {
      syncTimerRef.current = setInterval(() => {
        const videoEl = videoRef.current;
        if (!videoEl || videoEl.paused || videoEl.ended) return;
        const now = Date.now();
        const elapsed = Math.floor((now - lastPlayTimeRef.current) / 1000);
        totalWatchedRef.current += elapsed;
        lastPlayTimeRef.current = now;
        const delta = totalWatchedRef.current - lastSyncedRef.current;
        if (delta >= 10) {
          sendWatchTime(delta);
          lastSyncedRef.current = totalWatchedRef.current;
        }
      }, 5000);
    }
  };

  /** Pause tracking */
  const handlePauseOrEnd = async () => {
    if (!lastPlayTimeRef.current) return;
    const elapsed = Math.floor((Date.now() - lastPlayTimeRef.current) / 1000);
    totalWatchedRef.current += elapsed;
    lastPlayTimeRef.current = null;
    const unsynced = totalWatchedRef.current - lastSyncedRef.current;
    if (unsynced > 0) {
      await sendWatchTime(unsynced);
      lastSyncedRef.current = totalWatchedRef.current;
    }
    triggerAnimation("pause");
  };

  /** Overlay animations */
  const triggerAnimation = (type) => {
    setAnimationType(type);
    setTimeout(() => setAnimationType(null), 800);
  };

  /** Skip 10s */
  const skip = (sec) => {
    const videoEl = videoRef.current;
    if (!videoEl) return;
    videoEl.currentTime = Math.min(
      Math.max(0, videoEl.currentTime + sec),
      videoEl.duration || Infinity
    );
    triggerAnimation(sec > 0 ? "forward" : "backward");
  };

  /** Mobile double tap skip */
  const handleTouch = (e) => {
    const now = new Date().getTime();
    const gap = now - lastTap;
    if (gap < 300 && e.targetTouches.length === 1) {
      const tapX = e.changedTouches[0].clientX;
      const width = window.innerWidth;
      if (tapX < width / 2) skip(-10);
      else skip(10);
    }
    lastTap = now;
  };

  /** Keyboard shortcuts */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        document.activeElement.tagName === "INPUT" ||
        document.activeElement.tagName === "TEXTAREA"
      )
        return;

      const vid = videoRef.current;
      if (!vid) return;

      if (e.code === "ArrowRight") {
        e.preventDefault();
        skip(10);
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        skip(-10);
      } else if (e.code === "Space") {
        e.preventDefault();
        if (vid.paused) {
          vid.play();
        } else {
          vid.pause();
          triggerAnimation("pause");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /** Fullscreen fix for overlay */
  useEffect(() => {
    const handleFullscreenChange = () => {
      const container = containerRef.current;
      if (document.fullscreenElement && container) {
        container.classList.add("fullscreen-active");
      } else {
        container?.classList.remove("fullscreen-active");
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.addEventListener("touchend", handleTouch);
    return () => vid.removeEventListener("touchend", handleTouch);
  }, []);

  useEffect(() => {
    const handleUnload = async () => {
      await handlePauseOrEnd();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, []);

  useEffect(() => {
    return () => {
      if (syncTimerRef.current) {
        clearInterval(syncTimerRef.current);
        syncTimerRef.current = null;
      }
    };
  }, []);

  /** Like/Share/Comments */
  const like = async () => {
    try {
      await api.post(`/videos/${id}/like`);
      load();
    } catch {
      toast.error("Failed to like video");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: video.title, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.info("Link copied to clipboard");
      }
      await api.post(`/videos/${id}/share`);
    } catch {
      toast.error("Share failed");
    }
  };

  const addComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/comments/${id}`, { text });
      setText("");
      load();
    } catch {
      toast.error("Failed to post comment");
    }
  };

  const delComment = async (cid) => {
    const c = comments.find((c) => c._id === cid);
    if (!c) return;
    if (!user || String(c.user?._id) !== String(user.id || user._id)) {
      toast.warn("You can only delete your own comments");
      return;
    }
    try {
      await api.delete(`/comments/item/${cid}`);
      load();
    } catch {
      toast.error("Failed to delete comment");
    }
  };

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
        <div className="col-lg-8">
          <div ref={containerRef} className="video-player-container position-relative shadow-sm">
            <video
              ref={videoRef}
              className="video-player"
              src={video.url}
              controls
              poster={video.thumbnail || ""}
              onPlay={handlePlay}
              onPause={handlePauseOrEnd}
              onEnded={handlePauseOrEnd}
              onDoubleClick={(e) => {
                e.preventDefault();
                const rect = e.target.getBoundingClientRect();
                if (e.clientX < rect.left + rect.width / 2) skip(-10);
                else skip(10);
              }}
            />
            {animationType === "pause" && (
              <div className="video-symbol pause active">
                <div className="pause-bars">
                  <div className="bar left"></div>
                  <div className="bar right"></div>
                </div>
              </div>
            )}
            {animationType === "forward" && (
              <div className="video-symbol forward active">
                <FaRedoAlt className="symbol-icon" />
                <span className="symbol-text">10</span>
              </div>
            )}
            {animationType === "backward" && (
              <div className="video-symbol backward active">
                <FaUndoAlt className="symbol-icon" />
                <span className="symbol-text">10</span>
              </div>
            )}
          </div>

          <h3 className="video-title mt-3">{video.title}</h3>
          <p className="text-secondary small mb-1">
            Uploaded {video.createdAt ? timeAgo(video.createdAt) : ""}
          </p>

          <hr className="video-divider" />
          <h6 className="text-light mb-2">Description</h6>
          <p className="text-secondary video-description">{video.description}</p>

          <div className="d-flex align-items-center gap-3 mt-3 video-actions">
            <button
              className={`btn btn-like ${likedByUser ? "liked" : ""}`}
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

          {/* Comments */}
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
                        `https://ui-avatars.com/api/?name=${encodeURIComponent(
                          c.user?.name || "User"
                        )}`
                      }
                      alt={c.user?.name}
                      className="comment-avatar me-3"
                    />
                    <div className="comment-body flex-grow-1">
                      <div className="comment-header">
                        <div className="comment-info">
                          <small className="comment-author">
                            {c.user?.name || "Unknown User"}
                          </small>
                          <small className="comment-timestamp">
                            {c.createdAt ? timeAgo(c.createdAt) : ""}
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

        {/* Related videos */}
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
                    <video src={rv.url} muted poster={rv.thumbnail || ""}></video>
                  </div>
                  <div className="related-info">
                    <p className="related-title text-light mb-1">{rv.title}</p>
                    <small className="text-secondary">
                      {rv.user?.name || "Unknown"}
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
