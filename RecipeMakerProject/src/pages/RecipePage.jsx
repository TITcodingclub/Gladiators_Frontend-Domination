import DragDropBoard from '../components/DragDropBoard'
import VoiceInput from '../components/VoiceInput'
import VideoCallMock from '../components/VideoCallMock'
import CookModeView from '../components/CookModeView'
import TagAnimator from '../components/TagAnimator'
import EmojiReactions from '../components/EmojiReactions'

export default function RecipePage() {
  return (
    <div className="p-4 max-w-screen-lg mx-auto grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      <DragDropBoard />
      <VoiceInput />
      <VideoCallMock />
      <TagAnimator tags={['#vegan','#quick','#spicy']} />
      <CookModeView steps={['Chop onions','Saute','Serve']} />
      <EmojiReactions stepId="step-1" />
    </div>
  )
}
