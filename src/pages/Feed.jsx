import React, { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import VideoCard from '../components/VideoCard';
import VideoSkeleton from "../components/VideoSkeleton";
import '../pages/Feed.css';
import { FaMicrophone, FaMicrophoneSlash, FaSearch } from 'react-icons/fa';
import Fuse from 'fuse.js';

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [showAll, setShowAll] = useState(false);

  const scrollRef = useRef(null);

  // ---------- Fetch videos ----------
  useEffect(() => {
    const loadVideos = async () => {
      try {
        const { data } = await api.get('/videos');
        setVideos(data);
      } catch (err) {
        console.error('Failed to load videos', err);
      } finally {
        setLoading(false);
      }
    };

    loadVideos();

    // Voice recognition setup
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

  // ---------- Mic handler ----------
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

  // ---------- Search ----------
  const fuse = new Fuse(videos, {
    keys: ['title', 'description'],
    threshold: 0.4,
  });

  const filteredVideos =
    searchQuery.trim() === ''
      ? videos
      : fuse.search(searchQuery).map((r) => r.item);

  const visibleVideos = showAll
    ? filteredVideos
    : filteredVideos.slice(0, 15);

  // ---------- Horizontal scroll ----------
  const scrollBy = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="feed-page">
      {/* ---------- Search Bar ---------- */}
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

      {/* ---------- Voice Panel ---------- */}
      {showVoicePanel && (
        <div className="voice-panel">
          <div className="voice-wave"></div>
          <p className="voice-text">
            {liveTranscript || <span className="listening-text">Listening...</span>}
          </p>
          <p className="hint-text">Speak something like “music”</p>
        </div>
      )}

      {/* ---------- Video Scroll Section ---------- */}
      {loading ? (
        <div className="video-scroll-wrapper">
          <div className="video-scroll-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <VideoSkeleton key={i} />
            ))}
          </div>

          <p className="text-secondary text-center mt-4 fw-semibold">
            Please wait, we’re getting things ready for you…
          </p>
        </div>
      ) : visibleVideos.length > 0 ? (
        <>
          <div className="video-scroll-wrapper">
            {/* Scroll buttons hidden while loading */}
            {visibleVideos.length > 4 && (
              <>
                <button
                  className="scroll-btn left"
                  onClick={() => scrollBy('left')}
                  title="Scroll Left"
                >
                  ‹
                </button>
                <button
                  className="scroll-btn right"
                  onClick={() => scrollBy('right')}
                  title="Scroll Right"
                >
                  ›
                </button>
              </>
            )}

            <div className="video-scroll-row" ref={scrollRef}>
              {visibleVideos.map((v) => (
                <VideoCard key={v._id} video={v} />
              ))}
            </div>
          </div>

          {filteredVideos.length > 15 && !showAll && (
            <div className="text-center mt-3">
              <button
                className="btn btn-outline-info px-4 py-2"
                onClick={() => setShowAll(true)}
              >
                View All Videos ({filteredVideos.length})
              </button>
            </div>
          )}
        </>
      ) : (
        <p className="text-secondary text-center mt-5">
          No videos found for “{searchQuery}”.
        </p>
      )}
    </div>
  );
}
