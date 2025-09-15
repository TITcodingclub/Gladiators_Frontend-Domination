import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/common/Navbar';
import { useEffect, useState } from 'react';
import axiosInstance from './utils/axiosInstance';
import { AnimatePresence } from 'framer-motion';
import LoadingSpinner from './components/common/LoadingSpinner';
import PageTransition from './components/common/PageTransition';

import RecipePage from './pages/RecipePage';
import RecipeGuide from './components/recipe/RecipeGuide';
import CommunityFeed from './pages/CommunityFeed';
import LoginPage from './pages/LoginPage';
import UserProfile from './pages/UserProfile';
import UserProfilePage from './pages/UserProfilePage';
import RegisterProfile from './pages/RegisterProfile';
import DietPlanner from './components/diet/DietPlanner';
import SharedDietPlan from './pages/SharedDietPlan';
import Footer from './components/common/Footer';
import ThreadBackground from './components/common/ThreadBackground';

// ✅ Protected Route Component
function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
}

// ✅ Ensures a profile exists; otherwise redirects to register-profile
function RequireCompletedProfile({ children }) {
  const [checking, setChecking] = useState(true);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const check = async () => {
      try {
        const { data } = await axiosInstance.get('/api/users/me');
        if (!isMounted) return;
        setCompleted(!!data.profileCompleted);
      } catch {
        setCompleted(false);
      } finally {
        if (isMounted) setChecking(false);
      }
    };
    check();
    return () => {
      isMounted = false;
    };
  }, []);

  if (checking) {
    return <LoadingSpinner />;
  }

  if (!completed) return <Navigate to="/register-profile" replace />;
  return children;
}

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <AnimatedRoutes user={user} />
    </Router>
  );
}

function AnimatedRoutes({ user }) {
  const location = useLocation();

  return (
    <div className="min-h-screen w-full flex flex-col">
      {user && <Navbar />}
      <main className="flex-1 pt-20">
        <ThreadBackground />
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <ProtectedRoute user={user}>
                  <RequireCompletedProfile>
                    <PageTransition>
                      <RecipePage />
                    </PageTransition>
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
                    <PageTransition>
                      <RecipeGuide />
                    </PageTransition>
                  </RequireCompletedProfile>
                </ProtectedRoute>
              }
            />
            <Route
              path="/community"
              element={
                <ProtectedRoute user={user}>
                  <RequireCompletedProfile>
                    <PageTransition>
                      <CommunityFeed />
                    </PageTransition>
                  </RequireCompletedProfile>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute user={user}>
                  <RequireCompletedProfile>
                    <PageTransition>
                      <UserProfile />
                    </PageTransition>
                  </RequireCompletedProfile>
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-profile"
              element={
                <ProtectedRoute user={user}>
                  <PageTransition>
                    <RegisterProfile />
                  </PageTransition>
                </ProtectedRoute>
              }
            />
            <Route
              path="/diet-planner"
              element={
                <ProtectedRoute user={user}>
                  <RequireCompletedProfile>
                    <PageTransition>
                      <DietPlanner />
                    </PageTransition>
                  </RequireCompletedProfile>
                </ProtectedRoute>
              }
            />
            <Route
              path="/shared-diet-plan/:id"
              element={
                <PageTransition>
                  <SharedDietPlan />
                </PageTransition>
              }
            />
            <Route
              path="/shared-diet-plan"
              element={
                <PageTransition>
                  <SharedDietPlan />
                </PageTransition>
              }
            />
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute user={user}>
                  <RequireCompletedProfile>
                    <PageTransition>
                      <UserProfile />
                    </PageTransition>
                  </RequireCompletedProfile>
                </ProtectedRoute>
              }
            />          
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
        </main>
        {user && <Footer />}
      </div>
    );
}

export default App;
