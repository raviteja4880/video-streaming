import React, { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaEye, FaClock } from 'react-icons/fa';
import './videoCard.css';

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
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      video.user?.name || 'User'
    )}`;

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
      className="vcard-link"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="vcard">
        {/* Thumbnail */}
        <div className="vcard-thumbnail">
          <video
            ref={videoRef}
            src={video.url}
            muted
            playsInline
            preload="metadata"
            poster={video.thumbnail}
            className="vcard-preview"
            onError={(e) => {
              e.currentTarget.poster = '/assets/default-thumbnail.jpg';
            }}
          />
          <div className="vcard-overlay">
            <FaPlayCircle size={50} className="vcard-play-icon" />
            <span className="vcard-watch-now">Watch Now</span>
          </div>
        </div>

        {/* Video Info */}
        <div className="vcard-info">
          <h6 className="vcard-title mb-2">{video.title}</h6>

          <div className="vcard-meta">
            <div className="vcard-author">
              <img
                src={avatarUrl}
                alt="user"
                className="vcard-author-avatar"
                onError={(e) => {
                  e.target.src = '/assets/default-avatar.png';
                }}
              />
              <span className="vcard-author-name">
                {video.user?.name || 'Unknown'}
              </span>
            </div>

            <div className="vcard-meta-right">
              <span className="vcard-meta-item">
                <FaEye className="vcard-meta-icon" /> {video.views || 0} views
              </span>
              <span className="vcard-meta-separator">•</span>
              <span className="vcard-meta-item">
                <FaClock className="vcard-meta-icon" />{' '}
                {timeAgo(video.createdAt)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(VideoCard);
