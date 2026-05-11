import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Heart, Map as MapIcon, LayoutDashboard, Users, Info, List, PlusCircle, Moon, Sun, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png';
import { useLanguage } from '../lib/LanguageContext';

const Layout = ({ children, darkMode, toggleDarkMode }) => {
  const location = useLocation();
  const { lang, toggleLanguage, t } = useLanguage();
  
  const navItems = [
    { path: '/feed', icon: List, label: t('nav.feed') },
    { path: '/map', icon: MapIcon, label: t('nav.map') },
    { path: '/donate', icon: PlusCircle, label: t('nav.donate'), primary: true },
    { path: '/dashboard', icon: LayoutDashboard, label: t('nav.impact') },
    { path: '/community', icon: Users, label: t('nav.community') },
    { path: '/chat', icon: MessageSquare, label: t('nav.chat') },
  ];

  const isHome = location.pathname === '/';

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300">
      {/* Navbar */}
      <header className={`fixed w-full top-0 z-50 transition-all duration-300 ${
        isHome ? 'bg-black/10 backdrop-blur-md' : 'bg-white/80 dark:bg-black/60 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-white/10'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center group-hover:scale-110 transition-transform">
              <img src={logo} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <span className={`font-bold text-2xl tracking-tight ${isHome ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
              அன்பின் கரம்
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors ${
                  item.primary 
                    ? 'btn bg-primary text-white px-4 py-2 text-sm shadow-none rounded-lg' 
                    : (isHome 
                        ? 'text-white/80 hover:text-white' 
                        : 'text-gray-600 dark:text-gray-300 hover:text-primary dark:hover:text-white')
                } ${location.pathname === item.path && !item.primary ? 'text-primary font-semibold' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleLanguage}
              className={`px-3 py-1 text-xs font-bold rounded-full transition-colors border ${
                isHome ? 'text-white border-white/30 hover:bg-white/10' : 'text-gray-600 border-gray-300 hover:bg-gray-100 dark:text-gray-200 dark:border-white/20'
              }`}
            >
              {lang === 'ta' ? 'EN' : 'தமிழ்'}
            </button>
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full transition-colors ${
                isHome ? 'text-white/80 hover:bg-white/10' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/10'
              }`}
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      {/* Mobile Navigation (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-lg dark:bg-gray-900/95 border-t border-gray-200 dark:border-gray-800 z-50 px-2 pb-safe pt-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="flex justify-between items-center h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center w-full h-full gap-1.5 ${
                  isActive ? 'text-primary font-bold' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                <Icon className={`w-5 h-5 ${item.primary ? 'text-primary fill-primary/10' : ''} ${isActive && !item.primary ? 'stroke-[2.5px]' : ''}`} />
                <span className="text-[9px] leading-none font-medium tracking-tight">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer (Desktop visible only or scroll bottom) */}
      <footer className="bg-white dark:bg-gray-900 py-12 border-t border-gray-200 dark:border-gray-800 pb-24 md:pb-12 relative z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left md:flex md:justify-between items-center">
          <div>
            <h3 className="font-bold text-xl text-primary mb-2">அன்பின் கரம்</h3>
            <p className="text-gray-800 dark:text-gray-100 font-medium text-sm max-w-xs">
              Empowering communities to fight waste and hunger, together.
            </p>
          </div>
          <div className="mt-6 md:mt-0 text-gray-900 dark:text-gray-100 font-semibold text-sm flex gap-4 justify-center">
            <Link to="/about" className="hover:text-primary">About</Link>
            <a href="#" className="hover:text-primary">Terms</a>
            <a href="#" className="hover:text-primary">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
