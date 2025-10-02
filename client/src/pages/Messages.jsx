import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getSecureImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';
import { sendMessage, connectSocket, disconnectSocket, getSocket } from '../utils/socket';

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const { receiverId } = useParams();
  const currentUser = useSelector(state => state.user.currentUser);
  const token = useSelector(state => state.user.currentUser?.token);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (currentUser?._id) {
      connectSocket(currentUser._id);
      return () => disconnectSocket();
    }
  }, [currentUser?._id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
      if (!receiverId || !token) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/messages/${receiverId}`,
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
  }, [receiverId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`flex ${
              message.senderId === currentUser?._id ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`rounded-lg px-4 py-2 max-w-[70%] ${
                message.senderId === currentUser?._id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200'
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 border-t">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 p-2 border rounded-lg focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default Messages;



