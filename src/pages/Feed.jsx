import React, { useEffect, useState } from 'react';
import api from '../api/client';
import VideoCard from '../components/VideoCard';
import '../pages/Feed.css'; 

export default function Feed() {
  const [videos, setVideos] = useState([]);

  useEffect(() => {
    api.get('/videos').then(({ data }) => setVideos(data));
  }, []);

  return (
    <div className="feed-page">
      <div className="feed-header">
        <h3 className="feed-title">Latest Uploads</h3>
        <p className="feed-subtitle">Discover the most recent videos from creators</p>
      </div>

      <div className="video-grid">
        {videos.length > 0 ? (
          videos.map((v) => <VideoCard key={v._id} video={v} />)
        ) : (
          <p className="text-secondary text-center mt-5">No videos uploaded yet.</p>
        )}
      </div>
    </div>
  );
}
