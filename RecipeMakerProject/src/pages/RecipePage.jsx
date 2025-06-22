import DragDropBoard from '../components/DragDropBoard'
import VoiceInput from '../components/VoiceInput'
import VideoCallMock from '../components/VideoCallMock'
import CookModeView from '../components/CookModeView'
import TagAnimator from '../components/TagAnimator'
import EmojiReactions from '../components/EmojiReactions'

export default function RecipePage() {
  return (
    <div className="p-4 max-w-screen-lg mx-auto flex flex-col gap-6 ">
      <DragDropBoard />
     <div className='flex flex-col gap-4'>
       <VoiceInput />
       <VideoCallMock />
     </div>
      <TagAnimator tags={['🥦vegan', '⏱️quick', '🌶️spicy']} />
      <CookModeView steps={['Chop onions', 'Saute', 'Serve']} />
      <EmojiReactions stepId="step-1" />
    </div>
  )
}
