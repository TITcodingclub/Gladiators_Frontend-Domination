import RecipePage from './pages/RecipePage'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 bg-gradient-to-br from-[#0f101a] via-[#1e1f30] to-[#0f101a]
 text-[#2A2C41] dark:text-gray-100">
      <Navbar />
      <RecipePage />
    </div>
  )
}
