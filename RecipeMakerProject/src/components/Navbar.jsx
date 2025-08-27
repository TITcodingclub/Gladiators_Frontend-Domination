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

      {/* Mobile Menu Toggle */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenu(!mobileMenu)}
          className="text-2xl text-[#FF742C] focus:outline-none"
        >
          {mobileMenu ? <FaTimes /> : <FaBars />}
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

      {/* Mobile Drawer */}
      {mobileMenu && (
        <div className="fixed top-0 left-0 w-[90%] z-50 m-5 animate-slideDown bg-white dark:bg-[#1b1d2a] border-t border-gray-200 dark:border-gray-700 px-6 py-6 shadow-2xl rounded-b-xl md:hidden">
          <div className="flex justify-end mb-4">
            <button
              className="text-2xl text-[#FF742C] hover:scale-110 transition-transform"
              onClick={() => setMobileMenu(false)}
            >
              <FaTimes />
            </button>
          </div>

          {navItems.map(({ name, icon, path }, i) => (
            <a
              key={name}
              href={path}
              className="block text-lg text-gray-800 dark:text-white transition-all duration-300 hover:text-[#FF742C] mt-3 dark:hover:text-[#FF742C] transform hover:scale-105 animate-fadeInUp"
              style={{ animationDelay: `${i * 0.1}s`, animationFillMode: 'both' }}
            >
              {icon}
              {name}
            </a>
          ))}

          {user ? (
            <button
              onClick={() => {
                setMobileMenu(false);
                navigate('/profile');
              }}
              className="block text-left text-lg mt-5 text-gray-800 dark:text-white hover:text-[#FF742C] dark:hover:text-[#FF742C]"
            >
              View Profile
            </button>
          ) : (
            <button
              onClick={login}
              className="block text-left text-lg mt-5 text-gray-800 dark:text-white hover:text-[#FF742C] dark:hover:text-[#FF742C]"
            >
              Sign in with Google
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
