import { useEffect } from 'react'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import toast from 'react-hot-toast'

export default function VoiceInput({ onVoiceAdd }) {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition()

  useEffect(() => {
    if (!listening && transcript.trim()) {
      onVoiceAdd(transcript.trim())
      toast.success('Task added from voice 🎤')
      resetTranscript()
    }
  }, [listening])

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="border border-red-700 rounded-lg p-4 bg-gradient-to-br from-red-900 via-red-800 to-red-900 text-red-300">
        <p>Your browser does not support speech recognition.</p>
      </div>
    )
  }

  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gradient-to-br from-[#161825] via-[#1d1f31] to-[#161825] text-white">
      <h2 className="font-semibold text-xl mb-4">Use voice for task input</h2>

      <div className="space-x-2 mb-3">
        <button
          onClick={() => SpeechRecognition.startListening({ continuous: false })}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          🎤 Speak
        </button>
        <button
          onClick={() => SpeechRecognition.stopListening()}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
        >
          ⏹ Stop
        </button>
      </div>

      <div className="p-3 bg-gray-900 text-sm rounded border border-gray-600 min-h-[4rem]">
        {transcript || <span className="text-gray-500">Say something…</span>}
      </div>

      {listening && (
        <p className="text-green-400 mt-2 text-sm">Listening…</p>
      )}
    </div>
  )
}
