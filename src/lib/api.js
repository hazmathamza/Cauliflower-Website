import { io } from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';
let socket = null;

// Initialize socket connection
export const initializeSocket = (onNewMessage, onFriendRequest, onFriendRequestAccepted, onUserStatusChange) => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      withCredentials: true,
    });

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    // Set up event listeners
    if (onNewMessage) {
      socket.on('new_message', onNewMessage);
    }

    if (onFriendRequest) {
      socket.on('friend_request', onFriendRequest);
    }

    if (onFriendRequestAccepted) {
      socket.on('friend_request_accepted', onFriendRequestAccepted);
    }

    if (onUserStatusChange) {
      socket.on('user_status_change', onUserStatusChange);
    }
  }

  return socket;
};

// Join a channel or DM room
export const joinRoom = (roomId) => {
  if (socket) {
    socket.emit('join', { room: roomId });
  }
};

// Leave a channel or DM room
export const leaveRoom = (roomId) => {
  if (socket) {
    socket.emit('leave', { room: roomId });
  }
};

// Authentication API
export const authAPI = {
  register: async (userData) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Registration failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },
  
  login: async (credentials) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Logout failed');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  },
};

// User API
export const userAPI = {
  getUsers: async () => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch users');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get users error:', error);
      throw error;
    }
  },
  
  getUser: async (userId) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  },
  
  updateUser: async (userId, userData) => {
    try {
      const response = await fetch(`${API_URL}/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update user');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  },
};

// Server API
export const serverAPI = {
  getServers: async () => {
    try {
      const response = await fetch(`${API_URL}/servers`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch servers');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get servers error:', error);
      throw error;
    }
  },
  
  createServer: async (serverData) => {
    try {
      const response = await fetch(`${API_URL}/servers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create server error:', error);
      throw error;
    }
  },
  
  getServer: async (serverId) => {
    try {
      const response = await fetch(`${API_URL}/servers/${serverId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get server error:', error);
      throw error;
    }
  },
  
  updateServer: async (serverId, serverData) => {
    try {
      const response = await fetch(`${API_URL}/servers/${serverId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Update server error:', error);
      throw error;
    }
  },
  
  createChannel: async (serverId, channelData) => {
    try {
      const response = await fetch(`${API_URL}/servers/${serverId}/channels`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(channelData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create channel');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Create channel error:', error);
      throw error;
    }
  },
};

// Message API
export const messageAPI = {
  getMessages: async (channelId) => {
    try {
      const response = await fetch(`${API_URL}/messages/${channelId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch messages');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },
  
  sendMessage: async (channelId, messageData) => {
    try {
      const response = await fetch(`${API_URL}/messages/${channelId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(messageData),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send message');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },
};

// Friend API
export const friendAPI = {
  sendFriendRequest: async (targetUserId) => {
    try {
      const response = await fetch(`${API_URL}/friends/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetUserId }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to send friend request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Send friend request error:', error);
      throw error;
    }
  },
  
  respondToFriendRequest: async (requesterId, action) => {
    try {
      const response = await fetch(`${API_URL}/friends/request/${requesterId}/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
        credentials: 'include',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to respond to friend request');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Respond to friend request error:', error);
      throw error;
    }
  },
};