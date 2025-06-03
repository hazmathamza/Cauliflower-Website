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
  authService, 
  userService, 
  serverService, 
  messageService, 
  friendService 
} from '@/lib/firebaseService';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const [servers, setServers] = useState([]);
  const [messages, setMessages] = useState({});
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  
  const [activeServerId, setActiveServerId] = useLocalStorage('discord-activeServerId', 'home');
  const [activeChannelId, setActiveChannelId] = useLocalStorage('discord-activeChannelId', null);
  
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [messageSubscriptions, setMessageSubscriptions] = useState({});
  const [serverSubscriptions, setServerSubscriptions] = useState({});

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      } catch (error) {
        console.error("Error checking authentication:", error);
        setCurrentUser(null);
      }
    };
    
    checkAuth();
  }, []);

  // Subscribe to online users
  useEffect(() => {
    const unsubscribe = userService.subscribeToOnlineUsers((onlineUserIds) => {
      setOnlineUsers(onlineUserIds);
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch initial data when user is authenticated
  useEffect(() => {
    if (currentUser) {
      // Fetch all users
      const fetchUsers = async () => {
        try {
          const allUsers = await userService.getAllUsers();
          setUsers(allUsers);
          
          // Set members
          const initialMembers = allUsers.map(u => ({
            id: u.uid,
            name: u.username,
            role: u.role,
            status: u.status,
            avatar: u.avatar,
            customStatus: u.customStatus,
            pronouns: u.pronouns,
            aboutMe: u.aboutMe
          }));
          
          setMembers(initialMembers);
        } catch (error) {
          console.error("Error fetching users:", error);
        }
      };
      
      // Fetch servers
      const fetchServers = async () => {
        try {
          const userServers = await serverService.getUserServers(currentUser.uid);
          setServers(userServers);
          
          // If there's an active server and channel, fetch messages for that channel
          if (activeServerId !== 'home' && activeChannelId) {
            const channelMessages = await messageService.getChannelMessages(activeChannelId);
            setMessages(prev => ({
              ...prev,
              [activeChannelId]: channelMessages
            }));
            
            // Subscribe to channel messages
            subscribeToChannelMessages(activeChannelId);
          }
        } catch (error) {
          console.error("Error fetching servers:", error);
        }
      };
      
      fetchUsers();
      fetchServers();
    }
  }, [currentUser, activeServerId, activeChannelId]);

  // Handle navigation based on authentication
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

  // Subscribe to channel messages
  const subscribeToChannelMessages = (channelId) => {
    // Unsubscribe from previous channel if any
    if (messageSubscriptions[channelId]) {
      messageSubscriptions[channelId]();
    }
    
    const unsubscribe = messageService.subscribeToChannelMessages(channelId, (channelMessages) => {
      setMessages(prev => ({
        ...prev,
        [channelId]: channelMessages
      }));
    });
    
    setMessageSubscriptions(prev => ({
      ...prev,
      [channelId]: unsubscribe
    }));
  };

  // Subscribe to server changes
  const subscribeToServer = (serverId) => {
    // Unsubscribe from previous server if any
    if (serverSubscriptions[serverId]) {
      serverSubscriptions[serverId]();
    }
    
    const unsubscribe = serverService.subscribeToServer(serverId, (serverData) => {
      setServers(prev => prev.map(server => 
        server.id === serverId ? serverData : server
      ));
    });
    
    setServerSubscriptions(prev => ({
      ...prev,
      [serverId]: unsubscribe
    }));
  };

  const currentServer = servers.find(s => s.id === activeServerId);
  const currentChannel = currentServer?.channels?.find(c => c.id === activeChannelId);
  const currentMessages = activeChannelId ? (messages[activeChannelId] || []) : [];

  const handleAuthSuccess = async (user) => {
    try {
      // Login or register the user
      let loggedInUser;
      if (user.isRegistering) {
        loggedInUser = await authService.register(user.email, user.password, user.username);
      } else {
        loggedInUser = await authService.login(user.email, user.password);
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
      await authService.logout();
      setCurrentUser(null);
      setActiveServerId('home');
      setActiveChannelId(null);
      
      // Clean up subscriptions
      Object.values(messageSubscriptions).forEach(unsubscribe => unsubscribe());
      setMessageSubscriptions({});
      
      Object.values(serverSubscriptions).forEach(unsubscribe => unsubscribe());
      setServerSubscriptions({});
      
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

  const handleServerSelect = async (serverId) => {
    setActiveServerId(serverId);
    
    if (serverId === 'home') {
      setActiveChannelId(null); // No channel selected for home/friends page
      navigate('/friends');
    } else {
      // Subscribe to server changes
      subscribeToServer(serverId);
      
      const server = servers.find(s => s.id === serverId);
      if (server && server.channels && server.channels.length > 0) {
        const firstChannelId = server.channels[0].id;
        setActiveChannelId(firstChannelId);
        
        // Fetch messages for the selected channel
        try {
          const channelMessages = await messageService.getChannelMessages(firstChannelId);
          setMessages(prev => ({
            ...prev,
            [firstChannelId]: channelMessages
          }));
          
          // Subscribe to channel messages
          subscribeToChannelMessages(firstChannelId);
        } catch (error) {
          console.error("Error fetching channel messages:", error);
        }
      } else {
        setActiveChannelId(null);
      }
      
      if (location.pathname !== '/') navigate('/');
    }
  };

  const handleChannelSelect = async (channelId) => {
    setActiveChannelId(channelId);
    
    // Fetch messages for the selected channel
    try {
      const channelMessages = await messageService.getChannelMessages(channelId);
      setMessages(prev => ({
        ...prev,
        [channelId]: channelMessages
      }));
      
      // Subscribe to channel messages
      subscribeToChannelMessages(channelId);
    } catch (error) {
      console.error("Error fetching channel messages:", error);
    }
    
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
        const newServer = await serverService.createServer(currentUser.uid, { name: serverName });
        setServers(prev => [...prev, newServer]);
        setActiveServerId(newServer.id);
        
        // Subscribe to server changes
        subscribeToServer(newServer.id);
        
        if (newServer.channels && newServer.channels.length > 0) {
          const firstChannelId = newServer.channels[0].id;
          setActiveChannelId(firstChannelId);
          
          // Initialize messages for the new channel
          setMessages(prev => ({
            ...prev,
            [firstChannelId]: []
          }));
          
          // Subscribe to channel messages
          subscribeToChannelMessages(firstChannelId);
        }
        
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
        const newChannel = await serverService.createChannel(activeServerId, { 
          name: channelName,
          type: 'text',
          description: `${channelName} channel`
        });
        
        // Update the servers list with the new channel
        setServers(prev => prev.map(server => 
          server.id === activeServerId 
            ? { ...server, channels: [...(server.channels || []), newChannel] } 
            : server
        ));
        
        setActiveChannelId(newChannel.id);
        
        // Initialize messages for the new channel
        setMessages(prev => ({
          ...prev,
          [newChannel.id]: []
        }));
        
        // Subscribe to channel messages
        subscribeToChannelMessages(newChannel.id);
        
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
      const sortedUserIds = [currentUser.uid, recipientId].sort();
      targetChannelId = `dm_${sortedUserIds.join('_')}`;
      
      // Initialize messages for the DM channel if needed
      if (!messages[targetChannelId]) {
        try {
          const dmMessages = await messageService.getChannelMessages(targetChannelId);
          setMessages(prev => ({
            ...prev,
            [targetChannelId]: dmMessages
          }));
          
          // Subscribe to channel messages
          subscribeToChannelMessages(targetChannelId);
        } catch (error) {
          console.error("Error fetching DM messages:", error);
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
      // Upload file if any
      let fileData = null;
      if (file) {
        fileData = await messageService.uploadFile(file, currentUser.uid);
      }
      
      const messageData = {
        content,
        file: fileData
      };
      
      await messageService.sendMessage(targetChannelId, messageData, currentUser.uid);
      
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
      // Upload avatar if provided
      if (updatedUserData.avatarFile) {
        const avatarUrl = await userService.uploadAvatar(currentUser.uid, updatedUserData.avatarFile);
        updatedUserData.avatar = avatarUrl;
        delete updatedUserData.avatarFile;
      }
      
      const updatedUser = await userService.updateUserProfile(currentUser.uid, updatedUserData);
      setCurrentUser(updatedUser);
      
      // Update the user in the users list
      setUsers(prev => prev.map(u => u.uid === currentUser.uid ? updatedUser : u));
      
      // Update the user in the members list
      setMembers(prev => prev.map(m => m.id === currentUser.uid ? {
        id: updatedUser.uid,
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
      const updatedServer = await serverService.updateServer(serverId, updatedSettings);
      
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
    if (!currentUser || currentUser.uid === targetUserId) {
      toast({ variant: "destructive", title: "Error", description: "Cannot send friend request to yourself or not logged in." });
      return;
    }
    
    try {
      console.log("Sending friend request from", currentUser.uid, "to", targetUserId);
      
      // Verify both users exist before sending request
      const targetUser = users.find(u => u.uid === targetUserId);
      if (!targetUser) {
        toast({ variant: "destructive", title: "User Not Found", description: "Could not find the user you're trying to add." });
        return;
      }
      
      // Check if already friends
      if (currentUser.friends && currentUser.friends.includes(targetUserId)) {
        toast({ variant: "destructive", title: "Already Friends", description: `You are already friends with ${targetUser.username}.` });
        return;
      }
      
      // Check if friend request already sent
      if (targetUser.friendRequests && targetUser.friendRequests.some(req => req.fromUserId === currentUser.uid)) {
        toast({ variant: "destructive", title: "Request Already Sent", description: `You've already sent a friend request to ${targetUser.username}.` });
        return;
      }
      
      // Send the friend request
      await friendService.sendFriendRequest(currentUser.uid, targetUserId);
      
      // Show success message
      toast({ title: "Friend Request Sent!", description: `Friend request sent to ${targetUser.username}.` });
      
      // Refresh user data
      const updatedUsers = await userService.getAllUsers();
      setUsers(updatedUsers);
    } catch (error) {
      console.error("Friend request error:", error);
      
      // Show detailed error message
      toast({ 
        variant: "destructive", 
        title: "Friend Request Failed", 
        description: error.message || "There was an error sending the friend request. Please try again."
      });
    }
  };

  const handleFriendRequest = async (requesterId, action) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Error", description: "You must be logged in to respond to friend requests." });
      return;
    }

    try {
      console.log("Responding to friend request from", requesterId, "with action:", action);
      
      // Verify requester exists
      const requesterUser = users.find(u => u.uid === requesterId);
      if (!requesterUser) {
        toast({ variant: "destructive", title: "User Not Found", description: "The user who sent this request could not be found." });
        return;
      }
      
      // Respond to the friend request
      const result = await friendService.respondToFriendRequest(currentUser.uid, requesterId, action);
      
      // Update the current user
      const updatedUser = await userService.getUserById(currentUser.uid);
      setCurrentUser(updatedUser);
      
      // Update the users list
      const allUsers = await userService.getAllUsers();
      setUsers(allUsers);
      
      if (action === 'accept') {
        toast({ title: "Friend Request Accepted!", description: `You are now friends with ${requesterUser.username}.` });
        
        // Initialize messages for the DM channel
        if (result.dmChannelId) {
          try {
            console.log("Initializing DM channel:", result.dmChannelId);
            const dmMessages = await messageService.getChannelMessages(result.dmChannelId);
            setMessages(prev => ({
              ...prev,
              [result.dmChannelId]: dmMessages
            }));
            
            // Subscribe to channel messages
            subscribeToChannelMessages(result.dmChannelId);
          } catch (error) {
            console.error("Error fetching DM messages:", error);
            setMessages(prev => ({
              ...prev,
              [result.dmChannelId]: []
            }));
        }
      } else {
        toast({ title: "Friend Request Declined." });
      }
    } catch (error) {
      console.error("Friend request response error:", error);
      
      toast({ 
        variant: "destructive", 
        title: "Friend Request Action Failed", 
        description: error.message || "There was an error responding to the friend request. Please try again."
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
  
  const displayedUser = users.find(u => u.uid === currentUser?.uid) || currentUser;

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