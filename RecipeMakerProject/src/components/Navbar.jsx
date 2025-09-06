import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import {
  FaUserCircle,
  FaBars,
  FaTimes,
  FaHome,
  FaUtensils,
  FaUsers
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, login } = useAuth();
  const [mobileMenu, setMobileMenu] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { name: 'Home', icon: <FaHome className="inline mr-2" />, path: '/' },
    { name: 'Recipes', icon: <FaUtensils className="inline mr-2" />, path: '/recipes' },
    { name: 'Community', icon: <FaUsers className="inline mr-2" />, path: '/community' },
  ];

  return (
    <nav className="fixed w-full px-6 md:px-10 py-4 flex justify-between items-center shadow-xl z-50
      bg-gradient-to-br from-white via-gray-100 to-white text-gray-800
      dark:from-[#0f101a] dark:via-[#151623] dark:to-[#0f101a] dark:text-white">
      
      {/* Logo */}
      <div className="w-[200px] h-[50px]">
        <svg viewBox="0 0 300 60" width="100%" height="100%">
          <text
            id="nutrithy-logo"
            x="0"
            y="45"
            fontSize="40"
            fill="none"
            stroke="#22c55e"
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
            dur="7s"
            fill="freeze"
            begin="0.3s"
          />
        </svg>
      </div>

      {/* Desktop Nav */}
      <ul className="hidden md:flex gap-10">
        {navItems.map(({ name, icon, path }, index) => (
          <li key={name} className={`opacity-0 translate-y-2 animate-fadeSlideIn animation-delay-${index * 150}`}>
            <a
              href={path}
              className="text-xl flex items-center transition-transform duration-300 ease-in-out hover:scale-110 hover:text-[#FF742C] dark:hover:text-[#FF742C]"
            >
              {icon}
              {name}
            </a>
          </li>
        ))}
      </ul>

      {/* Mobile Menu Toggle - Improved with animation */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="text-2xl text-[#FF742C] focus:outline-none p-2 rounded-full hover:bg-gray-800/20 transition-colors duration-300 relative z-50"
          aria-label="Toggle menu"
        >
          {mobileMenu ? <FaTimes className="transform transition-transform duration-300 rotate-90 hover:rotate-180" /> : <FaBars className="transform transition-transform duration-300 hover:rotate-90" />}
        </button>
      </div>

      {/* User / Auth Section */}
      {user ? (
        <div
          className="hidden md:flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/profile')}
        >
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Avatar"
              className="w-10 h-10 rounded-full border-2 border-[#FF742C] hover:scale-110 transition"
            />
          ) : (
            <FaUserCircle className="w-10 h-10 text-[#FF742C]" />
          )}
        </div>
      ) : (
        <button
          onClick={login}
          className="hidden md:inline-block px-4 py-2 bg-[#FF742C] text-white rounded hover:bg-orange-600 transition"
        >
          Sign in with Google
        </button>
      )}

      {/* Mobile Drawer - Improved with animations and backdrop */}
      {mobileMenu && (
        <>
          {/* Backdrop with blur effect */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setMobileMenu(false)}
          />
          
          <div className="fixed top-0 right-0 h-full w-[80%] max-w-sm z-50 animate-slideDown bg-gradient-to-br from-[#0f101a]/95 via-[#151623]/95 to-[#0f101a]/95 border-l border-gray-700/50 px-6 py-6 shadow-2xl md:hidden overflow-y-auto backdrop-blur-md">
            <div className="flex items-center justify-between mb-8">
              {/* Logo in mobile menu */}
              <div className="w-[150px] h-[40px]">
                <svg viewBox="0 0 300 60" width="100%" height="100%">
                  <text
                    id="nutrithy-logo-mobile"
                    x="0"
                    y="45"
                    fontSize="30"
                    fill="none"
                    stroke="#22c55e"
                    strokeWidth="2"
                  >
                    Nutrithy 🍳
                  </text>
                </svg>
              </div>
              
              <button
                className="text-2xl text-[#FF742C] hover:scale-110 transition-transform p-2 rounded-full hover:bg-gray-800/30"
                onClick={() => setMobileMenu(false)}
                aria-label="Close menu"
              >
                <FaTimes />
              </button>
            </div>

            <div className="space-y-6 mt-6">
              {navItems.map(({ name, icon, path }, i) => (
                <a
                  key={name}
                  href={path}
                  onClick={() => setMobileMenu(false)}
                  className="flex items-center text-lg text-white transition-all duration-300 hover:text-[#FF742C] transform hover:translate-x-2 animate-fadeInUp p-3 rounded-lg hover:bg-gray-800/30"
                  style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
                >
                  <span className="text-[#FF742C] mr-3 text-xl">{icon}</span>
                  {name}
                </a>
              ))}

              {user ? (
                <div className="mt-8 pt-6 border-t border-gray-700/30">
                  <div className="flex items-center mb-4">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt="Avatar"
                        className="w-10 h-10 rounded-full border-2 border-[#FF742C]"
                      />
                    ) : (
                      <FaUserCircle className="w-10 h-10 text-[#FF742C]" />
                    )}
                    <div className="ml-3">
                      <p className="text-white font-medium">{user.displayName || 'User'}</p>
                      <p className="text-gray-400 text-sm">{user.email}</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => {
                      setMobileMenu(false);
                      navigate('/profile');
                    }}
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#FF742C] to-orange-600 text-white rounded-lg font-medium transition hover:shadow-lg hover:shadow-orange-500/20 mt-2"
                  >
                    <FaUserCircle />
                    View Profile
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    login();
                    setMobileMenu(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-[#FF742C] to-orange-600 text-white rounded-lg font-medium transition hover:shadow-lg hover:shadow-orange-500/20 mt-8"
                >
                  <FcGoogle className="text-xl" />
                  Sign in with Google
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
