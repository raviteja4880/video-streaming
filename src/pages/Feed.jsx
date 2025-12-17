import React, { useEffect, useState } from "react";
import api from "../api/client";
import VideoCard from "../components/VideoCard";
import VideoSkeleton from "../components/VideoSkeleton";
import "../pages/Feed.css";
import { FaMicrophone, FaMicrophoneSlash, FaSearch } from "react-icons/fa";
import Fuse from "fuse.js";

const PAGE_SIZE = 8; 

export default function Feed() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiReady, setApiReady] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);

  const [listening, setListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showVoicePanel, setShowVoicePanel] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");

  /* ---------- Fetch videos ---------- */
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get("/videos");
        setVideos(data);
        setApiReady(true);
      } catch (err) {
        console.warn("Backend waking up, retrying...", err.message);
      } finally {
        setLoading(false);
      }
    };

    load();

    /* ---------- Voice search setup ---------- */
    if ("webkitSpeechRecognition" in window || "SpeechRecognition" in window) {
      const SR =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      const recog = new SR();
      recog.continuous = true;
      recog.lang = "en-US";
      recog.interimResults = true;

      recog.onresult = (e) => {
        let text = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          text += e.results[i][0].transcript;
        }
        setLiveTranscript(text);

        if (e.results[e.results.length - 1].isFinal) {
          setSearchQuery(text);
          setListening(false);
          setShowVoicePanel(false);
          setLiveTranscript("");
        }
      };

      recog.onend = () => {
        setListening(false);
        setShowVoicePanel(false);
      };

      setRecognition(recog);
    }
  }, []);

  /* ---------- Auto retry while backend wakes ---------- */
  useEffect(() => {
    if (!apiReady) {
      const retry = setTimeout(async () => {
        try {
          setLoading(true);
          const { data } = await api.get("/videos");
          setVideos(data);
          setApiReady(true);
        } catch {
          // still sleeping → keep skeleton
        } finally {
          setLoading(false);
        }
      }, 3000);

      return () => clearTimeout(retry);
    }
  }, [apiReady]);

  /* ---------- Voice ---------- */
  const handleVoiceSearch = () => {
    if (!recognition) return alert("Voice search not supported");
    if (listening) {
      recognition.stop();
      setListening(false);
    } else {
      recognition.start();
      setListening(true);
      setShowVoicePanel(true);
    }
  };

  /* ---------- Search ---------- */
  const fuse = new Fuse(videos, {
    keys: ["title", "description"],
    threshold: 0.4,
  });

  const filteredVideos =
    searchQuery.trim() === ""
      ? videos
      : fuse.search(searchQuery).map((r) => r.item);

  const totalPages = Math.ceil(filteredVideos.length / PAGE_SIZE);

  const visibleVideos = filteredVideos.slice(
    page * PAGE_SIZE,
    page * PAGE_SIZE + PAGE_SIZE
  );

  const nextPage = () =>
    page < totalPages - 1 && setPage((p) => p + 1);
  const prevPage = () =>
    page > 0 && setPage((p) => p - 1);

  /* Reset page on search */
  useEffect(() => {
    setPage(0);
  }, [searchQuery]);

  return (
    <div className="feed-page">
      {/* ---------- Search Bar ---------- */}
      <div className="search-bar">
        <div className="search-input-container">
          <FaSearch className="search-icon" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search videos..."
          />
          <button
            className={`mic-btn ${listening ? "active" : ""}`}
            onClick={handleVoiceSearch}
          >
            {listening ? <FaMicrophoneSlash /> : <FaMicrophone />}
          </button>
        </div>
      </div>

      {/* ---------- Voice Panel ---------- */}
      {showVoicePanel && (
        <div className="voice-panel">
          <div className="voice-wave" />
          <p className="voice-text">
            {liveTranscript || "Listening..."}
          </p>
        </div>
      )}

      {/* ---------- Content ---------- */}
      {loading || !apiReady ? (
        <div className="video-scroll-row">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <VideoSkeleton key={i} />
          ))}
          <p className="text-center text-secondary mt-3">
            Waking up server, please wait…
          </p>
        </div>
      ) : visibleVideos.length > 0 ? (
        <div className="video-scroll-wrapper">
          {filteredVideos.length > PAGE_SIZE && (
            <>
              <button
                className="scroll-btn left"
                onClick={prevPage}
                disabled={page === 0}
              >
                ‹
              </button>
              <button
                className="scroll-btn right"
                onClick={nextPage}
                disabled={page === totalPages - 1}
              >
                ›
              </button>
            </>
          )}

          <div className="video-scroll-row">
            {visibleVideos.map((v) => (
              <VideoCard key={v._id} video={v} />
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center text-secondary">
          No videos found.
        </p>
      )}
    </div>
  );
}
