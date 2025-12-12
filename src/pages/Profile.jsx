import React, { useEffect, useRef, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FaSignOutAlt,
  FaTrashAlt,
  FaUserEdit,
  FaKey,
  FaUserCircle,
  FaCamera,
  FaCog,
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles.css';

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [busy, setBusy] = useState(false);
  const [activeSection, setActiveSection] = useState('none');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const nav = useNavigate();

  useEffect(() => {
    setName(user?.name || '');
    setAvatar(user?.avatar || '');
    setBio(user?.bio || '');
  }, [user]);

  useEffect(() => {
    const closeOnClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', closeOnClickOutside);
    return () => document.removeEventListener('mousedown', closeOnClickOutside);
  }, []);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  /** Upload Avatar */
  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setBusy(true);

    // Create toast placeholder
    let toastId = toast.loading('Starting upload...');

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = localStorage.getItem('token');

      // Use axios for upload with progress tracking
      const { data } = await api.post('/users/me/avatar', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          toast.update(toastId, {
            render: `Uploading avatar... ${percent}%`,
            type: 'info',
            isLoading: true,
          });
        },
      });

      if (data.success) {
        const updatedUser = { ...user, avatar: data.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setAvatar(data.avatar);

        toast.update(toastId, {
          render: 'Avatar uploaded successfully',
          type: 'success',
          isLoading: false,
          autoClose: 2500,
        });
      } else {
        toast.update(toastId, {
          render: 'Upload failed',
          type: 'error',
          isLoading: false,
          autoClose: 3000,
        });
      }
    } catch (err) {
      toast.update(toastId, {
        render: 'Error during upload',
        type: 'error',
        isLoading: false,
        autoClose: 3000,
      });
    } finally {
      setBusy(false);
    }
  };

  /** Remove Avatar */
  const removeAvatar = async () => {
    toast.info(
      <div className="text-center">
        <p className="mb-2">Remove your avatar?</p>
        <div className="d-flex justify-content-center gap-2">
          <button
            className="btn btn-sm btn-danger"
            onClick={async () => {
              toast.dismiss();
              try {
                const { data } = await api.delete('/users/me/avatar');
                if (data.success) {
                  toast.success('Avatar removed');
                  const updatedUser = { ...user, avatar: null };
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  setUser(updatedUser);
                  setAvatar('');
                }
              } catch {
                toast.error('Failed to remove avatar');
              }
            }}
          >
            Yes, remove
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
        </div>
      </div>,
      {
        autoClose: false,
        position: 'top-center',
        theme: 'dark',
      }
    );
  };

  /** Save profile info */
  const saveProfile = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/users/me', { name, bio });
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      toast.success('Profile updated');
      setActiveSection('none');
    } catch {
      toast.error('Update failed');
    } finally {
      setBusy(false);
    }
  };

  /** Update password */
  const updatePassword = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.put('/users/me', {
        currentPassword,
        newPassword,
      });
      toast.success(data.message || 'Password updated');
      setCurrentPassword('');
      setNewPassword('');
      setActiveSection('none');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card shadow-lg position-relative">

        {/* ⚙️ Settings Toggle + Floating Menu */}
        <div ref={menuRef}>
          <button
            className={`gear-toggle ${menuOpen ? 'rotating' : ''}`}
            onClick={toggleMenu}
          >
            <FaCog size={20} />
          </button>

          {menuOpen && (
            <div className="floating-menu animate__animated animate__fadeInRight">
              <button
                className="menu-btn"
                onClick={() => {
                  setActiveSection('edit');
                  setMenuOpen(false);
                }}
              >
                <FaUserEdit className="me-2" /> Edit Profile
              </button>

              <button
                className="menu-btn"
                onClick={() => {
                  setActiveSection('password');
                  setMenuOpen(false);
                }}
              >
                <FaKey className="me-2" /> Change Password
              </button>

              <button
                className="menu-btn"
                onClick={() => {
                  document.getElementById('avatarUpload').click();
                  setMenuOpen(false);
                }}
              >
                <FaCamera className="me-2" /> {avatar ? 'Update Avatar' : 'Upload Avatar'}
              </button>

              {avatar && (
                <button
                  className="menu-btn text-danger"
                  onClick={() => {
                    removeAvatar();
                    setMenuOpen(false);
                  }}
                >
                  <FaTrashAlt className="me-2" /> Remove Avatar
                </button>
              )}

              <hr className="text-secondary" />

              <button
                className="menu-btn text-danger"
                onClick={() => {
                  logout();
                  nav('/');
                }}
              >
                <FaSignOutAlt className="me-2" /> Logout
              </button>
            </div>
          )}
        </div>
        {/* Hidden Avatar Upload */}
        <input
          id="avatarUpload"
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />

        {/* Avatar Section */}
        <div className="profile-header text-center mt-3">
          {avatar ? (
            <img src={avatar} alt="avatar" className="profile-avatar" />
          ) : (
            <FaUserCircle
              size={80}
              className="text-secondary"
              style={{ background: '#222', borderRadius: '50%', padding: '6px' }}
              onClick={() => document.getElementById('avatarUpload').click()}
            />
          )}
          <h4 className="profile-name mt-2">{name}</h4>
          <small className="text-secondary">{user?.email}</small>
        </div>

        {/* Edit Profile */}
        {activeSection === 'edit' && (
          <form onSubmit={saveProfile} className="profile-form mt-4">
            <h6 className="text-light mb-3">Edit Profile</h6>
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
            <button className="btn btn-primary w-100" disabled={busy}>
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* Change Password */}
        {activeSection === 'password' && (
          <form onSubmit={updatePassword} className="mt-4">
            <h6 className="text-light mb-3">Change Password</h6>
            <div className="mb-3">
              <label className="form-label">Current Password</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">New Password</label>
              <input
                type="password"
                className="form-control bg-dark text-light border-secondary"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <button className="btn btn-warning w-100" disabled={busy}>
              {busy ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        )}

        {activeSection === 'none' && (
          <p className="text-secondary text-center mt-4 small">
            Use the ⚙️ toggle to manage your profile
          </p>
        )}
      </div>
    </div>
  );
}
