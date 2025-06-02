import React, { useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Shield, Bell, Palette, CreditCard, Gift, LogOut, Settings, KeyRound, ListChecks, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';
import { DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";


const SettingsNavItem = ({ to, icon: Icon, label }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      cn(
        "flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
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

const MyAccountSettings = ({ user, onUpdate }) => {
  const [username, setUsername] = useState(user.username);
  const [email, setEmail] = useState(user.email);
  const [pronouns, setPronouns] = useState(user.pronouns || '');
  const [customStatus, setCustomStatus] = useState(user.customStatus || '');

  const handleSave = () => {
    onUpdate({ username, email, pronouns, customStatus });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold text-white">My Account</h2>
      <div className="space-y-4">
        <div>
          <Label htmlFor="username" className="text-gray-300">Username</Label>
          <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} className="mt-1 bg-gray-700 border-gray-600" />
        </div>
        <div>
          <Label htmlFor="email" className="text-gray-300">Email</Label>
          <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 bg-gray-700 border-gray-600" />
        </div>
        <div>
          <Label htmlFor="pronouns" className="text-gray-300">Pronouns</Label>
          <Input id="pronouns" value={pronouns} onChange={(e) => setPronouns(e.target.value)} placeholder="e.g., she/her, he/him, they/them" className="mt-1 bg-gray-700 border-gray-600" />
        </div>
         <div>
          <Label htmlFor="customStatus" className="text-gray-300">Custom Status</Label>
          <Input id="customStatus" value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} placeholder="Set a custom status" className="mt-1 bg-gray-700 border-gray-600" />
        </div>
      </div>
      <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Changes</Button>
    </motion.div>
  );
};

const ProfileSettings = ({ user, onUpdate }) => {
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [bannerUrl, setBannerUrl] = useState(user.bannerUrl || '');
  const [profileEffect, setProfileEffect] = useState(user.profileEffect || 'none');
  const [aboutMe, setAboutMe] = useState(user.aboutMe || '');
  const fileInputRef = React.useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({ variant: "destructive", title: "Image too large", description: "Avatar image must be less than 2MB."});
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleSave = () => {
    onUpdate({ avatar: avatarUrl, bannerUrl, profileEffect, aboutMe });
  };

  return (
    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 p-6">
      <h2 className="text-2xl font-semibold text-white">User Profile</h2>
      <div className="space-y-6">
        <div>
          <Label className="text-gray-300">Avatar</Label>
          <div className="mt-2 flex items-center space-x-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl} alt={user.username} />
              <AvatarFallback className="text-3xl bg-gray-600">{user.username?.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleAvatarChange} className="hidden" id="avatar-upload"/>
            <Button variant="outline" onClick={() => document.getElementById('avatar-upload').click()}>Change Avatar</Button>
          </div>
        </div>
         <div>
          <Label htmlFor="bannerUrl" className="text-gray-300">Profile Banner URL</Label>
          <Input id="bannerUrl" value={bannerUrl} onChange={(e) => setBannerUrl(e.target.value)} placeholder="https://example.com/banner.jpg" className="mt-1 bg-gray-700 border-gray-600" />
           {bannerUrl && <img-replace src={bannerUrl} alt="Banner preview" className="mt-2 rounded-md max-h-32 object-cover w-full" />}
        </div>
        <div>
          <Label htmlFor="profileEffect" className="text-gray-300">Profile Effect</Label>
          <select id="profileEffect" value={profileEffect} onChange={(e) => setProfileEffect(e.target.value)} className="mt-1 block w-full bg-gray-700 border-gray-600 rounded-md p-2 text-white focus:ring-primary focus:border-primary">
            <option value="none">None</option>
            <option value="sparkles">Sparkles</option>
            <option value="fire">Fire</option>
            <option value="matrix">Matrix Rain</option>
            <option value="sakura">Sakura Blossoms</option>
          </select>
        </div>
        <div>
          <Label htmlFor="aboutMe" className="text-gray-300">About Me</Label>
          <Textarea
            id="aboutMe"
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
            placeholder="Tell us a little about yourself..."
            className="mt-1 bg-gray-700 border-gray-600 min-h-[100px] focus:ring-primary focus:border-primary"
            maxLength={190}
          />
          <p className="text-xs text-gray-400 mt-1">{aboutMe.length} / 190 characters</p>
        </div>
      </div>
      <Button onClick={handleSave} className="bg-primary hover:bg-primary/90">Save Profile</Button>
    </motion.div>
  );
};

const PlaceholderSettings = ({ title }) => (
  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6">
    <h2 className="text-2xl font-semibold text-white mb-4">{title}</h2>
    <div className="bg-gray-700/30 p-8 rounded-lg text-center">
      <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
      <p className="text-gray-400">Settings for "{title}" will be available here soon!</p>
      <p className="text-xs text-gray-500 mt-2">Thanks for your patience as we build out these features.</p>
    </div>
  </motion.div>
);


const UserSettingsPage = ({ currentUser, onUpdateUser }) => {
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/');
    return null;
  }
  
  const handleLogout = () => {
    localStorage.removeItem('discord-currentUser');
    toast({ title: "Logged Out", description: "You have been successfully logged out." });
    navigate('/auth');
  };

  return (
    <div className="h-screen flex bg-gray-850 text-white">
      <motion.div 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="w-64 bg-gray-900 p-4 space-y-1 border-r border-gray-700/50 flex flex-col"
      >
        <div className="text-xs uppercase text-gray-400 font-semibold px-3 pt-2 pb-1">User Settings</div>
        <SettingsNavItem to="my-account" icon={User} label="My Account" />
        <SettingsNavItem to="profile" icon={Palette} label="User Profile" />
        <SettingsNavItem to="privacy" icon={Shield} label="Privacy & Safety" />
        <SettingsNavItem to="sessions" icon={ListChecks} label="Authorized Apps" />
        <SettingsNavItem to="connections" icon={KeyRound} label="Connections" />
        
        <div className="text-xs uppercase text-gray-400 font-semibold px-3 pt-4 pb-1">Billing Settings</div>
        <SettingsNavItem to="nitro" icon={Gift} label="Nitro" />
        <SettingsNavItem to="subscriptions" icon={CreditCard} label="Server Boost" />
        <SettingsNavItem to="billing" icon={CreditCard} label="Subscriptions" />
        
        <div className="text-xs uppercase text-gray-400 font-semibold px-3 pt-4 pb-1">App Settings</div>
        <SettingsNavItem to="appearance" icon={Eye} label="Appearance" />
        <SettingsNavItem to="notifications" icon={Bell} label="Notifications" />

        <div className="mt-auto space-y-1">
          <DropdownMenuSeparator className="bg-gray-700" />
          <Button variant="ghost" onClick={handleLogout} className="w-full justify-start text-red-400 hover:bg-red-500/20 hover:text-red-300">
            <LogOut className="mr-3 h-5 w-5" /> Log Out
          </Button>
          <DropdownMenuSeparator className="bg-gray-700" />
           <Button variant="ghost" onClick={() => navigate('/')} className="w-full justify-start text-gray-400 hover:bg-gray-700/50 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="mr-3 h-7 w-7"><path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-5h2v2h-2v-2zm0-8h2v6h-2V7z"></path></svg>
            ESC
          </Button>
        </div>
      </motion.div>
      <div className="flex-1 bg-gray-700/50 overflow-y-auto">
        <Routes>
          <Route path="my-account" element={<MyAccountSettings user={currentUser} onUpdate={onUpdateUser} />} />
          <Route path="profile" element={<ProfileSettings user={currentUser} onUpdate={onUpdateUser} />} />
          <Route path="privacy" element={<PlaceholderSettings title="Privacy & Safety" />} />
          <Route path="sessions" element={<PlaceholderSettings title="Authorized Apps" />} />
          <Route path="connections" element={<PlaceholderSettings title="Connections" />} />
          <Route path="nitro" element={<PlaceholderSettings title="Nitro" />} />
          <Route path="subscriptions" element={<PlaceholderSettings title="Server Boost" />} />
          <Route path="billing" element={<PlaceholderSettings title="Subscriptions" />} />
          <Route path="appearance" element={<PlaceholderSettings title="Appearance" />} />
          <Route path="notifications" element={<PlaceholderSettings title="Notifications" />} />
          <Route index element={<MyAccountSettings user={currentUser} onUpdate={onUpdateUser} />} />
        </Routes>
      </div>
    </div>
  );
};

export default UserSettingsPage;