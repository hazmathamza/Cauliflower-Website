import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Home, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const ServerList = ({ servers, activeServer, onServerSelect, onCreateServer, navigate }) => {
  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-3 h-full border-r border-gray-800">
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          onServerSelect('home');
          navigate('/friends');
        }}
        className={cn(
          "h-12 w-12 rounded-full flex items-center justify-center cursor-pointer server-icon",
          activeServer === 'home' ? 'bg-primary rounded-2xl' : 'bg-gray-700 hover:bg-primary'
        )}
        title="Home / Friends"
      >
        <Home className={cn("h-6 w-6", activeServer === 'home' ? "text-white" : "text-gray-300 group-hover:text-white")} />
      </motion.div>

      <div className="w-8 h-px bg-gray-700 my-2"></div>

      {servers.filter(s => s.id !== 'home').map((server) => (
        <motion.div
          key={server.id}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onServerSelect(server.id)}
          className={cn(
            "h-12 w-12 rounded-full flex items-center justify-center cursor-pointer server-icon group",
            activeServer === server.id ? 'bg-primary rounded-2xl' : 'bg-gray-700 hover:bg-primary'
          )}
          title={server.name}
        >
          {server.icon && server.icon.startsWith('http') ? (
            <Avatar className="h-12 w-12">
                <AvatarImage src={server.icon} alt={server.name} />
                <AvatarFallback className="bg-gray-600 text-lg">{server.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ) : (
            <span className={cn("text-2xl", activeServer === server.id ? "text-white" : "text-gray-300 group-hover:text-white")}>
              {server.icon || server.name.charAt(0)}
            </span>
          )}
        </motion.div>
      ))}
      <motion.div
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={onCreateServer}
        className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-green-500 server-icon group"
        title="Create Server"
      >
        <Plus className="h-6 w-6 text-green-400 group-hover:text-white" />
      </motion.div>
    </div>
  );
};

export default ServerList;