import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useChat } from "../contexts/ChatContext";
import Picker from "@emoji-mart/react";
import { FaPaperclip, FaFilePdf, FaFileWord, FaFileArchive, FaFileAlt, FaDownload, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import { BsEmojiSmile } from 'react-icons/bs';
import styled from 'styled-components';
import VoiceNotePlayer from './VoiceNotePlayer';
import API_CONFIG from '../config/api';

const API_URL = API_CONFIG.BASE_URL;

// ========== STYLED COMPONENTS ========== //
const InboxContainer = styled.div`
  display: flex;
  height: 100vh;
  background: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: 380px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #ffffff;
`;

const Header = styled.div`
  padding: 24px 28px;
  border-bottom: 1px solid #e2e8f0;
  background: #ffffff;
`;

const HeaderTitle = styled.h2`
  font-size: 1.75rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
  letter-spacing: -0.025em;
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px 20px;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 20px;
  margin-bottom: 8px;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#ffffff'};
  color: ${props => props.isSelected ? '#ffffff' : '#1e293b'};
  box-shadow: ${props => props.isSelected ? '0 4px 12px rgba(99, 102, 241, 0.25)' : '0 1px 2px rgba(0, 0, 0, 0.05)'};
  border: ${props => props.isSelected ? 'none' : '1px solid #f1f5f9'};

  &:hover {
    background: ${props => props.isSelected ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#f8fafc'};
    transform: translateY(-1px);
    box-shadow: ${props => props.isSelected ? '0 4px 12px rgba(99, 102, 241, 0.25)' : '0 2px 8px rgba(0, 0, 0, 0.08)'};
  }
`;

const Avatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.isSelected ? '#ffffff' : '#e2e8f0'};
  margin-right: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ConversationInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const Username = styled.div`
  font-weight: 600;
  font-size: 15px;
  margin-bottom: 4px;
  color: ${props => props.isSelected ? '#ffffff' : '#1e293b'};
`;

const LastMessage = styled.div`
  font-size: 13px;
  color: ${props => props.isSelected ? 'rgba(255, 255, 255, 0.85)' : '#64748b'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  line-height: 1.4;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 20px 28px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ChatAvatar = styled.img`
  width: 52px;
  height: 52px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
  margin-right: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ChatUserInfo = styled.div`
  flex: 1;
`;

const ChatUserName = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #1e293b;
  margin-bottom: 2px;
`;

const ChatUserStatus = styled.div`
  font-size: 14px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const StatusDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
`;

const ChatBody = styled.div`
  flex: 1;
  padding: 24px 28px;
  overflow-y: auto;
  background: #f8fafc;
  background-image: 
    linear-gradient(rgba(226, 232, 240, 0.3) 1px, transparent 1px),
    linear-gradient(90deg, rgba(226, 232, 240, 0.3) 1px, transparent 1px);
  background-size: 20px 20px;
`;

const MessageRow = styled.div`
  display: flex;
  margin-bottom: 20px;
  justify-content: ${props => props.isMe ? 'flex-end' : 'flex-start'};
  position: relative;
  align-items: flex-end;
  
  &:hover {
    .message-actions {
      opacity: 1;
    }
  }
`;

const MessageBubble = styled.div`
  max-width: 70%;
  padding: 12px 18px;
  border-radius: ${props => props.isMe ? '20px 20px 6px 20px' : '20px 20px 20px 6px'};
  background: ${props => props.isMe ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' : '#ffffff'};
  color: ${props => props.isMe ? '#ffffff' : '#1e293b'};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: relative;
  word-wrap: break-word;
  line-height: 1.5;
  font-size: 15px;
  border: ${props => props.isMe ? 'none' : '1px solid #e2e8f0'};
`;

const MessageTime = styled.div`
  font-size: 11px;
  color: ${props => props.isMe ? 'rgba(255, 255, 255, 0.7)' : '#94a3b8'};
  text-align: right;
  margin-top: 6px;
  font-weight: 500;
`;

const InputArea = styled.form`
  display: flex;
  padding: 20px 28px;
  background: #ffffff;
  border-top: 1px solid #e2e8f0;
  align-items: center;
  gap: 12px;
`;

const InputField = styled.input`
  flex: 1;
  padding: 14px 20px;
  border-radius: 24px;
  border: 1px solid #e2e8f0;
  outline: none;
  font-size: 15px;
  background: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
  
  &:focus {
    border-color: #6366f1;
    background: #ffffff;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #94a3b8;
  }
`;

const IconButton = styled.button`
  background: transparent;
  border: none;
  color: #64748b;
  font-size: 20px;
  cursor: pointer;
  padding: 10px;
  border-radius: 50%;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f1f5f9;
    color: #6366f1;
    transform: scale(1.05);
  }
