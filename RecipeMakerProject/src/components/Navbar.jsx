import { useState } from 'react'
import { FaUserCircle, FaChevronDown } from 'react-icons/fa'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const user = {
    name: 'Chef Olivia',
    avatar: '', // leave blank to show default icon
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow px-4 py-3 flex justify-between items-center">
      {/* Logo */}
      <div className="text-2xl font-bold text-green-600">CookSync 🍳</div>

      {/* Links */}
      <ul className="hidden md:flex gap-6 text-gray-700 dark:text-gray-100">
        <li><a href="#" className="hover:text-green-500">Home</a></li>
        <li><a href="#" className="hover:text-green-500">Recipes</a></li>
        <li><a href="#" className="hover:text-green-500">Community</a></li>
      </ul>

      {/* User */}
      <div className="relative">
        <button onClick={() => setOpen(!open)} className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-100 focus:outline-none">
          {user.avatar ? (
            <img src={user.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
          ) : (
            <FaUserCircle className="w-8 h-8 text-gray-500" />
          )}
          <span>{user.name}</span>
          <FaChevronDown className="text-xs" />
        </button>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded shadow-md">
            <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
            <a href="#" className="block px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700">Logout</a>
          </div>
        )}
      </div>
    </nav>
  )
}
