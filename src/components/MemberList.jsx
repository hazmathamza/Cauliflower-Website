import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Shield, Users as UsersIcon, UserX, MessageSquarePlus, UserPlus } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui/use-toast';

const MemberList = ({ members = [], onlineUsers = [], users = [], currentUser, sendFriendRequest, isFriendsPage }) => {

  const detailedMembers = members.map(member => {
    const userDetails = users.find(u => u.id === member.id);
    return { ...member, ...userDetails };
  });

  const onlineMembers = detailedMembers.filter(member => 
    onlineUsers.includes(member.id) && member.id !== currentUser?.id
  );
  const offlineMembers = detailedMembers.filter(member => 
    !onlineUsers.includes(member.id) && member.id !== currentUser?.id
  );

  const getRoleIcon = (role) => {
    switch (role) {
      case 'owner':
        return <Crown className="h-3.5 w-3.5 text-yellow-400" />;
      case 'admin':
        return <Shield className="h-3.5 w-3.5 text-red-400" />;
      case 'moderator':
        return <Shield className="h-3.5 w-3.5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'owner':
        return 'text-yellow-400';
      case 'admin':
        return 'text-red-400';
      case 'moderator':
        return 'text-blue-400';
      default:
        return 'text-gray-300';
    }
  };

  const handleAddFriend = (targetUserId) => {
    if (currentUser?.id === targetUserId) {
        toast({ variant: "destructive", title: "Oops!", description: "You can't send a friend request to yourself." });
        return;
    }
    sendFriendRequest(targetUserId);
  };
  
  const handleMessageUser = (targetUserId) => {
    toast({title: "Start DM", description: `Starting a DM with ${users.find(u=>u.id === targetUserId)?.username || 'user'}. Feature in progress.`});
    // Future: Implement actual DM start logic, perhaps in App.jsx via a callback
    // For now, just navigate to friends page if not already there, to imply DMs are there.
    // Or directly create/select a DM channel.
  };


  const MemberItem = ({ member, isOnline }) => {
    const isFriend = currentUser?.friends?.includes(member.id);
    const hasPendingRequest = currentUser?.friendRequests?.some(req => req.fromUserId === member.id && req.status === 'pending') ||
                              users.find(u => u.id === member.id)?.friendRequests?.some(req => req.fromUserId === currentUser?.id && req.status === 'pending');

    return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.div
          whileHover={{ backgroundColor: "hsl(var(--muted) / 0.5)" }}
          className="flex items-center px-2 py-1.5 mx-1 rounded hover:bg-gray-600/50 cursor-pointer group"
        >
          <div className="relative">
            <Avatar className="w-8 h-8">
              <AvatarImage src={member.avatar} alt={member.name} />
              <AvatarFallback className={cn(
                "text-xs font-semibold",
                isOnline ? "bg-green-600 text-white" : "bg-gray-600 text-gray-300"
              )}>
                {member.name ? member.name.charAt(0).toUpperCase() : 'X'}
              </AvatarFallback>
            </Avatar>
            <div className={cn(
              "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-800",
              isOnline ? "bg-green-500" : "bg-gray-500"
            )} />
          </div>
          <div className="ml-3 flex-1 min-w-0">
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium truncate",
              getRoleColor(member.role)
            )}>
              {getRoleIcon(member.role)}
              <span className={cn(isOnline ? "text-white" : "text-gray-400")}>
                {member.name || `User ${member.id.slice(-4)}`}
              </span>
            </div>
            {member.customStatus && (
              <div className="text-xs text-gray-400 truncate">
                {member.customStatus}
              </div>
            )}
            {!member.customStatus && member.status && (
              <div className="text-xs text-gray-400 truncate">
                {member.status}
              </div>
            )}
          </div>
        </motion.div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56 bg-gray-800 border-gray-700 text-gray-200">
        <DropdownMenuLabel className="text-gray-400 px-2 py-1.5">
          {member.name || `User ${member.id.slice(-4)}`}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => handleMessageUser(member.id)}>
          <MessageSquarePlus className="mr-2 h-4 w-4" />
          <span>Message</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-primary/80 focus:bg-primary/80" onClick={() => toast({title: "View Profile", description:"Profile viewing feature coming soon!"})}>View Profile</DropdownMenuItem>
        {currentUser && currentUser.id !== member.id && !isFriend && !hasPendingRequest && (
             <DropdownMenuItem className="hover:bg-green-500/80 focus:bg-green-500/80 text-green-400 hover:text-white" onClick={() => handleAddFriend(member.id)}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Add Friend</span>
            </DropdownMenuItem>
        )}
        {isFriend && <DropdownMenuItem disabled>Already Friends</DropdownMenuItem>}
        {hasPendingRequest && !isFriend && <DropdownMenuItem disabled>Request Pending</DropdownMenuItem>}

        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="text-red-400 hover:bg-red-500/80 hover:text-white focus:bg-red-500/80 focus:text-white" onClick={() => toast({title: "Kick User", description:"Kick user feature coming soon!"})}>
          <UserX className="mr-2 h-4 w-4" />
          <span>Kick User</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )};

  if (isFriendsPage) {
     return (
      <div className="w-60 bg-gray-800 border-l border-gray-700/50 flex flex-col items-center justify-center h-full p-4 text-center">
        <UsersIcon className="h-20 w-20 text-primary mb-4" />
        <h2 className="text-lg font-semibold text-white">It's quiet... for now</h2>
        <p className="text-gray-400 text-sm mt-1">This is where you'll see server members. Since you're on the Friends page, this area is chilling.</p>
        <img-replace alt="Illustration of someone relaxing" class="w-40 h-40 mx-auto mt-6 opacity-50 rounded-lg shadow-lg" />
      </div>
    );
  }
  
  if (members.length === 0 && onlineUsers.length === 0) {
    return (
      <div className="w-60 bg-gray-800 border-l border-gray-700/50 flex flex-col items-center justify-center h-full p-4 text-center">
        <UsersIcon className="h-16 w-16 text-gray-600 mb-4" />
        <p className="text-gray-400 text-sm">No members in this server yet, or everyone is offline.</p>
        <img-replace alt="Illustration of two figures waving" class="w-32 h-32 mx-auto mt-4 opacity-30" />
      </div>
    );
  }


  return (
    <div className="w-60 bg-gray-800 border-l border-gray-700/50 overflow-y-auto h-full">
      <div className="p-3">
        {onlineMembers.length > 0 && (
          <div className="mb-5">
            <div className="flex items-center px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Online — {onlineMembers.length}</span>
            </div>
            <div className="mt-2 space-y-1">
              {onlineMembers.map((member) => (
                <MemberItem key={member.id} member={member} isOnline={true} />
              ))}
            </div>
          </div>
        )}

        {offlineMembers.length > 0 && (
          <div>
            <div className="flex items-center px-2 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wide">
              <UsersIcon className="h-3.5 w-3.5 mr-1.5" />
              <span>Offline — {offlineMembers.length}</span>
            </div>
            <div className="mt-2 space-y-1">
              {offlineMembers.map((member) => (
                <MemberItem key={member.id} member={member} isOnline={false} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MemberList;