`;

const SendButton = styled(IconButton)`
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  
  &:hover {
    background: rgba(99, 102, 241, 0.15);
    color: #6366f1;
  }
  
  &:disabled {
    color: #cbd5e1;
    background: transparent;
    cursor: not-allowed;
    transform: none;
  }
`;

const FileCard = styled.a`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  background: ${props => props.isMe ? 'rgba(255, 255, 255, 0.15)' : '#f8fafc'};
  border-radius: 12px;
  text-decoration: none;
  color: ${props => props.isMe ? '#ffffff' : '#1e293b'};
  margin: 8px 0;
  transition: all 0.2s ease;
  border: ${props => props.isMe ? 'none' : '1px solid #e2e8f0'};
  
  &:hover {
    background: ${props => props.isMe ? 'rgba(255, 255, 255, 0.2)' : '#f1f5f9'};
    transform: translateY(-1px);
  }
`;

const MessageActions = styled.div`
  position: absolute;
  top: -32px;
  right: 0;
  display: flex;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 6px;
  opacity: 0;
  transition: opacity 0.2s ease;
  border: 1px solid #e2e8f0;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #64748b;
  padding: 6px;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  
  &:hover {
    color: #6366f1;
    background: #f1f5f9;
  }
`;

const DeletedMessage = styled.div`
  font-style: italic;
  color: #94a3b8;
  padding: 12px 18px;
  background: #f8fafc;
  border-radius: 20px;
  margin-bottom: 8px;
  display: inline-block;
  max-width: 80%;
  border: 1px solid #e2e8f0;
  font-size: 14px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #64748b;
  text-align: center;
  padding: 40px;
`;

const EmptyStateIcon = styled.div`
  font-size: 64px;
  margin-bottom: 20px;
  opacity: 0.6;
`;

const EmptyStateText = styled.div`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
`;

const EmptyStateSubtext = styled.div`
  font-size: 15px;
  opacity: 0.8;
  line-height: 1.5;
`;

const DeleteButton = styled.button`
  background: #ef4444;
  border: none;
  color: #ffffff;
  font-weight: 500;
  font-size: 13px;
  cursor: pointer;
  padding: 8px 16px;
  border-radius: 8px;
  transition: all 0.2s ease;
  
  &:hover {
    background: #dc2626;
    transform: translateY(-1px);
  }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  color: #64748b;
  font-size: 13px;
  font-style: italic;
`;

const TypingDots = styled.div`
  display: flex;
  gap: 2px;
  
  span {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: #94a3b8;
    animation: typing 1.4s infinite ease-in-out;
    
    &:nth-child(1) { animation-delay: -0.32s; }
    &:nth-child(2) { animation-delay: -0.16s; }
  }
  
  @keyframes typing {
    0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
    40% { transform: scale(1); opacity: 1; }
  }
`;

// ========== UTILITY FUNCTIONS ========== //
const getProfileImageUrl = (path, username) => {
  if (!path) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username || 'User')}&background=4e8cff&color=fff`;
  }
  if (/^https?:\/\//.test(path)) return path;
  const cleanPath = path.replace(/^(uploads[\\/]+)+/, '');
  return `${API_URL}/uploads/${cleanPath}`;
};

