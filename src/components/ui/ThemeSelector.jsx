import React from 'react';
import { useTheme, themes } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Check, Moon, Sun, Palette } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ThemeSelector = () => {
  const { currentTheme, toggleTheme } = useTheme();

  const themeIcons = {
    dark: <Moon className="h-4 w-4 mr-2" />,
    light: <Sun className="h-4 w-4 mr-2" />,
    midnight: <Moon className="h-4 w-4 mr-2" />,
    forest: <Palette className="h-4 w-4 mr-2" />,
    ocean: <Palette className="h-4 w-4 mr-2" />,
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          {currentTheme === 'light' ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {Object.keys(themes).map((themeName) => (
          <DropdownMenuItem
            key={themeName}
            onClick={() => toggleTheme(themeName)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center">
              {themeIcons[themeName]}
              {themes[themeName].name}
            </div>
            {currentTheme === themeName && <Check className="h-4 w-4 ml-2" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ThemeSelector;