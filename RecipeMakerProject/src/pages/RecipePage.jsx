import { useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import DragDropBoard, { BoardContext } from '../components/DragDropBoard'
import VoiceInput from '../components/VoiceInput'
import VideoCallMock from '../components/VideoCallMock'
import CookModeView from '../components/CookModeView'
import TagAnimator from '../components/TagAnimator'
import EmojiReactions from '../components/EmojiReactions'

export default function RecipePage() {
  const { user } = useAuth()

  const steps = [
    { text: 'Preheat oven to 180°C (350°F).', tags: ['prep', 'oven'] },
    { text: 'Mix flour, sugar, and eggs in a bowl.', tags: ['mixing', 'base'] },
    { text: 'Pour mixture into baking pan.', tags: ['pour', 'prep'] },
    { text: 'Bake for 30 minutes.', tags: ['bake', 'timer'] }
  ]

  return (
    <div className="p-4 max-w-screen-lg mx-auto flex flex-col gap-6">
      {/* 🔥 Greeting at the top */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-green-500 mt-25">
          Hello Chef{user?.displayName ? `, ${user.displayName}` : ''} 👨‍🍳
        </h1>
        <p className="text-sm text-gray-400">Ready to cook something delicious today?</p>
      </div>

      <DragDropBoard>
        <VoiceWithVideoSection />
      </DragDropBoard>

      <TagAnimator tags={['🥦 vegan', '⏱️ quick', '🌶️ spicy']} />
      <CookModeView steps={steps} />
      {/* <EmojiReactions stepId="step-1" /> */}
    </div>
  )
}

// ✅ Context-safe component rendered within DragDropBoard
function VoiceWithVideoSection() {
  const { addCard, activeColumn } = useContext(BoardContext)
  return (
    <div className="flex flex-col gap-4">
      <VoiceInput onVoiceAdd={(text) => addCard(activeColumn, text)} />
      <VideoCallMock />
    </div>
  )
}
