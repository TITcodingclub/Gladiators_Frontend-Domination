import { useState, useEffect, useRef} from 'react';
import { useAuth } from '../../hooks/useAuth';
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaHome,
  FaUtensils,
  FaUsers,
  FaCalendarAlt,
  FaChartLine,
} from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { user, login } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeLink, setActiveLink] = useState("/");
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  // Update active link when route changes
  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location]);

  // Lock scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenu ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenu]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMobileMenu(false);
      }
    };
    if (mobileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenu]);

  const navItems = [
    { name: 'Home', icon: <FaHome className="inline" />, path: '/' },
    { name: 'Recipes', icon: <FaUtensils className="inline" />, path: '/recipes' },
    { name: 'Community', icon: <FaUsers className="inline" />, path: '/community' },
    { name: 'Activity', icon: <FaChartLine className="inline" />, path: '/activity' },
    { name: 'Diet Planner', icon: <FaCalendarAlt className="inline" />, path: '/diet-planner' },
  ];

  // Handle navigation with proper state management
  const handleNavigation = (path) => {
    try {
      setActiveLink(path);
      navigate(path, { replace: false });
      setMobileMenu(false);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct navigation
      window.location.href = path;
    }
  };

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed w-full px-6 md:px-8 lg:px-10 py-4 flex justify-between items-center z-50 transition-all duration-500
        ${scrolled 
          ? 'backdrop-blur-2xl bg-gray-900/70 shadow-2xl border-b border-emerald-500/20' 
          : 'backdrop-blur-xl bg-gray-900/30 border-b border-white/5'}`}
      style={{
        background: scrolled 
          ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.8), rgba(30, 41, 59, 0.9))' 
          : 'linear-gradient(135deg, rgba(15, 23, 42, 0.4), rgba(30, 41, 59, 0.6))',
        boxShadow: scrolled 
          ? '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Animated gradient border */}
      <motion.div 
        className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
        }}
        transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
        style={{ backgroundSize: '200% 200%' }}
      />
      
      {/* Professional Logo */}
      <motion.div 
        className="relative z-10 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <Link to="/" className="flex items-center gap-3">
          {/* Logo Icon with glassmorphism */}
          <motion.div 
            className="relative w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/30 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center group-hover:border-emerald-400/50 transition-all duration-300"
            whileHover={{ rotate: [0, -5, 5, 0] }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-2xl filter drop-shadow-lg">🍳</span>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
          </motion.div>
          
          {/* Logo Text */}
          <motion.div className="flex flex-col">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent tracking-tight"
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
              style={{ backgroundSize: '200% 200%' }}
            >
              Nutrithy
            </motion.h1>
            <motion.span 
              className="text-xs text-emerald-300/70 font-medium -mt-1"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Smart Nutrition
            </motion.span>
          </motion.div>
        </Link>
      </motion.div>


      {/* Professional Desktop Navigation */}
      <div className="hidden md:block relative z-10">
        <motion.nav 
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {navItems.map(({ name, icon, path }, index) => {
            const isActive = activeLink === path;
            return (
              <motion.div 
                key={name}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index + 0.5, duration: 0.4, type: 'spring', stiffness: 100 }}
                whileHover={{ y: -2 }}
                className="relative group"
              >
                <Link
                  to={path}
                  className={`relative px-6 py-3 flex items-center gap-3 text-sm font-medium rounded-2xl transition-all duration-300 overflow-hidden
                    ${isActive 
                      ? 'text-white bg-gradient-to-r from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25' 
                      : 'text-gray-300 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-emerald-400/30'}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation(path);
                  }}
                >
                  {/* Active background gradient */}
                  {isActive && (
                    <motion.div 
                      className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-emerald-600/20"
                      layoutId="activeNavBackground"
                      transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                    />
                  )}
                  
                  {/* Hover glow effect */}
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    animate={{ scale: isActive ? 1 : 0.8 }}
                  />
                  
                  {/* Icon with enhanced styling */}
                  <motion.span 
                    className={`relative z-10 transition-all duration-300 ${
                      isActive 
                        ? 'text-white drop-shadow-lg' 
                        : 'text-emerald-400 group-hover:text-emerald-300'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: 'spring', stiffness: 400 }}
                  >
                    {icon}
                  </motion.span>
                  
                  {/* Text with improved typography */}
                  <span className={`relative z-10 transition-all duration-300 whitespace-nowrap ${
                    isActive 
                      ? 'font-semibold text-white drop-shadow-sm' 
                      : 'font-medium group-hover:font-semibold'
                  }`}>
                    {name}
                  </span>
                  
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      className="absolute bottom-0 left-1/2 w-8 h-[2px] bg-white/80 rounded-full"
                      initial={{ scale: 0, x: '-50%' }}
                      animate={{ scale: 1, x: '-50%' }}
                      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
                    />
                  )}
                </Link>
              </motion.div>
            );
          })}
        </motion.nav>
      </div>

      {/* Professional Mobile Menu Toggle */}
      <div className="md:hidden relative z-10">
        <motion.button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="group relative p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-400/30 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
          aria-label="Toggle menu"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {/* Glow effect */}
          <motion.div 
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          />
          
          <AnimatePresence mode="wait">
            {mobileMenu ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                className="relative z-10"
              >
                <FaTimes className="text-lg text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
              </motion.div>
            ) : (
              <motion.div
                key="menu"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
                className="relative z-10"
              >
                <FaBars className="text-lg text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.button>
      </div>

      {/* Professional User Profile Section */}
      <div className="hidden md:block relative z-10">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {user ? (
            <motion.div
              className="group flex items-center gap-4 p-3 rounded-2xl backdrop-blur-md bg-white/5 border border-white/10 hover:border-emerald-400/30 transition-all duration-300 cursor-pointer"
              onClick={() => navigate('/profile')}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* User Info */}
              <div className="text-right">
                <motion.p 
                  className="text-sm font-semibold text-white group-hover:text-emerald-200 transition-colors duration-300"
                  initial={{ opacity: 0.8 }}
                  whileHover={{ opacity: 1 }}
                >
                  {user.displayName?.split(' ')[0] || 'User'}
                </motion.p>
                <p className="text-xs text-emerald-300/70 font-medium">My Profile</p>
              </div>
              
              {/* Enhanced Avatar */}
              <motion.div 
                className="relative"
                whileHover={{ rotate: 5 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                {/* Animated glow ring */}
                <motion.div 
                  className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/40 to-emerald-600/60 blur-sm"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                />
                
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="relative w-11 h-11 rounded-full border-2 border-white/40 object-cover shadow-lg backdrop-blur-sm"
                  />
                ) : (
                  <div className="relative w-11 h-11 rounded-full border-2 border-white/40 bg-gradient-to-br from-emerald-400/20 to-emerald-600/30 backdrop-blur-md flex items-center justify-center">
                    <FaUserCircle className="w-6 h-6 text-emerald-300" />
                  </div>
                )}
                
                {/* Online status indicator */}
                <motion.div
                  className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-gray-900 shadow-lg"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="w-full h-full rounded-full bg-white/20 animate-ping" />
                </motion.div>
              </motion.div>
              
              {/* Hover glow effect */}
              <motion.div 
                className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
            </motion.div>
          ) : (
            <motion.button
              onClick={login}
              className="group relative flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-2xl font-semibold shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 transition-all duration-300 overflow-hidden"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Button glow effect */}
              <motion.div 
                className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              />
              
              <FcGoogle className="text-xl relative z-10" />
              <span className="relative z-10 whitespace-nowrap">Sign in</span>
              
              {/* Animated shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 opacity-0 group-hover:opacity-100"
                animate={{
                  x: ['-100%', '100%']
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatDelay: 3
                }}
              />
            </motion.button>
          )}
        </motion.div>
      </div>

      {/* Mobile Drawer - Enhanced with framer-motion animations */}
      <AnimatePresence>
        {mobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed min-h-screen inset-0 bg-black/80 backdrop-blur-md z-40 md:hidden"
              onClick={() => setMobileMenu(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              className="fixed top-0 right-0 min-h-screen w-[80%] max-w-sm z-50 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 px-6 py-6 shadow-2xl md:hidden overflow-y-auto"
              initial={{ x: '100%', opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '100%', opacity: 0.5 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            >
              {/* Top bar: Logo + Close Button */}
              <div className="flex items-center justify-between mb-8">
                <Link to="/" onClick={() => setMobileMenu(false)}>
                  <div className="w-[150px] h-[40px]">
                    <svg viewBox="0 0 300 60" width="100%" height="100%">
                      <text x="0" y="45" fontSize="50" fill="none" stroke="#22c55e" strokeWidth="2">Nutrithy</text>
                      <text x="190" y="50" fontSize="50">🍳</text>
                    </svg>
                  </div>
                </Link>
      
                <motion.button
                  onClick={() => setMobileMenu(false)}
                  className="text-2xl text-[#FF742C] p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all duration-300"
                  whileTap={{ scale: 0.9 }}
                >
                  <FaTimes />
                </motion.button>
              </div>
      
              {/* Mobile Nav Items */}
              <div className="space-y-2">
                {navItems.map(({ name, icon, path }, i) => {
                  const isActive = activeLink === path;
                  return (
                    <motion.div
                      key={name}
                      initial={{ x: 50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                    >
                      <Link
                        to={path}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(path);
                        }}
                        className={`flex items-center text-base font-medium p-3 rounded-2xl transition-all duration-300 ${
                          isActive 
                            ? 'text-black font-bold italic bg-green-500 shadow-md'  // mono color background
                            : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/30'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${
                          isActive 
                            ? 'bg-black text-white' 
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
                        }`}>
                          <span className="text-lg">{icon}</span>
                        </div>
                        {name}
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
      
              {/* Profile / Auth Section */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                {user ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                    <div className="flex items-center mb-4">
                      {user.photoURL ? (
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-black/50 blur-[1px] opacity-70 animate-pulse-slow"></div>
                          <img
                            src={user.photoURL}
                            alt={user.displayName}
                            className="relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-[#FF742C] blur-[1px] opacity-70 animate-pulse-slow"></div>
                          <div className="relative w-12 h-12 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <FaUserCircle className="w-7 h-7 text-[#FF742C]" />
                          </div>
                        </div>
                      )}
                      <div className="ml-3">
                        <p className="text-gray-800 dark:text-white font-medium">{user.displayName || 'User'}</p>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">{user.email}</p>
                      </div>
                    </div>
                    <motion.button
                      onClick={() => {
                        navigate('/profile');
                        setMobileMenu(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-black/90 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <FaUserCircle />
                      View Profile
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.button
                    onClick={() => {
                      login();
                      setMobileMenu(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-green-500 to-[#FF742C] text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20 mt-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <FcGoogle className="text-xl" />
                    Sign in with Google
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
