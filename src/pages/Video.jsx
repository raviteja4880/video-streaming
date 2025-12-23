import React, { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  FaHeart,
  FaShareAlt,
  FaEye,
  FaRedoAlt,
  FaUndoAlt,
} from "react-icons/fa";
import "../pages/video.css";
import { Helmet } from "react-helmet-async";
import VideoCard from "../components/VideoCard";
import CommentList from "../components/CommentList";

export default function Video() {
  const { id } = useParams();
  const { user } = useAuth();

  /* ---------- Guest ID (REQUIRED FOR DB LIKES) ---------- */
  const getGuestId = () => {
    let gid = localStorage.getItem("guestId");
    if (!gid) {
      gid = crypto.randomUUID();
      localStorage.setItem("guestId", gid);
    }
    return gid;
  };
  const guestId = !user ? getGuestId() : null;

  const [video, setVideo] = useState(null);
  const [comments, setComments] = useState([]);
  const [related, setRelated] = useState([]);
  const [allVideos, setAllVideos] = useState([]);
  const [text, setText] = useState("");
  const [animationType, setAnimationType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const totalWatchedRef = useRef(0);
  const lastPlayTimeRef = useRef(null);
  const lastSyncedRef = useRef(0);
  const syncTimerRef = useRef(null);
  let lastTap = 0;

  /* ---------- Mobile Detection ---------- */
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 992);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  /* ---------- Load Data ---------- */
  const load = async () => {
    try {
      const [v, c, all] = await Promise.all([
        api.get(`/videos/${id}`),
        api.get(`/comments/${id}`),
        api.get(`/videos`),
      ]);

      setVideo(v.data);
      setComments(c.data);

      const others = all.data.filter((vid) => vid._id !== id);
      setAllVideos(others);
      setRelated(others.slice(0, 6));
    } catch {
      toast.error("Failed to load video");
    }
  };

  useEffect(() => {
    load();

    totalWatchedRef.current = 0;
    lastPlayTimeRef.current = null;
    lastSyncedRef.current = 0;
    viewRegisteredRef.current = false;

    if (syncTimerRef.current) clearInterval(syncTimerRef.current);
  }, [id]);

  /* ---------- Watch Tracking ---------- */
  const addToHistory = async () => {
    if (!user) return;
    try {
      await api.post(`/history/${id}`);
    } catch {}
  };

  const sendWatchTime = async (seconds) => {
    if (seconds <= 0) return;

    if (!viewRegisteredRef.current && totalWatchedRef.current >= 5) {
      try {
        await api.post(`/videos/${id}/view`, {
          viewerId: guestId,
        });
        viewRegisteredRef.current = true;
      } catch {}
    }

    try {
      await api.post(`/videos/${id}/watchtime`, {
        secondsWatched: seconds,
      });
    } catch {}
  };
  const viewRegisteredRef = useRef(false);

  const handlePlay = () => {
    addToHistory();
    lastPlayTimeRef.current = Date.now();

    if (!syncTimerRef.current) {
      syncTimerRef.current = setInterval(() => {
        const vid = videoRef.current;
        if (!vid || vid.paused || vid.ended) return;

        const now = Date.now();
        const elapsed = Math.floor((now - lastPlayTimeRef.current) / 1000);
        totalWatchedRef.current += elapsed;
        lastPlayTimeRef.current = now;

        const delta =
          totalWatchedRef.current - lastSyncedRef.current;
        if (delta >= 10) {
          sendWatchTime(delta);
          lastSyncedRef.current = totalWatchedRef.current;
        }
      }, 5000);
    }
  };
  
  useEffect(() => {
  return () => {
    if (syncTimerRef.current) {
      clearInterval(syncTimerRef.current);
      syncTimerRef.current = null;
    }
  };
}, []);

  const handlePauseOrEnd = async () => {
    if (!lastPlayTimeRef.current) return;
    const elapsed = Math.floor(
      (Date.now() - lastPlayTimeRef.current) / 1000
    );
    totalWatchedRef.current += elapsed;
    lastPlayTimeRef.current = null;

    const unsynced =
      totalWatchedRef.current - lastSyncedRef.current;
    if (unsynced > 0) {
      await sendWatchTime(unsynced);
      lastSyncedRef.current = totalWatchedRef.current;
    }
    triggerAnimation("pause");
  };

  /* ---------- Controls ---------- */
  const triggerAnimation = (type) => {
    setAnimationType(type);
    setTimeout(() => setAnimationType(null), 800);
  };

  const skip = (sec) => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.currentTime = Math.min(
      Math.max(0, vid.currentTime + sec),
      vid.duration || Infinity
    );
    triggerAnimation(sec > 0 ? "forward" : "backward");
  };

  const handleTouch = (e) => {
    const now = Date.now();
    if (now - lastTap < 300) {
      const tapX = e.changedTouches[0].clientX;
      if (tapX < window.innerWidth / 2) skip(-10);
      else skip(10);
    }
    lastTap = now;
  };

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.addEventListener("touchend", handleTouch);
    return () => vid.removeEventListener("touchend", handleTouch);
  }, []);

  /* ---------- Like / Share ---------- */
  const like = async () => {
    try {
      await api.post(`/videos/${id}/like`, {
        viewerId: guestId,
      });
      load();
    } catch {
      toast.error("Failed to like video");
    }
  };

  const share = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: video.title,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.info("Link copied");
      }
      await api.post(`/videos/${id}/share`);
    } catch {
      toast.error("Share failed");
    }
  };

  /* ---------- Comments ---------- */
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
    return `${Math.floor(diff / 86400)}d ago`;
  };

  if (!video) return <div className="loading">Loading...</div>;

  /* ---------- LIKE STATE (USER + GUEST) ---------- */
  const likedByUser =
    (user && video.likes?.includes(user._id)) ||
    (!user && video.likes?.includes(guestId));

  return (
    <>
      <Helmet>
        <title>{video.title} – Streamify</title>
      </Helmet>

      <div className="video-page container-fluid py-4">
        <div className="row gx-5 gy-4">
          <div className="col-lg-8">
            <div
              ref={containerRef}
              className="video-player-container position-relative"
            >
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
                  const rect = e.target.getBoundingClientRect();
                  if (e.clientX < rect.left + rect.width / 2) skip(-10);
                  else skip(10);
                }}
              />
              {animationType === "forward" && (
                <div className="video-symbol forward active">
                  <FaRedoAlt /> 10
                </div>
              )}
              {animationType === "backward" && (
                <div className="video-symbol backward active">
                  <FaUndoAlt /> 10
                </div>
              )}
            </div>

            <h3 className="mt-3">{video.title}</h3>
            <p className="text-secondary small">
              Uploaded {timeAgo(video.createdAt)}
            </p>

            <div className="video-actions d-flex gap-3">
              <button
                className={`btn btn-like ${likedByUser ? "liked" : ""}`}
                onClick={like}
              >
                <FaHeart /> {video.likes?.length || 0}
              </button>

              <button className="btn btn-share" onClick={share}>
                <FaShareAlt /> Share
              </button>

              <span className="text-secondary">
                <FaEye /> {video.views || 0}
              </span>
            </div>

            <div className="comment-section mt-5">
              <h5>Comments ({comments.length})</h5>

              {user ? (
                <form onSubmit={addComment} className="d-flex gap-2 mb-3">
                  <input
                    className="form-control bg-dark text-light"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Add a comment..."
                  />
                  <button className="btn btn-primary">Post</button>
                </form>
              ) : (
                <div className="d-flex gap-2 mb-3 align-items-center">
                  <input
                    className="form-control bg-dark text-secondary"
                    disabled
                    placeholder="Sign in to add a comment"
                  />
                  <Link to="/login" className="btn btn-outline-primary">
                    Sign in
                  </Link>
                </div>
              )}

              {comments.length > 0 ? (
                <CommentList
                  comments={comments}
                  meId={user?.id || user?._id}
                  onDelete={delComment}
                />
              ) : (
                <p className="text-secondary small">No comments yet.</p>
              )}
            </div>

            {isMobile && (
              <div className="mt-5">
                <h5 className="mb-3">More Videos</h5>
                <div className="d-flex flex-column gap-3">
                  {allVideos.slice(0, 6).map((v) => (
                    <VideoCard key={v._id} video={v} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {!isMobile && (
            <div className="col-lg-4">
              <div className="related-section p-3">
                <h5 className="mb-3">Related Videos</h5>
                {related.map((rv) => (
                  <Link
                    key={rv._id}
                    to={`/video/${rv._id}`}
                    className="related-item"
                  >
                    <div className="related-thumb">
                      <video
                        src={rv.url}
                        muted
                        poster={rv.thumbnail || ""}
                      />
                    </div>

                    <div className="related-info">
                      <p className="related-title">{rv.title}</p>
                      <div className="related-author-row">
                        <img
                          className="related-avatar"
                          src={
                            rv.user?.avatar ||
                            `https://ui-avatars.com/api/?name=${encodeURIComponent(
                              rv.user?.name || "User"
                            )}&background=0d1117&color=fff`
                          }
                          alt={rv.user?.name}
                        />
                        <span className="related-author">
                          {rv.user?.name || "Unknown"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
