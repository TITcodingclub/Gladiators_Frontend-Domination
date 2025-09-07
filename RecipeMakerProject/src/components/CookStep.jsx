import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Circle } from "lucide-react";
import EmojiReactions from "./EmojiReactions";

export default function CookStep({ index, step }) {
  // Load initial state from localStorage
  const [checked, setChecked] = useState(() => {
    const saved = localStorage.getItem(`cookstep-${index}`);
    return saved ? JSON.parse(saved) : false;
  });

  // Update localStorage whenever checked changes
  useEffect(() => {
    localStorage.setItem(`cookstep-${index}`, JSON.stringify(checked));
  }, [checked, index]);

  const handleToggle = () => setChecked(!checked);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: 1,
        y: 0,
        scale: checked ? 0.98 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: index * 0.1,
      }}
      whileHover={{
        borderColor: "rgba(59, 130, 246, 0.5)",
      }}
      className="relative mb-4 rounded-2xl border p-5 overflow-visible transition-all duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3">
        <h3
          className={`text-lg font-bold transition-colors duration-300 ${
            checked ? "text-green-400" : "text-white"
          }`}
        >
          Step {index + 1}
        </h3>
        <motion.button
          onClick={handleToggle}
          whileTap={{ scale: 0.95 }}
          className={`flex items-center gap-2 rounded-full px-4 py-1 text-sm font-semibold transition-all duration-300 ${
            checked
              ? "bg-green-600 text-white border border-green-500 hover:bg-green-700"
              : "bg-transparent text-white border border-white/30 hover:bg-white/10"
          }`}
        >
          {checked ? <CheckCircle size={18} /> : <Circle size={18} />}
          {checked ? "Completed" : "Mark as Done"}
        </motion.button>
      </div>

      {/* Step Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
        className={`mt-2 text-base transition-all duration-300 ${
          checked ? "line-through decoration-2 text-white/50" : "text-white/80"
        }`}
      >
        {step.text}
      </motion.p>

      {/* Tags */}
      <div className="mt-4 flex flex-wrap gap-2">
        {step.tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: 0.3 + index * 0.1 + i * 0.1,
              duration: 0.3,
              type: "spring",
              stiffness: 500,
            }}
            whileHover={{ scale: 1.15, rotate: -2 }}
            whileTap={{ scale: 0.95 }}
            className={`rounded-full px-3 py-1 text-xs font-medium text-white ${
              checked ? "bg-green-500" : "bg-blue-600"
            } shadow-md`}
          >
            #{tag}
          </motion.span>
        ))}
      </div>

      {/* Emoji Reactions */}
      <div className="mt-4">
        <EmojiReactions stepId={index} />
      </div>

      {/* Strike line if completed */}
      {checked && (
        <div className="absolute left-[10%] right-[10%] top-1/2 h-[2px] bg-green-500/50 z-10 rounded-full"></div>
      )}
    </motion.div>
  );
}
