import React, { memo, useRef } from 'react';
import { Link } from 'react-router-dom';
import { FaPlayCircle, FaHeart } from 'react-icons/fa';
import '../pages/VideoCard.css';

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
          <h6 className="video-title">{video.title}</h6>
          <div className="video-meta">
            <span className="video-author">
              {video.user?.name || 'Unknown'}
            </span>
            <span className="video-likes">
              <FaHeart className="text-danger me-1" />
              {video.likes?.length || 0}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default memo(VideoCard);
