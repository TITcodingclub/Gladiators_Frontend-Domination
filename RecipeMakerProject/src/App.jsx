import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';
import { useEffect, useState } from 'react'
import axiosInstance from './utils/axiosInstance'

import RecipePage from './pages/RecipePage';
import RecipeGuide from './components/RecipeGuide';
import CommunityFeed from './pages/CommunityFeed';
import LoginPage from './pages/LoginPage';
import UserProfile from './pages/UserProfile';
import RegisterProfile from './pages/RegisterProfile'; // ✅ import new page
import DietPlanner from './components/DietPlanner';
import SharedDietPlan from './pages/SharedDietPlan';

// ✅ Protected Route Component
function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

// ✅ Ensures a profile exists; otherwise redirects to register-profile
function RequireCompletedProfile({ children }) {
  const [checking, setChecking] = useState(true)
  const [completed, setCompleted] = useState(false)

  useEffect(() => {
    let isMounted = true
    const check = async () => {
      try {
        const { data } = await axiosInstance.get('/api/users/me')
        if (!isMounted) return
        setCompleted(!!data.profileCompleted)
      } catch {
        setCompleted(false)
      } finally {
        if (isMounted) setChecking(false)
      }
    }
    check()
    return () => { isMounted = false }
  }, [])

  if (checking) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black">
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#FF742C]"></div>
      </div>
    )
  }

  if (!completed) return <Navigate to="/register-profile" replace />
  return children
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-black">
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#FF742C]"></div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen w-full">
        {user && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute user={user}>
                <RequireCompletedProfile>
                  <RecipePage />
                </RequireCompletedProfile>
              </ProtectedRoute>
            }
          />
          <Route
            path="/login"
            element={!user ? <LoginPage /> : <Navigate to="/" replace />}
          />
          <Route
            path="/recipes"
            element={
              <ProtectedRoute user={user}>
                <RequireCompletedProfile>
                  <RecipeGuide />
                </RequireCompletedProfile>
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute user={user}>
                <RequireCompletedProfile>
                  <CommunityFeed />
                </RequireCompletedProfile>
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <RequireCompletedProfile>
                  <UserProfile />
                </RequireCompletedProfile>
              </ProtectedRoute>
            }
          />
          {/* ✅ RegisterProfile route */}
          <Route
            path="/register-profile"
            element={
              <ProtectedRoute user={user}>
                <RegisterProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/diet-planner"
            element={
              <ProtectedRoute user={user}>
                <RequireCompletedProfile>
                  <DietPlanner />
                </RequireCompletedProfile>
              </ProtectedRoute>
            }
          />
          <Route path="/shared-diet-plan/:id" element={<SharedDietPlan />} />
          <Route path="/shared-diet-plan" element={<SharedDietPlan />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
