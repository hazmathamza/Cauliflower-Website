
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { LogIn, UserPlus, Eye, EyeOff } from 'lucide-react';

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); 
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      if (!email || !password) {
        toast({ variant: "destructive", title: "Login Failed", description: "Please enter email and password." });
        return;
      }
      // Simulate login
      const users = JSON.parse(localStorage.getItem('discord-users')) || [];
      const user = users.find(u => u.email === email && u.password === password);
      if (user) {
        localStorage.setItem('discord-currentUser', JSON.stringify(user));
        onAuthSuccess(user);
        toast({ title: "Login Successful!", description: `Welcome back, ${user.username}!` });
      } else {
        toast({ variant: "destructive", title: "Login Failed", description: "Invalid email or password." });
      }
    } else {
      // Simulate signup
      if (!username || !email || !password) {
        toast({ variant: "destructive", title: "Signup Failed", description: "Please fill all fields." });
        return;
      }
      const users = JSON.parse(localStorage.getItem('discord-users')) || [];
      if (users.find(u => u.email === email)) {
        toast({ variant: "destructive", title: "Signup Failed", description: "Email already exists." });
        return;
      }
      const newUser = { id: `user${Date.now()}`, username, email, password, avatar: null, status: 'Online', role: 'member' };
      users.push(newUser);
      localStorage.setItem('discord-users', JSON.stringify(users));
      localStorage.setItem('discord-currentUser', JSON.stringify(newUser));
      onAuthSuccess(newUser);
      toast({ title: "Signup Successful!", description: `Welcome, ${newUser.username}!` });
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 p-4"
    >
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-xl shadow-2xl">
        <div className="text-center">
          <motion.h1 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-4xl font-bold text-primary"
          >
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </motion.h1>
          <p className="text-gray-400 mt-2">
            {isLogin ? 'Login to continue your journey.' : 'Join our community today!'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Choose a cool username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-500"
              />
            </motion.div>
          )}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.2 : 0.3 }}
          >
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-500"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isLogin ? 0.3 : 0.4 }}
          >
            <Label htmlFor="password" className="text-gray-300">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 bg-gray-700 border-gray-600 text-white placeholder-gray-500 pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-gray-400 hover:text-white"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: isLogin ? 0.4 : 0.5 }}
          >
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white py-3">
              {isLogin ? <LogIn className="mr-2 h-5 w-5" /> : <UserPlus className="mr-2 h-5 w-5" />}
              {isLogin ? 'Login' : 'Sign Up'}
            </Button>
          </motion.div>
        </form>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: isLogin ? 0.5 : 0.6 }}
          className="text-center"
        >
          <Button
            variant="link"
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary hover:text-primary/80"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Login"}
          </Button>
        </motion.div>
        <div className="text-center text-xs text-gray-500">
          For now, user data is stored in localStorage.
        </div>
      </div>
    </motion.div>
  );
};

export default AuthScreen;
