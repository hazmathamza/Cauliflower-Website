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

function App() {
  const [currentUser, setCurrentUser] = useLocalStorage('discord-currentUser', null);
  const navigate = useNavigate();
  const location = useLocation();

  const [servers, setServers] = useLocalStorage('discord-servers', [
    {
      id: 'server1',
      name: 'My Awesome Server',
      icon: '🚀',
      ownerId: 'user2',
      bannerUrl: 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      roles: [
        { id: 'role1', name: 'Admin', color: 'text-red-400', permissions: ['manageChannels', 'kickMembers', 'manageServerSettings'] },
        { id: 'role2', name: 'Moderator', color: 'text-blue-400', permissions: ['deleteMessages', 'muteMembers'] },
        { id: 'role3', name: 'Member', color: 'text-gray-300', permissions: [] },
      ],
      channels: [
        { id: 'ch1', name: 'general', type: 'text', description: 'General discussion' },
        { id: 'ch2', name: 'random', type: 'text', description: 'Random chat' },
        { id: 'ch3', name: 'announcements', type: 'text', description: 'Server announcements' },
        { id: 'ch4', name: 'General Voice', type: 'voice' },
      ]
    }
  ]);

  const [messages, setMessages] = useLocalStorage('discord-messages', {
    ch1: [
      { id: 'msg1', content: 'Welcome to the server! 🎉', userId: 'user2', userName: 'ServerBot', userAvatar: null, timestamp: Date.now() - 3600000 },
      { id: 'msg2', content: 'Hey everyone! Great to be here!', userId: 'user3', userName: 'Alice', userAvatar: null, timestamp: Date.now() - 1800000 },
      { id: 'msg3', content: 'This Discord clone looks amazing! 😍', userId: 'user4', userName: 'Bob', userAvatar: null, timestamp: Date.now() - 900000 }
    ],
    ch2: [{ id: 'msg4', content: 'Random thoughts go here! 🤔', userId: 'user3', userName: 'Alice', userAvatar: null, timestamp: Date.now() - 600000 }],
    ch3: [{ id: 'msg5', content: '📢 Server rules have been updated!', userId: 'user2', userName: 'ServerBot', userAvatar: null, timestamp: Date.now() - 7200000 }]
  });

  const [users, setUsers] = useLocalStorage('discord-users', [
    { id: 'user1', username: 'You', email: 'you@example.com', avatar: null, status: 'Online', customStatus: 'Building awesome apps!', role: 'member', pronouns: 'they/them', bannerUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', profileEffect: 'sparkles', aboutMe: 'Just a dev trying to make cool things.', friends: ['user3', 'user4'], friendRequests: [{ fromUserId: 'user5', status: 'pending', timestamp: Date.now() - 86400000 }] },
    { id: 'user2', username: 'ServerBot', email: 'bot@example.com', avatar: null, status: 'Always Online', customStatus: 'Serving the community', role: 'owner', pronouns: 'it/its', bannerUrl: null, profileEffect: null, aboutMe: 'I am the friendly server bot!', friends: [], friendRequests: [] },
    { id: 'user3', username: 'Alice', email: 'alice@example.com', avatar: null, status: 'Coding...', customStatus: 'Working on a new feature', role: 'admin', pronouns: 'she/her', bannerUrl: 'https://images.unsplash.com/photo-1504639725590-34d0984388bd?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80', profileEffect: 'fire', aboutMe: 'Loves coding and coffee.', friends: ['user1'], friendRequests: [] },
    { id: 'user4', username: 'Bob', email: 'bob@example.com', avatar: null, status: 'Gaming', customStatus: 'Leveling up!', role: 'moderator', pronouns: 'he/him', bannerUrl: null, profileEffect: null, aboutMe: 'Gamer and community enthusiast.', friends: ['user1'], friendRequests: [] },
    { id: 'user5', username: 'Charlie', email: 'charlie@example.com', avatar: null, status: 'Away', customStatus: '', role: 'member', pronouns: 'they/them', bannerUrl: null, profileEffect: null, aboutMe: '', friends: [], friendRequests: [] },
    { id: 'user6', username: 'Diana', email: 'diana@example.com', avatar: null, status: 'Studying', customStatus: 'Exam season!', role: 'member', pronouns: 'she/her', bannerUrl: null, profileEffect: null, aboutMe: 'Bookworm and future scientist.', friends: [], friendRequests: [] },
  ]);
  
  const initialMembers = users.map(u => ({
    id: u.id, name: u.username, role: u.role, status: u.status, avatar: u.avatar, customStatus: u.customStatus, pronouns: u.pronouns, aboutMe: u.aboutMe
  }));
  const [members, setMembers] = useLocalStorage('discord-members', initialMembers);

  const [activeServerId, setActiveServerId] = useLocalStorage('discord-activeServerId', servers.length > 0 ? servers[0].id : 'home');
  const [activeChannelId, setActiveChannelId] = useLocalStorage('discord-activeChannelId', 
    servers.length > 0 && servers[0].channels.length > 0 ? servers[0].channels[0].id : null
  );
  
  const [onlineUsers, setOnlineUsers] = useState(users.filter(u => u.status === 'Online' || u.status === 'Always Online').map(u => u.id));

  useEffect(() => {
    if (currentUser && !users.find(u => u.id === currentUser.id)) {
      const enrichedUser = {
        ...currentUser,
        pronouns: currentUser.pronouns || '',
        bannerUrl: currentUser.bannerUrl || null,
        profileEffect: currentUser.profileEffect || null,
        customStatus: currentUser.customStatus || '',
        aboutMe: currentUser.aboutMe || '',
        friends: currentUser.friends || [],
        friendRequests: currentUser.friendRequests || [],
      };
      setUsers(prevUsers => [...prevUsers, enrichedUser]);
      setMembers(prevMembers => [...prevMembers, {
        id: enrichedUser.id, name: enrichedUser.username, role: enrichedUser.role || 'member', status: enrichedUser.status || 'Online', avatar: enrichedUser.avatar || null, customStatus: enrichedUser.customStatus, pronouns: enrichedUser.pronouns, aboutMe: enrichedUser.aboutMe
      }]);
    }
  }, [currentUser, setUsers, setMembers, users]);
  
  useEffect(() => {
    const currentOnlineUsers = users.filter(u => u.status === 'Online' || u.status === 'Always Online').map(u => u.id);
    if (currentUser && !currentOnlineUsers.includes(currentUser.id) && (currentUser.status === 'Online' || currentUser.status === 'Always Online') ) {
       currentOnlineUsers.push(currentUser.id);
    }
    setOnlineUsers(currentOnlineUsers);
  }, [users, currentUser]);

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


  const handleAuthSuccess = (user) => {
    const enrichedUser = {
      ...user,
      pronouns: user.pronouns || '',
      bannerUrl: user.bannerUrl || null,
      profileEffect: user.profileEffect || null,
      customStatus: user.customStatus || '',
      aboutMe: user.aboutMe || '',
      friends: user.friends || [],
      friendRequests: user.friendRequests || [],
    };
    setCurrentUser(enrichedUser);
    if (!users.find(u => u.id === enrichedUser.id)) {
      const newUsersList = [...users, enrichedUser];
      setUsers(newUsersList);
      const newMembersList = [...members, { id: enrichedUser.id, name: enrichedUser.username, role: enrichedUser.role || 'member', status: enrichedUser.status || 'Online', avatar: enrichedUser.avatar || null, customStatus: enrichedUser.customStatus, pronouns: enrichedUser.pronouns, aboutMe: enrichedUser.aboutMe }];
      setMembers(newMembersList);
    }
    if (!onlineUsers.includes(enrichedUser.id) && (enrichedUser.status === 'Online' || enrichedUser.status === 'Always Online')) {
      setOnlineUsers(prevOnline => [...prevOnline, enrichedUser.id]);
    }
    navigate('/'); 
  };

  const handleLogout = () => {
    if (!currentUser) return;
    const loggedOutUser = { ...currentUser, status: 'Offline' };
    setUsers(users.map(u => u.id === currentUser.id ? loggedOutUser : u));
    setMembers(members.map(m => m.id === currentUser.id ? { ...m, status: 'Offline' } : m));
    setOnlineUsers(onlineUsers.filter(id => id !== currentUser.id));
    setCurrentUser(null);
    setActiveServerId('home');
    setActiveChannelId(null);
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate('/auth');
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
      } else {
        setActiveChannelId(null);
      }
      if (location.pathname !== '/') navigate('/');
    }
  };

  const handleChannelSelect = (channelId) => {
    setActiveChannelId(channelId);
     if (location.pathname.startsWith('/friends')) {
       navigate('/'); 
    }
  };

  const handleCreateServer = () => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Action Denied", description: "You must be logged in to create a server."});
        return;
    }
    const serverName = prompt('Enter server name:');
    if (serverName) {
      const newServer = {
        id: `server${Date.now()}`, name: serverName, icon: '🌟', ownerId: currentUser.id, bannerUrl: null,
        roles: [
           { id: 'role_owner', name: 'Owner', color: 'text-yellow-400', permissions: ['manageServer', 'manageChannels', 'manageRoles', 'kickMembers', 'banMembers', 'manageServerSettings'] },
           { id: 'role_default', name: 'Member', color: 'text-gray-300', permissions: [] }
        ],
        channels: [{ id: `ch${Date.now()}`, name: 'general', type: 'text', description: 'General discussion' }]
      };
      setServers([...servers, newServer]);
      setActiveServerId(newServer.id);
      setActiveChannelId(newServer.channels[0].id);
      toast({ title: "Server created!", description: `Welcome to ${serverName}!` });
      if (location.pathname.startsWith('/friends')) navigate('/');
    }
  };

  const handleCreateChannel = (channelName) => {
    if (!currentUser) {
        toast({ variant: "destructive", title: "Action Denied", description: "You must be logged in."});
        return;
    }
    if (currentServer && activeServerId !== 'home') {
      const newChannel = {
        id: `ch${Date.now()}`, name: channelName.toLowerCase().replace(/\s+/g, '-'), type: 'text', description: `${channelName} channel`
      };
      const updatedServers = servers.map(server => 
        server.id === activeServerId ? { ...server, channels: [...server.channels, newChannel] } : server
      );
      setServers(updatedServers);
      setActiveChannelId(newChannel.id);
      toast({ title: "Channel created!", description: `#${newChannel.name} is ready to use!` });
    } else {
        toast({ variant: "destructive", title: "Action Denied", description: "Cannot create channels in 'Home'."});
    }
  };

  const handleSendMessage = (content, file = null, recipientId = null) => {
    if (!currentUser) {
      toast({ variant: "destructive", title: "Message Not Sent", description: "You must be logged in to send messages." });
      return;
    }
  
    let targetChannelId = activeChannelId;
    if (recipientId) { // DM case
      const sortedUserIds = [currentUser.id, recipientId].sort();
      targetChannelId = `dm_${sortedUserIds.join('_')}`;
      if (!messages[targetChannelId]) {
        setMessages(prev => ({...prev, [targetChannelId]: []}));
      }
      setActiveChannelId(targetChannelId); // Switch to DM channel
    }
    
    if (!targetChannelId) {
       toast({ variant: "destructive", title: "Message Not Sent", description: "No active channel or DM selected." });
       return;
    }

    const newMessage = {
      id: `msg${Date.now()}`, content, userId: currentUser.id, userName: currentUser.username, userAvatar: currentUser.avatar, timestamp: Date.now(), file
    };
    setMessages(prev => ({ ...prev, [targetChannelId]: [...(prev[targetChannelId] || []), newMessage] }));
  };
  
  const updateUser = (updatedUserData) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updatedUserData };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
    setMembers(members.map(m => m.id === currentUser.id ? { ...m, name: updatedUser.username, avatar: updatedUser.avatar, status: updatedUser.status, customStatus: updatedUser.customStatus, pronouns: updatedUser.pronouns, aboutMe: updatedUser.aboutMe } : m));
    toast({ title: "Profile Updated", description: "Your changes have been saved." });
  };

  const updateServerSettings = (serverId, updatedSettings) => {
    setServers(prevServers => prevServers.map(server => 
      server.id === serverId ? { ...server, ...updatedSettings } : server
    ));
    toast({ title: "Server Settings Updated", description: "Changes saved successfully." });
  };

  const sendFriendRequest = (targetUserId) => {
    if (!currentUser || currentUser.id === targetUserId) {
      toast({ variant: "destructive", title: "Error", description: "Cannot send friend request to yourself or not logged in." });
      return;
    }
    
    const updatedUsers = users.map(user => {
      if (user.id === targetUserId) {
        // Check if already friends or request pending
        if (user.friends?.includes(currentUser.id)) {
          toast({ title: "Already Friends", description: `You are already friends with ${user.username}.` });
          return user;
        }
        if (user.friendRequests?.some(req => req.fromUserId === currentUser.id)) {
           toast({ title: "Request Already Sent", description: `Friend request already sent to ${user.username}.` });
           return user;
        }
        const newRequests = [...(user.friendRequests || []), { fromUserId: currentUser.id, status: 'pending', timestamp: Date.now() }];
        return { ...user, friendRequests: newRequests };
      }
      return user;
    });
    setUsers(updatedUsers);
    const targetUser = users.find(u => u.id === targetUserId);
    toast({ title: "Friend Request Sent!", description: `Friend request sent to ${targetUser?.username || 'user'}.` });
  };

  const handleFriendRequest = (requesterId, action) => {
    if (!currentUser) return;

    let updatedCurrentUser = { ...currentUser };
    updatedCurrentUser.friendRequests = updatedCurrentUser.friendRequests.filter(req => req.fromUserId !== requesterId);

    let updatedUsers = users.map(u => {
        if (u.id === currentUser.id) return updatedCurrentUser;
        return u;
    });

    if (action === 'accept') {
        updatedCurrentUser.friends = [...(updatedCurrentUser.friends || []), requesterId];
        
        updatedUsers = updatedUsers.map(u => {
            if (u.id === requesterId) {
                return { ...u, friends: [...(u.friends || []), currentUser.id] };
            }
            if (u.id === currentUser.id) {
                return updatedCurrentUser;
            }
            return u;
        });
        toast({ title: "Friend Request Accepted!", description: `You are now friends with ${users.find(u=>u.id === requesterId)?.username}.` });
    } else {
        toast({ title: "Friend Request Declined." });
    }
    
    setCurrentUser(updatedCurrentUser);
    setUsers(updatedUsers);
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