import React from 'react';
import CookStep from './CookStep';

export default function CookModeView({ steps }) {
  return (
    <div className="border border-gray-700 rounded-lg p-4 bg-gradient-to-br from-[#161825] via-[#1d1f31] to-[#161825] col-span-full">
      <h2 className="text-xl font-semibold mb-4 text-white">👨‍🍳 Cook Mode</h2>

      <div className="grid sm:grid-cols-2 gap-4">
        {steps.map((step, i) => (
          <CookStep key={i} index={i + 1} step={step} />
        ))}
      </div>
    </div>
  );
}
