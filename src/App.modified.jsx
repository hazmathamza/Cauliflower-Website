import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import ServerList from '@/components/ServerList';
import ChannelList from '@/components/ChannelList';
import ChatArea from '@/components/ChatArea';
import MemberList from '@/components/MemberList';
import AuthScreen from '@/components/AuthScreen';
import UserSettingsPage from '@/pages/UserSettingsPage';
import ServerSettingsPage from '@/pages/ServerSettingsPage';
import FriendsPage from '@/pages/FriendsPage'; 
import { Toaster } from '@/components/ui/toaster';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/components/ui/use-toast';
import { 
  authAPI, 
  userAPI, 
  serverAPI, 
  messageAPI, 
  friendAPI, 
  initializeSocket, 
  joinRoom, 
  leaveRoom 
} from '@/lib/api';

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage('discord-currentUser', null);
  const navigate = useNavigate();
  const location = useLocation();

  const [servers, setServers] = useState([]);
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [activeServerId, setActiveServerId] = useLocalStorage('discord-activeServerId', 'home');
  const [activeChannelId, setActiveChannelId] = useLocalStorage('discord-activeChannelId', null);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (currentUser) {
      const handleNewMessage = (data) => {
        const { channelId, message } = data;
        setMessages(prev => ({
          ...prev,
          [channelId]: [...(prev[channelId] || []), message]
        }));
      };

      const handleFriendRequest = (data) => {
        const { fromUserId } = data;
        if (fromUserId && currentUser) {
          // Update the current user's friend requests
          userAPI.getUser(currentUser.id)
            .then(updatedUser => {
              setCurrentUser(updatedUser);
              toast({ 
                title: "New Friend Request", 
                description: `You have a new friend request from ${users.find(u => u.id === fromUserId)?.username || 'someone'}!` 
              });
            })
            .catch(error => console.error('Error fetching updated user:', error));
        }
      };

      const handleFriendRequestAccepted = (data) => {
        const { userId, friendId, dmChannelId } = data;
        if ((userId === currentUser.id || friendId === currentUser.id) && dmChannelId) {
          // Update the current user's friends list
          userAPI.getUser(currentUser.id)
            .then(updatedUser => {
              setCurrentUser(updatedUser);
              
              // Initialize messages for the DM channel if needed
              if (!messages[dmChannelId]) {
                messageAPI.getMessages(dmChannelId)
                  .then(channelMessages => {
                    setMessages(prev => ({
                      ...prev,
                      [dmChannelId]: channelMessages
                    }));
                  })
                  .catch(error => console.error('Error fetching DM messages:', error));
              }
              
              const friendName = users.find(u => u.id === (userId === currentUser.id ? friendId : userId))?.username || 'someone';
              toast({ 
                title: "Friend Request Accepted", 
                description: `You are now friends with ${friendName}!` 
              });
            })
            .catch(error => console.error('Error fetching updated user:', error));
        }
      };

      const handleUserStatusChange = (data) => {
        const { userId, status } = data;
        if (userId && status) {
          // Update the user's status in the users list
          setUsers(prevUsers => prevUsers.map(user => 
            user.id === userId ? { ...user, status } : user
          ));
          
          // Update online users list
          if (status === 'Online' || status === 'Always Online') {
            setOnlineUsers(prev => prev.includes(userId) ? prev : [...prev, userId]);
          } else {
            setOnlineUsers(prev => prev.filter(id => id !== userId));
          }
        }
      };

      const newSocket = initializeSocket(
        handleNewMessage,
        handleFriendRequest,
        handleFriendRequestAccepted,
        handleUserStatusChange
      );
      
      setSocket(newSocket);
      
      // Join the user's own room for direct messages
      joinRoom(currentUser.id);
      
      // Join the active channel room if any
      if (activeChannelId) {
        joinRoom(activeChannelId);
      }
      
      return () => {
        if (activeChannelId) {
          leaveRoom(activeChannelId);
        }
        if (currentUser) {
          leaveRoom(currentUser.id);
        }
      };
    }
  }, [currentUser, activeChannelId]);

  // Fetch initial data
  useEffect(() => {
    if (currentUser) {
      // Fetch servers
      serverAPI.getServers()
        .then(fetchedServers => {
          setServers(fetchedServers);
          
          // If there's an active server and channel, fetch messages for that channel
          if (activeServerId !== 'home' && activeChannelId) {
            messageAPI.getMessages(activeChannelId)
              .then(channelMessages => {
                setMessages(prev => ({
                  ...prev,
                  [activeChannelId]: channelMessages
                }));
              })
              .catch(error => console.error('Error fetching channel messages:', error));
          }
        })
        .catch(error => console.error('Error fetching servers:', error));
      
      // Fetch users
      userAPI.getUsers()
        .then(fetchedUsers => {
          setUsers(fetchedUsers);
          
          // Set online users
          const onlineUserIds = fetchedUsers
            .filter(u => u.status === 'Online' || u.status === 'Always Online')
            .map(u => u.id);
          
          setOnlineUsers(onlineUserIds);
          
          // Set members
          const initialMembers = fetchedUsers.map(u => ({
            id: u.id,
            name: u.username,
            role: u.role,
            status: u.status,
            avatar: u.avatar,
            customStatus: u.customStatus,
            pronouns: u.pronouns,
            aboutMe: u.aboutMe
          }));
          
          setMembers(initialMembers);
        })
        .catch(error => console.error('Error fetching users:', error));
    }
  }, [currentUser, activeServerId, activeChannelId]);

  useEffect(() => {
    if (!currentUser && !['/auth', '/friends'].includes(location.pathname)) {
      navigate('/auth');
    } else if (!currentUser && location.pathname === '/friends') {
       navigate('/auth')
    }
  }, [currentUser, location.pathname, navigate]);
  
  useEffect(() => {
    if (currentUser && location.pathname === '/auth') {
      navigate('/');
    }
  }, [currentUser, location.pathname, navigate]);

  const currentServer = servers.find(s => s.id === activeServerId);
  const currentChannel = currentServer?.channels.find(c => c.id === activeChannelId);
  const currentMessages = activeChannelId ? (messages[activeChannelId] || []) : [];

  const handleAuthSuccess = async (user) => {
    try {
      // Login or register the user
      let loggedInUser;
      if (user.isRegistering) {
        loggedInUser = await authAPI.register({
          username: user.username,
          email: user.email,
          password: user.password
        });
      } else {
        loggedInUser = await authAPI.login({
          email: user.email,
          password: user.password
        });
      }
      
      setCurrentUser(loggedInUser);
      toast({ 
        title: user.isRegistering ? "Registration Successful!" : "Login Successful!", 
        description: user.isRegistering ? `Welcome, ${loggedInUser.username}!` : `Welcome back, ${loggedInUser.username}!` 
      });
      navigate('/');
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: user.isRegistering ? "Registration Failed" : "Login Failed", 
        description: error.message 
      });
    }
  };

  const handleLogout = async () => {
    if (!currentUser) return;
    
    try {
      await authAPI.logout();
      setCurrentUser(null);
      setActiveServerId('home');
      setActiveChannelId(null);
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
      navigate('/auth');
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Logout Failed", 
        description: error.message 
      });
    }
  };

  const handleServerSelect = (serverId) => {
    setActiveServerId(serverId);
    if (serverId === 'home') {
      setActiveChannelId(null); // No channel selected for home/friends page
      navigate('/friends');
    } else {
      const server = servers.find(s => s.id === serverId);
      if (server && server.channels.length > 0) {
        setActiveChannelId(server.channels[0].id);
        
        // Fetch messages for the selected channel
        messageAPI.getMessages(server.channels[0].id)
          .then(channelMessages => {
            setMessages(prev => ({
              ...prev,
              [server.channels[0].id]: channelMessages
            }));
          })
          .catch(error => console.error('Error fetching channel messages:', error));
      } else {
        setActiveChannelId(null);
      }
      if (location.pathname !== '/') navigate('/');
    }
  };

  const handleChannelSelect = (channelId) => {
    // Leave the previous channel room if any
    if (activeChannelId) {
      leaveRoom(activeChannelId);
    }
    
    setActiveChannelId(channelId);
    
    // Join the new channel room
    joinRoom(channelId);
    
    // Fetch messages for the selected channel
    messageAPI.getMessages(channelId)
      .then(channelMessages => {
        setMessages(prev => ({
          ...prev,
          [channelId]: channelMessages
        }));
      })
      .catch(error => console.error('Error fetching channel messages:', error));
    
    if (location.pathname.startsWith('/friends')) {
      navigate('/'); 
    }
  };

  const handleCreateServer = async () => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Action Denied", description: "You must be logged in to create a server."});
      return;
    }
    
    const serverName = prompt('Enter server name:');
    if (serverName) {
      try {
        const newServer = await serverAPI.createServer({ name: serverName });
        setServers(prev => [...prev, newServer]);
        setActiveServerId(newServer.id);
        setActiveChannelId(newServer.channels[0].id);
        
        // Initialize messages for the new channel
        setMessages(prev => ({
          ...prev,
          [newServer.channels[0].id]: []
        }));
        
        toast({ title: "Server created!", description: `Welcome to ${serverName}!` });
        if (location.pathname.startsWith('/friends')) navigate('/');
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Server Creation Failed", 
          description: error.message 
        });
      }
    }
  };

  const handleCreateChannel = async (channelName) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Action Denied", description: "You must be logged in."});
      return;
    }
    
    if (currentServer && activeServerId !== 'home') {
      try {
        const newChannel = await serverAPI.createChannel(activeServerId, { 
          name: channelName,
          type: 'text',
          description: `${channelName} channel`
        });
        
        // Update the servers list with the new channel
        setServers(prev => prev.map(server => 
          server.id === activeServerId 
            ? { ...server, channels: [...server.channels, newChannel] } 
            : server
        ));
        
        setActiveChannelId(newChannel.id);
        
        // Initialize messages for the new channel
        setMessages(prev => ({
          ...prev,
          [newChannel.id]: []
        }));
        
        toast({ title: "Channel created!", description: `#${newChannel.name} is ready to use!` });
      } catch (error) {
        toast({ 
          variant: "destructive", 
          title: "Channel Creation Failed", 
          description: error.message 
        });
      }
    } else {
      toast({ variant: "destructive", title: "Action Denied", description: "Cannot create channels in 'Home'."});
    }
  };

  const handleSendMessage = async (content, file = null, recipientId = null) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Message Not Sent", description: "You must be logged in to send messages." });
      return;
    }
  
    let targetChannelId = activeChannelId;
    if (recipientId) { // DM case
      const sortedUserIds = [currentUser.id, recipientId].sort();
      targetChannelId = `dm_${sortedUserIds.join('_')}`;
      
      // Initialize messages for the DM channel if needed
      if (!messages[targetChannelId]) {
        try {
          const dmMessages = await messageAPI.getMessages(targetChannelId);
          setMessages(prev => ({
            ...prev,
            [targetChannelId]: dmMessages
          }));
        } catch (error) {
          console.error('Error fetching DM messages:', error);
          setMessages(prev => ({
            ...prev,
            [targetChannelId]: []
          }));
        }
      }
      
      setActiveChannelId(targetChannelId); // Switch to DM channel
    }
    
    if (!targetChannelId) {
      toast({ variant: "destructive", title: "Message Not Sent", description: "No active channel or DM selected." });
      return;
    }

    try {
      const messageData = {
        content,
        file
      };
      
      const newMessage = await messageAPI.sendMessage(targetChannelId, messageData);
      
      // Update messages locally (the socket will also update this, but we do it here for immediate feedback)
      setMessages(prev => ({
        ...prev,
        [targetChannelId]: [...(prev[targetChannelId] || []), newMessage]
      }));
      
      toast({
        title: "Message sent!",
        description: "Your message has been delivered.",
      });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Message Not Sent", 
        description: error.message 
      });
    }
  };
  
  const updateUser = async (updatedUserData) => {
    if (!currentUser) return;
    
    try {
      const updatedUser = await userAPI.updateUser(currentUser.id, updatedUserData);
      setCurrentUser(updatedUser);
      
      // Update the user in the users list
      setUsers(prev => prev.map(u => u.id === currentUser.id ? updatedUser : u));
      
      // Update the user in the members list
      setMembers(prev => prev.map(m => m.id === currentUser.id ? {
        ...m,
        name: updatedUser.username,
        avatar: updatedUser.avatar,
        status: updatedUser.status,
        customStatus: updatedUser.customStatus,
        pronouns: updatedUser.pronouns,
        aboutMe: updatedUser.aboutMe
      } : m));
      
      toast({ title: "Profile Updated", description: "Your changes have been saved." });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Profile Update Failed", 
        description: error.message 
      });
    }
  };

  const updateServerSettings = async (serverId, updatedSettings) => {
    try {
      const updatedServer = await serverAPI.updateServer(serverId, updatedSettings);
      
      // Update the server in the servers list
      setServers(prev => prev.map(server => 
        server.id === serverId ? updatedServer : server
      ));
      
      toast({ title: "Server Settings Updated", description: "Changes saved successfully." });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Server Update Failed", 
        description: error.message 
      });
    }
  };

  const sendFriendRequest = async (targetUserId) => {
    if (!currentUser || currentUser.id === targetUserId) {
      toast({ variant: "destructive", title: "Error", description: "Cannot send friend request to yourself or not logged in." });
      return;
    }
    
    try {
      await friendAPI.sendFriendRequest(targetUserId);
      
      const targetUser = users.find(u => u.id === targetUserId);
      toast({ title: "Friend Request Sent!", description: `Friend request sent to ${targetUser?.username || 'user'}.` });
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Friend Request Failed", 
        description: error.message 
      });
    }
  };

  const handleFriendRequest = async (requesterId, action) => {
    if (!currentUser) return;

    try {
      await friendAPI.respondToFriendRequest(requesterId, action);
      
      // Update the current user
      const updatedUser = await userAPI.getUser(currentUser.id);
      setCurrentUser(updatedUser);
      
      // Update the users list
      const updatedUsers = await userAPI.getUsers();
      setUsers(updatedUsers);
      
      if (action === 'accept') {
        const requesterUser = users.find(u => u.id === requesterId);
        toast({ title: "Friend Request Accepted!", description: `You are now friends with ${requesterUser?.username || 'user'}.` });
        
        // Create or fetch the DM channel
        const sortedUserIds = [currentUser.id, requesterId].sort();
        const dmChannelId = `dm_${sortedUserIds.join('_')}`;
        
        try {
          const dmMessages = await messageAPI.getMessages(dmChannelId);
          setMessages(prev => ({
            ...prev,
            [dmChannelId]: dmMessages
          }));
        } catch (error) {
          console.error('Error fetching DM messages:', error);
          setMessages(prev => ({
            ...prev,
            [dmChannelId]: []
          }));
        }
      } else {
        toast({ title: "Friend Request Declined." });
      }
    } catch (error) {
      toast({ 
        variant: "destructive", 
        title: "Friend Request Action Failed", 
        description: error.message 
      });
    }
  };

  const MainAppLayout = () => (
    <div className="h-screen flex bg-gray-900 text-white overflow-hidden">
      <motion.div initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3 }}>
        <ServerList servers={servers} activeServer={activeServerId} onServerSelect={handleServerSelect} onCreateServer={handleCreateServer} navigate={navigate} />
      </motion.div>
      <motion.div initial={{ x: -200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.1 }} className="flex flex-col">
        <ChannelList server={currentServer} channels={currentServer?.channels || []} activeChannel={activeChannelId} onChannelSelect={handleChannelSelect} onCreateChannel={handleCreateChannel} currentUser={displayedUser} onLogout={handleLogout} navigate={navigate} isFriendsPage={activeServerId === 'home'} users={users} />
      </motion.div>
      <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.2 }} className="flex-1 flex">
        <ChatArea channel={currentChannel} messages={currentMessages} onSendMessage={handleSendMessage} currentUser={displayedUser} isDM={activeChannelId?.startsWith('dm_')} />
      </motion.div>
      <motion.div initial={{ x: 200, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.3, delay: 0.3 }}>
        <MemberList 
            members={activeServerId !== 'home' ? members.filter(m => currentServer ? (currentServer.members ? currentServer.members.includes(m.id) : true) : true) : []} 
            onlineUsers={onlineUsers} 
            users={users} 
            currentUser={displayedUser}
            sendFriendRequest={sendFriendRequest} 
            isFriendsPage={activeServerId === 'home'}
        />
      </motion.div>
    </div>
  );
  
  const displayedUser = users.find(u => u.id === currentUser?.id) || currentUser;

  return (
    <>
      <Routes>
        <Route path="/auth" element={<AuthScreen onAuthSuccess={handleAuthSuccess} />} />
        <Route path="/" element={currentUser ? (activeServerId !== 'home' || location.pathname === '/' ? <MainAppLayout /> : <FriendsPage currentUser={displayedUser} users={users} onFriendRequest={handleFriendRequest} sendFriendRequest={sendFriendRequest} onSendMessage={handleSendMessage} />) : null} />
        <Route path="/friends" element={currentUser ? <FriendsPage currentUser={displayedUser} users={users} onFriendRequest={handleFriendRequest} sendFriendRequest={sendFriendRequest} onSendMessage={handleSendMessage} navigate={navigate} /> : null} />
        <Route path="/settings/*" element={currentUser ? <UserSettingsPage currentUser={displayedUser} onUpdateUser={updateUser} /> : null} />
        <Route path="/server-settings/:serverId/*" element={currentUser && currentServer ? <ServerSettingsPage server={currentServer} onUpdateSettings={updateServerSettings} currentUser={displayedUser} /> : null} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;