import React, { useState } from 'react';
import EmojiReactions from './EmojiReactions';

export default function CookStep({ index, step }) {
  const [checked, setChecked] = useState(false);

  return (
    <div className="bg-[#222439] p-4 rounded-lg shadow transition-all duration-300 hover:ring hover:ring-purple-500">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white font-semibold">Step {index}</h3>
          <p className="text-gray-300 mt-1">{step.text}</p>
        </div>
        <button
          onClick={() => setChecked(!checked)}
          className={`text-sm ml-2 rounded-full px-3 py-1 transition ${
            checked ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
          }`}
        >
          {checked ? '✓ Done' : '✓'}
        </button>
      </div>

      {/* Animated Tags */}
      <div className="mt-3 flex flex-wrap gap-2">
        {step.tags.map(tag => (
          <span
            key={tag}
            className="bg-purple-700 text-white px-2 py-0.5 text-xs rounded-full animate-pulse"
          >
            #{tag}
          </span>
        ))}
      </div>

      {/* Emoji Reactions */}
      <EmojiReactions stepId={index} />
    </div>
  );
}
