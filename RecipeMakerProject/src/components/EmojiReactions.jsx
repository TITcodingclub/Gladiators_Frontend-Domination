import { useState } from 'react'

export default function EmojiReactions({ stepId }) {
  const [counts, setCounts] = useState({ '👍':0, '😄':0, '😋':0 })
  const react = emoji => setCounts(c => ({ ...c, [emoji]: c[emoji]+1 }))
  return (
    <div className="flex space-x-4 mt-2">
      {Object.keys(counts).map(e => (
        <button key={e} onClick={() => react(e)} className="flex items-center space-x-1">
          <span>{e}</span><span>{counts[e]}</span>
        </button>
      ))}
    </div>
  )
}
