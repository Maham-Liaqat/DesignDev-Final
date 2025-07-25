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
  background: #f6f9ff;
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  width: 350px;
  background: #fff;
  border-right: 1px solid #e9ecef;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0,0,0,0.05);
`;

const RightPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #fff 40%, #f5debc 100%);
`;

const HeaderTitle = styled.h2`
  font-size: 1.6rem;
  font-weight: 700;
  color: #222b45;
  margin: 0;
`;

const ConversationList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 16px;
`;

const ConversationItem = styled.div`
  display: flex;
  align-items: center;
  padding: 16px;
  margin-bottom: 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.isSelected ? 'linear-gradient(135deg, #4e8cff 0%, #1DAAF5 100%)' : '#fff'};
  color: ${props => props.isSelected ? '#fff' : '#333'};
  box-shadow: ${props => props.isSelected ? '0 4px 12px rgba(78, 140, 255, 0.3)' : '0 1px 3px rgba(0,0,0,0.1)'};

  &:hover {
    background: ${props => props.isSelected ? 'linear-gradient(135deg, #4e8cff 0%, #1DAAF5 100%)' : '#f8f9fa'};
    transform: translateY(-1px);
    box-shadow: ${props => props.isSelected ? '0 4px 12px rgba(78, 140, 255, 0.3)' : '0 2px 8px rgba(0,0,0,0.1)'};
  }
`;

const Avatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid ${props => props.isSelected ? '#fff' : '#e9ecef'};
  margin-right: 16px;
`;

const ConversationInfo = styled.div`
  flex: 1;
`;

const Username = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 4px;
`;

const LastMessage = styled.div`
  font-size: 14px;
  color: ${props => props.isSelected ? 'rgba(255,255,255,0.8)' : '#666'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
`;

const ChatHeader = styled.div`
  display: flex;
  align-items: center;
  padding: 16px 24px;
  background: linear-gradient(135deg, #fff 40%, #f5debc 100%);
  border-bottom: 1px solid #e9ecef;
`;

const ChatAvatar = styled.img`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(81, 16, 88, 0.87);
  margin-right: 16px;
`;

const ChatUserInfo = styled.div`
  flex: 1;
`;

const ChatUserName = styled.div`
  font-weight: 600;
  font-size: 18px;
  color: #333;
`;

const ChatUserStatus = styled.div`
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
    color: rgb(78, 140, 255);
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6c757d;
  text-align: center;
  padding: 40px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyStateText = styled.div`
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 8px;
`;

const EmptyStateSubtext = styled.div`
  font-size: 14px;
  opacity: 0.7;
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
                    <Username>{other?.username || 'User'}</Username>
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
                  {Object.keys(typingUsers).length > 0 ? "Typing..." : "Online"}
                </ChatUserStatus>
              </ChatUserInfo>
              <button
                onClick={() => setDeleteConfirm('all')}
                style={{
                  background: '#1DAAF5',
                  border: 'none',
                  color: '#E1306C',
                  fontWeight: 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  padding: '8px 16px',
                  borderRadius: '8px'
                }}
                title="Delete Chat History"
              >
                Delete Chat History
              </button>
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
    </InboxContainer>
  );
};

export default Inbox; 

