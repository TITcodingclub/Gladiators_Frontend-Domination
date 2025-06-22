import RecipePage from './pages/RecipePage'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen  bg-gradient-to-br from-[#0f101a] via-[#151623] to-[#0f101a] text-gray-800 dark:text-gray-100">
      <Navbar />
      <RecipePage />
    </div>
  )
}
