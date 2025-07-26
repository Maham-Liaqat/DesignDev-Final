import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaGithub, FaLinkedin, FaTwitter, FaCamera } from 'react-icons/fa';
import API_CONFIG from '../config/api';

const API_URL = API_CONFIG.BASE_URL;
const darkText = { color: '#222' };
const accent = { color: '#ff7f50' };

const EditProfile = () => {
  const [form, setForm] = useState({
    profileImage: '',
    bio: '',
    location: '',
    website: '',
    socialLinks: { github: '', linkedin: '', twitter: '' },
  });
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current user profile
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        const res = await axios.get(`${API_URL}/profile/${userId}`);
        setForm({
          profileImage: res.data.user.profileImage || '',
          bio: res.data.user.bio || '',
          location: res.data.user.location || '',
          website: res.data.user.website || '',
          socialLinks: res.data.user.socialLinks || { github: '', linkedin: '', twitter: '' },
        });
        setPreview(res.data.user.profileImage ? `${API_URL}/${res.data.user.profileImage}` : '');
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('socialLinks.')) {
      const key = name.split('.')[1];
      setForm((prev) => ({ ...prev, socialLinks: { ...prev.socialLinks, [key]: value } }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, profileImage: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === 'socialLinks') {
          Object.entries(value).forEach(([k, v]) => formData.append(`socialLinks.${k}`, v));
        } else if (key === 'profileImage' && value instanceof File) {
          formData.append('profileImage', value);
        } else {
          formData.append(key, value);
        }
      });
      await axios.put(`${API_URL}/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      navigate(`/profile/${localStorage.getItem('username') || localStorage.getItem('userId')}`);
    } catch (err) {
      // handle error
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={darkText}>Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <div className="card shadow-lg p-4 mb-5" style={{ borderRadius: 24, background: 'linear-gradient(135deg, #fff 80%, #f5debc 100%)' }}>
        <h2 style={{ ...darkText, fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Edit Profile</h2>
        <form onSubmit={handleSubmit}>
          {/* Profile Image Upload */}
          <div className="mb-4 text-center">
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <img
                src={preview || 'https://ui-avatars.com/api/?name=User'}
                alt="Preview"
                className="rounded-circle shadow"
                style={{ width: 100, height: 100, objectFit: 'cover', border: '4px solid #ff7f50', boxShadow: '0 4px 24px #ff7f5022' }}
              />
              <label htmlFor="profileImageInput" style={{ position: 'absolute', bottom: 0, right: 0, background: '#fff', borderRadius: '50%', padding: 8, cursor: 'pointer', border: '2px solid #ff7f50' }}>
                <FaCamera style={{ color: '#ff7f50' }} />
                <input type="file" name="profileImage" id="profileImageInput" className="d-none" accept="image/*" onChange={handleImageChange} />
              </label>
            </div>
          </div>
          {/* Bio */}
          <div className="mb-3">
            <label className="form-label" style={{ ...darkText, fontWeight: 500 }}>Bio</label>
            <textarea className="form-control" name="bio" value={form.bio} onChange={handleChange} maxLength={300} style={darkText} />
          </div>
          {/* Location */}
          <div className="mb-3">
            <label className="form-label" style={{ ...darkText, fontWeight: 500 }}>Location</label>
            <input className="form-control" name="location" value={form.location} onChange={handleChange} maxLength={100} style={darkText} />
          </div>
          {/* Website */}
          <div className="mb-3">
            <label className="form-label" style={{ ...darkText, fontWeight: 500 }}>Website</label>
            <input className="form-control" name="website" value={form.website} onChange={handleChange} style={darkText} />
          </div>
          {/* Social Links */}
          <div className="mb-3">
            <label className="form-label" style={{ ...darkText, fontWeight: 500 }}>Social Links</label>
            <div className="d-flex gap-2">
              <input className="form-control" name="socialLinks.github" value={form.socialLinks.github} onChange={handleChange} placeholder="GitHub" style={darkText} />
              <input className="form-control" name="socialLinks.linkedin" value={form.socialLinks.linkedin} onChange={handleChange} placeholder="LinkedIn" style={darkText} />
              <input className="form-control" name="socialLinks.twitter" value={form.socialLinks.twitter} onChange={handleChange} placeholder="Twitter" style={darkText} />
            </div>
          </div>
          <button type="submit" className="btn btn-primary mt-3 w-100" style={{ background: '#ff7f50', border: 'none', fontWeight: 600, fontSize: 18 }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditProfile; 