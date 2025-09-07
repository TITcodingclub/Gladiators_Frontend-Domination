import { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mic, Square } from 'lucide-react';

export default function VoiceInput({ onVoiceAdd }) {
  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  useEffect(() => {
    if (!listening && transcript.trim()) {
      onVoiceAdd(transcript.trim());
      toast.success('Task added from voice 🎤');
      resetTranscript();
    }
  }, [listening]);

  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="p-4 rounded-lg border border-red-500 bg-red-900 text-red-200">
        Your browser does not support speech recognition.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-xl text-white flex flex-col gap-4"
    >
      <h2 className="text-lg md:text-xl font-bold">🎤 Voice-Controlled Task Input</h2>

      <div className="flex flex-wrap gap-4">
        {!listening ? (
          <motion.button
            onClick={() => SpeechRecognition.startListening({ continuous: false })}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold bg-green-600 shadow-md shadow-green-500/50 hover:bg-green-700 transition-colors duration-300"
            whileTap={{ scale: 0.95 }}
            animate={{ boxShadow: listening ? '0 0 15px rgba(76, 175, 80, 0.5)' : '0 0 0 rgba(76,175,80,0)' }}
          >
            <Mic size={20} />
            Speak
          </motion.button>
        ) : (
          <motion.button
            onClick={() => SpeechRecognition.SquareListening()}
            className="flex items-center gap-2 px-5 py-3 rounded-full font-semibold bg-red-600 shadow-md shadow-red-500/50 hover:bg-red-700 transition-colors duration-300"
            whileTap={{ scale: 0.95 }}
          >
            <Square size={20} />
            Stop
          </motion.button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-md p-3 font-mono min-h-[4rem] text-gray-300">
        {transcript || <span className="text-gray-500 italic">Say something…</span>}
      </div>

      {listening && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-green-400 italic mt-2"
          transition={{ repeat: Infinity, repeatType: 'reverse', duration: 0.8 }}
        >
          🎧 Listening...
        </motion.div>
      )}
    </motion.div>
  );
}
