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

  // Simplified navigation items
  const navigationItems = useMemo(() => [
    { name: 'Dashboard', icon: Home, path: '/' },
    { name: 'Recipes', icon: ChefHat, path: '/recipes' },
    { name: 'Community', icon: Users, path: '/community' },
    { name: 'Calls', icon: MessageCircle, path: '/calls' },
    { name: 'Activity', icon: Activity, path: '/activity' },
    { name: 'Diet Planner', icon: Calendar, path: '/diet-planner' },
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
      {/* Modern Simplified Sidebar */}
      <motion.aside
        ref={sidebarRef}
        initial="expanded"
        animate={isCollapsed && !isHovering ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden lg:flex fixed left-0 top-0 h-screen z-40 flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-lg"
      >
        {/* Modern Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          {(!isCollapsed || isHovering) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3"
            >
              <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Nutrithy</h1>
              </div>
            </motion.div>
          )}
          
          {/* Collapsed state logo */}
          {(isCollapsed && !isHovering) && (
            <div className="flex justify-center">
              <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
            </div>
          )}
        </div>

        {/* Modern Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeLink === item.path;
            
            return (
              <motion.div key={item.name} className="relative group">
                <motion.button
                  onClick={() => handleNavigation(item.path)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  
                  {(!isCollapsed || isHovering) && (
                    <span className="font-medium text-sm truncate">{item.name}</span>
                  )}
                </motion.button>
                
                {/* Tooltip for collapsed state */}
                {isCollapsed && !isHovering && (
                  <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-sm rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </motion.div>
            );
          })}
        </nav>

        {/* Modern User Profile Section */}
        {user && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            {(!isCollapsed || isHovering) ? (
              <div className="space-y-3">
                {/* User Info */}
                <div 
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                  onClick={() => handleNavigation('/profile')}
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {user.displayName?.split(' ')[0] || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      My Profile
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => handleNavigation('/profile')}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex items-center justify-center"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-medium">
                        {user.displayName?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                </button>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors flex items-center justify-center"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </motion.aside>

      {/* Modern Mobile Sidebar */}
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

            {/* Mobile Sidebar */}
            <motion.aside
              initial="closed"
              animate="open"
              exit="closed"
              variants={mobileSidebarVariants}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 h-screen w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 shadow-xl z-40 lg:hidden flex flex-col"
            >
              {/* Mobile Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <img src="/vite.svg" alt="Logo" className="w-8 h-8" />
                  <div>
                    <h1 className="text-lg font-semibold text-gray-900 dark:text-white">Nutrithy</h1>
                  </div>
                </div>
                
                <button
                  onClick={closeMobile}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {navigationItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = activeLink === item.path;
                  
                  return (
                    <motion.div key={item.name} className="relative group">
                      <motion.button
                        onClick={() => handleNavigation(item.path)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 ${
                          isActive
                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
                        }`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-sm truncate">{item.name}</span>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile User Profile */}
              {user && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="space-y-3">
                    {/* User Info */}
                    <div 
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                      onClick={() => handleNavigation('/profile')}
                    >
                      {user.photoURL ? (
                        <img
                          src={user.photoURL}
                          alt={user.displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.displayName?.charAt(0) || 'U'}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {user.displayName?.split(' ')[0] || 'User'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          My Profile
                        </p>
                      </div>
                    </div>

                    {/* Logout Button */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 p-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </div>
                </div>
              )}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
