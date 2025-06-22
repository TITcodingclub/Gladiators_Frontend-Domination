import RecipePage from './pages/RecipePage'
import Navbar from './components/Navbar'

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#2A2C41] text-[#2A2C41] dark:text-gray-100">
      <Navbar />
      <RecipePage />
    </div>
  )
}
