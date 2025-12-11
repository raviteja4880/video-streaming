import React, { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FaCamera, FaSignOutAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import '../styles.css';

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
    <div className="profile-page">
      <div className="profile-card shadow-lg">
        {/* 🔴 Logout button */}
        <button
          className="logout-btn d-flex align-items-center gap-2"
          onClick={() => {
            logout();
            nav('/');
          }}
        >
          <FaSignOutAlt size={14} />
          Logout
        </button>

        {/* Avatar Section */}
        <div className="profile-header text-center">
          <div className="avatar-wrapper">
            <img
              src={preview || avatar || 'https://via.placeholder.com/150'}
              alt="avatar"
              className="profile-avatar"
            />
            <label
              htmlFor="avatarUpload"
              className="avatar-upload-btn"
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
          <h4 className="profile-name">{name}</h4>
          <small className="profile-email">{user?.email}</small>
        </div>

        {/* Profile Form */}
        <form onSubmit={save} className="profile-form mt-4">
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
