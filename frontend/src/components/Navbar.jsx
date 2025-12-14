import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Github, Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  return (
   <nav className="w-full py-4 px-6 flex justify-between items-center bg-white/70 dark:bg-gray-950/80 backdrop-blur-lg sticky top-0 z-50 border-b border-gray-200 dark:border-gray-800 transition-colors duration-300">
      {/* LOGO */}
      <Link to="/" className="flex items-center gap-2 group">
        <div className="bg-brand-50 dark:bg-brand-900/30 p-2 rounded-lg group-hover:bg-brand-100 dark:group-hover:bg-brand-900/50 transition-colors">
          <ShieldCheck className="text-brand-600 dark:text-brand-400 w-6 h-6" />
        </div>
        <span className="font-bold text-xl text-brand-900 dark:text-white tracking-tight">
          Allergy<span className="text-brand-600 dark:text-brand-400">Sentinel</span>
        </span>
      </Link>

      {/* LINKS & ACTIONS */}
      <div className="flex items-center gap-6">
        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-6 font-medium text-gray-600 dark:text-gray-300">
          <Link to="/profile" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Profile</Link>
           {/* NEW LINK */}
          <Link to="/history" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            Scan History
          </Link>
          {/* -------- */}
          <a href="https://github.com/CloudyPatil" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-gray-900 dark:hover:text-white">
            <Github className="w-4 h-4" /> Source
          </a>

          <a href="https://www.linkedin.com/in/harshal-patil-77538a355/" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Contact</a>
        </div>

        {/* Divider */}
        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 hidden md:block"></div>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle Dark Mode"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>

        {/* CTA BUTTON */}
        <Link 
          to="/scan" 
          className="bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-lg shadow-brand-500/30 hover:bg-brand-700 hover:shadow-brand-500/50 hover:-translate-y-0.5 transition-all duration-300"
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;