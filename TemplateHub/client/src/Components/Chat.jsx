import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useChat } from "../contexts/ChatContext";
import Picker from "@emoji-mart/react";
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileArchive, FaFileAlt, FaDownload, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import styled from 'styled-components';
import VoiceNotePlayer from './VoiceNotePlayer';
import Footer from './Footer';
import API_CONFIG from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

const getProfileImageUrl = (path, username) => {
  if (!path) {
    // No image path, fallback to avatar
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=4e8cff&color=fff`;
  }
  if (/^https?:\/\//.test(path)) return path;
  // Remove ALL leading 'uploads/' or backslash from path to avoid any double prefix
  const cleanPath = path.replace(/^(uploads[\\/]+)+/, '');
  return `${API_URL}/uploads/${cleanPath}`;
};

const getFileIcon = (fileType, fileUrl) => {
  if (!fileType) {
    // Fallback based on file extension
    const extension = fileUrl?.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(extension)) return <FaFilePdf size={20} />;
    if (['doc', 'docx'].includes(extension)) return <FaFileWord size={20} />;
    if (['zip', 'rar', '7z'].includes(extension)) return <FaFileArchive size={20} />;
    return <FaFileAlt size={20} />;
  }
  
  if (fileType.startsWith('image/')) return <FaFileAlt size={20} />;
  if (fileType === 'application/pdf') return <FaFilePdf size={20} />;
  if (fileType.includes('word') || fileType.includes('document')) return <FaFileWord size={20} />;
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return <FaFileArchive size={20} />;
  
  return <FaFileAlt size={20} />;
};

const getSafeFileUrl = (url) => {
  if (!url) return '';
  // If the url is already absolute, return as is
  if (/^https?:\/\//.test(url)) return url;
  let safeUrl = url.replace(/\\/g, '/').replace(/^upLoads/i, 'uploads');
  // Remove any leading slash
  if (safeUrl.startsWith('/')) safeUrl = safeUrl.slice(1);
  return `${API_URL}/${safeUrl}`;
};

const isLikelyFile = (url) => {
  if (!url) return false;
  return /\.(png|jpe?g|gif|pdf|docx?|zip|rar|mp3|wav|webm)$/i.test(url);
};

// ========== STYLED COMPONENTS ========== //
const ChatContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background:rgba(198, 199, 200, 0.65);
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #fff 40%, #f5debc 100%);
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  z-index: 10;
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(81, 16, 88, 0.87);
  margin-right: 16px;
`;

const UserInfo = styled.div`
  flex: 1;
`;

const UserName = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #333;
`;

const UserStatus = styled.div`
  font-size: 14px;
  color: #666;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  background: #f0f2f5;
  background-image: linear-gradient(rgba(229, 229, 229, 0.3) 1px, transparent 1px);
  background-size: 100% 40px;
`;

const MessageRow = styled.div`
  display: flex;
  margin-bottom: 16px;
  justify-content: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  position: relative;
  align-items: center;
  &:hover {
    .message-actions {
      opacity: 1;
    }
  }
`;

const MessageBubble = styled.div`
  max-width: 100%;
  padding: 12px 16px;
  border-radius: ${props => props.isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px'};
  background: ${props => props.isMe ? '#1DAAF5' : '#ffffff'};
  color: ${props => props.isMe ? '#fff' : '#333'};
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 16px;
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: ${props => props.isMe ? 'rgba(255,255,255,0.7)' : '#999'};
  text-align: right;
  margin-top: 4px;
`;

const InputArea = styled.form`
  display: flex;
  padding: 16px;
  background: #ffffff;
  border-top: 1px solid #e9ecef;
  align-items: center;
`;

const InputField = styled.input`
  flex: 1;
  padding: 12px 16px;
  border-radius: 24px;
  border: 1px solid #e9ecef;
  outline: none;
  font-size: 16px;
  margin: 0 8px;
  &:focus {
    border-color: #1DAAF5;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s;
  &:hover {
    background: rgba(0,0,0,0.05);
    color: #4e8cff;
  }
`;

const SendButton = styled(IconButton)`
  color: #4e8cff;
  background: rgba(78, 140, 255, 0.1);
  &:hover {
    background: rgba(78, 140, 255, 0.2);
  }
`;

const FileCard = styled.a`
  display: flex;
  align-items: center;
  padding: 12px;
  background: ${props => props.isMe ? 'rgba(255,255,255,0.2)' : '#f8f9fa'};
  border-radius: 12px;
  text-decoration: none;
  color: ${props => props.isMe ? '#fff' : '#333'};
  margin: 8px 0;
  transition: all 0.2s;
  &:hover {
    background: ${props => props.isMe ? 'rgba(255,255,255,0.3)' : '#e9ecef'};
  }
`;

const MessageActions = styled.div`
  position: absolute;
  top: -24px;
  right: 0;
  display: flex;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 4px;
  opacity: 0;
  transition: opacity 0.2s;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #666;
  padding: 4px;
  cursor: pointer;
  &:hover {
    color:rgb(78, 140, 255);
  }
`;

const DeletedMessage = styled.div`
  font-style: italic;
  color: #999;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 18px;
  margin-bottom: 8px;
  display: inline-block;
  max-width: 80%;
`;

// ========== MAIN CHAT COMPONENT ========== //
const Chat = () => {
  const { conversationId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [participants, setParticipants] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { socket, typingUsers } = useChat();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Fetch messages and participants
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [messagesRes, conversationsRes] = await Promise.all([
          axios.get(`${API_URL}/api/chat/messages/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        console.log("Fetched messages:", messagesRes.data.messages);
        setMessages(messagesRes.data.messages);
        const conv = conversationsRes.data.conversations.find(c => c._id === conversationId);
        console.log("Found conversation:", conv);
        setParticipants(conv?.participants || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (socket) {
      socket.emit("join_conversation", conversationId);
      socket.emit("read_messages", { conversationId, userId });

      socket.on("receive_message", (msg) => {
        console.log("Received message via socket:", msg);
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== userId) {
          socket.emit("read_messages", { conversationId, userId });
        }
      });

      socket.on("message_edited", (msg) => {
        setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
      });

      socket.on("message_deleted", (msg) => {
        setMessages(prev => prev.map(m => m._id === msg._id ? msg : m));
      });
    }

    return () => {
      if (socket) {
        socket.off("receive_message");
        socket.off("message_edited");
        socket.off("message_deleted");
      }
    };
  }, [conversationId, socket, userId, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle typing indicator
  const handleInput = (e) => {
    setInput(e.target.value);
    if (socket) {
      if (!typing) {
      setTyping(true);
      socket.emit("typing", { conversationId, userId });
    }
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        setTyping(false);
        socket.emit("stop_typing", { conversationId, userId });
      }, 1000);
    }
  };

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    console.log("Sending message:", { conversationId, senderId: userId, content: input });
    if (socket) {
      socket.emit("send_message", { conversationId, senderId: userId, content: input });
    }
    setInput("");
    setTyping(false);
    if (socket) socket.emit("stop_typing", { conversationId, userId });
    setShowEmojiPicker(false);
  };

  // File upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUploading(true);
    setUploadProgress(0);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(`${API_URL}/api/chat/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
      });

      if (socket && res.data.fileUrl) {
        socket.emit("send_message", {
          conversationId,
          senderId: userId,
          content: res.data.fileUrl,
          fileUrl: res.data.fileUrl,
          fileType: res.data.fileType,
          originalName: file.name
        });
      } else {
        alert('File upload failed, no file URL returned.');
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Message editing
  const handleEdit = (msg) => {
    setEditingMsgId(msg._id);
    setEditInput(msg.content);
  };

  const handleEditSave = (msg) => {
    if (socket && editInput.trim()) {
      socket.emit("edit_message", { messageId: msg._id, newText: editInput });
    }
    setEditingMsgId(null);
    setEditInput("");
  };

  const handleEditCancel = () => {
    setEditingMsgId(null);
    setEditInput("");
  };

  const handleDelete = (msg) => {
    setDeleteConfirm(msg);
  };

  const handleConfirmDelete = () => {
    if (socket) {
      console.log("Emitting delete_message for:", deleteConfirm._id); // Debug log
      socket.emit("delete_message", { messageId: deleteConfirm._id });
    }
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteAllMessages = async () => {
    try {
      await axios.delete(`${API_URL}/api/chat/messages/${conversationId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete chat history.');
      setDeleteConfirm(null);
    }
  };

  if (loading) return <div className="text-center py-4">Loading messages...</div>;

  const otherUser = participants.find((u) => u._id !== userId);
  const myUser = participants.find((u) => u._id === userId);

  return (
    <ChatContainer>
      {/* Header */}
      <ChatHeader>
        <button onClick={() => navigate(-1)} style={{ background: 'none', border: 'none', marginRight: '12px' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="#4e8cff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <Avatar
          src={getProfileImageUrl(otherUser?.profileImage, otherUser?.username)}
          alt="avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${otherUser?.username || 'User'}&background=4e8cff&color=fff`;
          }}
        />
        <UserInfo>
          <UserName>{otherUser?.username || "User"}</UserName>
          <UserStatus>
            {Object.keys(typingUsers).length > 0 ? "Typing..." : "Online"}
          </UserStatus>
        </UserInfo>
        <button
          onClick={() => setDeleteConfirm('all')}
          style={{ marginLeft: 'auto', background: ' #1DAAF5', border: 'none', color: ' #E1306C', fontWeight: 500, fontSize: 14, cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}
          title="Delete Chat History"
        >
          Delete Chat History
        </button>
      </ChatHeader>

      {/* Chat Body */}
      <ChatBody>
        {messages.map((msg) => {
          const isMine = msg.senderId === userId;
          const sender = participants.find(u => u._id === msg.senderId) || (isMine ? myUser : otherUser);

          const fileUrl = getSafeFileUrl(msg.fileUrl || msg.content);
          const fileType = msg.fileType || (fileUrl.match(/\.(png|jpe?g|gif)$/i) ? 'image' : fileUrl.match(/\.(pdf|docx?|zip|rar)$/i) ? 'file' : undefined);

          if (msg.deleted) {
            return (
              <MessageRow key={msg._id} isMe={isMine}>
                <DeletedMessage>
                  <FaTrash style={{ marginRight: 6, color: '#bbb', verticalAlign: 'middle' }} />
                  This message was deleted
                </DeletedMessage>
              </MessageRow>
            );
          }

          return (
            <MessageRow key={msg._id} isMe={isMine}>
              {/* Receiver: Avatar left, bubble right */}
                {!isMine && (
                <Avatar
                  src={getProfileImageUrl(sender?.profileImage, sender?.username)}
                    alt="avatar"
                  style={{ marginRight: '16px' }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${sender?.username || 'User'}&background=4e8cff&color=fff`;
                  }}
                />
              )}

              <div style={{ position: 'relative' }}>
                <MessageBubble isMe={isMine}>
                  {editingMsgId === msg._id ? (
                    <div style={{ width: '100%' }}>
                      <input
                        type="text"
                        value={editInput}
                        onChange={(e) => setEditInput(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '16px',
                          background: '#fff',
                          color: '#333'
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                        <button
                          onClick={() => handleEditSave(msg)}
                          style={{
                            padding: '4px 8px',
                            background: '#4e8cff',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          style={{
                            padding: '4px 8px',
                            background: '#666',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {(msg.fileUrl || msg.content) && (msg.fileType || isLikelyFile(msg.fileUrl || msg.content)) ? (
                        fileType === 'image' ? (
                          <img 
                            src={getProfileImageUrl(fileUrl, '')}
                            alt="attachment"
                            style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '12px' }}
                          />
                        ) : (
                          <FileCard 
                            href={getSafeFileUrl(fileUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            isMe={isMine}
                          >
                            {getFileIcon(msg.fileType, msg.fileUrl)}
                            <div style={{ marginLeft: '12px' }}>
                              <div style={{ fontWeight: 500 }}>
                                {msg.originalName ? msg.originalName : (fileUrl.split('/').pop())}
                              </div>
                              <div style={{ fontSize: '12px', color: isMine ? 'rgba(255,255,255,0.7)' : '#666' }}>
                                Click to download
                              </div>
                            </div>
                            <FaDownload size={16} />
                          </FileCard>
                        )
                      ) : msg.content}
                    </>
                  )}
                  <MessageTime isMe={isMine}>
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                    {isMine && msg.isRead && (
                      <span style={{ marginLeft: '6px', color: '#4caf50' }}>✓✓</span>
                    )}
                    {msg.edited && (
                      <span style={{ marginLeft: '6px', fontStyle: 'italic', fontSize: '0.8em' }}>(edited)</span>
                    )}
                  </MessageTime>
                </MessageBubble>

                {isMine && (
                  <MessageActions className="message-actions">
                    {!msg.fileUrl && (
                      <ActionButton onClick={() => handleEdit(msg)} title="Edit">
                        <FaEdit size={14} />
                      </ActionButton>
                    )}
                    <ActionButton onClick={() => handleDelete(msg)} title="Delete">
                      <FaTrash size={14} />
                    </ActionButton>
                  </MessageActions>
                )}
              </div>

              {/* Sender: Bubble left, avatar right */}
              {isMine && (
                <Avatar
                  src={getProfileImageUrl(sender?.profileImage, sender?.username)}
                  alt="avatar"
                  style={{ marginLeft: '16px' }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${sender?.username || 'User'}&background=4e8cff&color=fff`;
                  }}
                />
              )}
            </MessageRow>
          );
        })}
          <div ref={messagesEndRef} />
      </ChatBody>

      {/* Input Area */}
      <InputArea onSubmit={handleSend}>
        <IconButton type="button" onClick={() => fileInputRef.current?.click()}>
          <FaPaperclip />
        </IconButton>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
          accept="image/*,application/pdf,.doc,.docx,.zip,.rar,.txt"
        />
        <InputField
          value={input}
          onChange={handleInput}
          placeholder="Type a message..."
          disabled={uploading}
        />
        <IconButton type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <BsEmojiSmile />
        </IconButton>
            {showEmojiPicker && (
          <div style={{ position: 'absolute', bottom: '80px', right: '20px', zIndex: 100 }}>
                <Picker
              onEmojiSelect={emoji => setInput(prev => prev + emoji.native)}
                  theme="light"
                  showPreview={false}
                  showSkinTones={false}
                />
              </div>
            )}
        <SendButton type="submit" disabled={uploading || !input.trim()}>
          <IoSend />
        </SendButton>
      </InputArea>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '24px',
            borderRadius: '12px',
            maxWidth: '400px',
            width: '90%',
            textAlign: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>{deleteConfirm === 'all' ? 'Delete Chat History?' : 'Delete Message?'}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>
              {deleteConfirm === 'all' ? 'This will permanently delete all messages in this chat. This action cannot be undone.' : 'This action cannot be undone. The message will be permanently deleted.'}
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button
                onClick={handleCancelDelete}
                style={{
                  padding: '10px 20px',
                  background: '#f8f9fa',
                  color: '#666',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Cancel
            </button>
              <button
                onClick={deleteConfirm === 'all' ? handleDeleteAllMessages : handleConfirmDelete}
                style={{
                  padding: '10px 20px',
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Delete
          </button>
            </div>
      </div>
    </div>
      )}
      <Footer />
    </ChatContainer>
  );
};

export default Chat; 

