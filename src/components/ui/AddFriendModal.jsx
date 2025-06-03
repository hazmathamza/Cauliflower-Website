import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus, Loader2, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { testFriendRequestPermissions } from '@/utils/testPermissions';
import PermissionFixDialog from './PermissionFixDialog';

const AddFriendModal = ({ isOpen, onClose, onAddFriend, users, currentUser }) => {
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [permissionChecked, setPermissionChecked] = useState(false);
  const [hasPermission, setHasPermission] = useState(true);
  const modalRef = useRef(null);
  const { theme } = useTheme();

  // Check permissions when modal opens
  useEffect(() => {
    if (isOpen && currentUser && !permissionChecked) {
      const checkPermissions = async () => {
        try {
          // Find a random user that's not the current user to test permissions
          const otherUser = users.find(u => u.uid !== currentUser.uid);
          if (otherUser) {
            const result = await testFriendRequestPermissions(currentUser.uid, otherUser.uid);
            setHasPermission(result.success);
            setPermissionChecked(true);
            
            if (!result.success) {
              console.warn("Permission check failed:", result.error);
            }
          }
        } catch (error) {
          console.error("Error checking permissions:", error);
          setHasPermission(false);
          setPermissionChecked(true);
        }
      };
      
      checkPermissions();
    }
  }, [isOpen, currentUser, users, permissionChecked]);

  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!hasPermission && permissionChecked) {
      toast({ 
        variant: "destructive", 
        title: "Permission Error", 
        description: "You don't have permission to send friend requests. This may be due to Firebase security rules." 
      });
      return;
    }
    
    if (!username.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a username." });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use case-insensitive comparison and ensure username exists
      const targetUser = users.find(u => 
        u.username && u.username.toLowerCase() === username.toLowerCase().trim()
      );
      
      if (!targetUser) {
        toast({ variant: "destructive", title: "User Not Found", description: `Could not find user: ${username}` });
        setIsSubmitting(false);
        return;
      }
      
      // Use uid instead of id
      if (targetUser.uid === currentUser.uid) {
        toast({ variant: "destructive", title: "Error", description: "You can't add yourself as a friend." });
        setIsSubmitting(false);
        return;
      }
      
      // Check if already friends
      if (currentUser.friends && currentUser.friends.includes(targetUser.uid)) {
        toast({ variant: "destructive", title: "Already Friends", description: `You are already friends with ${targetUser.username}.` });
        setIsSubmitting(false);
        return;
      }
      
      // Check if friend request already sent
      if (targetUser.friendRequests && targetUser.friendRequests.some(req => req.fromUserId === currentUser.uid)) {
        toast({ variant: "destructive", title: "Request Already Sent", description: `You've already sent a friend request to ${targetUser.username}.` });
        setIsSubmitting(false);
        return;
      }
      
      // Send friend request using uid
      await onAddFriend(targetUser.uid);
      setUsername('');
      setIsSubmitting(false);
      onClose();
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      toast({ 
        variant: "destructive", 
        title: "Friend Request Failed", 
        description: error.message || "There was an error sending the friend request. Please try again."
      });
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className={`${theme.chatArea} rounded-lg shadow-xl w-full max-w-md p-6 relative`}
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
            
            <h2 className={`text-xl font-bold mb-4 ${theme.text}`}>Add Friend</h2>
            
            {!hasPermission && permissionChecked && (
              <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-md">
                <p className="text-red-300 text-sm">
                  <strong>Permission Error:</strong> You don't have permission to send friend requests. 
                  This may be due to Firebase security rules or your account status.
                </p>
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="username" className={`block mb-2 text-sm font-medium ${theme.secondaryText}`}>
                  Friend's Username
                </label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${theme.input} ${theme.text} border-0 focus-visible:ring-1 focus-visible:ring-primary`}
                  autoFocus
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  className={`${theme.border} ${theme.text}`}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary hover:bg-primary/90 text-white"
                  disabled={isSubmitting || (!hasPermission && permissionChecked)}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" /> Send Request
                    </>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFriendModal;