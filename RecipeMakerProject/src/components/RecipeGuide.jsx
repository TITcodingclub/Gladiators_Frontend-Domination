import React, { useState } from 'react'
import axios from 'axios'
import CookModeView from './CookModeView'
import { Snackbar } from '@mui/material'

export default function RecipeGuide() {
  const [query, setQuery] = useState('')
  const [steps, setSteps] = useState(null)
  const [customName, setCustomName] = useState('')
  const [customSteps, setCustomSteps] = useState([''])
  const [alert, setAlert] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return
    setSteps(null)
    setAlert('')

    try {
      const { data } = await axios.get(
        `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`
      )
      const meal = data.meals?.[0]
      if (meal) {
        const instr = meal.strInstructions
          ?.split(/\r?\n/)
          .filter(line => line.trim())
        setSteps(instr.map(text => ({ text, tags: [] })))
      } else {
        setAlert('No recipe found.')
      }
    } catch {
      setAlert('Error fetching recipe.')
    }
  }

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
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-center text-green-400">🍳 Recipe Guide</h1>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          placeholder="Search recipe..."
          className="flex-1 p-3 rounded border border-gray-600 bg-gray-800 text-white"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          onClick={handleSearch}
          className="px-5 py-3 bg-green-600 hover:bg-green-700 text-white rounded font-semibold"
        >
          Search
        </button>
      </div>

      {/* Custom Recipe Form */}
      {!steps && (
        <div className="bg-gray-900 border border-gray-700 p-4 rounded-lg space-y-4">
          <h2 className="text-xl font-semibold text-white">Add Your Own Recipe</h2>
          <input
            type="text"
            placeholder="Recipe Name"
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            value={customName}
            onChange={e => setCustomName(e.target.value)}
          />
          {customSteps.map((step, i) => (
            <input
              key={i}
              type="text"
              placeholder={`Step ${i + 1}`}
              className="w-full p-2 mt-2 rounded bg-gray-800 text-white border border-gray-600"
              value={step}
              onChange={(e) => {
                const newSteps = [...customSteps]
                newSteps[i] = e.target.value
                setCustomSteps(newSteps)
              }}
            />
          ))}
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => setCustomSteps([...customSteps, ''])}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
            >
              + Step
            </button>
            <button
              onClick={saveCustom}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
            >
              Save Recipe
            </button>
          </div>
        </div>
      )}

      {/* Cook Mode View */}
      {steps && (
        <div className="space-y-4">
          <CookModeView steps={steps} />
          <button
            onClick={() => setSteps(null)}
            className="text-green-400 hover:text-red-400 text-sm mt-2 underline"
          >
            ← Back to search
          </button>
        </div>
      )}

      {/* Alert */}
      <Snackbar
        open={!!alert}
        autoHideDuration={3000}
        message={alert}
        onClose={() => setAlert('')}
      />
    </div>
  )
}
