// src/pages/LoginPage.jsx
import { useAuth } from '../hooks/useAuth'
import { FcGoogle } from 'react-icons/fc'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md p-8 bg-white dark:bg-gray-800 rounded-xl shadow-md text-center space-y-6">
        
        <h1 className="text-4xl font-bold text-green-600 dark:text-green-300">Nutrithy 🍳</h1>
        
        <p className="text-gray-600 dark:text-gray-300 text-sm">
          Your intelligent cooking assistant.
        </p>

        <button
          onClick={login}
          className="flex items-center justify-center w-full gap-3 px-5 py-3 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 hover:shadow-md transition cursor-pointer"
        >
          <FcGoogle className="text-2xl" />
          <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Sign in with Google</span>
        </button>

        <p className="text-xs text-gray-400 dark:text-gray-500">
          Start your smart cooking journey.
        </p>
      </div>
    </div>
  )
}
