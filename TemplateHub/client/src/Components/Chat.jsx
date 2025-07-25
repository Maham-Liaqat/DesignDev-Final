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

const getProfileImageUrl = (path, username, isCurrentUser = false) => {
  if (!path) {
    // No image path, fallback to avatar with proper user identification
    const displayName = isCurrentUser ? 'You' : (username || 'User');
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=8b5cf6&color=fff`;
  }
  if (/^https?:\/\//.test(path)) return path;
  // Remove ALL leading 'uploads/' or backslash from path to avoid any double prefix
  const cleanPath = path.replace(/^(uploads[\\/]+)+/, '');
  return `${API_URL}/uploads/${cleanPath}`;
};

const getAvatarDisplayName = (username, isCurrentUser = false) => {
  if (isCurrentUser) return 'You';
  if (!username) return 'User';
  
  // Extract initials from username
  const names = username.split(' ');
  if (names.length >= 2) {
    return names[0][0] + names[1][0];
  }
  return username.substring(0, 2).toUpperCase();
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

// ========== TYPING INDICATOR COMPONENT ========== //
const TypingIndicator = () => (
  <div className="typing-indicator">
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
    <div className="typing-dot"></div>
  </div>
);

// ========== MESSAGE STATUS COMPONENT ========== //
const MessageStatus = ({ status }) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sent':
        return <span style={{ color: '#94a3b8' }}>✓</span>;
      case 'delivered':
        return <span style={{ color: '#f59e0b' }}>✓✓</span>;
      case 'read':
        return <span style={{ color: '#3b82f6' }}>✓✓✓</span>;
      default:
        return null;
    }
  };

  return getStatusIcon();
};

// ========== MAIN CHAT COMPONENT ========== //
const Chat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { messages, setMessages, addMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [deletingMessage, setDeletingMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [messageStatus, setMessageStatus] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiPickerRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`${API_URL}/api/chat/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          setMessages(response.data.messages || []);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        if (error.response?.status === 401) {
          navigate("/login");
        }
      }
    };

    fetchData();
  }, [id, navigate]);

  // Simulate typing indicator
  useEffect(() => {
    if (isTyping) {
      const timer = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isTyping]);

  // Simulate message status updates
  useEffect(() => {
    messages.forEach((msg, index) => {
      if (!messageStatus[msg._id]) {
        setTimeout(() => {
          setMessageStatus(prev => ({
            ...prev,
            [msg._id]: 'sent'
          }));
        }, 500 + index * 100);

        setTimeout(() => {
          setMessageStatus(prev => ({
            ...prev,
            [msg._id]: 'delivered'
          }));
        }, 1000 + index * 100);

        setTimeout(() => {
          setMessageStatus(prev => ({
            ...prev,
            [msg._id]: 'read'
          }));
        }, 2000 + index * 100);
      }
    });
  }, [messages]);

  // Handle typing indicator
  const handleInput = (e) => {
    setInputValue(e.target.value);
    if (isTyping) {
      setIsTyping(false);
    }
    setIsTyping(true);
  };

  // Send message
  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    console.log("Sending message:", { conversationId: id, senderId: localStorage.getItem("userId"), content: inputValue });
    addMessage({ conversationId: id, senderId: localStorage.getItem("userId"), content: inputValue });
    setInputValue("");
    setIsTyping(false);
  };

  // File upload
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setSelectedFile(file);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(`${API_URL}/api/chat/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // setUploadProgress(percent); // This state was removed, so this line is removed
          },
      });

      if (res.data.fileUrl) {
        addMessage({
          conversationId: id,
          senderId: localStorage.getItem("userId"),
          content: res.data.fileUrl,
          fileUrl: res.data.fileUrl,
          fileType: res.data.fileType,
          originalName: file.name
        });
        setSelectedFile(null);
      } else {
        alert('File upload failed, no file URL returned.');
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      // setUploading(false); // This state was removed, so this line is removed
      // setUploadProgress(0); // This state was removed, so this line is removed
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Message editing
  const handleEdit = (msg) => {
    setEditingMessage(msg);
    setEditValue(msg.content);
  };

  const handleEditSave = (msg) => {
    if (isTyping) {
      setIsTyping(false);
    }
    if (editValue.trim()) {
      addMessage({
        conversationId: id,
        senderId: localStorage.getItem("userId"),
        content: editValue,
        fileUrl: msg.fileUrl, // Keep original fileUrl if editing a file
        fileType: msg.fileType, // Keep original fileType if editing a file
        originalName: msg.originalName, // Keep originalName if editing a file
        _id: msg._id, // Ensure the original message ID is preserved
        edited: true // Indicate it was edited
      });
    }
    setEditingMessage(null);
    setEditValue("");
  };

  const handleEditCancel = () => {
    setEditingMessage(null);
    setEditValue("");
  };

  const handleDelete = (msg) => {
    setDeletingMessage(msg);
  };

  const handleConfirmDelete = () => {
    if (isTyping) {
      setIsTyping(false);
    }
    addMessage({
      conversationId: id,
      senderId: localStorage.getItem("userId"),
      content: "This message was deleted",
      deleted: true,
      _id: deletingMessage._id
    });
    setDeletingMessage(null);
  };

  const handleCancelDelete = () => {
    setDeletingMessage(null);
  };

  const handleDeleteAllMessages = async () => {
    try {
      await axios.delete(`${API_URL}/api/chat/messages/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setMessages([]);
      setDeletingMessage(null);
    } catch (err) {
      alert('Failed to delete chat history.');
      setDeletingMessage(null);
    }
  };

  if (!localStorage.getItem("token")) {
    return <div className="text-center py-4">Please <a href="/login">log in</a> to view this chat.</div>;
  }

  const otherUser = messages.find(u => u._id !== localStorage.getItem("userId"));
  const myUser = messages.find(u => u._id === localStorage.getItem("userId"));

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
          src={getProfileImageUrl(otherUser?.profileImage, otherUser?.username, false)}
          alt="avatar"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = `https://ui-avatars.com/api/?name=${otherUser?.username || 'User'}&background=4e8cff&color=fff`;
          }}
        />
        <UserInfo>
          <UserName>{otherUser?.username || "User"}</UserName>
          <UserStatus>
            {Object.keys(isTyping ? { [localStorage.getItem("userId")]: true } : {}).length > 0 ? "Typing..." : "Online"}
          </UserStatus>
        </UserInfo>
        <button
          onClick={() => setDeletingMessage('all')}
          style={{ marginLeft: 'auto', background: ' #1DAAF5', border: 'none', color: ' #E1306C', fontWeight: 500, fontSize: 14, cursor: 'pointer', padding: '8px 16px', borderRadius: '8px' }}
          title="Delete Chat History"
        >
          Delete Chat History
        </button>
      </ChatHeader>

      {/* Chat Body */}
      <ChatBody>
                  {messages.map((msg) => {
            const isMine = msg.senderId === localStorage.getItem("userId");
            const currentUserId = localStorage.getItem("userId");
            const sender = isMine ? { username: 'You', profileImage: null } : otherUser;

          const fileUrl = getSafeFileUrl(msg.fileUrl || msg.content);
          const isFile = isLikelyFile(fileUrl);

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
              {!isMine && (
                <Avatar
                  src={getProfileImageUrl(sender?.profileImage, sender?.username, false)}
                  alt={sender?.username || "User"}
                  style={{ marginRight: '16px' }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${sender?.username || 'User'}&background=8b5cf6&color=fff`;
                  }}
                />
              )}
              {isMine && (
                <Avatar
                  src={getProfileImageUrl(null, 'You', true)}
                  alt="You"
                  style={{ marginLeft: '16px' }}
                  onError={e => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=You&background=8b5cf6&color=fff`;
                  }}
                />
              )}
              <div style={{ position: 'relative' }}>
                <MessageBubble isMe={isMine}>
                  {editingMessage === msg._id ? (
                    <div style={{ width: '100%' }}>
                      <input
                        type="text"
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px 12px',
                          border: '1px solid #ddd',
                          borderRadius: '8px',
                          fontSize: '14px'
                        }}
                        autoFocus
                      />
                      <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditSave(msg)}
                          style={{
                            padding: '4px 8px',
                            background: '#4caf50',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Save
                        </button>
                        <button
                          onClick={handleEditCancel}
                          style={{
                            padding: '4px 8px',
                            background: '#f44336',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="message-content">
                        {isFile ? (
                          <a href={fileUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 16px',
                              background: 'rgba(255,255,255,0.1)',
                              borderRadius: '12px',
                              marginTop: '8px'
                            }}>
                              {getFileIcon(msg.fileType, fileUrl)}
                              <span style={{ flex: 1, wordBreak: 'break-all' }}>
                                {msg.originalName || fileUrl.split('/').pop()}
                              </span>
                              <FaDownload style={{ color: isMine ? '#fff' : '#6366f1' }} />
                            </div>
                          </a>
                        ) : (
                          <div style={{ wordBreak: 'break-word' }}>
                            {msg.content}
                          </div>
                        )}
                      </div>
                      
                      <div className="message-timestamp">
                        <span>
                          {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit',
                            hour12: true 
                          }) : ""}
                        </span>
                        {isMine && (
                          <div className="message-status">
                            {messageStatus[msg._id] === 'sent' && (
                              <span style={{ color: '#4caf50' }}>✓</span>
                            )}
                            {messageStatus[msg._id] === 'delivered' && (
                              <span style={{ color: '#ff9800' }}>✓✓</span>
                            )}
                            {messageStatus[msg._id] === 'read' && (
                              <span style={{ color: '#2196f3' }}>✓✓✓</span>
                            )}
                          </div>
                        )}
                        {msg.edited && (
                          <span className="message-edited">(edited)</span>
                        )}
                      </div>
                    </>
                  )}
                </MessageBubble>
                
                {/* Message Actions */}
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '12px',
                  display: 'flex',
                  gap: '8px',
                  opacity: 0,
                  transition: 'opacity 0.3s ease',
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '4px 8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  <button
                    onClick={() => handleEdit(msg)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#64748b',
                      transition: 'all 0.2s ease',
                      fontSize: '12px'
                    }}
                    title="Edit message"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(msg)}
                    style={{
                      background: 'none',
                      border: 'none',
                      padding: '4px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      color: '#ef4444',
                      transition: 'all 0.2s ease',
                      fontSize: '12px'
                    }}
                    title="Delete message"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </MessageRow>
          );
        })}
        
        {/* Typing Indicator */}
        {isTyping && (
          <MessageRow isMe={false}>
            <Avatar
              src={getProfileImageUrl(otherUser?.profileImage, otherUser?.username, false)}
              alt={otherUser?.username || "User"}
              style={{ marginRight: '16px' }}
              onError={e => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${otherUser?.username || 'User'}&background=8b5cf6&color=fff`;
              }}
            />
            <div style={{ position: 'relative' }}>
              <MessageBubble isMe={false}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '8px 12px',
                  background: 'rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  maxWidth: '60px'
                }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '-0.16s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#6366f1',
                    animation: 'typing 1.4s infinite ease-in-out',
                    animationDelay: '-0.32s'
                  }}></div>
                </div>
              </MessageBubble>
            </div>
          </MessageRow>
        )}
        
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
          value={inputValue}
          onChange={handleInput}
          placeholder="Type a message..."
          disabled={isTyping}
        />
        <IconButton type="button" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
          <BsEmojiSmile />
        </IconButton>
            {showEmojiPicker && (
          <div ref={emojiPickerRef} style={{ position: 'absolute', bottom: '80px', right: '20px', zIndex: 100 }}>
                <Picker
              onEmojiSelect={emoji => setInputValue(prev => prev + emoji.native)}
                  theme="light"
                  showPreview={false}
                  showSkinTones={false}
                />
              </div>
            )}
        <SendButton type="submit" disabled={isTyping || !inputValue.trim()}>
          <IoSend />
        </SendButton>
      </InputArea>

      {/* Delete Confirmation Modal */}
      {deletingMessage && (
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
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>{deletingMessage === 'all' ? 'Delete Chat History?' : 'Delete Message?'}</h3>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>
              {deletingMessage === 'all' ? 'This will permanently delete all messages in this chat. This action cannot be undone.' : 'This action cannot be undone. The message will be permanently deleted.'}
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
                onClick={deletingMessage === 'all' ? handleDeleteAllMessages : handleConfirmDelete}
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