const getFileIcon = (fileType, fileUrl) => {
  if (!fileType) {
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
  if (/^https?:\/\//.test(url)) return url;
  let safeUrl = url.replace(/\\/g, '/').replace(/^upLoads/i, 'uploads');
  if (safeUrl.startsWith('/')) safeUrl = safeUrl.slice(1);
  return `${API_URL}/${safeUrl}`;
};

const isLikelyFile = (url) => {
  if (!url) return false;
  return /\.(png|jpe?g|gif|pdf|docx?|zip|rar|mp3|wav|webm)$/i.test(url);
};

// ========== MAIN COMPONENT ========== //
const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingMsgId, setEditingMsgId] = useState(null);
  const [editInput, setEditInput] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const { socket, typingUsers } = useChat();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  // Get selected conversation from location state
  useEffect(() => {
    if (location.state?.selectedConversationId) {
      setSelectedConversation(location.state.selectedConversationId);
    }
  }, [location.state]);

  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${API_URL}/api/chat/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log("Conversations API response:", res.data);
        setConversations(res.data.conversations || []);
      } catch (err) {
        console.error("Error fetching conversations:", err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchConversations();
  }, [token]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) {
      setMessages([]);
      return;
    }

    const fetchMessages = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/chat/messages/${selectedConversation}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMessages(res.data.messages || []);
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    fetchMessages();

    if (socket) {
      socket.emit("join_conversation", selectedConversation);
      socket.emit("read_messages", { conversationId: selectedConversation, userId });

      socket.on("receive_message", (msg) => {
        setMessages(prev => [...prev, msg]);
        if (msg.senderId !== userId) {
          socket.emit("read_messages", { conversationId: selectedConversation, userId });
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
  }, [selectedConversation, socket, userId, token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getOtherParticipant = (conv) => {
    return conv.participants.find(p => p._id !== userId);
  };

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation._id);
  };

  const handleInput = (e) => {
    setInput(e.target.value);
    if (socket && selectedConversation) {
      if (!typing) {
        setTyping(true);
        socket.emit("typing", { conversationId: selectedConversation, userId });
      }
      clearTimeout(window.typingTimeout);
      window.typingTimeout = setTimeout(() => {
        setTyping(false);
        socket.emit("stop_typing", { conversationId: selectedConversation, userId });
      }, 1000);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim() || !selectedConversation) return;
    
    if (socket) {
      socket.emit("send_message", { 
        conversationId: selectedConversation, 
        senderId: userId, 
        content: input 
      });
    }
    setInput("");
    setTyping(false);
    if (socket) socket.emit("stop_typing", { conversationId: selectedConversation, userId });
    setShowEmojiPicker(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedConversation) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const res = await axios.post(`${API_URL}/api/chat/upload`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (socket && res.data.fileUrl) {
        socket.emit("send_message", {
          conversationId: selectedConversation,
          senderId: userId,
          content: res.data.fileUrl,
          fileUrl: res.data.fileUrl,
          fileType: res.data.fileType,
          originalName: file.name
        });
      }
    } catch (err) {
      console.error("Error uploading file:", err);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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
      socket.emit("delete_message", { messageId: deleteConfirm._id });
    }
    setDeleteConfirm(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirm(null);
  };

  const handleDeleteAllMessages = async () => {
    try {
      await axios.delete(`${API_URL}/api/chat/messages/${selectedConversation}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages([]);
      setDeleteConfirm(null);
    } catch (err) {
      alert('Failed to delete chat history.');
      setDeleteConfirm(null);
    }
  };

  const otherUser = selectedConversation ? 
    conversations.find(c => c._id === selectedConversation)?.participants.find(u => u._id !== userId) : null;

  return (
    <InboxContainer>
      {/* Left Panel - Conversation List */}
      <LeftPanel>
        <Header>
          <HeaderTitle>Inbox</HeaderTitle>
        </Header>
        <ConversationList>
          {loading ? (
            <EmptyState>
              <EmptyStateText>Loading conversations...</EmptyStateText>
            </EmptyState>
          ) : conversations.length === 0 ? (
            <EmptyState>
              <EmptyStateIcon>💬</EmptyStateIcon>
              <EmptyStateText>No conversations yet</EmptyStateText>
              <EmptyStateSubtext>Start chatting with a seller or buyer!</EmptyStateSubtext>
            </EmptyState>
          ) : (
            conversations.map(conv => {
              const other = getOtherParticipant(conv);
              const isSelected = selectedConversation === conv._id;
              return (
                <ConversationItem
                  key={conv._id}
                  isSelected={isSelected}
                  onClick={() => handleConversationSelect(conv)}
                >
                  <Avatar
                    src={getProfileImageUrl(other?.profileImage, other?.username)}
                    alt="avatar"
                    isSelected={isSelected}
                    onError={e => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${other?.username || 'User'}`;
                    }}
                  />
                  <ConversationInfo>
                    <Username isSelected={isSelected}>{other?.username || 'User'}</Username>
                    <LastMessage isSelected={isSelected}>
                      {conv.lastMessage || 'Start a conversation...'}
                    </LastMessage>
                  </ConversationInfo>
                </ConversationItem>
              );
            })
          )}
        </ConversationList>
      </LeftPanel>

      {/* Right Panel - Chat */}
      <RightPanel>
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <ChatHeader>
              <ChatAvatar
                src={getProfileImageUrl(otherUser?.profileImage, otherUser?.username)}
                alt="avatar"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = `https://ui-avatars.com/api/?name=${otherUser?.username || 'User'}&background=4e8cff&color=fff`;
                }}
              />
              <ChatUserInfo>
                <ChatUserName>{otherUser?.username || "User"}</ChatUserName>
                <ChatUserStatus>
                  {Object.keys(typingUsers).length > 0 ? (
                    <>
                      <TypingDots>
                        <span></span>
                        <span></span>
                        <span></span>
                      </TypingDots>
                      <TypingIndicator>Typing...</TypingIndicator>
                    </>
                  ) : (
                    "Online"
                  )}
                </ChatUserStatus>
              </ChatUserInfo>
              <DeleteButton onClick={() => setDeleteConfirm('all')}>
                Delete Chat History
              </DeleteButton>
            </ChatHeader>

            {/* Chat Body */}
            <ChatBody>
              {messages.map((msg) => {
                const isMine = msg.senderId === userId;
                const fileUrl = getSafeFileUrl(msg.fileUrl || msg.content);
                const fileType = msg.fileType || (fileUrl.match(/\.(png|jpe?g|gif)$/i) ? 'image' : fileUrl.match(/\.(pdf|docx?|zip|rar)$/i) ? 'file' : undefined);

                if (msg.deleted) {
                  return (
                    <MessageRow key={msg._id} isMe={isMine}>
                      <DeletedMessage>
                        <FaTrash style={{ marginRight: 6, color: '#94a3b8', verticalAlign: 'middle' }} />
                        This message was deleted
                      </DeletedMessage>
                    </MessageRow>
                  );
                }

                return (
                  <MessageRow key={msg._id} isMe={isMine}>
                    {!isMine && (
                      <Avatar
                        src={getProfileImageUrl(msg.sender?.profileImage, msg.sender?.username)}
                        alt="avatar"
                        style={{ marginRight: '16px' }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${msg.sender?.username || 'User'}&background=4e8cff&color=fff`;
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
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '15px',
                                background: '#f8fafc',
                                color: '#1e293b'
                              }}
                              autoFocus
                            />
                            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                              <button
                                onClick={() => handleEditSave(msg)}
                                style={{
                                  padding: '4px 8px',
                                  background: '#6366f1',
                                  color: '#ffffff',
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
                                  background: '#94a3b8',
                                  color: '#ffffff',
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
                                    <div style={{ fontSize: '12px', color: isMine ? 'rgba(255,255,255,0.7)' : '#64748b' }}>
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
                            <span style={{ marginLeft: '6px', color: '#10b981' }}>✓✓</span>
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

                    {isMine && (
                      <Avatar
                        src={getProfileImageUrl(msg.sender?.profileImage, msg.sender?.username)}
                        alt="avatar"
                        style={{ marginLeft: '16px' }}
                        onError={e => {
                          e.target.onerror = null;
                          e.target.src = `https://ui-avatars.com/api/?name=${msg.sender?.username || 'User'}&background=4e8cff&color=fff`;
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
          </>
        ) : (
          <EmptyState>
            <EmptyStateIcon>💬</EmptyStateIcon>
            <EmptyStateText>Select a conversation</EmptyStateText>
            <EmptyStateSubtext>Choose a conversation from the list to start chatting</EmptyStateSubtext>
          </EmptyState>
        )}
      </RightPanel>

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
            <h3 style={{ margin: '0 0 16px 0', color: '#333' }}>
              {deleteConfirm === 'all' ? 'Delete Chat History?' : 'Delete Message?'}
            </h3>
            <p style={{ margin: '0 0 24px 0', color: '#666' }}>
              {deleteConfirm === 'all' 
                ? 'This will permanently delete all messages in this chat. This action cannot be undone.' 
                : 'This action cannot be undone. The message will be permanently deleted.'
              }
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
                  background: '#ef4444',
                  color: '#ffffff',
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
    </InboxContainer>
  );
};

export default Inbox; 

