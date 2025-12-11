import React from "react";
import { useUpload } from "../context/UploadContext";
import { FaTimesCircle, FaVideo } from "react-icons/fa";

export default function UploadStatusBar() {
  const { uploading, progress, fileName, cancelUpload } = useUpload();
  if (!uploading) return null;

  return (
    <div
      className="position-fixed bottom-0 end-0 m-3 p-3 rounded-3 shadow-lg"
      style={{
        width: "320px",
        background: "#181818",
        border: "1px solid #333",
        zIndex: 9999,
      }}
    >
      <div className="d-flex align-items-center justify-content-between mb-2">
        <div className="d-flex align-items-center gap-2">
          <FaVideo className="text-info" />
          <div>
            <strong className="text-light small d-block">
              {fileName?.length > 25
                ? fileName.slice(0, 25) + "…"
                : fileName || "Uploading..."}
            </strong>
            <small className="text-secondary">
              {progress < 100 ? "Uploading..." : "Finalizing..."}
            </small>
          </div>
        </div>
        <button
          onClick={cancelUpload}
          className="btn btn-sm btn-outline-danger border-0"
          title="Cancel upload"
        >
          <FaTimesCircle />
        </button>
      </div>

      <div
        className="progress"
        style={{
          height: "8px",
          background: "#222",
          borderRadius: "5px",
        }}
      >
        <div
          className="progress-bar bg-info"
          role="progressbar"
          style={{
            width: `${progress}%`,
            transition: "width 0.3s ease",
          }}
        ></div>
      </div>

      <small className="text-warning d-block mt-2">
        Don’t reload or navigate until upload completes.
      </small>
    </div>
  );
}
