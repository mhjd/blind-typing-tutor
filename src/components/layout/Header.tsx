"use client";

import React from "react";
import {
  Keyboard as KeyboardIcon,
  Moon,
  Sun,
} from "lucide-react";

interface HeaderProps {
  title: string;
  lightMode: string;
  darkMode: string;
  isDarkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  lightMode,
  darkMode: darkModeLabel,
  isDarkMode,
  setDarkMode,
}) => {
  return (
    <>
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-sm px-6 py-4 flex justify-between items-center fixed w-full top-0 z-50 transition-colors duration-300">
        <div className="flex items-center gap-4">
          <h1
            data-testid="app-title"
            className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap transition-colors flex items-center gap-2 font-mono"
          >
            <KeyboardIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            {title}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            data-testid="theme-toggle-button"
            onClick={() => setDarkMode(!isDarkMode)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-gray-900 dark:text-white transition-colors"
            title={isDarkMode ? lightMode : darkModeLabel}
            aria-label={isDarkMode ? lightMode : darkModeLabel}
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

    </>
  );
};
