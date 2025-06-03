import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, CheckCircle, XCircle, MessageSquare, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from '@/components/ui/scroll-area';
import AddFriendModal from '@/components/ui/AddFriendModal';
import { useTheme } from '@/hooks/useTheme';

const FriendsPage = ({ currentUser, users, onFriendRequest, sendFriendRequest, onSendMessage, navigate }) => {
  const [addFriendUsername, setAddFriendUsername] = useState('');
  const [activeTab, setActiveTab] = useState("online");
  const [isAddFriendModalOpen, setIsAddFriendModalOpen] = useState(false);
  const { theme } = useTheme();

  if (!currentUser) {
    navigate('/auth');
    return null;
  }

  const friendsList = currentUser.friends?.map(friendId => users.find(u => u.id === friendId)).filter(Boolean) || [];
  const onlineFriends = friendsList.filter(f => f.status === 'Online' || f.status === 'Always Online');
  const allFriends = friendsList; 
  const pendingRequests = currentUser.friendRequests?.filter(req => req.status === 'pending')
    .map(req => ({ ...req, user: users.find(u => u.id === req.fromUserId) }))
    .filter(req => req.user) || [];
  
  // Placeholder for users you've sent requests to that are still pending
  // This would require checking other users' friendRequests lists or a separate 'sentRequests' list for currentUser
  const sentRequests = users.filter(u => u.friendRequests?.some(req => req.fromUserId === currentUser.id && req.status === 'pending'));


  const handleAddFriendSubmit = (e) => {
    e.preventDefault();
    if (!addFriendUsername.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a username." });
      return;
    }
    const targetUser = users.find(u => u.username.toLowerCase() === addFriendUsername.toLowerCase().trim());
    if (!targetUser) {
      toast({ variant: "destructive", title: "User Not Found", description: `Could not find user: ${addFriendUsername}` });
      return;
    }
    if (targetUser.id === currentUser.id) {
      toast({ variant: "destructive", title: "Error", description: "You can't add yourself as a friend." });
      return;
    }
    sendFriendRequest(targetUser.id);
    setAddFriendUsername('');
  };

  const startDM = (friendId) => {
    const friend = users.find(u => u.id === friendId);
    if (friend) {
      onSendMessage(`Started a chat with ${friend.username}`, null, friendId);
      navigate('/'); // Navigate to main chat view, App.jsx handles setting DM channel
    }
  };

  const FriendCard = ({ user, type }) => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center justify-between p-3 ${theme.input} hover:${theme.hover} rounded-lg transition-colors`}
    >
      <div className="flex items-center space-x-3">
        <div className="relative">
            <Avatar className="h-10 w-10">
                <AvatarImage src={user.avatar} alt={user.username} />
                <AvatarFallback className="bg-primary text-white">{user.username.charAt(0)}</AvatarFallback>
            </Avatar>
            {(user.status === 'Online' || user.status === 'Always Online') && type !== 'pending' && type !== 'sent' && (
                 <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-gray-700/30" />
            )}
        </div>
        <div>
          <p className="font-medium text-white">{user.username}</p>
          <p className="text-xs text-gray-400">
            {type === 'pending' ? `Incoming Friend Request` : 
             type === 'sent' ? `Outgoing Friend Request` :
             user.customStatus || user.status || 'Offline'}
          </p>
        </div>
      </div>
      <div className="flex space-x-2">
        {type === 'pending' && (
          <>
            <Button size="icon" variant="ghost" className="text-green-400 hover:bg-green-500/20 hover:text-green-300 h-8 w-8" onClick={() => onFriendRequest(user.id, 'accept')}>
              <CheckCircle className="h-5 w-5" />
            </Button>
            <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-500/20 hover:text-red-300 h-8 w-8" onClick={() => onFriendRequest(user.id, 'decline')}>
              <XCircle className="h-5 w-5" />
            </Button>
          </>
        )}
        {(type === 'online' || type === 'all') && (
          <Button size="icon" variant="ghost" className="text-gray-400 hover:bg-primary/20 hover:text-primary h-8 w-8" onClick={() => startDM(user.id)}>
            <MessageSquare className="h-5 w-5" />
          </Button>
        )}
        {type === 'sent' && (
            <Button size="icon" variant="ghost" className="text-gray-400 h-8 w-8" disabled>
                <XCircle className="h-5 w-5 opacity-50" />
            </Button>
        )}
      </div>
    </motion.div>
  );
  
  const renderFriendList = (list, type) => {
    if (list.length === 0) {
      let message = "No friends here yet. Add some!";
      if (type === 'online') message = "No friends are currently online.";
      if (type === 'pending') message = "No pending friend requests.";
      if (type === 'sent') message = "You haven't sent any friend requests recently.";
      return <p className="text-gray-500 text-center py-8">{message}</p>;
    }
    return list.map(friend => <FriendCard key={friend.id} user={friend} type={type} />);
  };


  return (
    <div className={`flex flex-col h-full ${theme.chatArea}`}>
      <div className={`p-4 border-b ${theme.border}`}>
        <Button 
          onClick={() => setIsAddFriendModalOpen(true)} 
          className="bg-primary hover:bg-primary/90 text-white font-semibold w-full py-6"
        >
          <UserPlus className="mr-2 h-5 w-5" /> Add Friend
        </Button>
      </div>
      
      <AddFriendModal 
        isOpen={isAddFriendModalOpen}
        onClose={() => setIsAddFriendModalOpen(false)}
        onAddFriend={sendFriendRequest}
        users={users}
        currentUser={currentUser}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
        <TabsList className={`shrink-0 ${theme.input} p-1 m-3 rounded-lg`}>
          <TabsTrigger value="online" className={`data-[state=active]:${theme.active} data-[state=active]:${theme.text} ${theme.secondaryText} hover:${theme.text} flex-1`}>Online ({onlineFriends.length})</TabsTrigger>
          <TabsTrigger value="all" className={`data-[state=active]:${theme.active} data-[state=active]:${theme.text} ${theme.secondaryText} hover:${theme.text} flex-1`}>All ({allFriends.length})</TabsTrigger>
          <TabsTrigger value="pending" className={`data-[state=active]:${theme.active} data-[state=active]:${theme.text} ${theme.secondaryText} hover:${theme.text} flex-1`}>Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="blocked" className={`data-[state=active]:${theme.active} data-[state=active]:${theme.text} ${theme.secondaryText} hover:${theme.text} flex-1`} onClick={() => toast({title: "Blocked Users", description: "Feature coming soon!"})}>Blocked</TabsTrigger>
        </TabsList>
        
        <ScrollArea className="flex-1 p-3 space-y-2">
            <TabsContent value="online" className="mt-0">
                {renderFriendList(onlineFriends, 'online')}
            </TabsContent>
            <TabsContent value="all" className="mt-0">
                {renderFriendList(allFriends, 'all')}
            </TabsContent>
            <TabsContent value="pending" className="mt-0">
                {renderFriendList(pendingRequests.map(r => r.user), 'pending')}
                {sentRequests.length > 0 && (
                    <>
                        <h3 className="text-sm font-semibold text-gray-400 uppercase mt-6 mb-2 px-1">Sent Requests</h3>
                        {renderFriendList(sentRequests, 'sent')}
                    </>
                )}
            </TabsContent>
            <TabsContent value="blocked" className="mt-0">
                <p className="text-gray-500 text-center py-8">Blocked users will appear here.</p>
            </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
};

export default FriendsPage;