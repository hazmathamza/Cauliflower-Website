import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Hash, Volume2, Settings, Plus, ChevronDown, Users, LogOut, Mic, Headphones, UserCog, ShieldAlert, BellDot, Palette, ShoppingCart, UserPlus, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { toast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


const ChannelList = ({ 
  server, 
  channels, 
  activeChannel, 
  onChannelSelect, 
  onCreateChannel,
  currentUser,
  onLogout,
  navigate,
  isFriendsPage,
  users
}) => {
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');

  const handleCreateChannelSubmit = () => {
    if (newChannelName.trim()) {
      onCreateChannel(newChannelName.trim());
      setNewChannelName('');
      setShowCreateChannel(false);
    } else {
      toast({ variant: "destructive", title: "Error", description: "Channel name cannot be empty."});
    }
  };

  const textChannels = channels.filter(ch => ch.type === 'text');
  const voiceChannels = channels.filter(ch => ch.type === 'voice');

  const handleServerSettingsNavigation = () => {
    if (server?.id && server.id !== 'home') {
      navigate(`/server-settings/${server.id}`);
    } else {
      toast({ variant: "destructive", title: "Error", description: "No server selected or server ID is missing."});
    }
  };
  
  const handleLeaveServer = () => {
    toast({ title: "Feature Coming Soon!", description: "Leaving servers will be available in a future update." });
  }

  const friendsList = currentUser?.friends?.map(friendId => users.find(u => u.id === friendId)).filter(Boolean) || [];
  const onlineFriends = friendsList.filter(f => users.find(u => u.id === f.id)?.status === 'Online' || users.find(u => u.id === f.id)?.status === 'Always Online');
  const offlineFriends = friendsList.filter(f => users.find(u => u.id === f.id)?.status !== 'Online' && users.find(u => u.id === f.id)?.status !== 'Always Online');

  const directMessages = Object.keys(JSON.parse(localStorage.getItem('discord-messages') || '{}'))
    .filter(key => key.startsWith('dm_'))
    .map(key => {
        const userIds = key.substring(3).split('_');
        const otherUserId = userIds.find(id => id !== currentUser?.id);
        const otherUser = users.find(u => u.id === otherUserId);
        if (!otherUser) return null;
        const dmChannelMessages = JSON.parse(localStorage.getItem('discord-messages'))[key];
        const lastMessage = dmChannelMessages && dmChannelMessages.length > 0 ? dmChannelMessages[dmChannelMessages.length - 1] : null;

        return {
            id: key,
            name: otherUser.username,
            avatar: otherUser.avatar,
            lastMessageContent: lastMessage ? (lastMessage.userId === currentUser?.id ? `You: ${lastMessage.content}` : lastMessage.content) : "No messages yet",
            timestamp: lastMessage ? lastMessage.timestamp : 0,
            isOnline: otherUser.status === 'Online' || otherUser.status === 'Always Online'
        };
    })
    .filter(Boolean)
    .sort((a, b) => b.timestamp - a.timestamp);


  return (
    <div className="w-60 bg-gray-800 flex flex-col h-full">
      {!isFriendsPage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <motion.div 
              whileHover={{ backgroundColor: "hsl(var(--muted))" }}
              className="h-12 px-4 flex items-center justify-between border-b border-gray-700 shadow-md cursor-pointer"
            >
              <h2 className="font-semibold text-white truncate">{server?.name || 'Select Server'}</h2>
              <ChevronDown className="h-5 w-5 text-gray-400" />
            </motion.div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-200">
            {server && server.id !== 'home' && (
              <>
                <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => toast({title: "Nitro Boost!", description: "Server Boost feature coming soon!"})}>
                  <ShoppingCart className="mr-2 h-4 w-4" /> Server Boost
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={handleServerSettingsNavigation}>
                  <Settings className="mr-2 h-4 w-4" /> Server Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => setShowCreateChannel(true)}>
                  <Plus className="mr-2 h-4 w-4" /> Create Channel
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => toast({title: "Coming Soon!", description: "Category creation will be available later."})}>
                  <Plus className="mr-2 h-4 w-4" /> Create Category
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => toast({title: "Coming Soon!", description: "Notification settings are on the way."})}>
                  <BellDot className="mr-2 h-4 w-4" /> Notification Settings
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => toast({title: "Coming Soon!", description: "Privacy settings will be implemented soon."})}>
                  <ShieldAlert className="mr-2 h-4 w-4" /> Privacy Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-700" />
                <DropdownMenuItem 
                  className="text-red-400 hover:bg-red-500/80 hover:text-white focus:bg-red-500/80 focus:text-white"
                  onClick={handleLeaveServer}
                >
                  <LogOut className="mr-2 h-4 w-4" /> Leave Server
                </DropdownMenuItem>
              </>
            )}
            {(!server || server.id === 'home') && (
               <DropdownMenuItem disabled>No server selected</DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {isFriendsPage && (
        <div className="h-12 px-4 flex items-center border-b border-gray-700 shadow-md">
            <Input placeholder="Find or start a conversation" className="bg-gray-900 border-none h-8 text-sm placeholder-gray-500 focus:ring-0" />
        </div>
      )}
      
      <ScrollArea className="flex-1 p-2">
        {isFriendsPage ? (
          <>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-700/50 hover:text-white mb-2" onClick={() => navigate('/friends')}>
                <Users className="mr-2 h-5 w-5"/> Friends
            </Button>
            <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-gray-700/50 hover:text-white mb-2" onClick={() => toast({title: "Nitro!", description: "Nitro page coming soon!"})}>
                <ShoppingCart className="mr-2 h-5 w-5"/> Nitro
            </Button>
            <div className="px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide mt-4 mb-1 flex justify-between items-center">
                Direct Messages
                <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white" onClick={() => toast({title: "New DM", description: "Functionality to start a new DM from here is coming soon."})}>
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
            {directMessages.map(dm => (
                 <motion.div 
                    key={dm.id} 
                    whileHover={{ x: 2 }} 
                    className={cn("flex items-center px-2 py-1.5 mx-1 rounded channel-hover cursor-pointer text-gray-300 hover:text-white", activeChannel === dm.id && "bg-gray-600/80 text-white")} 
                    onClick={() => onChannelSelect(dm.id)}
                    title={`Chat with ${dm.name}`}
                >
                    <div className="relative">
                        <Avatar className="w-8 h-8">
                            <AvatarImage src={dm.avatar} alt={dm.name} />
                            <AvatarFallback className="bg-gray-600 text-sm">{dm.name.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        {dm.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800 bg-green-500" />}
                    </div>
                    <div className="ml-2 flex-1 min-w-0">
                        <span className="text-sm truncate block">{dm.name}</span>
                        <span className="text-xs text-gray-400 truncate block">{dm.lastMessageContent}</span>
                    </div>
                </motion.div>
            ))}
            {directMessages.length === 0 && <p className="text-xs text-gray-500 px-2">No DMs yet. Find some friends!</p>}
          </>
        ) : server && (textChannels.length > 0 || voiceChannels.length > 0) ? (
          <>
            {textChannels.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <span>Text Channels</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white" onClick={() => setShowCreateChannel(!showCreateChannel)}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {showCreateChannel && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="px-2 py-1 my-1">
                    <Input placeholder="New channel name" value={newChannelName} onChange={(e) => setNewChannelName(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleCreateChannelSubmit()} autoFocus className="h-8 text-sm bg-gray-700 border-gray-600 text-white placeholder-gray-500" />
                    <Button onClick={handleCreateChannelSubmit} size="sm" className="w-full mt-1 bg-primary/80 hover:bg-primary">Create</Button>
                  </motion.div>
                )}
                {textChannels.map((channel) => (
                  <motion.div key={channel.id} whileHover={{ x: 2 }} className={cn("flex items-center px-2 py-1 mx-1 rounded channel-hover cursor-pointer text-gray-300 hover:text-white", activeChannel === channel.id && "bg-gray-600/80 text-white")} onClick={() => onChannelSelect(channel.id)}>
                    <Hash className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm truncate">{channel.name}</span>
                  </motion.div>
                ))}
              </div>
            )}
            {voiceChannels.length > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  <span>Voice Channels</span>
                  <Button variant="ghost" size="icon" className="h-5 w-5 text-gray-400 hover:text-white" onClick={() => toast({title: "Coming Soon!", description: "Voice channel creation is planned!"})}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {voiceChannels.map((channel) => (
                  <motion.div key={channel.id} whileHover={{ x: 2 }} className={cn("flex items-center px-2 py-1 mx-1 rounded channel-hover cursor-pointer text-gray-300 hover:text-white", activeChannel === channel.id && "bg-gray-600/80 text-white")} onClick={() => onChannelSelect(channel.id)}>
                    <Volume2 className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="text-sm truncate">{channel.name}</span>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : server && !isFriendsPage ? (
             <div className="p-4 text-center text-gray-400 flex flex-col items-center justify-center h-full">
                <Hash className="h-16 w-16 text-gray-500 mb-3" />
                <p className="text-sm">No channels here yet!</p>
                <p className="text-xs">Why not create one?</p>
                <Button size="sm" className="mt-4 bg-primary/80 hover:bg-primary" onClick={() => setShowCreateChannel(true)}>
                    <Plus className="mr-2 h-4 w-4" /> Create Channel
                </Button>
            </div>
        ) : null}
         {!server && !isFriendsPage && (
          <div className="p-4 text-center text-gray-400 flex flex-col items-center justify-center h-full">
            <Users className="h-16 w-16 text-gray-500 mb-3" />
            <p className="text-sm">It's quiet in here...</p>
            <p className="text-xs">Select a server on the left or create a new one to get started!</p>
          </div>
        )}
      </ScrollArea>

      <div className="h-14 bg-gray-900/70 px-2 flex items-center justify-between border-t border-gray-700/50">
        {currentUser && (
          <div className="flex items-center flex-1 min-w-0">
             <Avatar className="w-8 h-8">
                <AvatarImage src={currentUser.avatar} />
                <AvatarFallback className="bg-primary text-sm">
                  {currentUser.username ? currentUser.username.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            <div className="ml-2 min-w-0 flex-1">
              <div className="text-sm font-medium text-white truncate">{currentUser.username}</div>
              <div className="text-xs text-gray-400 truncate">{currentUser.customStatus || currentUser.status || 'Online'}</div>
            </div>
          </div>
        )}
        <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => toast({title: "Feature Coming Soon!", description: "Microphone controls are planned."})}>
                <Mic className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => toast({title: "Feature Coming Soon!", description: "Headphone/audio settings are planned."})}>
                <Headphones className="h-4 w-4" />
            </Button>
             <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
                        <Settings className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" align="end" className="w-56 bg-gray-800 border-gray-700 text-gray-200 mb-1">
                    <DropdownMenuLabel className="text-gray-400">User Settings</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-gray-700"/>
                    <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => navigate('/settings/my-account')}>
                        <UserCog className="mr-2 h-4 w-4" />
                        <span>My Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => navigate('/settings/profile')}>
                        <Palette className="mr-2 h-4 w-4" />
                        <span>Edit Profile</span>
                    </DropdownMenuItem>
                     <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => navigate('/settings/privacy')}>
                        <ShieldAlert className="mr-2 h-4 w-4" />
                        <span>Privacy & Safety</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => navigate('/settings/notifications')}>
                        <BellDot className="mr-2 h-4 w-4" />
                        <span>Notifications</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700"/>
                     <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => toast({title: "Nitro Shop!", description: "The Nitro shop is coming soon!"})}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        <span>Nitro</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-gray-700"/>
                    <DropdownMenuItem 
                        onClick={onLogout} 
                        className="text-red-400 hover:bg-red-500/80 hover:text-white focus:bg-red-500/80 focus:text-white"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Logout</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

export default ChannelList;