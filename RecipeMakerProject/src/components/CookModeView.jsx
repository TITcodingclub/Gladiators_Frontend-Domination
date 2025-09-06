import React, { useState, useEffect } from 'react';
import CookStep from './CookStep';
import {
  Box, Typography, Grid, Paper, Divider, Checkbox, Button,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import TimerIcon from '@mui/icons-material/Timer';
import KitchenIcon from '@mui/icons-material/Kitchen';
import ListAltIcon from '@mui/icons-material/ListAlt';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { motion } from 'framer-motion';

export default function CookModeView({ steps = [], description = '', ingredients = [], cookTime = 'Unknown' }) {
  // Initialize with empty arrays with proper length to avoid uncontrolled to controlled warning
  const [checkedStates, setCheckedStates] = useState(() => Array(steps.length).fill(false));
  const [ingredientChecked, setIngredientChecked] = useState(() => Array(ingredients.length).fill(false));
  const [timerActive, setTimerActive] = useState(false);
  const [seconds, setSeconds] = useState(0);

  // Update state arrays when steps or ingredients change
  useEffect(() => {
    setCheckedStates(Array(steps.length).fill(false));
    setIngredientChecked(Array(ingredients.length).fill(false));
    setTimerActive(false);
    setSeconds(0);
  }, [steps, ingredients]);

  // Timer countdown
  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const handleToggleStep = (index) => {
    setCheckedStates((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const handleToggleIngredient = (index) => {
    setIngredientChecked((prev) => {
      const copy = [...prev];
      copy[index] = !copy[index];
      return copy;
    });
  };

  const formatTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{
      bgcolor: '#0f172a',
      color: '#fff',
      minHeight: '100vh',
      p: { xs: 2, md: 4 },
      borderRadius: 2,
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* --- Timer Button --- */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              variant="contained"
              startIcon={<TimerIcon />}
              onClick={() => setTimerActive(!timerActive)}
              sx={{
                bgcolor: timerActive ? '#f43f5e' : '#3b82f6',
                color: '#fff',
                borderRadius: 8,
                px: 3,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: timerActive ? '#e11d48' : '#2563eb',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              {timerActive ? 'Stop Timer' : 'Start Timer'} {timerActive && `(${formatTime(seconds)})`}
            </Button>
          </motion.div>
        </Box>
      </motion.div>

      {/* --- Recipe Info --- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper elevation={0} sx={{ p: 3, mb: 3, bgcolor: 'rgba(30,41,59,0.22)', borderRadius: 3 }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <Typography variant="body1" sx={{ color: '#fff', fontStyle: 'italic', textAlign: 'center', mb: 2, fontSize: '1.15rem' }}>
              {description}
            </Typography>
          </motion.div>
          <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ color: '#60a5fa' }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                  Cook Time: {cookTime}
                </Typography>
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <RestaurantIcon sx={{ color: '#60a5fa' }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                  Ingredients: {ingredients.length}
                </Typography>
              </Box>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ListAltIcon sx={{ color: '#60a5fa' }} />
                <Typography variant="body2" sx={{ color: '#cbd5e1' }}>
                  Steps: {steps.length}
                </Typography>
              </Box>
            </motion.div>
          </Box>
        </Paper>
      </motion.div>

      <Grid container spacing={3}>
        {/* --- Ingredients --- */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(30,41,59,0.22)', borderRadius: 3, height: '100%' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <KitchenIcon sx={{ color: '#60a5fa' }} />
                <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                  Ingredients
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: 2,
                        bgcolor: ingredientChecked[index] ? 'rgba(96,165,250,0.1)' : 'transparent',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <Checkbox
                        checked={ingredientChecked[index]}
                        onChange={() => handleToggleIngredient(index)}
                        sx={{
                          color: '#60a5fa',
                          '&.Mui-checked': {
                            color: '#60a5fa',
                          },
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          color: ingredientChecked[index] ? '#60a5fa' : '#cbd5e1',
                          textDecoration: ingredientChecked[index] ? 'line-through' : 'none',
                          transition: 'all 0.2s ease',
                        }}
                      >
                        {ingredient}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </Paper>
          </motion.div>
        </Grid>

        {/* --- Cooking Steps --- */}
        <Grid item xs={12} md={8}>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Paper elevation={0} sx={{ p: 3, bgcolor: 'rgba(30,41,59,0.22)', borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                <MenuBookIcon sx={{ color: '#60a5fa' }} />
                <Typography variant="h6" sx={{ color: '#f1f5f9', fontWeight: 'bold' }}>
                  Cooking Steps
                </Typography>
              </Box>
              <Divider sx={{ bgcolor: 'rgba(255,255,255,0.12)', mb: 2 }} />
              <Box sx={{ position: 'relative' }}>
                {/* Vertical gradient line */}
                <Box
                  sx={{
                    position: 'absolute',
                    left: '24px',
                    top: '10px',
                    bottom: '10px',
                    width: '2px',
                    background: 'linear-gradient(to bottom, rgba(96,165,250,0.7), rgba(96,165,250,0.1))',
                    zIndex: 0,
                  }}
                />
                <Box sx={{ maxHeight: '60vh', overflow: 'auto', pr: 2 }}>
                  {steps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index, duration: 0.4 }}
                    >
                      <CookStep
                        step={step}
                        index={index}
                        isChecked={checkedStates[index]}
                        onToggle={() => handleToggleStep(index)}
                      />
                    </motion.div>
                  ))}
                </Box>
              </Box>
            </Paper>
          </motion.div>
        </Grid>
      </Grid>
    </Box>
  );
}