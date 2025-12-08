import React, { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaHeart } from 'react-icons/fa';
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

  return (
    <Link
      to={`/video/${video._id}`}
      className="video-card-link"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="video-card">
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
            <FaPlayCircle size={48} className="play-icon" />
          </div>
        </div>

        <div className="video-info">
          {/* User section */}
          <div className="video-author d-flex align-items-center gap-2 mb-1">
            <img
              src={avatarUrl}
              alt={video.user?.name || 'User'}
              className="video-author-avatar"
            />
            <span className="video-author-name">
              {video.user?.name || 'Unknown'}
            </span>
          </div>

          {/* Video title & likes */}
          <h6 className="video-title mb-1">{video.title}</h6>
          <div className="video-meta d-flex align-items-center justify-content-between">
            <span className="video-likes d-flex align-items-center gap-1">
              <FaHeart className="text-danger" />
              {video.likes?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(VideoCard);
