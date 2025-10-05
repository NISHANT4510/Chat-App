import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useSelector } from "react-redux";
import { getSecureImageUrl, DEFAULT_AVATAR } from "../utils/imageUtils";
// Inline icons to avoid external dependency issues
const IconMenu = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconX = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
const IconSearch = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" />
  </svg>
);
const MessageIcon = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h8M8 14h5M21 12c0 4.418-4.03 8-9 8a9.74 9.74 0 01-4.12-.88L3 20l.88-4.12A8.94 8.94 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const MessagesLayout = () => {
  const [conversations, setConversations] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSidebar, setShowSidebar] = useState(false);

  const currentUser = useSelector((state) => state.user?.currentUser);
  const navigate = useNavigate();
  const location = useLocation();
  const onlineUsers = useSelector((state) => state.messages?.onlineUsers || []);

  /* fetch conversations when user token available */
  useEffect(() => {
    const fetchConversations = async () => {
      if (!currentUser?.token) return;
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/conversations`,
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${currentUser?.token}` },
          }
        );
        setConversations(response.data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      }
    };

    fetchConversations();
  }, [currentUser?.token]);

  /* fetch users when token available */
  useEffect(() => {
    const fetchUsers = async () => {
      if (!currentUser?.token) return;
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/users`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${currentUser?.token}` },
        });
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data.filter((user) => user._id !== currentUser?._id));
        } else if (response.data?.users && Array.isArray(response.data.users)) {
          setUsers(
            response.data.users.filter((user) => user._id !== currentUser?._id)
          );
        } else {
          setUsers([]);
        }
      } catch (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
      }
    };

    if (currentUser?.token) {
      fetchUsers();
    }
  }, [currentUser]);

  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showSidebar]);

  const handleNavigateToUser = (userId) => {
    navigate(`/messages/${userId}`);
    setShowSidebar(false);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch = `${user.fullName || ""} ${user.username || ""}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (filter === "Friends") {
      return (
        matchesSearch &&
        user.relationship === "friends"
      );
    } else if (filter === "Others") {
      return (
        matchesSearch &&
        user.relationship !== "friends"
      );
    }
    return matchesSearch;
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden fixed inset-0 top-16">
      {/* Mobile Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-x-0 top-16 bottom-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setShowSidebar(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static top-16 bottom-0 left-0 z-50
          w-full sm:w-[380px] lg:w-[400px] bg-white dark:bg-gray-900 
          transform transition-all duration-300 ease-out
          ${showSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r border-gray-200 dark:border-gray-800
          flex flex-col shadow-2xl lg:shadow-none
        `}
        role="navigation"
        aria-label="Conversations list"
      >
        {/* Sidebar Header */}
        <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <MessageIcon className="w-6 h-6 text-blue-600 dark:text-blue-500" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h1>
            </div>
            <button
              onClick={() => setShowSidebar(false)}
              className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Close sidebar"
            >
              <IconX className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-600 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-600 transition-all"
              aria-label="Search conversations"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mt-4">
            {['All', 'Friends', 'Others'].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-medium transition-all
                  ${filter === filterOption 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
                aria-pressed={filter === filterOption}
              >
                {filterOption}
              </button>
            ))}
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <MessageIcon className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-sm">No conversations found</p>
            </div>
          ) : (
            <div className="py-2">
              {filteredUsers.map((user) => {
                const isUserOnline = onlineUsers.includes(user._id);
                const isCurrentChat = location.pathname === `/messages/${user._id}`;

                return (
                  <button
                    key={user._id}
                    onClick={() => handleNavigateToUser(user._id)}
                    className={`
                      w-full px-6 py-3 flex items-center gap-3 transition-all hover:bg-gray-50 dark:hover:bg-gray-800/50
                      ${isCurrentChat ? 'bg-gray-100 dark:bg-gray-800' : ''}
                    `}
                    aria-label={`Chat with ${user.fullName || user.username}`}
                    aria-current={isCurrentChat ? 'page' : undefined}
                  >
                    <div className="relative flex-shrink-0">
                      {user.profilePhoto || user.avatar ? (
                        <img
                          src={getSecureImageUrl(user.profilePhoto || user.avatar)}
                          alt=""
                          className="w-11 h-11 rounded-full object-cover"
                          onError={(e) => { e.target.src = DEFAULT_AVATAR; }}
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                          <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      )}
                      {isUserOnline && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" aria-label="Online"></span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0 text-left">
                      <h3 className="font-medium text-gray-900 dark:text-white text-sm mb-0.5">
                        {user.fullName || user.username}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isUserOnline ? 'Online' : 'Offline'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      {/* Main Chat Area */}
      <div className="flex-1 min-h-0 flex flex-col bg-white dark:bg-gray-900 relative">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowSidebar(true)}
          className="lg:hidden fixed top-20 left-4 z-30 p-3 bg-white dark:bg-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105 border border-gray-200 dark:border-gray-800"
          aria-label="Open conversations"
          aria-expanded={showSidebar}
        >
          <IconMenu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        <Outlet />
      </div>
    </div>
  );
};

export default MessagesLayout;
