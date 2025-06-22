// src/App.jsx
import { useAuth } from './hooks/useAuth'
import Navbar from './components/Navbar'
import RecipePage from './pages/RecipePage'
import LoginPage from './pages/LoginPage'

function App() {
  const { user } = useAuth()

  return (
    <div className="min-h-screen w-full ">
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
