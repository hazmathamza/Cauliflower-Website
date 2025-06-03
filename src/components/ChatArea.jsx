import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Smile, Plus, Hash, Paperclip, Image as ImageIcon, X, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import EmojiPicker from 'emoji-picker-react';

const ChatArea = ({ 
  channel, 
  messages, 
  onSendMessage, 
  currentUser,
  isDM = false,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [attachedFile, setAttachedFile] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiButtonRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    // Clear message input when channel changes
    setNewMessage('');
    setAttachedFile(null);
    setShowEmojiPicker(false);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }, [channel]);
  
  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showEmojiPicker && emojiButtonRef.current && !emojiButtonRef.current.contains(event.target)) {
        // Check if the click is on the emoji picker itself
        const emojiPickerElement = document.querySelector('.EmojiPickerReact');
        if (emojiPickerElement && !emojiPickerElement.contains(event.target)) {
          setShowEmojiPicker(false);
        }
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);
  
  const handleEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    const cursorPosition = inputRef.current.selectionStart;
    const textBeforeCursor = newMessage.slice(0, cursorPosition);
    const textAfterCursor = newMessage.slice(cursorPosition);
    
    setNewMessage(textBeforeCursor + emoji + textAfterCursor);
    
    // Focus back on input after selecting emoji
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.selectionStart = cursorPosition + emoji.length;
        inputRef.current.selectionEnd = cursorPosition + emoji.length;
      }
    }, 10);
  };

  const handleSendMessage = () => {
    if (newMessage.trim() || attachedFile) {
      onSendMessage(newMessage.trim(), attachedFile, isDM ? channel?.id : null); // Pass channel.id as recipientId if it's a DM
      setNewMessage('');
      setAttachedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; 
      }
      toast({
        title: "Message sent!",
        description: "Your message has been delivered.",
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { 
        toast({ variant: "destructive", title: "File too large", description: "Please select a file smaller than 5MB." });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedFile({
          name: file.name,
          type: file.type,
          size: file.size,
          url: file.type.startsWith('image/') ? reader.result : null, 
        });
      };
      reader.readAsDataURL(file);
      toast({ title: "File Attached", description: `${file.name} is ready to be sent.` });
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString();
  };

  const groupedMessages = messages.reduce((groups, message) => {
    const date = formatDate(message.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (!channel && !isDM) { // If not a DM and no channel, show placeholder
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-700 text-gray-400 p-8">
        <Hash className="h-24 w-24 text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-300">No Channel Selected</h2>
        <p className="mt-2 text-center">Select a channel from the list on the left to start chatting, or create a new one!</p>
      </div>
    );
  }
  
  if (isDM && !channel) { // If it's supposed to be a DM but channel info is missing (e.g., user navigated to /friends directly)
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-700 text-gray-400 p-8">
        <Users className="h-24 w-24 text-gray-500 mb-4" />
        <h2 className="text-2xl font-semibold text-gray-300">Select a Friend</h2>
        <p className="mt-2 text-center">Choose a friend from the list to start a direct message.</p>
      </div>
    );
  }


  return (
    <div className="flex-1 flex flex-col bg-gray-700">
      <div className="h-12 px-4 flex items-center border-b border-gray-600 bg-gray-800 shadow-sm">
        {isDM ? (
            <Users className="h-5 w-5 text-gray-400 mr-2" />
        ) : (
            <Hash className="h-5 w-5 text-gray-400 mr-2" />
        )}
        <h3 className="font-semibold text-white">{channel?.name || (isDM ? 'Direct Message' : 'general')}</h3>
        {channel?.description && !isDM && <span className="ml-2 text-sm text-gray-400 border-l border-gray-600 pl-2">{channel.description}</span>}
      </div>

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-1">
          {Object.entries(groupedMessages).map(([date, dayMessages]) => (
            <div key={date}>
              <div className="flex items-center my-4">
                <div className="flex-1 h-px bg-gray-600/50"></div>
                <span className="px-3 text-xs text-gray-400 bg-gray-700 rounded-full">{date}</span>
                <div className="flex-1 h-px bg-gray-600/50"></div>
              </div>
              <AnimatePresence>
                {dayMessages.map((message, index) => {
                  const prevMessage = index > 0 ? dayMessages[index - 1] : null;
                  const showAvatar = !prevMessage || prevMessage.userId !== message.userId || (message.timestamp - prevMessage.timestamp) > 5 * 60 * 1000;
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className={cn("group flex items-start space-x-3 px-2 py-0.5 message-hover rounded", showAvatar ? "mt-3" : "mt-0.5")}
                    >
                      <div className="w-10 flex justify-center pt-1">
                        {showAvatar ? (
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={message.userAvatar} alt={message.userName} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm">{message.userName?.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        ) : (
                          <span className="text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity w-full text-center pt-1">{formatTime(message.timestamp)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        {showAvatar && (
                          <div className="flex items-baseline space-x-2 mb-0.5">
                            <span className="font-semibold text-white hover:underline cursor-pointer text-sm">{message.userName}</span>
                            <span className="text-xs text-gray-400">{formatTime(message.timestamp)}</span>
                          </div>
                        )}
                        <div className="text-gray-100 break-words text-sm leading-relaxed">
                          {message.content}
                          {message.file && (
                            <div className="mt-2 p-2 bg-gray-600/50 rounded-md max-w-xs">
                              {message.file.type?.startsWith('image/') && message.file.url ? (
                                <img-replace src={message.file.url} alt={message.file.name} className="max-w-full max-h-64 rounded-md object-contain" />
                              ) : (
                                <div className="flex items-center space-x-2 text-gray-300">
                                  <Paperclip className="h-5 w-5" />
                                  <span>{message.file.name} ({(message.file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-3 border-t border-gray-600/50">
        {attachedFile && (
          <div className="mb-2 p-2 bg-gray-600/70 rounded-md flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-gray-200">
              {attachedFile.type.startsWith('image/') ? <ImageIcon className="h-5 w-5 text-primary" /> : <Paperclip className="h-5 w-5 text-primary" />}
              <span>{attachedFile.name}</span>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-red-400" onClick={() => { setAttachedFile(null); if(fileInputRef.current) fileInputRef.current.value = ""; }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <div className="flex items-center space-x-2 bg-gray-600 rounded-lg px-3 py-2">
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" id="file-upload" />
          <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white" onClick={() => fileInputRef.current?.click()}>
            <Plus className="h-5 w-5" />
          </Button>
          <Input
            ref={inputRef}
            placeholder={isDM ? `Message @${channel?.name || 'user'}` : `Message #${channel?.name || 'general'}`}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-gray-400 text-sm"
          />
          <div className="relative">
            <Button 
              ref={emojiButtonRef}
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 text-gray-400 hover:text-white" 
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile className="h-5 w-5" />
            </Button>
            
            {showEmojiPicker && (
              <div className="absolute bottom-12 right-0 z-50">
                <EmojiPicker 
                  onEmojiClick={handleEmojiClick} 
                  theme="dark"
                  searchPlaceHolder="Search emoji..."
                  width={320}
                  height={400}
                />
              </div>
            )}
          </div>
          <Button onClick={handleSendMessage} disabled={!newMessage.trim() && !attachedFile} size="icon" className="h-8 w-8 bg-primary hover:bg-primary/90">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;