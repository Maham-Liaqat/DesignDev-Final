import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaGithub, FaLinkedin, FaTwitter, FaMapMarkerAlt, FaEdit, FaStar, FaFileAlt, FaChartLine, FaClock, FaTrash } from 'react-icons/fa';
import API_CONFIG from '../config/api';

const API_URL = API_CONFIG.BASE_URL;
const darkText = { color: '#222' };
const accent = { color: '#ff7f50' };

const statIcons = [
  <FaFileAlt size={22} />, // Templates
  <FaChartLine size={22} />, // Sales
  <FaStar size={22} />, // Avg. Rating
  <FaClock size={22} />, // Response Rate
];

const UserProfile = () => {
  const { identifier } = useParams();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ templateCount: 0, avgRating: 0 });
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [deleting, setDeleting] = useState(null);
  const navigate = useNavigate();
  
  // Check if identifier is a MongoDB ObjectId (24 hex characters) or username
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
  const isOwnProfile = localStorage.getItem('userId') === identifier || 
                      (user && localStorage.getItem('userId') === user._id);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        let res;
        if (isObjectId) {
          // If it's an ObjectId, fetch by userId
          res = await axios.get(`${API_URL}/profile/${identifier}`);
        } else {
          // If it's a username, fetch by username
          res = await axios.get(`${API_URL}/profile/by-username/${identifier}`);
        }
        
        setUser(res.data.user);
        console.log('Loaded user:', res.data.user);
        console.log('User email for template fetch:', res.data.user?.email);
        
        const statsRes = await axios.get(`${API_URL}/profile/${res.data.user._id}/comprehensive-stats`);
        setStats(statsRes.data.stats);
        
        // Fetch templates by user email
        if (res.data.user?.email) {
          const tRes = await axios.get(`${API_URL}/seller/${res.data.user.email}`);
          setTemplates(tRes.data.templates || []);
          console.log('Fetched templates:', tRes.data.templates);
          // Fetch reviews for user's templates
          const rRes = await axios.get(`${API_URL}/api/reviews/user/${res.data.user.email}`);
          setReviews(rRes.data.reviews || []);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        // If username not found, try as ObjectId
        if (!isObjectId) {
          try {
            const res = await axios.get(`${API_URL}/profile/${identifier}`);
            setUser(res.data.user);
            // ... rest of the logic
          } catch (fallbackErr) {
            console.error('Fallback error:', fallbackErr);
          }
        }
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [identifier, isObjectId]);

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;
    setDeleting(id);
    try {
      await axios.delete(`${API_URL}/seller/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setTemplates(templates.filter(t => t._id !== id));
    } catch (err) {
      alert('Failed to delete template.');
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div style={darkText}>Loading...</div>;
  if (!user) return <div style={darkText}>User not found.</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 900 }}>
      {/* Profile Card */}
      <div className="card shadow-lg p-4 mb-5 position-relative" style={{ borderRadius: 24, background: 'linear-gradient(135deg, #fff 80%, #f5debc 100%)' }}>
        {/* Edit Profile Button - top right */}
        {isOwnProfile && (
          <button
            className="btn btn-outline-primary position-absolute"
            style={{ top: 16, right: 16, borderRadius: 20, fontWeight: 500, zIndex: 2 }}
            onClick={() => navigate('/profile/edit')}
          >
            <FaEdit style={{ marginRight: 8 }} /> Edit Profile
          </button>
        )}
        {/* Message Me Button */}
        {!isOwnProfile && (
          <button
            className="btn btn-primary position-absolute"
            style={{ top: 24, right: 24, borderRadius: 20, fontWeight: 500 }}
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                if (!token) {
                  toast.error("Please login to message this user.");
                  return;
                }
                // Create or get conversation
                const convRes = await axios.post(
                  `${API_CONFIG.BASE_URL}/api/chat/conversations`,
                  { recipientId: identifier },
                  { headers: { Authorization: `Bearer ${token}` } }
                );
                navigate(`/inbox`, { 
                  state: { selectedConversationId: convRes.data.conversation._id } 
                });
              } catch (err) {
                toast.error("Could not start chat with this user.");
              }
            }}
          >
            Message Me
          </button>
        )}
        {/* Top row: profile image left, button right */}
        <div className="d-flex align-items-start mb-3" style={{gap: '1.5rem'}}>
          {/* Profile Image - top left */}
          <div style={{ position: 'relative' }}>
            <img
              src={user.profileImage ? `${API_URL}/${user.profileImage}` : 'https://ui-avatars.com/api/?name=' + user.username}
              alt="Profile"
              className="rounded-circle shadow"
              style={{ width: 120, height: 120, objectFit: 'cover', border: '4px solid #ff7f50', boxShadow: '0 4px 24pxrgba(255, 127, 80, 0.39)' }}
            />
            {/* Badge Example */}
            <span className="badge bg-warning position-absolute text-dark" style={{ bottom: 0, right: 0, fontSize: 12 }}>Seller</span>
          </div>
        </div>
        {/* Main Info and rest of content */}
        <div className="flex-grow-1">
          <h2 style={{ ...darkText, fontWeight: 700, fontSize: 32 }}>{user.username}</h2>
          <div className="d-flex align-items-center mb-2" style={{ gap: 12 }}>
            {user.location && <span className="text-muted"><FaMapMarkerAlt style={accent} /> {user.location}</span>}
            <span className="text-muted" style={{ fontSize: 14 }}>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
          <p style={{ ...darkText, fontSize: 18, marginBottom: 8 }}>{user.bio}</p>
          {/* Social Links */}
          <div className="d-flex align-items-center" style={{ gap: 16 }}>
            {user.socialLinks?.github && <a href={user.socialLinks.github} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm" style={accent}><FaGithub /></a>}
            {user.socialLinks?.linkedin && <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm" style={accent}><FaLinkedin /></a>}
            {user.socialLinks?.twitter && <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="btn btn-light btn-sm" style={accent}><FaTwitter /></a>}
          </div>
        </div>
        {/* Stats Bar */}
        <div className="d-flex justify-content-around align-items-center mt-4 mb-2 flex-wrap gap-3">
          <div className="text-center">
            <div style={{ fontSize: 22, color: '#ff7f50' }}>{statIcons[0]}</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{stats.templatesUploaded || 0}</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Templates</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: 22, color: '#ff7f50' }}>{statIcons[1]}</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{stats.totalSales || 0}</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Sales</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: 22, color: '#ff7f50' }}>{statIcons[2]}</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{stats.averageRating || 0.0}</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Avg. Rating</div>
          </div>
          <div className="text-center">
            <div style={{ fontSize: 22, color: '#ff7f50' }}>{statIcons[3]}</div>
            <div style={{ fontWeight: 700, fontSize: 20 }}>{stats.responseRate || 0}%</div>
            <div className="text-muted" style={{ fontSize: 14 }}>Response Rate</div>
          </div>
        </div>
      </div>

      {/* Templates Section */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm p-4 mb-4" style={{ borderRadius: 18, background: 'linear-gradient(135deg, #fff 85%,rgba(193, 21, 255, 0.36) 100%)' }}>
            <h4 style={{ ...darkText, fontWeight: 600 }}>Templates by {user.username}</h4>
            {templates.length === 0 ? (
              <div className="text-muted">No templates uploaded yet.</div>
            ) : (
              <div className="list-group">
                {templates.map(t => (
                  <div key={t._id} className="list-group-item d-flex justify-content-between align-items-center">
                    <div>
                      <div style={{ fontWeight: 500 }}>{t.templateName}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>{t.category} | {t.license} | {new Date(t.createdAt).toLocaleDateString()}</div>
                    </div>
                    {isOwnProfile && (
                      <button className="btn btn-sm btn-danger" disabled={deleting === t._id} onClick={() => handleDeleteTemplate(t._id)}>
                        {deleting === t._id ? 'Deleting...' : <FaTrash />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section at the bottom */}
      <div className="row g-4">
        <div className="col-12">
          <div className="card shadow-sm p-4 mb-4" style={{ borderRadius: 18, background: 'linear-gradient(135deg, #fff 80%, #f5debc 100%)' }}>
            <h4 style={{ ...darkText, fontWeight: 600 }}>Reviews</h4>
            {reviews.length === 0 ? (
              <div className="text-muted">No reviews yet.</div>
            ) : (
              <div className="list-group">
                {reviews.map(r => (
                  <div key={r._id} className="list-group-item">
                    <div style={{ fontWeight: 500 }}>{r.title} <span className="text-warning"><FaStar /> {r.rating}</span></div>
                    <div className="text-muted" style={{ fontSize: 13 }}>By {r.username} on {new Date(r.createdAt).toLocaleDateString()}</div>
                    <div>{r.content}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 