import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { useTheme } from '@/hooks/useTheme';
import { fixPermissionIssues } from '@/utils/fixPermissions';

const PermissionFixDialog = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFixed, setIsFixed] = useState(false);
  const modalRef = React.useRef(null);
  const { theme } = useTheme();

  // Handle escape key press
  React.useEffect(() => {
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
  React.useEffect(() => {
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
    
    if (!email.trim() || !password.trim()) {
      toast({ variant: "destructive", title: "Error", description: "Please enter your email and password." });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await fixPermissionIssues(email, password);
      
      if (result.success) {
        setIsFixed(true);
        toast({ title: "Success", description: "Permission issues have been fixed. You can now send friend requests." });
      } else {
        toast({ 
          variant: "destructive", 
          title: "Fix Failed", 
          description: result.error || "Failed to fix permission issues. Please try again."
        });
      }
    } catch (error) {
      console.error("Error fixing permissions:", error);
      toast({ 
        variant: "destructive", 
        title: "Fix Failed", 
        description: error.message || "There was an error fixing permissions. Please try again."
      });
    } finally {
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
            
            <div className="flex items-center mb-4">
              <ShieldAlert className="h-6 w-6 text-yellow-500 mr-2" />
              <h2 className={`text-xl font-bold ${theme.text}`}>Fix Permission Issues</h2>
            </div>
            
            {isFixed ? (
              <div className="text-center py-6">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className={`text-lg font-medium ${theme.text} mb-2`}>Permissions Fixed!</h3>
                <p className={`${theme.secondaryText} mb-6`}>You should now be able to send friend requests.</p>
                <Button onClick={onClose} className="bg-primary hover:bg-primary/90 text-white">
                  Close
                </Button>
              </div>
            ) : (
              <>
                <p className={`mb-4 ${theme.secondaryText}`}>
                  To fix permission issues, please re-authenticate with your account credentials.
                  This will refresh your authentication token and fix common permission problems.
                </p>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label htmlFor="email" className={`block mb-2 text-sm font-medium ${theme.secondaryText}`}>
                      Email
                    </label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`${theme.input} ${theme.text} border-0 focus-visible:ring-1 focus-visible:ring-primary`}
                      autoFocus
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="password" className={`block mb-2 text-sm font-medium ${theme.secondaryText}`}>
                      Password
                    </label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className={`${theme.input} ${theme.text} border-0 focus-visible:ring-1 focus-visible:ring-primary`}
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={onClose}
                      className={`${theme.border} ${theme.text}`}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary/90 text-white"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Fixing...
                        </>
                      ) : (
                        <>
                          <ShieldAlert className="mr-2 h-4 w-4" /> Fix Permissions
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PermissionFixDialog;