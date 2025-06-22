// src/App.jsx
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import RecipePage from './pages/RecipePage'
import LoginPage from './pages/LoginPage'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#0f101a] via-[#151623] to-[#0f101a] text-gray-800 dark:text-gray-100">
      {user ? (
        <>
          <Navbar />
          <RecipePage />
        </>
      ) : (
        <LoginPage />
      )}
    </div>
  )
}

export default App
