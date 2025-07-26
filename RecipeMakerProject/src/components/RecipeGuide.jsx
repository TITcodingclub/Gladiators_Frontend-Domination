import React, { useState, useEffect } from 'react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import CookModeView from './CookModeView'
import { Snackbar, Alert } from '@mui/material'
import TagAnimator from './TagAnimator'
import ThreadBackground from './ThreadBackground'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

export default function RecipeGuide({ scrollRef }) {
  const [query, setQuery] = useState('')
  const [steps, setSteps] = useState(null)
  const [customName, setCustomName] = useState('')
  const [customSteps, setCustomSteps] = useState([''])
  const [alert, setAlert] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (scrollRef?.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [scrollRef])

  const handleSearch = async () => {
    if (!query.trim() || isLoading) return
    
    setIsLoading(true)
    setSteps(null)
    setAlert('')

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' })
      const prompt = `Provide cooking instructions for "${query}". List each step clearly and concisely. Include ingredients or preparation time, with the steps.`
      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      const geminiSteps = text
        .split('\n')
        .filter(line => line.trim() && line.match(/^\d+\./))
        .map(line => ({ text: line.replace(/^\d+\.\s*/, '').replace(/[*#]/g, '').trim(), tags: [] }))

      if (geminiSteps.length > 0) {
        setSteps(geminiSteps)
      } else {
        setAlert('No detailed instructions found from Gemini.')
      }
    } catch (error) {
      console.error('Error fetching recipe from Gemini:', error)
      setAlert('Error fetching recipe from Gemini.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  // FIX: Function to handle removing a custom step
  const handleRemoveCustomStep = (index) => {
    // Prevent removing the last step
    if (customSteps.length === 1) return;
    const newSteps = customSteps.filter((_, i) => i !== index);
    setCustomSteps(newSteps);
  };
  
  // FIX: Function to update a specific custom step
  const handleCustomStepChange = (e, index) => {
    const newSteps = [...customSteps];
    newSteps[index] = e.target.value;
    setCustomSteps(newSteps);
  };

  const saveCustom = () => {
    const valid = customSteps.filter(s => s.trim())
    if (!customName.trim() || valid.length === 0) {
      setAlert('Please enter a name and at least one step.')
      return
    }

    const saved = JSON.parse(localStorage.getItem('custom-recipes') || '{}')
    saved[customName] = valid.map(text => ({ text, tags: [] }))
    localStorage.setItem('custom-recipes', JSON.stringify(saved))
    setAlert('Custom recipe saved!')
    setSteps(saved[customName])
  }

  return (
    <>
      <ThreadBackground />
      <div ref={scrollRef} className="w-full lg:px-20 lg:py-10 px-5 py-5 space-y-6">
        <h1 className="text-3xl font-bold text-center text-green-400 mt-24">🍳 Recipe Guide</h1>

        <TagAnimator tags={['🥦 vegan', '⏱️ quick', '🌶️ spicy']} />

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="Search any recipe with AI..."
            className="flex-1 p-3 rounded border border-gray-600 bg-gray-800 text-white"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={handleSearch}
            disabled={isLoading}
            className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        {isLoading && (
            <div className="flex justify-center items-center gap-4 py-10">
                <div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl text-green-400 font-semibold">
                    Nutrithy - loading your recipe...
                </p>
            </div>
        )}

        {/* --- IMPROVED CUSTOM RECIPE FORM UI --- */}
        {!steps && !isLoading && (
          <div className="bg-gradient-to-br from-[#161825] via-[#1d1f31] to-[#161825] border border-gray-700 p-6 rounded-xl space-y-4">
            <h2 className="text-2xl font-bold text-white text-center mb-2">Add Your Own Recipe</h2>
            
            {/* Recipe Name Input */}
            <input
              type="text"
              placeholder="Recipe Name"
              className="w-full p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
              value={customName}
              onChange={e => setCustomName(e.target.value)}
            />
            
            {/* Steps Section */}
            <div className="space-y-3">
              {customSteps.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Step ${i + 1}`}
                    className="flex-grow p-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 transition"
                    value={step}
                    onChange={(e) => handleCustomStepChange(e, i)}
                  />
                  {customSteps.length > 1 && (
                    <button 
                      onClick={() => handleRemoveCustomStep(i)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-gray-700 transition-colors"
                      title="Remove Step"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setCustomSteps([...customSteps, ''])}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-semibold transition"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Step
              </button>
              <button
                onClick={saveCustom}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition"
              >
                Save Recipe
              </button>
            </div>
          </div>
        )}

        {steps && (
          <div className="space-y-4">
            <CookModeView steps={steps} />
            <button
              onClick={() => setSteps(null)}
              className="text-green-400 hover:text-red-400 text-sm mt-2"
            >
              ← Back to search
            </button>
          </div>
        )}

        <Snackbar
          open={!!alert}
          autoHideDuration={3000}
          onClose={() => setAlert('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionProps={{ onEnter: (node) => node.classList.add('fade-in') }}
        >
          <Alert
            onClose={() => setAlert('')}
            severity="info"
            icon={false}
            sx={{
              width: '100%',
              fontWeight: '600',
              backdropFilter: 'blur(8px)',
              backgroundColor: 'rgba(30, 41, 59, 0.8)',
              color: '#f1f5f9',
              border: '1px solid rgba(51, 65, 85, 0.6)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              borderRadius: '12px',
              textAlign: 'center',
              px: 3,
              py: 1.5,
            }}
          >
            {alert}
          </Alert>
        </Snackbar>
      </div>
    </>
  )
}