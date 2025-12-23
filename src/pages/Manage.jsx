import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import { toast } from "react-toastify";

// Recharts
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#00E5FF", "#FFB300"];

export default function CreatorVideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [video, setVideo] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [tab, setTab] = useState("analytics");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    const videoRes = await api.get(`/videos/${id}`);
    const analyticsRes = await api.get(`/videos/${id}/analytics`);

    setVideo(videoRes.data);
    setAnalytics(analyticsRes.data);
    setTitle(videoRes.data.title);
    setDescription(videoRes.data.description);
  };

  const updateVideo = async () => {
    try {
      await api.put(`/videos/${id}`, { title, description });
      toast.success("Video updated successfully");
    } catch {
      toast.error("Failed to update video");
    }
  };

  const deleteVideo = async () => {
    try {
      await api.delete(`/videos/${id}`);
      toast.success("Video deleted");
      navigate("/dashboard");
    } catch {
      toast.error("Failed to delete video");
    }
  };

  if (!video || !analytics) {
    return (
      <div className="vh-100 d-flex justify-content-center align-items-center text-light">
        Loading video analytics...
      </div>
    );
  }

  return (
    <div className="container py-4 text-light">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 style={{ color: "#EAEAEA" }}>{video.title}</h3>
      </div>

      {/* Tabs */}
      <div className="mb-4">
        <button
          className={`btn me-2 ${
            tab === "analytics" ? "btn-info" : "btn-outline-info"
          }`}
          onClick={() => setTab("analytics")}
        >
          Analytics
        </button>

        <button
          className={`btn ${
            tab === "edit" ? "btn-info" : "btn-outline-info"
          }`}
          onClick={() => setTab("edit")}
        >
          Edit Video
        </button>
      </div>

      {/* Content */}
      {tab === "analytics" && <AnalyticsSection data={analytics} />}
      {tab === "edit" && (
        <EditSection
          title={title}
          description={description}
          setTitle={setTitle}
          setDescription={setDescription}
          onSave={updateVideo}
          videoUrl={video.url}
          onDelete={deleteVideo}
        />
      )}
    </div>
  );
}

const formatWatchTime = (seconds) => {
  if (seconds < 60) return `${seconds} sec`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(2)} min`;
  return `${(seconds / 3600).toFixed(2)} hrs`;
};

/* ================= ANALYTICS ================= */

function AnalyticsSection({ data }) {
  const viewsData = [
    { name: "Users", value: data.userViews },
    { name: "Guests", value: data.guestViews },
  ];

  const watchData = [
    { name: "Users", value: data.userWatchTime },
    { name: "Guests", value: data.guestWatchTime },
  ];

  const engagementData = [
    { name: "Likes", value: data.likes },
    { name: "Shares", value: data.shares },
  ];

  return (
    <>
      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <KPI title="Total Views" value={data.views} />
        <KPI title="Total Likes" value={data.likes} />
        <KPI title="Average Watch Time" value={formatWatchTime(data.avgWatchTime)} />
        <KPI title="Total Watch Time" value={formatWatchTime(data.totalWatchTime)} />
      </div>

      <div className="row">
        {/* Views */}
        <div className="col-md-6 mb-4">
          <ChartCard title="User vs Guest Views">
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={viewsData}>
                <XAxis dataKey="name" stroke="#B0BEC5" />
                <YAxis stroke="#B0BEC5" />
                <Tooltip />
                <Bar dataKey="value" fill="#00E5FF" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Watch Time */}
        <div className="col-md-6 mb-4">
        <ChartCard title="User vs Guest Watch Time">
            <ResponsiveContainer width="100%" height={260}>
            <PieChart>
                <Pie
                data={watchData}
                dataKey="value"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={6}
                >
                {watchData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                ))}
                </Pie>

                <Tooltip
                formatter={(value) => formatWatchTime(value)}
                contentStyle={{
                    backgroundColor: "#121212",
                    border: "1px solid #333",
                    borderRadius: "8px",
                    color: "#EAEAEA",
                }}
                labelStyle={{
                    color: "#00E5FF",
                    fontWeight: 600,
                }}
                itemStyle={{
                    color: "#EAEAEA",
                }}
                />
            </PieChart>
            </ResponsiveContainer>
        </ChartCard>
        </div>
      </div>

      {/* Engagement */}
      <ChartCard title="Engagement (Likes & Shares)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={engagementData} layout="vertical">
            <XAxis type="number" stroke="#B0BEC5" />
            <YAxis type="category" dataKey="name" stroke="#B0BEC5" />
            <Tooltip />
            <Bar dataKey="value" fill="#4CAF50" radius={[0, 6, 6, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </>
  );
}

/* ================= EDIT ================= */

function EditSection({
  title,
  description,
  setTitle,
  setDescription,
  onSave,
  videoUrl,
  onDelete,
}) {
  const confirmDelete = () => {
    toast.warn(
      <div style={{ textAlign: "center" }}>
        <p>Delete this video permanently?</p>
        <div className="d-flex justify-content-center gap-2 mt-2">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => {
              toast.dismiss();
              onDelete();
            }}
          >
            Yes, Delete
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        theme: "dark",
      }
    );
  };

  return (
    <div className="card bg-dark p-4 text-light">
      {/* Video Preview */}
      <div className="mb-4">
        <video
          src={videoUrl}
          controls
          className="w-100 rounded"
          style={{ maxHeight: "360px", background: "#000" }}
        />
      </div>

      <label className="mb-2">Title</label>
      <input
        className="form-control mb-3 bg-black text-light"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label className="mb-2">Description</label>
      <textarea
        className="form-control mb-3 bg-black text-light"
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="d-flex justify-content-between align-items-center mt-3">
        <button className="btn btn-info" onClick={onSave}>
          Save Changes
        </button>

        <button className="btn btn-outline-danger" onClick={confirmDelete}>
          Delete Video
        </button>
      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */

function KPI({ title, value }) {
  return (
    <div className="col-md-3 col-6">
      <div className="card bg-dark text-center p-3 shadow-sm">
        <h4 style={{ color: "#00E5FF" }}>{value}</h4>
        <small style={{ color: "#B0BEC5" }}>{title}</small>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="card bg-dark p-3 shadow-sm">
      <h6 className="mb-3" style={{ color: "#EAEAEA" }}>
        {title}
      </h6>
      {children}
    </div>
  );
}
