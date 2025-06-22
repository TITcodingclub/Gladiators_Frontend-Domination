import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { FaChevronDown, FaUserCircle, FaMoon, FaSun } from 'react-icons/fa'
import { FiLogOut } from 'react-icons/fi'

export default function Navbar() {
  const { user, login, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(false)

  const dropdownRef = useRef(null)

  const toggleTheme = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <nav className="bg-gradient-to-br fixed w-full from-[#0f101a] via-[#151623] to-[#0f101a] shadow-xl px-10 py-5 flex justify-between items-center z-999">
      <div className="text-2xl font-bold text-green-500">Nutrithy 🍳</div>

      <ul className="hidden md:flex gap-6 text-white">
        <li><a href="#" className="hover:text-[#FF742C] text-xl">Home</a></li>
        <li><a href="#" className="hover:text-[#FF742C] text-xl">Recipes</a></li>
        <li><a href="#" className="hover:text-[#FF742C] text-xl">Community</a></li>
      </ul>

      {user ? (
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 text-sm font-medium text-white cursor-pointer focus:outline-none"
          >
            {user.photoURL ? (
              <img src={user.photoURL} alt="Avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <FaUserCircle className="w-8 h-8 text-[#FF742C] cursor-pointer" />
            )}
            <FaChevronDown className="text-xs text-[#FF742C] cursor-pointer" />
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-44 bg-white cursor-pointer dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md z-50">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {darkMode ? (
                  <FaMoon className="text-[#FF742C]" />
                ) : (
                  <FaSun className="text-[#FF742C]" />
                )}
                {darkMode ? 'Dark Mode' : 'Light Mode'}
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FiLogOut className="text-[#FF742C]" />
                Logout
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={login}
          className="px-4 py-2 bg-[#FF742C] text-white rounded hover:bg-orange-600 transition"
        >
          Sign in with Google
        </button>
      )}
    </nav>
  )
}
