import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [busy, setBusy] = useState(false);
  const [newAvatarFile, setNewAvatarFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const nav = useNavigate();

  useEffect(() => {
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
    setBio(user?.bio || '');
  }, [user]);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);

    try {
      let uploadedAvatar = avatar;

      if (newAvatarFile) {
        const formData = new FormData();
        formData.append('avatar', newAvatarFile);

        const res = await fetch('http://localhost:5000/api/users/me/avatar', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: formData,
        });

        const data = await res.json();
        if (data.success) {
          uploadedAvatar = data.avatar;
        } else {
          alert(data.message || 'Image upload failed');
        }
      }

      const { data } = await api.put('/users/me', {
        name,
        avatar: uploadedAvatar,
        bio,
      });

      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      setPreview(null);
      setNewAvatarFile(null);
    } catch (err) {
      console.error('Profile update failed:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
      <div className="col-md-8 col-lg-6 bg-dark p-4 rounded shadow-sm position-relative" style={{ maxWidth: 600 }}>
        {/* 🔴 Logout button (top-right) */}
        <button
          className="btn btn-outline-danger btn-sm position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
          onClick={() => {
            logout();
            nav('/');
          }}
        >
          <FaSignOutAlt size={14} />
          Logout
        </button>

        {/* Avatar & basic info */}
        <div className="text-center mb-4 position-relative mt-3">
          <div className="position-relative d-inline-block">
            <img
              src={preview || avatar || 'https://via.placeholder.com/150'}
              alt="avatar"
              className="rounded-circle shadow-sm"
              width="130"
              height="130"
              style={{
                objectFit: 'cover',
                border: '3px solid #ffffff',
              }}
            />
            <label
              htmlFor="avatarUpload"
              className="position-absolute bottom-0 end-0 bg-primary text-white rounded-circle p-2 shadow-sm d-flex align-items-center justify-content-center"
              style={{
                cursor: 'pointer',
                fontSize: '1rem',
                border: '2px solid white',
                transform: 'translate(25%, 25%)',
              }}
              title="Change photo"
            >
              <FaCamera size={16} />
            </label>
            <input
              id="avatarUpload"
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
          </div>
          <h4 className="mt-3 mb-0">{name}</h4>
          <small className="text-secondary">{user?.email}</small>
        </div>

        {/* Profile Form */}
        <form onSubmit={save}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input
              className="form-control bg-dark text-light border-secondary"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Bio</label>
            <textarea
              className="form-control bg-dark text-light border-secondary"
              rows="3"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>

          {newAvatarFile && (
            <div className="alert alert-warning py-2 small">
              New profile photo selected — click <b>Save changes</b> to upload.
            </div>
          )}

          <button className="btn btn-primary w-100" disabled={busy}>
            {busy ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
