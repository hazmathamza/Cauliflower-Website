import React, { createContext, useContext, useState, useEffect } from 'react';

// Define available themes
export const themes = {
  dark: {
    name: 'Dark',
    background: 'bg-gray-900',
    sidebar: 'bg-gray-800',
    channelList: 'bg-gray-800',
    chatArea: 'bg-gray-700',
    memberList: 'bg-gray-800',
    text: 'text-white',
    secondaryText: 'text-gray-300',
    border: 'border-gray-600',
    input: 'bg-gray-600',
    hover: 'hover:bg-gray-700',
    active: 'bg-gray-600',
    icon: 'text-gray-400',
  },
  light: {
    name: 'Light',
    background: 'bg-gray-100',
    sidebar: 'bg-gray-200',
    channelList: 'bg-gray-200',
    chatArea: 'bg-white',
    memberList: 'bg-gray-200',
    text: 'text-gray-900',
    secondaryText: 'text-gray-600',
    border: 'border-gray-300',
    input: 'bg-gray-100',
    hover: 'hover:bg-gray-300',
    active: 'bg-gray-300',
    icon: 'text-gray-500',
  },
  midnight: {
    name: 'Midnight',
    background: 'bg-slate-950',
    sidebar: 'bg-slate-900',
    channelList: 'bg-slate-900',
    chatArea: 'bg-slate-800',
    memberList: 'bg-slate-900',
    text: 'text-slate-100',
    secondaryText: 'text-slate-300',
    border: 'border-slate-700',
    input: 'bg-slate-700',
    hover: 'hover:bg-slate-800',
    active: 'bg-slate-700',
    icon: 'text-slate-400',
  },
  forest: {
    name: 'Forest',
    background: 'bg-emerald-950',
    sidebar: 'bg-emerald-900',
    channelList: 'bg-emerald-900',
    chatArea: 'bg-emerald-800',
    memberList: 'bg-emerald-900',
    text: 'text-emerald-100',
    secondaryText: 'text-emerald-300',
    border: 'border-emerald-700',
    input: 'bg-emerald-700',
    hover: 'hover:bg-emerald-800',
    active: 'bg-emerald-700',
    icon: 'text-emerald-400',
  },
  ocean: {
    name: 'Ocean',
    background: 'bg-blue-950',
    sidebar: 'bg-blue-900',
    channelList: 'bg-blue-900',
    chatArea: 'bg-blue-800',
    memberList: 'bg-blue-900',
    text: 'text-blue-100',
    secondaryText: 'text-blue-300',
    border: 'border-blue-700',
    input: 'bg-blue-700',
    hover: 'hover:bg-blue-800',
    active: 'bg-blue-700',
    icon: 'text-blue-400',
  },
};

// Create the context
const ThemeContext = createContext();

// Create a provider component
export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(() => {
    // Try to get the theme from localStorage
    const savedTheme = localStorage.getItem('discord-theme');
    return savedTheme && themes[savedTheme] ? savedTheme : 'dark';
  });

  // Update localStorage when theme changes
  useEffect(() => {
    localStorage.setItem('discord-theme', currentTheme);
    
    // Update body background
    document.body.className = themes[currentTheme].background;
  }, [currentTheme]);

  // Get the current theme object
  const theme = themes[currentTheme];

  const toggleTheme = (themeName) => {
    if (themes[themeName]) {
      setCurrentTheme(themeName);
    }
  };

  return (
    <ThemeContext.Provider value={{ currentTheme, theme, toggleTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};