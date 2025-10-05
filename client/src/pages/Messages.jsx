import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getSecureImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';
import { sendMessage, connectSocket, disconnectSocket, getSocket } from '../utils/socket';
// Inline message icon to avoid external dependency issues
const MessageIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.74 9.74 0 01-4.12-.88L3 20l.88-4.12A8.94 8.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [receiverInfo, setReceiverInfo] = useState(null);
  const { receiverId } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector(state => state.user.currentUser);
  const token = useSelector(state => state.user.currentUser?.token);
  const onlineUsers = useSelector(state => state.messages?.onlineUsers || []);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);

  useEffect(() => {
    if (currentUser?._id) {
      connectSocket(currentUser._id);
      return () => disconnectSocket();
    }
  }, [currentUser?._id]);

  const scrollToBottom = (behavior = 'smooth') => {
    const el = messagesContainerRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiverId || !token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/messages/${receiverId}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        if (response.data) {
          setMessages(Array.isArray(response.data) ? response.data : []);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
        setMessages([]);
      }
    };

    fetchMessages();
  }, [receiverId, token]);

  useEffect(() => {
    const fetchReceiverInfo = async () => {
      if (!receiverId || !token) return;
      
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/users/${receiverId}`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setReceiverInfo(response.data);
      } catch (error) {
        console.error('Error fetching receiver info:', error);
      }
    };

    fetchReceiverInfo();
  }, [receiverId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ensure we start at bottom when switching chats
  useEffect(() => {
    requestAnimationFrame(() => scrollToBottom('auto'));
  }, [receiverId]);

  // Listen for new messages
  useEffect(() => {
    if (!currentUser?._id) return;
    
    const handleNewMessage = (message) => {
      if (message.senderId === receiverId || message.receiverId === receiverId) {
        setMessages(prev => [...prev, message]);
      }
    };

    const socket = getSocket();
    if (socket) {
      socket.on('newMessage', handleNewMessage);
      
      return () => {
        socket.off('newMessage', handleNewMessage);
      };
    }
  }, [currentUser?._id, receiverId]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !currentUser || !receiverId) {
      console.error('Missing required fields:', {
        hasMessage: !!newMessage.trim(),
        hasCurrentUser: !!currentUser,
        hasReceiverId: !!receiverId
      });
      return;
    }

    try {
      console.log('Sending message to:', receiverId);
      // Create message data
      const messageData = {
        senderId: currentUser._id,
        receiverId: receiverId,
        text: newMessage,
        timestamp: new Date().toISOString()
      };

      // Try to send through socket first for immediate delivery
      try {
        console.log('Attempting socket message:', messageData);
        await sendMessage(messageData);
        console.log('Socket message sent successfully');
        // Still save to database even if socket succeeds
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/messages/${receiverId}`,
          { messageBody: newMessage },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const savedMsg = response.data;
        setMessages(prev => [...prev, savedMsg]);
        setNewMessage('');
        scrollToBottom();
        return;
      } catch (error) {
        if (error.message === 'User is offline') {
          console.warn('Socket message send failed: User is offline');
          // Continue with HTTP fallback
          console.log('Falling back to HTTP request...');
        } else {
          throw error;
        }
      }

      // Save to database (this serves as a fallback if socket fails)
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/messages/${receiverId}`,
        { messageBody: newMessage },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      const savedMsg = response.data;
      setMessages(prev => [...prev, savedMsg]);
      setNewMessage('');

      // Scroll to bottom
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const isOnline = receiverInfo && onlineUsers.includes(receiverId);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  if (!receiverId) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <div className="text-center p-8 animate-fade-in">
          <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-full flex items-center justify-center">
            <MessageIcon className="w-12 h-12 text-blue-600 dark:text-blue-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Your Messages</h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm">Select a conversation from the sidebar to start chatting</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0 bg-white dark:bg-gray-900 overflow-hidden">
      {/* Chat Header */}
      <header className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/messages')}
            className="lg:hidden p-2 -ml-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            aria-label="Back to conversations"
          >
            <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="relative flex-shrink-0">
            <img
              src={getSecureImageUrl(receiverInfo?.profilePhoto || receiverInfo?.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(receiverInfo?.fullName || receiverInfo?.username || 'User')}&background=random`}
              alt={receiverInfo?.fullName || receiverInfo?.username}
              className="w-11 h-11 lg:w-12 lg:h-12 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
            />
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" aria-label="Online"></span>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h2 className="font-semibold text-gray-900 dark:text-white text-base lg:text-lg truncate">
              {receiverInfo?.fullName || receiverInfo?.username || 'Loading...'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {isOnline ? 'Active now' : 'Offline'}
            </p>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 lg:px-6 pt-4 pb-28 bg-gray-50 dark:bg-gray-950" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0 0 0 / 0.03) 1px, transparent 0)', backgroundSize: '24px 24px' }}>
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full animate-fade-in">
            <div className="text-center text-gray-400 dark:text-gray-600">
              <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <MessageIcon className="w-8 h-8" />
              </div>
              <p className="text-sm">No messages yet</p>
              <p className="text-xs mt-1">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-3">
            {messages.map((message, index) => {
              const isSent = message.senderId === currentUser?._id;
              const showTime = index === 0 || 
                (new Date(message.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime()) > 300000;
              
              return (
                <div key={message._id} className="animate-fade-in">
                  {showTime && (
                    <div className="text-center text-xs text-gray-400 dark:text-gray-600 my-6">
                      <span className="bg-white dark:bg-gray-900 px-3 py-1 rounded-full shadow-sm">
                        {new Date(message.timestamp).toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  <div className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}>
                    <div className="group max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]">
                      <div
                        className={`
                          rounded-2xl px-4 py-2.5 break-words shadow-sm
                          ${isSent
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                            : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                          }
                        `}
                      >
                        <p className="text-sm lg:text-base leading-relaxed whitespace-pre-wrap">{message.text}</p>
                      </div>
                      <div className={`text-[10px] text-gray-400 dark:text-gray-600 mt-1 px-1 ${isSent ? 'text-right' : 'text-left'}`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <footer className="sticky bottom-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 lg:py-4 shadow-lg z-20" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 0.5rem)' }}>
        <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto">
          <div className="flex items-end gap-6 lg:gap-3">
            <div className="flex-1 relative">
              <textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
                placeholder="Type a message..."
                rows={1}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-3xl focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900/30 resize-none text-sm lg:text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all"
                style={{ maxHeight: '120px', minHeight: '44px' }}
                aria-label="Type your message"
              />
            </div>
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className={`
                p-3 lg:p-3.5 rounded-full transition-all flex-shrink-0
                ${newMessage.trim()
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95'
                  : 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }
              `}
              aria-label="Send message"
            
            >
              <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </form>
      </footer>
    </div>
  );
};

export default Messages;
