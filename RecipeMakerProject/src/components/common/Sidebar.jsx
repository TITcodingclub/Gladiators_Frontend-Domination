import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useSidebar } from '../../hooks/useSidebar';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ChefHat, 
  Users, 
  Activity, 
  Calendar, 
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Bookmark,
  TrendingUp,
  Search,
  MessageCircle,
  Heart
} from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const {
    isCollapsed,
    isMobileOpen,
    isMobile,
    isHovering,
    sidebarWidth,
    toggleCollapsed,
    toggleMobile,
    closeMobile,
    handleMouseEnter,
    handleMouseLeave
  } = useSidebar();
  const [activeLink, setActiveLink] = useState('/');
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarRef = useRef(null);

  // Update active link when route changes
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Memoize navigation items to prevent unnecessary re-renders
  const navigationItems = useMemo(() => [
    {
      section: 'Main',
      items: [
        { name: 'Dashboard', icon: Home, path: '/', badge: null },
        { name: 'Recipes', icon: ChefHat, path: '/recipes', badge: null },
        { name: 'Community', icon: Users, path: '/community', badge: '12' },
        { name: 'Activity Feed', icon: Activity, path: '/activity', badge: null },
      ]
    },
    {
      section: 'Planning',
      items: [
        { name: 'Diet Planner', icon: Calendar, path: '/diet-planner', badge: null },
        { name: 'Analytics', icon: TrendingUp, path: '/analytics', badge: null },
        { name: 'Favorites', icon: Heart, path: '/favorites', badge: null },
        { name: 'Bookmarks', icon: Bookmark, path: '/bookmarks', badge: null },
      ]
    },
    {
      section: 'Social',
      items: [
        { name: 'Messages', icon: MessageCircle, path: '/messages', badge: '3' },
        { name: 'Notifications', icon: Bell, path: '/notifications', badge: '5' },
        { name: 'Search', icon: Search, path: '/search', badge: null },
      ]
    }
  ], []);

  const handleNavigation = useCallback((path) => {
    setActiveLink(path);
    navigate(path);
    closeMobile();
  }, [navigate, closeMobile]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle keyboard shortcuts when sidebar is focused or no input is focused
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      // Alt + Number keys for quick navigation
      if (e.altKey && !e.ctrlKey && !e.shiftKey) {
        const keyNumber = parseInt(e.key);
        if (keyNumber >= 1 && keyNumber <= 9) {
          e.preventDefault();
          const allItems = navigationItems.flatMap(section => section.items);
          const targetItem = allItems[keyNumber - 1];
          if (targetItem) {
            handleNavigation(targetItem.path);
          }
        }
      }

      // Ctrl + M to toggle sidebar collapse
      if (e.ctrlKey && e.key === 'm' && !e.altKey && !e.shiftKey) {
        e.preventDefault();
        toggleCollapsed();
      }

      // Escape to close mobile sidebar
      if (e.key === 'Escape' && isMobileOpen) {
        e.preventDefault();
        closeMobile();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigationItems, handleNavigation, toggleCollapsed, isMobileOpen, closeMobile]);

  // Handle click outside to close mobile sidebar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        closeMobile();
      }
    };

    if (isMobileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
    };
  }, [isMobileOpen, closeMobile]);


  const handleLogout = useCallback(() => {
    logout();
    closeMobile();
  }, [logout, closeMobile]);

  const sidebarVariants = useMemo(() => ({
    expanded: { width: 280 },
    collapsed: { width: 80 },
    hovering: { width: 280 }
  }), []);

  const tooltipVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -10 },
    visible: { opacity: 1, scale: 1, x: 0 }
  };

  const pulseVariants = {
    idle: { scale: 1 },
    pulse: { 
      scale: [1, 1.05, 1],
      transition: { duration: 0.6, repeat: Infinity }
    }
  };

  const shimmerVariants = {
    initial: { x: '-100%' },
    animate: { 
      x: '100%',
      transition: { duration: 1.5, repeat: Infinity, ease: 'linear' }
    }
  };

  const mobileSidebarVariants = useMemo(() => ({
    open: { x: 0, opacity: 1 },
    closed: { x: -280, opacity: 0 }
  }), []);

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        ref={sidebarRef}
        initial="expanded"
        animate={isCollapsed && !isHovering ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex fixed left-0 top-0 h-screen bg-gradient-to-b from-gray-900/98 via-gray-900/95 to-gray-900/98 backdrop-blur-2xl border-r border-gradient-to-b border-emerald-500/20 shadow-2xl shadow-black/30 z-40 flex-col overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.95) 50%, rgba(17, 24, 39, 0.98) 100%)',
          borderRight: '1px solid rgba(16, 185, 129, 0.2)',
          boxShadow: '20px 0 40px -12px rgba(0, 0, 0, 0.3), inset -1px 0 0 rgba(16, 185, 129, 0.1)'
        }}
      >
        {/* Enhanced Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-gray-800/30">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-2 left-4 w-20 h-20 bg-emerald-500 rounded-full blur-3xl" />
            <div className="absolute bottom-2 right-4 w-16 h-16 bg-blue-500 rounded-full blur-2xl" />
          </div>
          {(!isCollapsed || isHovering) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex items-center gap-3 z-10"
            >
              <motion.div 
                className="relative w-10 h-10 bg-gradient-to-r from-emerald-500 via-blue-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              >
                <ChefHat className="w-6 h-6 text-white" />
                {/* Rotating glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-500 to-orange-500 blur-lg opacity-50 animate-pulse" />
              </motion.div>
              <div>
                <motion.h1 
                  className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-blue-300 to-orange-300 bg-clip-text text-transparent"
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  style={{
                    backgroundSize: '200% 200%'
                  }}
                >
                  Nutrithy
                </motion.h1>
                <p className="text-xs text-gray-400 font-medium tracking-wide">Nutrition Made Easy</p>
              </div>
            </motion.div>
          )}
          
          <motion.button
            onClick={toggleCollapsed}
            className="relative p-3 rounded-2xl bg-gradient-to-r from-gray-800/30 to-gray-700/30 hover:from-emerald-500/20 hover:to-blue-500/20 border border-gray-600/30 hover:border-emerald-500/50 transition-all duration-300 group overflow-hidden"
            whileHover={{ 
              scale: 1.1,
              rotate: isCollapsed ? 180 : 0,
              boxShadow: "0 10px 25px -5px rgba(16, 185, 129, 0.3)"
            }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Menu className="w-5 h-5 text-gray-300 group-hover:text-emerald-300 transition-colors duration-300 relative z-10" />
          </motion.button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-8 scrollbar-emerald-thin">
          {navigationItems.map((section, sectionIndex) => (
            <div key={section.section}>
              {(!isCollapsed || isHovering) && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: sectionIndex * 0.1 }}
                  className="relative mb-4 px-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-px bg-gradient-to-r from-emerald-500/50 to-transparent" />
                    <h3 className="text-xs font-bold text-gray-300 uppercase tracking-widest">
                      {section.section}
                    </h3>
                    <div className="flex-1 h-px bg-gradient-to-r from-gray-600/30 to-transparent" />
                  </div>
                </motion.div>
              )}
              
              <div className="space-y-1">
                {section.items.map((item, itemIndex) => {
                  const Icon = item.icon;
                  const isActive = activeLink === item.path;
                  
                  return (
                    <motion.div
                      key={item.name}
                      className="relative group"
                    >
                      <motion.button
                        onClick={() => handleNavigation(item.path)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: (sectionIndex * 0.1) + (itemIndex * 0.05),
                          type: 'spring',
                          stiffness: 100,
                          damping: 15
                        }}
                        className={`relative w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all duration-300 group overflow-hidden focus:outline-none focus:ring-2 focus:ring-emerald-400/50 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500/25 via-blue-500/20 to-orange-500/25 text-white border border-emerald-400/40 shadow-2xl shadow-emerald-500/20 transform scale-105'
                            : 'text-gray-400 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-700/60 hover:shadow-xl hover:border hover:border-gray-600/30 hover:scale-102 hover:transform'
                        }`}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={`Navigate to ${item.name}`}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleNavigation(item.path);
                          }
                        }}
                        whileHover={{ 
                          scale: 1.02, 
                          x: 2,
                          transition: { type: 'spring', stiffness: 300, damping: 20 }
                        }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <motion.div 
                          className={`flex-shrink-0 transition-colors duration-200 ${
                            isActive ? 'text-emerald-400' : 'group-hover:text-emerald-300'
                          }`}
                          variants={isActive ? pulseVariants : {}}
                          animate={isActive ? 'pulse' : 'idle'}
                        >
                          <Icon className="w-5 h-5" />
                        </motion.div>

                        {/* Active indicator effects */}
                        {isActive && (
                          <>
                            {/* Shimmer effect */}
                            <div className="absolute inset-0 overflow-hidden rounded-2xl">
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-300/10 via-blue-300/10 to-transparent"
                                variants={shimmerVariants}
                                initial="initial"
                                animate="animate"
                              />
                            </div>
                            {/* Glowing border */}
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/20 via-blue-400/20 to-orange-400/20 blur-sm" />
                            {/* Particle effect dots */}
                            <div className="absolute top-2 right-2 w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
                            <div className="absolute bottom-2 left-2 w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                          </>
                        )}

                        {/* Hover gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-blue-500/0 to-orange-500/0 group-hover:from-emerald-500/5 group-hover:via-blue-500/5 group-hover:to-orange-500/5 rounded-2xl transition-all duration-500" />
                        
                        {(!isCollapsed || isHovering) && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex-1 flex items-center justify-between min-w-0"
                          >
                            <span className="font-medium truncate">{item.name}</span>
                            {item.badge && (
                              <motion.span 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="bg-orange-500/20 text-orange-400 text-xs px-2 py-1 rounded-full font-medium border border-orange-500/30"
                              >
                                {item.badge}
                              </motion.span>
                            )}
                          </motion.div>
                        )}
                      </motion.button>
                      
                      {/* Tooltip for collapsed state (only show when not hovering) */}
                      {isCollapsed && !isHovering && (
                        <AnimatePresence>
                          <motion.div
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            variants={tooltipVariants}
                            className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg shadow-xl z-50 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap border border-gray-700"
                          >
                            {item.name}
                            {item.badge && (
                              <span className="ml-2 bg-orange-500/20 text-orange-400 text-xs px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                            <div className="absolute right-full top-1/2 -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-gray-800"></div>
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile Section */}
        {user && (
          <div className="p-4 border-t border-gray-800/50">
            {(!isCollapsed || isHovering) ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
              >
                {/* User Info */}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors cursor-pointer">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-10 h-10 rounded-full border-2 border-emerald-500/30 object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {user.displayName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-400 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    onClick={() => handleNavigation('/profile')}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </motion.button>
                  
                  <motion.button
                    onClick={() => handleNavigation('/settings')}
                    className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </motion.button>
                  
                  <motion.button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <LogOut className="w-4 h-4" />
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-2">
                <motion.button
                  onClick={() => handleNavigation('/profile')}
                  className="p-3 rounded-xl bg-gray-800/30 hover:bg-gray-700/50 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-gray-300" />
                  )}
                </motion.button>
                
                <motion.button
                  onClick={handleLogout}
                  className="p-3 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors flex items-center justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <LogOut className="w-5 h-5" />
                </motion.button>
              </div>
            )}
          </div>
        )}
      </motion.aside>

      {/* Mobile Overlay - Hidden since using MobileTopNav */}
      {false && (
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
              onClick={closeMobile}
            />

            {/* Enhanced Mobile Sidebar */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileSidebarVariants}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-80 bg-gradient-to-b from-gray-900/98 via-gray-800/96 to-gray-900/98 backdrop-blur-2xl shadow-2xl z-40 lg:hidden flex flex-col overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.98) 0%, rgba(31, 41, 55, 0.96) 30%, rgba(55, 65, 81, 0.94) 70%, rgba(17, 24, 39, 0.98) 100%)',
                borderRight: '1px solid rgba(16, 185, 129, 0.3)',
                boxShadow: '25px 0 50px -12px rgba(0, 0, 0, 0.5), inset -1px 0 0 rgba(16, 185, 129, 0.2)'
              }}
            >
              {/* Mobile decorative background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-20 left-10 w-32 h-32 bg-emerald-500 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-40 right-10 w-24 h-24 bg-blue-500 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-orange-500 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
              </div>
              {/* Enhanced Mobile Header */}
              <div className="relative flex items-center justify-between p-6 border-b border-gray-700/30">
                {/* Header gradient line */}
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
                <div className="relative flex items-center gap-4 z-10">
                  <motion.div 
                    className="relative w-12 h-12 bg-gradient-to-r from-emerald-400 via-blue-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/40"
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.8, ease: "easeInOut" }}
                  >
                    <ChefHat className="w-7 h-7 text-white" />
                    {/* Pulsing glow */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400 to-orange-500 blur-xl opacity-60 animate-pulse" />
                  </motion.div>
                  <div>
                    <motion.h1 
                      className="text-2xl font-bold bg-gradient-to-r from-emerald-300 via-blue-300 to-orange-300 bg-clip-text text-transparent"
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                      style={{
                        backgroundSize: '300% 300%'
                      }}
                    >
                      Nutrithy
                    </motion.h1>
                    <p className="text-sm text-gray-300 font-medium tracking-wide">Nutrition Made Easy</p>
                  </div>
                </div>
                
                <motion.button
                  onClick={closeMobile}
                  className="relative p-3 rounded-2xl bg-gradient-to-r from-red-500/20 to-orange-500/20 hover:from-red-500/30 hover:to-orange-500/30 border border-red-400/30 hover:border-red-400/50 transition-all duration-300 group overflow-hidden"
                  whileHover={{ 
                    scale: 1.1,
                    rotate: 90,
                    boxShadow: "0 10px 25px -5px rgba(239, 68, 68, 0.4)"
                  }}
                  whileTap={{ scale: 0.9, rotate: 180 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  {/* Close button shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  <X className="w-6 h-6 text-red-300 group-hover:text-red-200 transition-colors duration-300 relative z-10" />
                </motion.button>
              </div>

              {/* Enhanced Mobile Navigation */}
              <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
                {navigationItems.map((section, sectionIndex) => (
                  <motion.div
                    key={section.section}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: sectionIndex * 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-px bg-gradient-to-r from-emerald-400/60 to-transparent" />
                      <h3 className="text-sm font-bold text-gray-200 uppercase tracking-widest">
                        {section.section}
                      </h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-500/30 to-transparent" />
                    </div>
                    
                    <div className="space-y-1">
                      {section.items.map((item, itemIndex) => {
                        const Icon = item.icon;
                        const isActive = activeLink === item.path;
                        
                        return (
                          <motion.button
                            key={item.name}
                            onClick={() => handleNavigation(item.path)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: (sectionIndex * 0.1) + (itemIndex * 0.05) }}
                            className={`relative w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group overflow-hidden ${
                              isActive
                                ? 'bg-gradient-to-r from-emerald-500/30 via-blue-500/25 to-orange-500/30 text-white border border-emerald-400/50 shadow-2xl shadow-emerald-500/25 transform scale-105'
                                : 'text-gray-300 hover:text-white hover:bg-gradient-to-r hover:from-gray-800/70 hover:to-gray-700/70 hover:shadow-xl hover:border hover:border-gray-500/40 hover:scale-102 hover:transform'
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            {/* Mobile active effects */}
                            {isActive && (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-blue-400/10 to-orange-400/10 rounded-2xl blur-sm" />
                                <div className="absolute top-3 right-3 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.7s' }} />
                              </>
                            )}
                            
                            <motion.div 
                              className={`flex-shrink-0 transition-colors duration-300 relative z-10 ${
                                isActive ? 'text-emerald-300' : 'group-hover:text-emerald-400'
                              }`}
                              whileHover={{ scale: 1.1, rotate: 5 }}
                              transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            >
                              <Icon className="w-6 h-6" />
                            </motion.div>
                            <div className="flex-1 flex items-center justify-between min-w-0 relative z-10">
                              <span className={`font-semibold text-base truncate transition-all duration-300 ${
                                isActive ? 'text-white' : 'group-hover:text-white'
                              }`}>
                                {item.name}
                              </span>
                              {item.badge && (
                                <motion.span 
                                  className="bg-gradient-to-r from-orange-500/30 to-red-500/30 text-orange-300 text-sm px-3 py-1.5 rounded-full font-bold border border-orange-400/30 shadow-lg"
                                  whileHover={{ scale: 1.1 }}
                                  animate={{
                                    boxShadow: ['0 0 0 0 rgba(251, 146, 60, 0.4)', '0 0 0 8px rgba(251, 146, 60, 0)', '0 0 0 0 rgba(251, 146, 60, 0)']
                                  }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                >
                                  {item.badge}
                                </motion.span>
                              )}
                            </div>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Mobile User Section */}
              {user && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-4 border-t border-gray-800/50 space-y-3"
                >
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-800/30">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full border-2 border-emerald-500/30 object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {user.displayName || 'User'}
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        {user.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <motion.button
                      onClick={() => handleNavigation('/profile')}
                      className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <User className="w-4 h-4" />
                      Profile
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleNavigation('/settings')}
                      className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-colors text-sm"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </motion.button>
                    
                    <motion.button
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 hover:text-red-300 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <LogOut className="w-4 h-4" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      )}
    </>
  );
}
