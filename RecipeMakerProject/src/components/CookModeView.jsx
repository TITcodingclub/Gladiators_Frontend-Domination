import React, { useState, useEffect } from 'react';
import CookStep from './CookStep';
import { Box, Typography, Grid } from '@mui/material';

/**
 * The parent component that renders the list of steps.
 * @param {object} props
 * @param {Array<object>} props.steps - The array of step objects.
 */
export default function CookModeView({ steps }) {
  // Add state to manage the checked status of all steps
  const [checkedStates, setCheckedStates] = useState([]);

  // Initialize or reset the checked states when the steps prop changes
  useEffect(() => {
    setCheckedStates(new Array(steps.length).fill(false));
  }, [steps]);

  // Create a handler to toggle the state of a specific step
  const handleToggleStep = (index) => {
    const newCheckedStates = [...checkedStates];
    newCheckedStates[index] = !newCheckedStates[index];
    setCheckedStates(newCheckedStates);
  };

  return (
    <Box 
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}
    >
      <Typography 
        variant="h4" 
        component="h2" 
        sx={{ 
          fontWeight: 'bold', 
          mb: 3, 
          color: '#fff',
          textAlign: 'center'
        }}
      >
        👨‍🍳 Cook Mode
      </Typography>

      <Grid container spacing={{ xs: 4, md: 6 }}>
        {steps.map((step, index) => (
          // FIX: Enhanced Grid item props for a more adaptive layout
          <Grid item xs={12} sm={6} md={4} key={index}>
            <CookStep
              index={index}
              step={step}
              // Pass the correct state and handler down as props
              checked={checkedStates[index]}
              onToggle={() => handleToggleStep(index)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}