import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  X, 
  ChefHat,
  Bell,
  Search,
  User,
  Home,
  Activity,
  Users,
  Calendar,
  TrendingUp,
  Heart,
  Bookmark,
  MessageCircle,
  Settings,
  LogOut,
  Sparkles,
  Zap,
  Globe,
  Shield,
  Crown,
  Star
} from 'lucide-react';

export default function MobileTopNav() {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Handle scroll effect for nav bar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Lock body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  const navigationItems = [
    { 
      name: 'Dashboard', 
      icon: Home, 
      path: '/', 
      badge: null, 
      gradient: 'from-violet-400 via-purple-500 to-indigo-600',
      glow: 'shadow-violet-500/50',
      description: 'Your nutrition hub',
      accent: Crown
    },
    { 
      name: 'Recipes', 
      icon: ChefHat, 
      path: '/recipes', 
      badge: null, 
      gradient: 'from-orange-400 via-red-500 to-pink-600',
      glow: 'shadow-orange-500/50',
      description: 'Discover & create',
      accent: Sparkles
    },
    { 
      name: 'Community', 
      icon: Users, 
      path: '/community', 
      badge: null, 
      gradient: 'from-cyan-400 via-blue-500 to-indigo-600',
      glow: 'shadow-cyan-500/50',
      description: 'Connect with others',
      accent: Globe
    },
    { 
      name: 'Activity', 
      icon: Activity, 
      path: '/activity', 
      badge: null, 
      gradient: 'from-emerald-400 via-green-500 to-teal-600',
      glow: 'shadow-emerald-500/50',
      description: 'Track your progress',
      accent: Zap
    },
    { 
      name: 'Diet Planner', 
      icon: Calendar, 
      path: '/diet-planner', 
      badge: null, 
      gradient: 'from-indigo-400 via-purple-500 to-violet-600',
      glow: 'shadow-indigo-500/50',
      description: 'Plan your meals',
      accent: Shield
    }
  ];

  const handleNavigation = (path) => {
    try {
      navigate(path, { replace: false });
      setIsMenuOpen(false);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to direct navigation
      window.location.href = path;
      setIsMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  if (!user) return null;

  return (
    <>
      {/* Professional Mobile Top Navigation Bar */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`lg:hidden fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || isMenuOpen
            ? 'backdrop-blur-2xl bg-gray-900/80 shadow-2xl border-b border-emerald-500/20'
            : 'backdrop-blur-xl bg-gray-900/40 border-b border-white/10'
        }`}
        style={{
          background: scrolled || isMenuOpen 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9))' 
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.5), rgba(30, 41, 59, 0.6))',
          boxShadow: scrolled || isMenuOpen 
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
        
        <div className="relative flex items-center justify-between px-6 py-4">
          {/* Professional Menu Button */}
          <motion.button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="group relative p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-400/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Toggle menu"
          >
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            <motion.div
              animate={{ 
                rotate: isMenuOpen ? 180 : 0
              }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 200 }}
              className="relative z-10"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
              ) : (
                <Menu className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
              )}
            </motion.div>
          </motion.button>

          {/* Professional Logo */}
          <motion.div
            className="group flex items-center gap-3 cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavigation('/')}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Logo Icon */}
            <motion.div
              className="relative w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-400/20 to-emerald-600/30 backdrop-blur-md border border-emerald-400/30 flex items-center justify-center group-hover:border-emerald-400/50 transition-all duration-300"
              whileHover={{ rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xl filter drop-shadow-lg">🍳</span>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/10 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse" />
            </motion.div>
            
            {/* Logo Text */}
            <motion.div className="flex flex-col">
              <motion.h1 
                className="text-xl font-bold bg-gradient-to-r from-white via-emerald-200 to-emerald-400 bg-clip-text text-transparent tracking-tight"
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                style={{ backgroundSize: '200% 200%' }}
              >
                Nutrithy
              </motion.h1>
              <motion.span 
                className="text-xs text-emerald-300/70 font-medium -mt-0.5"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                Smart Nutrition
              </motion.span>
            </motion.div>
          </motion.div>

          {/* Professional User Profile Button */}
          <motion.button
            onClick={() => handleNavigation('/profile')}
            className="group relative p-3 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 hover:border-emerald-400/30 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/10 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            />
            
            <div className="relative z-10">
              {user.photoURL ? (
                <div className="relative">
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-8 h-8 rounded-xl object-cover border-2 border-white/40 shadow-lg group-hover:border-emerald-400/60 transition-all duration-300"
                  />
                  {/* Online status indicator */}
                  <motion.div 
                    className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full border-2 border-gray-900 shadow-lg"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="w-full h-full rounded-full bg-white/20 animate-ping" />
                  </motion.div>
                </div>
              ) : (
                <div className="relative">
                  <User className="w-8 h-8 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300" />
                </div>
              )}
            </div>
          </motion.button>
        </div>
      </motion.header>

      {/* Futuristic Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Enhanced Backdrop with Particles */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40"
              onClick={() => setIsMenuOpen(false)}
              style={{
                background: 'radial-gradient(circle at 30% 20%, rgba(120, 119, 198, 0.3) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at 80% 80%, rgba(120, 119, 198, 0.2) 0%, rgba(255, 255, 255, 0) 50%), radial-gradient(circle at 40% 40%, rgba(17, 24, 39, 0.8) 0%, rgba(0, 0, 0, 0.6) 100%)',
                backdropFilter: 'blur(12px) saturate(180%)'
              }}
            >
              {/* Floating particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-white/30 rounded-full"
                    style={{
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.3, 1, 0.3],
                      scale: [1, 1.5, 1]
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2
                    }}
                  />
                ))}
              </div>
            </motion.div>

            {/* Professional Mobile Menu Panel */}
            <motion.div
              initial={{ x: '-100%', opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0 }}
              transition={{ 
                type: "spring", 
                damping: 25, 
                stiffness: 300,
                opacity: { duration: 0.3 }
              }}
              className="lg:hidden fixed left-0 top-16 bottom-0 w-80 z-50 overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%)',
                backdropFilter: 'blur(20px) saturate(180%)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
              }}
            >
              
              {/* Professional Menu Content */}
              <div className="relative h-full overflow-y-auto p-6 space-y-6 scrollbar-hidden">
                {/* Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="text-center pb-6 border-b border-emerald-500/20"
                >
                  <h2 className="text-lg font-semibold bg-gradient-to-r from-white to-emerald-200 bg-clip-text text-transparent mb-2">Navigation</h2>
                  <p className="text-sm text-emerald-300/70">Quick access to all features</p>
                </motion.div>
                
                {/* Professional Navigation Items */}
                <div className="space-y-3">
                  {navigationItems.map((item, index) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <motion.button
                        key={item.name}
                        onClick={() => handleNavigation(item.path)}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ 
                          delay: index * 0.1,
                          duration: 0.4,
                          type: 'spring',
                          stiffness: 120
                        }}
                        className="w-full group relative"
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className={`relative p-4 rounded-2xl backdrop-blur-md border transition-all duration-300 flex items-center gap-4 ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 border-emerald-400/50 shadow-lg shadow-emerald-500/25'
                            : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-emerald-400/30'
                        }`}>
                          {/* Icon */}
                          <div className={`p-3 rounded-xl transition-all duration-300 ${
                            isActive 
                              ? 'bg-white/20 text-white' 
                              : 'bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500/30'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          
                          {/* Content */}
                          <div className="flex-1 text-left">
                            <h3 className={`font-semibold text-base transition-colors duration-300 ${
                              isActive 
                                ? 'text-white' 
                                : 'text-white group-hover:text-emerald-200'
                            }`}>
                              {item.name}
                            </h3>
                            <p className={`text-sm transition-colors duration-300 ${
                              isActive 
                                ? 'text-white/80' 
                                : 'text-emerald-300/70 group-hover:text-emerald-300'
                            }`}>
                              {item.description}
                            </p>
                          </div>
                          
                          {/* Active indicator */}
                          {isActive && (
                            <motion.div
                              className="absolute right-4 w-2 h-2 bg-white rounded-full shadow-lg"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200 }}
                            />
                          )}
                          
                          {/* Hover glow effect */}
                          <motion.div 
                            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-emerald-400/5 to-emerald-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          />
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Holographic Divider */}
                <motion.div
                  initial={{ opacity: 0, scaleX: 0 }}
                  animate={{ opacity: 1, scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="relative my-8 mx-4"
                >
                  <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                  <motion.div
                    className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/80 to-transparent"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                  {/* Glowing center dot */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-pulse" />
                </motion.div>

                {/* Futuristic User Section */}
                <motion.div
                  initial={{ opacity: 0, y: 30, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: 0.9, duration: 0.6, type: 'spring' }}
                  className="space-y-4"
                >
                  {/* User Profile Card */}
                  <motion.div
                    className="relative group"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.3 }}
                  >
                    {/* Holographic background */}
                    <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-pink-500/20 blur-lg group-hover:blur-none transition-all duration-500" />
                    
                    <div className="relative p-5 rounded-3xl bg-white/5 backdrop-blur-md border border-white/20 group-hover:border-white/30 transition-all duration-500">
                      <div className="flex items-center gap-4">
                        {/* Avatar with holographic ring */}
                        <motion.div
                          className="relative"
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          transition={{ duration: 0.3 }}
                        >
                          {/* Rotating holographic ring */}
                          <motion.div
                            className="absolute inset-0 w-16 h-16 rounded-2xl bg-gradient-to-r from-cyan-400/40 via-purple-500/40 to-pink-500/40 blur-sm"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                          />
                          
                          {user.photoURL ? (
                            <img
                              src={user.photoURL}
                              alt={user.displayName}
                              className="relative w-14 h-14 rounded-2xl object-cover border-2 border-white/40 shadow-[0_0_15px_rgba(255,255,255,0.3)] hover:shadow-[0_0_25px_rgba(255,255,255,0.5)] transition-all duration-300"
                            />
                          ) : (
                            <div className="relative w-14 h-14 bg-gradient-to-br from-purple-600/30 to-cyan-600/30 rounded-2xl flex items-center justify-center border-2 border-white/40 backdrop-blur-md">
                              <User className="w-8 h-8 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                            </div>
                          )}
                          
                          {/* Online status with neon glow */}
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full border-2 border-black/50 shadow-[0_0_12px_rgba(34,197,94,0.8)]">
                            <div className="w-full h-full rounded-full bg-white/20 animate-ping" />
                          </div>
                        </motion.div>
                        
                        {/* User info with neon text */}
                        <div className="flex-1">
                          <motion.h3 
                            className="font-bold text-lg bg-gradient-to-r from-white to-cyan-200 bg-clip-text text-transparent mb-1"
                            animate={{
                              backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
                            }}
                            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                            style={{ backgroundSize: '200% 200%' }}
                          >
                            {user.displayName?.split(' ')[0] || 'User'}
                          </motion.h3>
                          <p className="text-white/70 text-sm truncate font-medium">
                            {user.email}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="w-2 h-2 bg-green-400 rounded-full shadow-[0_0_6px_rgba(34,197,94,0.8)] animate-pulse" />
                            <span className="text-xs text-green-300/80 font-medium">Active Now</span>
                          </div>
                        </div>
                        
                        {/* Crown icon for premium users */}
                        <motion.div
                          animate={{ rotate: [0, 10, -10, 0] }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                        >
                          <Crown className="w-6 h-6 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]" />
                        </motion.div>
                      </div>
                      
                      {/* Holographic scan line */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 rounded-3xl"
                        animate={{ x: ['-100%', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                      />
                    </div>
                  </motion.div>

                  {/* Futuristic Action Buttons */}
                  <div className="grid grid-cols-3 gap-3">
                    <motion.button
                      onClick={() => handleNavigation('/profile')}
                      className="relative group overflow-hidden"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Button glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-lg group-hover:blur-none transition-all duration-300" />
                      
                      <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 group-hover:border-cyan-400/50 transition-all duration-300">
                        <User className="w-5 h-5 text-white mx-auto mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" />
                        <span className="text-xs text-white/80 group-hover:text-cyan-200 font-medium transition-colors block">Profile</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      onClick={() => handleNavigation('/settings')}
                      className="relative group overflow-hidden"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Button glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-violet-500/20 blur-lg group-hover:blur-none transition-all duration-300" />
                      
                      <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 group-hover:border-purple-400/50 transition-all duration-300">
                        <Settings className="w-5 h-5 text-white mx-auto mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]" />
                        <span className="text-xs text-white/80 group-hover:text-purple-200 font-medium transition-colors block">Settings</span>
                      </div>
                    </motion.button>
                    
                    <motion.button
                      onClick={handleLogout}
                      className="relative group overflow-hidden"
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Button glow */}
                      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-red-500/20 to-pink-500/20 blur-lg group-hover:blur-none transition-all duration-300" />
                      
                      <div className="relative p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/20 group-hover:border-red-400/50 transition-all duration-300">
                        <LogOut className="w-5 h-5 text-white mx-auto mb-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.4)] group-hover:drop-shadow-[0_0_12px_rgba(239,68,68,0.8)]" />
                        <span className="text-xs text-white/80 group-hover:text-red-200 font-medium transition-colors block">Logout</span>
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
