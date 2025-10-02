import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { getSecureImageUrl, DEFAULT_AVATAR } from '../utils/imageUtils';

const MessagesLayout = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'friends', 'others'
  const currentUser = useSelector(state => state.user?.currentUser);
  const navigate = useNavigate();
  const onlineUsers = useSelector(state => state.messages.onlineUsers);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/conversations`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser?.token}` }
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser?.token}` }
        });
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data.filter(user => user._id !== currentUser?._id));
        } else if (response.data?.users && Array.isArray(response.data.users)) {
          setUsers(response.data.users.filter(user => user._id !== currentUser?._id));
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      }
    };

    if (currentUser?.token) {
      fetchUsers();
    }
  }, [currentUser]);

  const filteredUsers = users.filter(user => {
    const searchContent = `${user.fullName || ''} ${user.username || ''}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return searchContent.includes(query);
  });

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Left sidebar - User List */}
      <div className="w-80 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold mb-4">Messages</h2>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full p-2 pl-8 border rounded-lg focus:outline-none focus:border-blue-500"
              />
              <svg
                className="absolute left-2 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          <div className="flex rounded-lg overflow-hidden border">
            <button
              onClick={() => setFilter('all')}
              className={`flex-1 py-2 text-sm font-medium ${
                filter === 'all' 
                  ? 'bg-blue-500 text-white' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('friends')}
              className={`flex-1 py-2 text-sm font-medium ${
                filter === 'friends'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Friends
            </button>
            <button
              onClick={() => setFilter('others')}
              className={`flex-1 py-2 text-sm font-medium ${
                filter === 'others'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Others
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-[calc(100vh-180px)]">
          {filteredUsers
            .filter(user => {
              if (filter === 'friends') {
                return user.followers?.includes(currentUser?.id) || user.following?.includes(currentUser?.id);
              } else if (filter === 'others') {
                return !user.followers?.includes(currentUser?.id) && !user.following?.includes(currentUser?.id);
              }
              return true;
            })
            .map(user => (
            <div
              key={user._id}
              onClick={() => navigate(`/messages/${user._id}`)}
              className="flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b"
            >
              <div className="relative">
                <img
                  src={getSecureImageUrl(user.profilePhoto || user.avatar) || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName || user.username)}&background=random`}
                  alt={user.fullName || user.username}
                  className="w-10 h-10 rounded-full object-cover"
                  onError={(e) => {
                    e.target.src = DEFAULT_AVATAR;
                  }}
                />
                {onlineUsers.includes(user._id) && (
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">{user.fullName || user.username}</h3>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100">
                    {user.followers?.includes(currentUser?.id) && user.following?.includes(currentUser?.id) 
                      ? 'Friend'
                      : user.followers?.includes(currentUser?.id)
                      ? 'Follows you'
                      : user.following?.includes(currentUser?.id)
                      ? 'Following'
                      : ''}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <span>{onlineUsers.includes(user._id) ? 'Online' : 'Offline'}</span>
                  {user.lastSeen && !onlineUsers.includes(user._id) && (
                    <span className="ml-2 text-xs">
                      Last seen: {new Date(user.lastSeen).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
};

export default MessagesLayout;