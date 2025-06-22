import { useContext } from 'react'
import DragDropBoard, { BoardContext } from '../components/DragDropBoard'
import VoiceInput from '../components/VoiceInput'
import VideoCallMock from '../components/VideoCallMock'
import CookModeView from '../components/CookModeView'
import TagAnimator from '../components/TagAnimator'
import EmojiReactions from '../components/EmojiReactions'

export default function RecipePage() {
  return (
    <div className="p-4 max-w-screen-lg mx-auto flex flex-col gap-6">
      <DragDropBoard>
        <VoiceWithVideoSection />
      </DragDropBoard>

      <TagAnimator tags={['🥦 vegan', '⏱️ quick', '🌶️ spicy']} />
      <CookModeView steps={['Chop onions', 'Saute for 5 min', 'Serve hot']} />
      <EmojiReactions stepId="step-1" />
    </div>
  )
}

// ✅ Helper component placed AFTER DragDropBoard renders
function VoiceWithVideoSection() {
  const { addCard, activeColumn } = useContext(BoardContext)
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <VoiceInput onVoiceAdd={(text) => addCard(activeColumn, text)} />
      <VideoCallMock />
    </div>
  )
}
