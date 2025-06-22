import { motion, AnimatePresence } from 'framer-motion'

export default function TagAnimator({ tags }) {
  return (
    <div className="space-x-2">
      <AnimatePresence>
        {tags.map(tag => (
          <motion.span key={tag} initial={{ scale:0 }} animate={{ scale:1 }} exit={{ scale:0 }} className="inline-block px-3 py-1 bg-green-600 rounded-full">
            {tag}
          </motion.span>
        ))}
      </AnimatePresence>
    </div>
  )
}
