import React, { useState, useRef } from 'react';
import api from '../api/client';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function Upload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelToken = useRef(null);
  const toastId = useRef(null); 

  // File validation
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const maxSizeMB = 200;
    const allowedTypes = ['video/mp4', 'video/mkv', 'video/webm', 'video/quicktime'];

    if (!allowedTypes.includes(selected.type)) {
      toast.error('Invalid file type. Please upload a valid video (mp4, mkv, webm, mov).');
      e.target.value = '';
      return;
    }

    if (selected.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File too large! Maximum allowed size is ${maxSizeMB}MB.`);
      e.target.value = '';
      return;
    }

    setFile(selected);
    toast.success(`Selected: ${selected.name}`);
  };

  // Upload handler
  const submit = async (e) => {
    e.preventDefault();
    if (!file) {
      toast.warn('Please select a video file first!');
      return;
    }

    setBusy(true);
    setProgress(0);

    const form = new FormData();
    form.append('video', file);
    form.append('title', title);
    form.append('description', description);

    try {
      cancelToken.current = axios.CancelToken.source();
      toastId.current = toast.loading('Uploading video...');

      await api.post('/videos', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
        cancelToken: cancelToken.current.token,
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setProgress(percent);
          toast.update(toastId.current, {
            render: `Uploading: ${percent}%`,
            type: 'info',
            isLoading: true,
          });
        },
      });

      toast.update(toastId.current, {
        render: 'Upload complete! Go to Home to view your video.',
        type: 'success',
        isLoading: false,
        autoClose: 2000,
      });

      setTitle('');
      setDescription('');
      setFile(null);
      setProgress(0);
    } catch (err) {
      if (axios.isCancel(err)) {
        if (toastId.current) {
          toast.update(toastId.current, {
            render: 'Upload cancelled.',
            type: 'warning',
            isLoading: false,
            autoClose: 1500,
          });
        }
      } else {
        if (toastId.current) {
          toast.update(toastId.current, {
            render: `Upload failed: ${err.response?.data?.message || err.message}`,
            type: 'error',
            isLoading: false,
            autoClose: 2000,
          });
        } else {
          toast.error(`Upload failed: ${err.response?.data?.message || err.message}`);
        }
      }
    } finally {
      setBusy(false);
      cancelToken.current = null;
    }
  };

  // Cancel upload
  const handleCancel = () => {
    if (cancelToken.current) {
      cancelToken.current.cancel('User cancelled the upload.');
      cancelToken.current = null;
    }
    setBusy(false);
    setProgress(0);
  };

  return (
    <form onSubmit={submit} className="mx-auto" style={{ maxWidth: 640 }}>
      <h3 className="mb-3">Upload Video</h3>

      <div className="mb-3">
        <label className="form-label">Title</label>
        <input
          className="form-control"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          disabled={busy}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Description</label>
        <textarea
          className="form-control"
          rows="3"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={busy}
        />
      </div>

      <div className="mb-3">
        <label className="form-label">Video File</label>
        <input
          type="file"
          className="form-control"
          accept="video/*"
          onChange={handleFileChange}
          required
          disabled={busy}
        />
      </div>

      {progress > 0 && (
        <div className="mb-3">
          <div className="progress" style={{ height: '10px' }}>
            <div
              className={`progress-bar progress-bar-striped ${
                progress < 100 ? 'progress-bar-animated bg-success' : 'bg-primary'
              }`}
              role="progressbar"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <small className="text-light">{progress}% uploaded</small>
        </div>
      )}

      <div className="d-flex gap-2">
        <button className="btn btn-primary w-100" disabled={busy}>
          {busy ? 'Uploading...' : 'Upload'}
        </button>
        {busy && (
          <button
            type="button"
            className="btn btn-outline-danger"
            onClick={handleCancel}
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
