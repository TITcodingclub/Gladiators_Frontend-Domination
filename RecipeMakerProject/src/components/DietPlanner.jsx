import { useState } from 'react';
import { Box, Typography, Button, TextField, CircularProgress, Chip, Divider } from '@mui/material';
import { FiActivity, FiTarget, FiCalendar, FiRefreshCw, FiClock } from 'react-icons/fi';
import { MdFastfood, MdOutlineWaterDrop, MdOutlineFoodBank, MdOutlineLocalFireDepartment } from 'react-icons/md';
import { GoogleGenerativeAI } from '@google/generative-ai';
import {motion} from 'framer-motion'

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || ""; // Use environment variable

export default function DietPlanner() {
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [formData, setFormData] = useState({
    age: '',
    weight: '',
    height: '',
    activityLevel: 'moderate',
    goal: 'maintain',
    dietaryRestrictions: '',
    mealPreference: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateDietPlan = async () => {
    setLoading(true);
    try {
      // If API_KEY is not set, use mock data instead of actual API call
      if (!API_KEY) {
        setTimeout(() => {
          setDietPlan(mockDietPlan);
          setLoading(false);
        }, 1500);
        return;
      }

      // Real API implementation
      const genAI = new GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: MODEL_NAME });

      const prompt = `Generate a personalized diet plan based on the following information:\n
      Age: ${formData.age}\n
      Weight: ${formData.weight} kg\n
      Height: ${formData.height} cm\n
      Activity Level: ${formData.activityLevel}\n
      Goal: ${formData.goal}\n
      Dietary Restrictions: ${formData.dietaryRestrictions || 'None'}\n
      Meal Preferences: ${formData.mealPreference || 'None'}\n
      Please provide a structured diet plan with:\n
      1. Daily calorie target\n
      2. Macronutrient breakdown (protein, carbs, fats)\n
      3. Meal plan for one day (breakfast, lunch, dinner, snacks)\n
      4. Hydration recommendation\n
      5. 2-3 specific nutrition tips based on their goals`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse the AI response into structured data
      // This is a simplified parsing logic and might need adjustment based on actual AI output
      const parsedPlan = parseAIResponse(text);
      setDietPlan(parsedPlan);
    } catch (error) {
      console.error('Error generating diet plan:', error);
      // Fallback to mock data on error
      setDietPlan(mockDietPlan);
    } finally {
      setLoading(false);
    }
  };

  // Simple parser for AI response - would need to be adapted to actual AI output format
  const parseAIResponse = () => {
    // This is a placeholder implementation
    // In a real app, you would parse the AI text response into structured data
    return mockDietPlan;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      <Box
        sx={{
          backdropFilter: 'blur(10px)',
          borderRadius: '24px',
          border: '1px solid rgba(255,255,255,0.1)',
          padding: { xs: 3, md: 4 },
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        {/* Title with icon */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <MdOutlineFoodBank size={28} className="text-green-500 mr-2" />
          <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold', color: '#22c55e' }}>
            AI Diet Planner
          </Typography>
        </Box>

        {!dietPlan ? (
          <Box>
            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary' }}>
              Get a personalized diet plan based on your goals and preferences.
            </Typography>

            {/* Form */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2, mb: 3 }}>
              <TextField
                label="Age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <FiCalendar className="mr-2 text-gray-400" />,
                }}
              />
              <TextField
                label="Weight (kg)"
                name="weight"
                type="number"
                value={formData.weight}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <FiActivity className="mr-2 text-gray-400" />,
                }}
              />
              <TextField
                label="Height (cm)"
                name="height"
                type="number"
                value={formData.height}
                onChange={handleChange}
                variant="outlined"
                size="small"
                InputProps={{
                  startAdornment: <FiTarget className="mr-2 text-gray-400" />,
                }}
              />
              <TextField
                select
                label="Activity Level"
                name="activityLevel"
                value={formData.activityLevel}
                onChange={handleChange}
                variant="outlined"
                size="small"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="sedentary">Sedentary</option>
                <option value="light">Lightly Active</option>
                <option value="moderate">Moderately Active</option>
                <option value="active">Very Active</option>
                <option value="extreme">Extremely Active</option>
              </TextField>
              <TextField
                select
                label="Goal"
                name="goal"
                value={formData.goal}
                onChange={handleChange}
                variant="outlined"
                size="small"
                SelectProps={{
                  native: true,
                }}
              >
                <option value="lose">Weight Loss</option>
                <option value="maintain">Maintain Weight</option>
                <option value="gain">Weight Gain</option>
                <option value="muscle">Build Muscle</option>
              </TextField>
              <TextField
                label="Dietary Restrictions"
                name="dietaryRestrictions"
                value={formData.dietaryRestrictions}
                onChange={handleChange}
                placeholder="e.g., vegetarian, gluten-free"
                variant="outlined"
                size="small"
              />
              <TextField
                label="Meal Preferences"
                name="mealPreference"
                value={formData.mealPreference}
                onChange={handleChange}
                placeholder="e.g., high protein, low carb"
                variant="outlined"
                size="small"
                sx={{ gridColumn: { md: '1 / 3' } }}
              />
            </Box>

            <Button
              variant="contained"
              onClick={generateDietPlan}
              disabled={loading || !formData.age || !formData.weight || !formData.height}
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <MdOutlineLocalFireDepartment />}
              sx={{
                bgcolor: '#22c55e',
                '&:hover': { bgcolor: '#16a34a' },
                width: '100%',
                py: 1.5,
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 'bold'
              }}
            >
              {loading ? 'Generating Plan...' : 'Generate Diet Plan'}
            </Button>
          </Box>
        ) : (
          <Box>
            {/* Results */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 'bold' }}>
                Your Personalized Diet Plan
              </Typography>
              <Button
                startIcon={<FiRefreshCw />}
                onClick={() => setDietPlan(null)}
                size="small"
                sx={{ color: '#22c55e', textTransform: 'none' }}
              >
                Create New Plan
              </Button>
            </Box>

            {/* Macros Summary */}
            <Box sx={{ 
              display: 'grid', 
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, 
              gap: 2, 
              mb: 3,
              p: 2,
              bgcolor: 'rgba(34,197,94,0.08)',
              borderRadius: '16px'
            }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Daily Calories
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22c55e' }}>
                  {dietPlan.calories} kcal
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Protein
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22c55e' }}>
                  {dietPlan.macros.protein}g
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Carbs
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22c55e' }}>
                  {dietPlan.macros.carbs}g
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Fats
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#22c55e' }}>
                  {dietPlan.macros.fats}g
                </Typography>
              </Box>
            </Box>

            {/* Hydration */}
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, p: 2, bgcolor: 'rgba(59,130,246,0.08)', borderRadius: '16px' }}>
              <MdOutlineWaterDrop size={24} className="text-blue-500 mr-2" />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  Hydration Goal
                </Typography>
                <Typography variant="body2">
                  {dietPlan.hydration}
                </Typography>
              </Box>
            </Box>

            {/* Meal Plan */}
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
              <MdFastfood className="mr-2 text-green-500" /> Daily Meal Plan
            </Typography>

            {Object.entries(dietPlan.meals).map(([mealName, mealDetails]) => (
              <Box key={mealName} sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: '#22c55e', display: 'flex', alignItems: 'center' }}>
                  <FiClock className="mr-1" /> {mealName}
                </Typography>
                <Box sx={{ pl: 2, borderLeft: '2px solid rgba(34,197,94,0.3)', ml: 1, mt: 1 }}>
                  {mealDetails.map((item, index) => (
                    <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                      • {item}
                    </Typography>
                  ))}
                </Box>
              </Box>
            ))}

            {/* Tips */}
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2 }}>
              Nutrition Tips
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {dietPlan.tips.map((tip, index) => (
                <Chip 
                  key={index} 
                  label={tip} 
                  sx={{ 
                    bgcolor: 'rgba(34,197,94,0.1)', 
                    color: 'text.primary',
                    '& .MuiChip-label': { px: 2 }
                  }} 
                />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </motion.div>
  );
}

// Mock diet plan for testing or when API is not available
const mockDietPlan = {
  calories: 2200,
  macros: {
    protein: 165,
    carbs: 220,
    fats: 73
  },
  hydration: "Drink at least 2.5-3 liters (8-10 glasses) of water daily",
  meals: {
    "Breakfast (7-8 AM)": [
      "Greek yogurt (200g) with berries and 1 tbsp honey",
      "2 slices of whole grain toast with 1/2 avocado",
      "1 boiled egg"
    ],
    "Lunch (12-1 PM)": [
      "Grilled chicken breast (150g)",
      "Quinoa salad with mixed vegetables (1 cup)",
      "Olive oil and lemon dressing (1 tbsp)"
    ],
    "Snack (3-4 PM)": [
      "1 apple with 2 tbsp almond butter",
      "Handful of mixed nuts (30g)"
    ],
    "Dinner (7-8 PM)": [
      "Baked salmon (150g)",
      "Steamed broccoli and carrots (1 cup)",
      "Sweet potato (medium, 150g)"
    ],
    "Evening (if needed)": [
      "Protein shake with 1 scoop protein powder and almond milk",
      "Or chamomile tea (no calories)"
    ]
  },
  tips: [
    "Eat protein with every meal to support muscle maintenance",
    "Time your carbs around workouts for better energy and recovery",
    "Include healthy fats for hormone balance and satiety"
  ]
};