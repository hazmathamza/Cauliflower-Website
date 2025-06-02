import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Settings, Shield, Users, Smile, Bot, Link as LinkIcon, Trash2, LayoutDashboard, Palette, UploadCloud, UserPlus, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";

const SettingsNavItem = ({ to, icon: Icon, label, disabled = false }) => (
  <NavLink
    to={to}
    onClick={(e) => disabled && e.preventDefault()}
    className={({ isActive }) =>
      cn(
        "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
        disabled ? "text-gray-500 cursor-not-allowed" : 
        isActive
          ? "bg-primary/20 text-primary"
          : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
      )
    }
  >
    <Icon className="mr-3 h-5 w-5" />
    {label}
  </NavLink>
);

const OverviewSettings = ({ server, onUpdate, currentUser }) => {
  const [serverName, setServerName] = useState(server.name);
  const [serverIcon, setServerIcon] = useState(server.icon); 
  const [serverBanner, setServerBanner] = useState(server.bannerUrl || '');

  const handleSave = () => {
    onUpdate(server.id, { name: serverName, icon: serverIcon, bannerUrl: serverBanner });
  };
  
  const isOwner = server.ownerId === currentUser?.id;

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold text-white">Server Overview</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="serverName" className="text-gray-300">Server Name</Label>
          <Input id="serverName" value={serverName} onChange={(e) => setServerName(e.target.value)} className="mt-1 bg-gray-700 border-gray-600" disabled={!isOwner} />
        </div>
        <div>
          <Label htmlFor="serverIcon" className="text-gray-300">Server Icon (Emoji or URL)</Label>
          <Input id="serverIcon" value={serverIcon} onChange={(e) => setServerIcon(e.target.value)} className="mt-1 bg-gray-700 border-gray-600" disabled={!isOwner} />
        </div>
        <div>
          <Label htmlFor="serverBanner" className="text-gray-300">Server Banner URL</Label>
          <Input id="serverBanner" value={serverBanner} onChange={(e) => setServerBanner(e.target.value)} placeholder="https://example.com/banner.jpg" className="mt-1 bg-gray-700 border-gray-600" disabled={!isOwner} />
          {serverBanner && <img-replace src={serverBanner} alt="Banner preview" className="mt-2 rounded-md max-h-40 object-cover w-full" />}
        </div>
      </div>
      {isOwner && <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Changes</Button>}
      {!isOwner && <p className="text-sm text-yellow-400">Only the server owner can change these settings.</p>}
    </motion.div>
  );
};

const PlaceholderServerSettings = ({ title }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
    <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
    <div className="bg-gray-700/30 p-8 rounded-lg text-center">
      <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
      <p className="text-gray-400">Server settings for "{title}" will be available here soon!</p>
      <p className="text-xs text-gray-500 mt-2">This section is under construction.</p>
    </div>
  </motion.div>
);

const ServerSettingsPage = ({ server, onUpdateSettings, currentUser }) => {
  const navigate = useNavigate();
  const { serverId } = useParams(); 

  useEffect(() => {
    if (!server) {
      toast({ variant: "destructive", title: "Error", description: "Server not found." });
      navigate('/');
    }
  }, [server, navigate]);

  if (!server) return null;

  const handleDeleteServer = () => {
    if (server.ownerId !== currentUser?.id) {
      toast({ variant: "destructive", title: "Permission Denied", description: "Only the server owner can delete the server." });
      return;
    }
    if (window.confirm(`Are you sure you want to delete the server "${server.name}"? This action cannot be undone.`)) {
      toast({ title: "Feature Incomplete", description: "Server deletion logic needs to be fully implemented in App.jsx." });
    }
  };
  
  const isOwner = server.ownerId === currentUser?.id;


  return (
    <div className="h-screen flex bg-gray-850 text-white">
      <motion.div 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gray-900 p-4 space-y-1 border-r border-gray-700/50 flex flex-col"
      >
        <div className="px-3 pt-2 pb-1">
          <h1 className="text-lg font-semibold text-white truncate">{server.name}</h1>
          <p className="text-xs text-gray-400">Server Settings</p>
        </div>
        <SettingsNavItem to={`/server-settings/${serverId}/overview`} icon={LayoutDashboard} label="Overview" />
        <SettingsNavItem to={`/server-settings/${serverId}/roles`} icon={Shield} label="Roles" disabled={!isOwner} />
        <SettingsNavItem to={`/server-settings/${serverId}/emoji`} icon={Smile} label="Emoji" disabled={!isOwner} />
        <SettingsNavItem to={`/server-settings/${serverId}/moderation`} icon={UserPlus} label="Moderation" disabled={!isOwner} />
        <SettingsNavItem to={`/server-settings/${serverId}/audit-log`} icon={Lock} label="Audit Log" disabled={!isOwner} />
        <SettingsNavItem to={`/server-settings/${serverId}/integrations`} icon={LinkIcon} label="Integrations" disabled={!isOwner} />
        
        <div className="text-xs uppercase text-gray-400 font-semibold px-3 pt-4 pb-1">User Management</div>
        <SettingsNavItem to={`/server-settings/${serverId}/members`} icon={Users} label="Members" />
        <SettingsNavItem to={`/server-settings/${serverId}/invites`} icon={UserPlus} label="Invites" />
        <SettingsNavItem to={`/server-settings/${serverId}/bans`} icon={Shield} label="Bans" disabled={!isOwner} />

        <div className="mt-auto space-y-1">
          <DropdownMenuSeparator className="bg-gray-700" />
          {isOwner && (
            <Button variant="ghost" onClick={handleDeleteServer} className="w-full justify-start text-red-400 hover:bg-red-500/20 hover:text-red-300">
              <Trash2 className="mr-3 h-5 w-5" /> Delete Server
            </Button>
          )}
          <DropdownMenuSeparator className="bg-gray-700" />
           <Button variant="ghost" onClick={() => navigate('/')} className="w-full justify-start text-gray-400 hover:bg-gray-700/50 hover:text-white">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-3 h-7 w-7"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"></path></svg>
            ESC
          </Button>
        </div>
      </motion.div>
      <div className="flex-1 bg-gray-700/50 overflow-y-auto">
        <Routes>
          <Route path="overview" element={<OverviewSettings server={server} onUpdate={onUpdateSettings} currentUser={currentUser} />} />
          <Route path="roles" element={<PlaceholderServerSettings title="Roles" />} />
          <Route path="emoji" element={<PlaceholderServerSettings title="Emoji" />} />
          <Route path="moderation" element={<PlaceholderServerSettings title="Moderation" />} />
          <Route path="audit-log" element={<PlaceholderServerSettings title="Audit Log" />} />
          <Route path="integrations" element={<PlaceholderServerSettings title="Integrations" />} />
          <Route path="members" element={<PlaceholderServerSettings title="Members" />} />
          <Route path="invites" element={<PlaceholderServerSettings title="Invites" />} />
          <Route path="bans" element={<PlaceholderServerSettings title="Bans" />} />
          <Route index element={<OverviewSettings server={server} onUpdate={onUpdateSettings} currentUser={currentUser} />} />
        </Routes>
      </div>
    </div>
  );
};

export default ServerSettingsPage;