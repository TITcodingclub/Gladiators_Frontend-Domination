import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import RecipePage from './pages/RecipePage'
import RecipeGuide from './components/RecipeGuide'
import LoginPage from './pages/LoginPage'
import ThreadBackground from './components/ThreadBackground'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        Loading...
      </div>
    )
  }

  return (
    <Router>
      <ThreadBackground />
      <div className="min-h-screen w-full">
        {user && <Navbar />}
        <Routes>
          <Route
            path="/"
            element={user ? <RecipePage /> : <Navigate to="/login" replace />}
          />
          <Route element={<LoginPage />} path='/login'></Route>
         <Route element={<RecipeGuide />} path='/recipes' > </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
