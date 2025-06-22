import { useState } from 'react';

export default function EmojiReactions({ stepId }) {
  const [counts, setCounts] = useState({ '👍': 0, '😄': 0, '😋': 0 });

  const react = emoji => {
    setCounts(prev => ({
      ...prev,
      [emoji]: prev[emoji] + 1,
    }));
  };

  return (
    <div className="flex space-x-4 mt-3">
      {Object.keys(counts).map(e => (
        <button
          key={e}
          onClick={() => react(e)}
          className="flex items-center space-x-1 text-sm hover:scale-110 transition"
        >
          <span>{e}</span>
          <span className="text-gray-300">{counts[e]}</span>
        </button>
      ))}
    </div>
  );
}
