import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API_CONFIG from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setConversations(res.data.conversations);
      } catch (err) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [token]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container py-5" style={{ maxWidth: 600 }}>
      <h2 style={{ fontWeight: 700, fontSize: 28, marginBottom: 24 }}>Inbox</h2>
      <div className="list-group">
        {conversations.length === 0 && <div className="text-muted">No conversations yet.</div>}
        {conversations.map((conv) => {
          const otherUser = conv.participants.find( 
            (u) => u._id !== localStorage.getItem("userId")
          );
          return (
            <button
              key={conv._id}
              className="list-group-item list-group-item-action d-flex align-items-center gap-3"
              style={{ borderRadius: 12, marginBottom: 8 }}
              onClick={() => navigate(`/chat/${conv._id}`)}
            >
              <img
                src={otherUser?.profileImage ? `${API_URL}/uploads/${otherUser.profileImage.replace(/^uploads\//, '')}` : `https://ui-avatars.com/api/?name=${otherUser?.username}`}
                alt="avatar"
                className="rounded-circle"
                style={{ width: 48, height: 48, objectFit: "cover", border: "2px solid #ff7f50" }}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${otherUser?.username}`;
                }}
              />
              <div className="flex-grow-1 text-start">
                <div style={{ fontWeight: 600 }}>{otherUser?.username}</div>
                <div className="text-muted" style={{ fontSize: 14 }}>{conv.lastMessage || "No messages yet."}</div>
              </div>
              <div className="text-muted" style={{ fontSize: 12 }}>{new Date(conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Inbox; 

