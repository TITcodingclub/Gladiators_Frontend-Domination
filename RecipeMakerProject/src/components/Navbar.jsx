import { useState, useEffect, useRef} from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaHome,
  FaUtensils,
  FaUsers,
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
  ];

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed w-full px-6 md:px-10 py-3 flex justify-between items-center z-50 transition-all duration-300
        ${scrolled ? 'backdrop-blur-xl bg-white/80 dark:bg-[#0f101a]/90 shadow-lg' : 'bg-transparent'}`}
    >
      {/* Background gradient - visible only when scrolled */}
      <div className={`absolute inset-0 bg-gradient-to-r from-green-400/5 to-[#FF742C]/5 transition-opacity duration-500 ${scrolled ? 'opacity-100' : 'opacity-0'}`}></div>
      
      {/* Top line gradient */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-green-400 via-[#22c55e] to-[#FF742C]"></div>
      
      {/* Logo */}
     <motion.div 
        className="w-[180px] h-[50px] relative z-10"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.98 }}
      >
        <Link to="/">
          <svg viewBox="0 0 300 60" width="100%" height="100%">
            <text
              id="nutrithy-logo"
              x="0"
              y="50"
              fontSize="60"
              fill="none"
              stroke="#22c55e"   // solid green stroke
              strokeWidth="2"
              strokeDasharray="1000"
              strokeDashoffset="1000"
            >
              Nutrithy 🍳
            </text>
            <animate
              xlinkHref="#nutrithy-logo"
              attributeName="stroke-dashoffset"
              from="1000"
              to="0"
              dur="3s"
              fill="freeze"
              begin="0.2s"
            />
          </svg>
        </Link>
      </motion.div>


      {/* Desktop Nav */}
      <div className="hidden md:block relative z-10">
        <ul className="flex gap-1">
          {navItems.map(({ name, icon, path }, index) => {
            const isActive = activeLink === path;
            return (
              <motion.li 
                key={name} 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <Link
                  to={path}
                  className={`relative px-10 py-2 mx-1 flex items-center gap-2 text-base font-medium rounded-2xl transition-all duration-300
                    ${isActive 
                      ? 'text-black font-bold italic bg-green-500 shadow-md'  // mono color background
                      : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100/80 dark:hover:bg-gray-800/30'}`}
                  onClick={() => setActiveLink(path)}
                >
                  <span className={`${isActive ? 'text-black font-bold' : 'text-green-500'} transition-colors duration-300`}>
                    {icon}
                  </span>
                  {name}
                </Link>

              </motion.li>
            );
          })}
        </ul>
      </div>

      {/* Mobile Menu Toggle - Enhanced with animation */}
    <div className="md:hidden relative z-10">
      <motion.button
        onClick={() => setMobileMenu(!mobileMenu)}
        className="text-2xl text-[#FF742C] focus:outline-none p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800/30 transition-all duration-300 relative z-50"
        aria-label="Toggle menu"
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          {mobileMenu ? (
            <motion.div
              key="close"
              initial={{ rotate: 0, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaTimes className="text-[#FF742C]" />
            </motion.div>
          ) : (
            <motion.div
              key="menu"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <FaBars className="text-[#FF742C]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </div>

      {/* User / Auth Section */}
      <div className="hidden md:block relative z-10">
        {user ? (
          <motion.div
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => navigate('/profile')}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {user.displayName?.split(' ')[0] || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">My Profile</p>
            </div>
            
            {user.photoURL ? (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-[#FF742C] blur-[1px] opacity-70 animate-pulse-slow"></div>
                <img
                  src={user.photoURL}
                  alt="Avatar"
                  className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 object-cover"
                />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-green-400 to-[#FF742C] blur-[1px] opacity-70 animate-pulse-slow"></div>
                <div className="relative w-10 h-10 rounded-full border-2 border-white dark:border-gray-800 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <FaUserCircle className="w-6 h-6 text-[#FF742C]" />
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.button
            onClick={login}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-[#FF742C] text-white rounded-full font-medium shadow-md shadow-orange-500/10 hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <FcGoogle className="text-lg" />
            Sign in
          </motion.button>
        )}
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
                        onClick={() => {
                          setMobileMenu(false);
                          setActiveLink(path);
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
