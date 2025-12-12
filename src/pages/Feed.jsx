import React, { useEffect, useState } from 'react';
import api from '../api/client';
import VideoCard from '../components/VideoCard';
import '../pages/Feed.css';
import { FaMicrophone, FaMicrophoneSlash, FaSearch } from 'react-icons/fa';
import Fuse from 'fuse.js';

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');

  useEffect(() => {
    api.get('/videos').then(({ data }) => setVideos(data));

    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SpeechRecognition();
      recog.continuous = true;
      recog.lang = 'en-US';
      recog.interimResults = true;

      recog.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setLiveTranscript(transcript);
        if (event.results[event.results.length - 1].isFinal) {
          setSearchQuery(transcript);
          setListening(false);
          setShowVoicePanel(false);
          setLiveTranscript('');
        }
      };

      recog.onend = () => {
        setListening(false);
        setShowVoicePanel(false);
      };

      setRecognition(recog);
    }
  }, []);

  const handleVoiceSearch = () => {
    if (!recognition) {
      alert('Voice recognition not supported in this browser.');
      return;
    }

    if (listening) {
      recognition.stop();
      setListening(false);
      setShowVoicePanel(false);
    } else {
      setShowVoicePanel(true);
      recognition.start();
      setListening(true);
    }
  };

  const fuse = new Fuse(videos, {
    keys: ['title', 'description'],
    threshold: 0.4,
  });

  const filteredVideos =
    searchQuery.trim() === ''
      ? videos
      : fuse.search(searchQuery).map((r) => r.item);

  return (
    <div className="feed-page">
      <div className="search-bar">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search videos..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button
            className={`mic-btn ${listening ? 'active' : ''}`}
            onClick={handleVoiceSearch}
          >
            {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </div>
      </div>

      {/* Voice Assistant Dropdown */}
      {showVoicePanel && (
        <div className="voice-panel">
          <div className="voice-wave"></div>
          <p className="voice-text">
            {liveTranscript ? (
              <span>{liveTranscript}</span>
            ) : (
              <span className="listening-text">Listening...</span>
            )}
          </p>
          <p className="hint-text">Speak something like “music”</p>
        </div>
      )}

      {/* Video Grid */}
      <div className="video-grid">
        {filteredVideos.length > 0 ? (
          filteredVideos.map((v) => <VideoCard key={v._id} video={v} />)
        ) : (
          <p className="text-secondary text-center mt-5">
            No videos found for “{searchQuery}”.
          </p>
        )}
      </div>
    </div>
  );
}
