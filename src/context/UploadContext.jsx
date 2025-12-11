import React, { createContext, useContext, useState, useRef } from "react";
import api from "../api/client";
import axios from "axios";
import { toast } from "react-toastify";

const UploadContext = createContext();
export const useUpload = () => useContext(UploadContext);

export function UploadProvider({ children }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [fileName, setFileName] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);
  const cancelToken = useRef(null);

  const uploadVideo = async (formData, onComplete) => {
    try {
      setUploading(true);
      setProgress(0);
      setFileName(formData.get("video")?.name || "Uploading video");

      cancelToken.current = axios.CancelToken.source();

      await api.post("/videos", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        cancelToken: cancelToken.current.token,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
        },
      });

      toast.success("Upload complete!");
      onComplete?.();
    } catch (err) {
      if (axios.isCancel(err)) toast.info("Upload cancelled.");
      else toast.error("Upload failed.");
    } finally {
      setUploading(false);
      setProgress(0);
      setFileName("");
      cancelToken.current = null;
      setIsCancelling(false);
    }
  };

  const cancelUpload = () => {
    if (!uploading || isCancelling) return; // prevent duplicate triggers
    setIsCancelling(true);
    toast.dismiss(); // clear previous toasts
    toast.warn(
      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: "8px" }}>
          Are you sure you want to cancel this upload?
        </p>
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-danger btn-sm px-3"
            onClick={() => {
              cancelToken.current?.cancel("User cancelled upload");
              setUploading(false);
              setProgress(0);
              toast.dismiss();
              toast.info("Upload cancelled.");
              setIsCancelling(false);
            }}
          >
            Yes, Cancel
          </button>
          <button
            className="btn btn-secondary btn-sm px-3"
            onClick={() => {
              toast.dismiss();
              setIsCancelling(false);
            }}
          >
            No, Continue
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        theme: "dark",
      }
    );
  };

  return (
    <UploadContext.Provider
      value={{
        uploading,
        progress,
        fileName,
        uploadVideo,
        cancelUpload,
        isCancelling,
      }}
    >
      {children}
    </UploadContext.Provider>
  );
}
