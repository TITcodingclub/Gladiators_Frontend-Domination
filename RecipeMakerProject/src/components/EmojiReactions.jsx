import React, { useState, useEffect, useRef } from 'react';
import { Stack, Badge, IconButton, Box } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { FiHeart, FiSmile, FiThumbsUp, FiStar } from 'react-icons/fi';

// Emoji variants for Framer Motion animations
const emojiVariants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 500, damping: 15 } },
  hover: { scale: 1.2, rotate: [0, -10, 10, -10, 0], transition: { duration: 0.5 } },
  tap: { scale: 0.9, transition: { duration: 0.1 } },
  exit: { scale: 0, opacity: 0 }
};

// Floating animation variants
const floatVariants = {
  initial: { y: 0, scale: 1, opacity: 1 },
  animate: { y: -80, scale: 1.5, opacity: 0, transition: { duration: 1.2, ease: 'easeOut' } }
};

export default function EmojiReactions() {
  // Enhanced emoji set with React Icons
  const [counts, setCounts] = useState({ 
    '👍': 0, 
    '❤️': 0, 
    '😄': 0, 
    '🌟': 0, 
    '😋': 0 
  });
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  // State to manage the floating animation
  const [floatingEmojis, setFloatingEmojis] = useState([]);
  const containerRef = useRef(null);
  
  // Map emojis to React Icons for enhanced visual appeal
  const emojiIcons = {
    '👍': <FiThumbsUp />,
    '❤️': <FiHeart />,
    '😄': <FiSmile />,
    '🌟': <FiStar />
  };
  
  // GSAP animation for container entrance
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  const handleReact = (emoji) => {
    const newCounts = { ...counts };
    let newSelected = selectedEmoji;

    // --- Enhanced Reversible Logic ---
    if (selectedEmoji === emoji) {
      // User is deselecting their reaction
      newCounts[emoji]--;
      newSelected = null;
      
      // Add a subtle shake animation when deselecting
      if (containerRef.current) {
        gsap.to(containerRef.current, {
          x: [-5, 5, -3, 3, 0],
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    } else {
      // If user had a previous selection, undo it
      if (selectedEmoji) {
        newCounts[selectedEmoji]--;
      }
      // Add the new reaction
      newCounts[emoji]++;
      newSelected = emoji;

      // --- Trigger Multiple Floating Animations ---
      // Create 3 floating emojis for a more dynamic effect
      for (let i = 0; i < 3; i++) {
        const newFloating = { 
          id: Date.now() + i, 
          emoji: emoji,
          offsetX: (Math.random() - 0.5) * 60, // Random horizontal offset
          delay: i * 0.15 // Staggered animation
        };
        setFloatingEmojis(prev => [...prev, newFloating]);
        
        // Remove the emoji from the animation state after the animation ends
        setTimeout(() => {
          setFloatingEmojis(prev => prev.filter(f => f.id !== newFloating.id));
        }, 1200); // Slightly longer than animation duration
      }
      
      // Add a pulse effect when selecting
      if (containerRef.current) {
        gsap.fromTo(
          containerRef.current,
          { scale: 0.95 },
          { scale: 1, duration: 0.4, ease: 'elastic.out(1, 0.3)' }
        );
      }
    }

    setCounts(newCounts);
    setSelectedEmoji(newSelected);
  };

  return (
    <motion.div
      ref={containerRef}
      className="relative p-4 mt-2 inline-block rounded-2xl bg-gradient-to-r from-gray-800/50 to-gray-700/50 backdrop-blur-sm border border-gray-700/30 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center mb-2 text-gray-300 text-sm font-medium">Rate this recipe</div>
      
      {/* Container for the floating emojis with Framer Motion */}
      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-visible pointer-events-none">
        <AnimatePresence>
          {floatingEmojis.map(item => (
            <motion.div
              key={item.id}
              className="absolute left-1/2 top-0 text-3xl"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={floatVariants}
              custom={item.delay}
              style={{ 
                x: `calc(-50% + ${item.offsetX}px)`,
                transitionDelay: `${item.delay}s`
              }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* Enhanced reaction buttons with Framer Motion */}
      <div className="flex justify-center gap-3">
        {Object.keys(counts).map((emoji) => (
          <motion.div
            key={emoji}
            className="relative"
            initial="initial"
            animate="animate"
            whileHover="hover"
            whileTap="tap"
            variants={emojiVariants}
          >
            <Badge
              badgeContent={counts[emoji] > 0 ? counts[emoji] : null}
              color="primary"
              sx={{ 
                '& .MuiBadge-badge': { 
                  color: '#fff',
                  fontWeight: 'bold',
                  boxShadow: '0 0 10px rgba(0,0,0,0.2)'
                } 
              }}
            >
              <motion.button
                onClick={() => handleReact(emoji)}
                aria-label={`react with ${emoji}`}
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${selectedEmoji === emoji ? 'bg-gradient-to-r from-blue-500/30 to-purple-500/30' : 'bg-gray-800/50'} border ${selectedEmoji === emoji ? 'border-blue-400' : 'border-gray-600'} shadow-md`}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                {emojiIcons[emoji] || emoji}
              </motion.button>
            </Badge>
            
            {/* Show emoji name on hover */}
            <motion.div 
              className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 whitespace-nowrap"
              initial={{ opacity: 0, y: -5 }}
              whileHover={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {emoji === '👍' ? 'Like' : 
               emoji === '❤️' ? 'Love' : 
               emoji === '😄' ? 'Smile' : 
               emoji === '🌟' ? 'Star' : 'Yummy'}
            </motion.div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}