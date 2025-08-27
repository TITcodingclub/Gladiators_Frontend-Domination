import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Navbar from './components/Navbar';

import RecipePage from './pages/RecipePage';
import RecipeGuide from './components/RecipeGuide';
import CommunityFeed from './pages/CommunityFeed';
import LoginPage from './pages/LoginPage';
import UserProfile from './pages/UserProfile';
import RegisterProfile from './pages/RegisterProfile'; // ✅ import new page

// ✅ Protected Route Component
function ProtectedRoute({ user, children }) {
  return user ? children : <Navigate to="/login" replace />;
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
                <RecipePage />
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
                <RecipeGuide />
              </ProtectedRoute>
            }
          />
          <Route
            path="/community"
            element={
              <ProtectedRoute user={user}>
                <CommunityFeed />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute user={user}>
                <UserProfile />
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
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
