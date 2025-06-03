import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/hooks/useTheme';

const AddFriendModal = ({ isOpen, onClose, onAddFriend, users, currentUser }) => {
  const [username, setUsername] = useState('');
  const modalRef = useRef(null);
  const { theme } = useTheme();

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter a username." });
      return;
    }
    
    const targetUser = users.find(u => u.username.toLowerCase() === username.toLowerCase().trim());
    if (!targetUser) {
      toast({ variant: "destructive", title: "User Not Found", description: `Could not find user: ${username}` });
      return;
    }
    
    if (targetUser.id === currentUser.id) {
      toast({ variant: "destructive", title: "Error", description: "You can't add yourself as a friend." });
      return;
    }
    
    onAddFriend(targetUser.id);
    setUsername('');
    onClose();
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
                <Button type="submit" className="bg-primary hover:bg-primary/90 text-white">
                  <UserPlus className="mr-2 h-4 w-4" /> Send Request
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