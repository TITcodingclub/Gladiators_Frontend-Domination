import React from 'react';
import { Card, CardHeader, CardContent, CardActions, Typography, Chip, Box } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EmojiReactions from './EmojiReactions';
import { motion } from 'framer-motion';

// Define the pulse animation for the tags
const pulseKeyframe = {
  '@keyframes pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.7 },
  },
};

/**
 * CookStep Component - Now a controlled component.
 * @param {object} props
 * @param {number} props.index - The step number.
 * @param {object} props.step - The step data { text, tags }.
 * @param {boolean} props.checked - The completion status of the step.
 * @param {Function} props.onToggle - Function to call when the check status is toggled.
 */
export default function CookStep({ index, step, checked, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        scale: checked ? 0.98 : 1,
        backgroundColor: checked ? '#1A1C2C' : '#222439',
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 20,
        delay: index * 0.1
      }}
      whileHover={{ 
        y: -4,
        boxShadow: checked 
          ? '0 6px 16px rgba(34, 197, 94, 0.2)' 
          : '0 12px 28px rgba(0, 0, 0, 0.12)',
        borderColor: 'rgba(59, 130, 246, 0.5)'
      }}
    >
      <Card 
        elevation={checked ? 1 : 4}
        sx={{ 
          mb: 3,
          bgcolor: 'inherit', 
          borderRadius: '12px',
          border: '1px solid',
          borderColor: checked ? 'transparent' : 'rgba(255, 255, 255, 0.1)',
          opacity: checked ? 0.85 : 1,
          boxShadow: checked 
            ? '0 4px 12px rgba(34, 197, 94, 0.15)' 
            : '0 8px 20px rgba(0, 0, 0, 0.08)',
          position: 'relative',
          overflow: 'visible',
          '&::before': checked ? {
            content: '""',
            position: 'absolute',
          top: '50%',
          left: '10%',
          right: '10%',
          height: '2px',
          background: 'rgba(34, 197, 94, 0.4)',
          zIndex: 1
        } : {}
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" component="h3" sx={{ color: '#fff', fontWeight: 'bold' }}>
            Step {index + 1}
          </Typography>
        }
        action={
          <Chip
            variant={checked ? 'filled' : 'outlined'}
            label={checked ? 'Completed' : 'Mark as Done'}
            onClick={onToggle}
            icon={checked ? <CheckCircleIcon /> : <RadioButtonUncheckedIcon />}
            color={checked ? 'success' : 'default'}
            sx={{
              color: '#fff',
              borderColor: 'rgba(255, 255, 255, 0.3)',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              '& .MuiChip-icon': {
                color: checked ? '#fff' : 'rgba(255, 255, 255, 0.5)',
              }
            }}
          />
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ 
        opacity: checked ? 0.5 : 1,
        transition: 'opacity 0.4s ease-in-out',
        }}>
        {/* Step Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 + (index * 0.1), duration: 0.5 }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: 'rgba(255, 255, 255, 0.7)',
              mt: 1,
              textDecoration: checked ? 'line-through' : 'none',
              textDecorationThickness: '2px',
            }}
          >
            {step.text}
          </Typography>
        </motion.div>

        {/* Tags */}
        <Box sx={{ mt: 3, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {step.tags.map((tag, i) => (
            <motion.div
              key={`motion-${tag}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ 
                delay: 0.3 + (index * 0.1) + (i * 0.1), 
                duration: 0.3,
                type: "spring",
                stiffness: 500
              }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              <Chip
                key={tag}
                label={`#${tag}`}
                size="small"
                sx={{
                  ...pulseKeyframe,
                  bgcolor: 'primary.main',
                  color: '#fff',
                  fontWeight: '500',
                }}
              />
            </motion.div>
          ))}
        </Box>
      </CardContent>
      
      {/* Emoji Reactions */}
      <CardActions sx={{ justifyContent: 'flex-start', px: 2, pt: 0 }}>
        <EmojiReactions stepId={index} />
      </CardActions>
    </Card>
    </motion.div>
  );
}