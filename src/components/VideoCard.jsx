import React, { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaEye, FaClock } from 'react-icons/fa';
import '../pages/videoCard.css';

function VideoCard({ video }) {
  const videoRef = useRef(null);

  const handleMouseEnter = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  const avatarUrl =
    video.user?.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(video.user?.name || 'User')}`;

  const timeAgo = (date) => {
    const diff = Math.floor((Date.now() - new Date(date)) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <Link
      to={`/video/${video._id}`}
      className="video-card-link"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-card">
        {/* Thumbnail */}
        <div className="video-thumbnail">
          <video
            ref={videoRef}
            src={video.url}
            muted
            playsInline
            preload="metadata"
            poster={video.thumbnail || ''}
            className="video-preview"
          />
          <div className="video-overlay">
            <FaPlayCircle size={50} className="play-icon" />
            <span className="watch-now">Watch Now</span>
          </div>
        </div>

        {/* Video Info */}
        <div className="video-info">
          <h6 className="video-title mb-2">{video.title}</h6>

          <div className="video-meta">
            <div className="video-meta-left">
              <span className="meta-item">
                <FaEye className="meta-icon" /> {video.views || 0} views
              </span>
              <span className="meta-separator">•</span>
              <span className="meta-item">
                <FaClock className="meta-icon" /> {timeAgo(video.createdAt)}
              </span>
            </div>

            <div className="video-author d-flex align-items-center gap-1">
              <img src={avatarUrl} alt="user" className="video-author-avatar" />
              <span className="video-author-name">
                {video.user?.name || 'Unknown'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(VideoCard);
