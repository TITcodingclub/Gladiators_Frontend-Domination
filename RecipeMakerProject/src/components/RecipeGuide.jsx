import { useEffect, useState } from 'react'
import CookStep from './CookStep'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import toast from 'react-hot-toast'

const DEFAULT_RECIPES = {
  Cake: [
    { text: 'Preheat oven to 180°C (350°F).', tags: ['prep', 'oven'] },
    { text: 'Mix flour, sugar, and eggs in a bowl.', tags: ['mixing', 'base'] },
    { text: 'Pour mixture into baking pan.', tags: ['pour', 'prep'] },
    { text: 'Bake for 30 minutes.', tags: ['bake', 'timer'] },
  ],
}

export default function RecipeGuide() {
  const [recipes, setRecipes] = useState(() =>
    JSON.parse(localStorage.getItem('custom-recipes')) || DEFAULT_RECIPES
  )
  const [selected, setSelected] = useState(null)
  const [checkedSteps, setCheckedSteps] = useState({})
  const [customRecipeName, setCustomRecipeName] = useState('')
  const [customSteps, setCustomSteps] = useState([''])

  const { transcript, listening, resetTranscript } = useSpeechRecognition()

  // Load saved progress on recipe change
  useEffect(() => {
    if (!selected) return
    const saved = localStorage.getItem(`progress-${selected}`)
    setCheckedSteps(saved ? JSON.parse(saved) : {})
  }, [selected])

  // Save progress
  useEffect(() => {
    if (selected) {
      localStorage.setItem(`progress-${selected}`, JSON.stringify(checkedSteps))
    }
  }, [checkedSteps, selected])

  // Voice Command Handler
  useEffect(() => {
    const command = transcript.toLowerCase().trim()
    if (!command || !selected) return

    if (command.includes('next step')) {
      const nextIndex = Object.values(checkedSteps).filter(Boolean).length
      if (nextIndex < recipes[selected].length) {
        setCheckedSteps((prev) => ({ ...prev, [nextIndex]: true }))
        toast.success(`Step ${nextIndex + 1} marked as done ✅`)
      }
    }

    if (command.includes('reset') || command.includes('start over')) {
      setCheckedSteps({})
      toast('Recipe reset 🔁')
    }

    resetTranscript()
  }, [transcript])

  const handleAddCustomRecipe = () => {
    const steps = customSteps.filter((s) => s.trim())
    if (!customRecipeName || steps.length === 0) return

    const newRecipes = {
      ...recipes,
      [customRecipeName]: steps.map((text) => ({ text, tags: [] })),
    }

    setRecipes(newRecipes)
    localStorage.setItem('custom-recipes', JSON.stringify(newRecipes))
    setCustomRecipeName('')
    setCustomSteps([''])
    toast.success('Custom recipe added! 🧁')
  }

  return (
    <div className="space-y-6">
      {!selected ? (
        <>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Select a Recipe to Cook</h2>
            <div className="flex justify-center gap-4 flex-wrap">
              {Object.keys(recipes).map((name) => (
                <button
                  key={name}
                  onClick={() => setSelected(name)}
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded transition"
                >
                  🍽️ {name}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-[#1f2133] p-4 rounded-lg mt-6 space-y-4">
            <h3 className="text-white text-lg font-semibold">Add Your Own Recipe</h3>
            <input
              value={customRecipeName}
              onChange={(e) => setCustomRecipeName(e.target.value)}
              placeholder="Recipe name"
              className="w-full p-2 rounded bg-gray-700 text-white"
            />
            {customSteps.map((step, i) => (
              <input
                key={i}
                value={step}
                onChange={(e) =>
                  setCustomSteps((prev) =>
                    prev.map((s, idx) => (idx === i ? e.target.value : s))
                  )
                }
                placeholder={`Step ${i + 1}`}
                className="w-full p-2 rounded bg-gray-700 text-white mb-2"
              />
            ))}
            <div className="flex gap-2">
              <button
                onClick={() => setCustomSteps([...customSteps, ''])}
                className="bg-blue-500 px-3 py-1 rounded text-white"
              >
                + Add Step
              </button>
              <button
                onClick={handleAddCustomRecipe}
                className="bg-green-600 px-3 py-1 rounded text-white"
              >
                ✅ Save Recipe
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-white">👨‍🍳 {selected} Cooking Guide</h2>
            <div className="flex gap-2">
              <button
                onClick={() => SpeechRecognition.startListening({ continuous: false })}
                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded"
              >
                🎤 Voice Command
              </button>
              <button
                onClick={() => {
                  setSelected(null)
                  setCheckedSteps({})
                }}
                className="text-sm text-gray-300 hover:text-red-400 underline"
              >
                ← Choose Another Recipe
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {recipes[selected].map((step, i) => (
              <CookStep
                key={i}
                index={i + 1}
                step={step}
                checked={checkedSteps[i]}
                onToggle={() =>
                  setCheckedSteps((prev) => ({ ...prev, [i]: !prev[i] }))
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
