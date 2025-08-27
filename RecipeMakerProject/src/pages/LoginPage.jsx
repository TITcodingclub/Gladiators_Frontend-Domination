import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FcGoogle } from 'react-icons/fc'
import { Box } from '@mui/material'
import ThreadBackground from '../components/ThreadBackground'
import axiosInstance from '../utils/axiosInstance'

export default function LoginPage() {
  const { user, loading, login } = useAuth() // Firebase auth state
  const navigate = useNavigate()
  const [checkingProfile, setCheckingProfile] = useState(false)
  
  
  useEffect(() => {
    const checkProfile = async () => {
      if (!user) return
      
      setCheckingProfile(true)
      try {
        const { data } = await axiosInstance.get('/api/users/me')
        
        if (data.user && data.user.profileCompleted) {
          navigate('/', { replace: true })
        } else {
          navigate('/register-profile', { replace: true })
        }
      } catch (err) {
        console.error('Error checking profile:', err)
        navigate('/register-profile', { replace: true })
      } finally {
        setCheckingProfile(false)
      }
    }

    if (!loading && user) checkProfile()
  }, [user, loading, navigate])

  if (loading || checkingProfile) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black">
        <p className="text-white text-lg">Checking profile...</p>
      </div>
    )
  }

  return (
    <>
      <ThreadBackground />
      <div className="min-h-screen flex items-center justify-center bg-transparent">
        <div className="w-full max-w-md p-8 bg-gradient-to-br from-[#0c0d14] via-[#1d1f31] to-[#0c0d14] rounded-2xl text-center space-y-6 shadow-2xl">
          {/* Logo */}
          <div className="flex justify-center">
            <Box sx={{ width: 220, height: 60 }}>
              <svg viewBox="0 0 180 60" width="100%" height="100%">
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
                  dur="10s"
                  fill="freeze"
                  begin="0.3s"
                />
              </svg>
            </Box>
          </div>

          <p className="text-gray-400 text-sm whitespace-nowrap overflow-hidden border-r-2 border-gray-400 animate-typing">
            Your intelligent cooking assistant.
          </p>

          {/* Google Sign-In */}
          <button
            onClick={login}
            className="flex items-center justify-center w-full gap-3 px-5 py-3 border border-gray-600 rounded-lg bg-white dark:bg-gray-700 hover:shadow-lg transition cursor-pointer"
          >
            <FcGoogle className="text-2xl" />
            <span className="text-sm font-medium text-gray-800 dark:text-gray-100">
              Sign in with Google
            </span>
          </button>

          <p className="text-xs text-gray-500">Start your smart cooking journey.</p>
        </div>
      </div>
    </>
  )
}
