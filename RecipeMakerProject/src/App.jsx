import LoginPage from './pages/LoginPage'
import Navbar from './components/Navbar'
import RecipePage from './pages/RecipePage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user } = useAuth()

  return (
    <>
      {user ? (
        <>
          <Navbar />
          <RecipePage />
        </>
      ) : (
        <LoginPage />
      )}
    </>
  )
}
export default App