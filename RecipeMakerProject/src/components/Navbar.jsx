import { useAuth } from '../hooks/useAuth'
import { FaChevronDown } from 'react-icons/fa'

export default function Navbar() {
  const { user, login, logout } = useAuth()

  return (
    <nav className="bg-white dark:bg-gray-900 shadow px-4 py-3 flex justify-between items-center">
      <div className="text-2xl font-bold text-green-600">Nutrithy 🍳</div>

      <ul className="hidden md:flex gap-6 text-gray-700 dark:text-gray-100">
        <li><a href="#" className="hover:text-green-500">Home</a></li>
        <li><a href="#" className="hover:text-green-500">Recipes</a></li>
        <li><a href="#" className="hover:text-green-500">Community</a></li>
      </ul>

      {/* User */}
      {user ? (
        <div className="relative flex items-center gap-2">
          <img src={user.photoURL} className="w-8 h-8 rounded-full" alt="avatar" />
          <span>{user.displayName}</span>
          <button onClick={logout} className="ml-4 px-3 py-1 bg-red-500 text-white text-sm rounded">Logout</button>
        </div>
      ) : (
        <button onClick={login} className="px-4 py-2 bg-green-600 text-white rounded">Sign in with Google</button>
      )}
    </nav>
  )
}
