import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { messageAPI } from '../api';
import { connectSocket, disconnectSocket, getSocket } from '../utils/socket';
import {
  HiOutlinePaperAirplane,
  HiOutlineChatBubbleLeftRight,
  HiOutlineMagnifyingGlass,
} from 'react-icons/hi2';

const ChatPage = () => {
  const { user } = useAuth();
  const [chatUsers, setChatUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typing, setTyping] = useState(false);
  const [search, setSearch] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(true);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    const socket = connectSocket();
    fetchChatUsers();

    if (socket) {
      socket.on('receiveMessage', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('messageSent', (msg) => {
        setMessages((prev) => [...prev, msg]);
      });

      socket.on('onlineUsers', (users) => {
        setOnlineUsers(users);
      });

      socket.on('userTyping', ({ userId }) => {
        if (userId === selectedUser?._id) setTyping(true);
      });

      socket.on('userStoppedTyping', () => {
        setTyping(false);
      });
    }

    return () => {
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser._id);
    }
  }, [selectedUser]);

  const fetchChatUsers = async () => {
    try {
      const { data } = await messageAPI.getChatUsers();
      setChatUsers(data.data.users);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchMessages = async (userId) => {
    try {
      const { data } = await messageAPI.getMessages(userId);
      setMessages(data.data.messages);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('sendMessage', {
        receiverId: selectedUser._id,
        content: newMessage.trim(),
      });
      socket.emit('stopTyping', { receiverId: selectedUser._id });
    }
    setNewMessage('');
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    const socket = getSocket();
    if (socket && selectedUser) {
      socket.emit('typing', { receiverId: selectedUser._id });
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('stopTyping', { receiverId: selectedUser._id });
      }, 1500);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const isOnline = (userId) => onlineUsers.includes(userId);

  const filteredUsers = chatUsers.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-7rem)] gap-4 animate-fadeIn">
      {/* Sidebar — Users */}
      <div className="w-80 shrink-0 glass rounded-2xl flex flex-col overflow-hidden">
        <div className="p-4 border-b border-dark-700/50">
          <h2 className="text-lg font-semibold text-dark-100 mb-3">Messages</h2>
          <div className="relative">
            <HiOutlineMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loadingUsers ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8 text-dark-500 text-sm">No users found</div>
          ) : (
            filteredUsers.map((u) => (
              <button
                key={u._id}
                onClick={() => setSelectedUser(u)}
                className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all ${
                  selectedUser?._id === u._id
                    ? 'bg-primary-500/10 border-l-2 border-primary-500'
                    : 'hover:bg-dark-800/40 border-l-2 border-transparent'
                }`}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-dark-700 flex items-center justify-center text-dark-300 font-medium text-sm">
                    {u.name?.charAt(0)?.toUpperCase()}
                  </div>
                  {isOnline(u._id) && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-emerald rounded-full border-2 border-dark-900" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark-100 truncate">{u.name}</p>
                  <p className="text-xs text-dark-500 capitalize">{u.role}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 glass rounded-2xl flex flex-col overflow-hidden">
        {selectedUser ? (
          <>
            {/* Chat header */}
            <div className="px-6 py-4 border-b border-dark-700/50 flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold text-sm">
                  {selectedUser.name?.charAt(0)?.toUpperCase()}
                </div>
                {isOnline(selectedUser._id) && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-accent-emerald rounded-full border-2 border-dark-900" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-dark-100">{selectedUser.name}</h3>
                <p className="text-xs text-dark-500">
                  {typing ? (
                    <span className="text-accent-emerald">typing...</span>
                  ) : isOnline(selectedUser._id) ? (
                    <span className="text-accent-emerald">Online</span>
                  ) : (
                    'Offline'
                  )}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-16">
                  <HiOutlineChatBubbleLeftRight className="w-12 h-12 text-dark-600 mx-auto mb-3" />
                  <p className="text-dark-500 text-sm">No messages yet. Say hello! 👋</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = (msg.sender?._id || msg.sender) === user?._id;
                  return (
                    <div key={msg._id || idx} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl text-sm ${
                          isMine
                            ? 'gradient-primary text-white rounded-br-md'
                            : 'bg-dark-800 text-dark-200 rounded-bl-md'
                        }`}
                      >
                        <p>{msg.content}</p>
                        <p className={`text-xs mt-1 ${isMine ? 'text-white/50' : 'text-dark-500'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="p-4 border-t border-dark-700/50">
              <div className="flex gap-3">
                <input
                  value={newMessage}
                  onChange={handleTyping}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 rounded-xl bg-dark-800/60 border border-dark-700 text-dark-100 text-sm focus:outline-none focus:border-primary-500 transition-all"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="px-5 py-3 rounded-xl gradient-primary text-white hover:opacity-90 disabled:opacity-30 transition-all"
                >
                  <HiOutlinePaperAirplane className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <HiOutlineChatBubbleLeftRight className="w-16 h-16 text-dark-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-dark-300">Select a conversation</h3>
              <p className="text-dark-500 text-sm mt-1">Choose someone to start chatting with</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
