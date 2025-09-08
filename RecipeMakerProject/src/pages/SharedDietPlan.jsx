import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import axiosInstance from '../utils/axiosInstance';
import { Calendar, Activity, Target, Clock, Droplet, RefreshCw, Coffee, Utensils, ChevronDown, ChevronUp, Heart, Flame, Zap, Sun, Moon } from "lucide-react";

const SharedDietPlan = () => {
  const { id } = useParams();
  const location = useLocation();
  const [dietPlan, setDietPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('meals');
  const [expandedMeals, setExpandedMeals] = useState({});
  const [isDarkTheme, setIsDarkTheme] = useState(true); // Default to dark theme
  
  // Toggle theme function
  const toggleTheme = () => {
    setIsDarkTheme(prev => !prev);
  };

  useEffect(() => {
    const fetchSharedPlan = async () => {
      try {
        setLoading(true);
        
        // Check if we have an ID from URL params
        if (id) {
          // Fetch from backend API
          const response = await axiosInstance.get(`/api/diet-plans/shared/${id}`);
          if (response.data.success) {
            setDietPlan(response.data.dietPlan);
          } else {
            setError('Failed to load the shared diet plan');
          }
        } else {
          // Check for query param ID (for localStorage sharing)
          const queryParams = new URLSearchParams(location.search);
          const shareId = queryParams.get('id');
          
          if (shareId) {
            // Get from localStorage
            const sharedPlans = JSON.parse(localStorage.getItem('sharedDietPlans') || '{}');
            const planData = sharedPlans[shareId];
            
            if (planData) {
              setDietPlan({
                name: planData.name,
                plan: planData.plan,
                createdAt: new Date().toISOString()
              });
            } else {
              setError('This shared diet plan has expired or is no longer available');
            }
          } else {
            setError('Invalid diet plan link');
          }
        }
      } catch (error) {
        console.error('Error fetching shared diet plan:', error);
        setError('Failed to load the shared diet plan');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSharedPlan();
  }, [id, location.search]);

  const toggleMealExpansion = (mealType) => {
    setExpandedMeals(prev => ({
      ...prev,
      [mealType]: !prev[mealType]
    }));
  };

  // Apply theme to document body
  useEffect(() => {
    // Apply theme to body when component mounts or theme changes
    document.body.classList.toggle('dark-theme', isDarkTheme);
    document.body.classList.toggle('light-theme', !isDarkTheme);
    
    // Cleanup when component unmounts
    return () => {
      document.body.classList.remove('dark-theme');
      document.body.classList.remove('light-theme');
    };
  }, [isDarkTheme]);

  if (loading) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} transition-colors duration-300`}>Loading shared diet plan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}>Error</h2>
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-6 transition-colors duration-300`}>{error}</p>
          <a 
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!dietPlan) {
    return (
      <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900' : 'bg-gray-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className={`${isDarkTheme ? 'bg-gray-800' : 'bg-white'} p-8 rounded-lg shadow-md max-w-md w-full text-center transition-colors duration-300`}>
          <div className="text-yellow-500 text-5xl mb-4">🔍</div>
          <h2 className={`text-2xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}>Diet Plan Not Found</h2>
          <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-600'} mb-6 transition-colors duration-300`}>The diet plan you're looking for doesn't exist or has been removed.</p>
          <a 
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md transition-all"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  const plan = dietPlan.plan;

  return (
    <div className={`min-h-screen ${isDarkTheme ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} py-25 px-4 sm:px-6 lg:px-8 transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto relative">
        {/* Theme Toggle Button */}
        <motion.button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2 rounded-full ${isDarkTheme ? 'bg-gray-700 text-yellow-300' : 'bg-blue-100 text-blue-800'} z-10 transition-colors duration-300`}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkTheme ? <Sun size={20} /> : <Moon size={20} />}
        </motion.button>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${isDarkTheme ? 'bg-gray-800/80' : 'bg-white'} rounded-lg shadow-lg p-6 transition-colors duration-300`}
        >
          <div className="text-center mb-8">
            <h1 className={`text-3xl font-bold ${isDarkTheme ? 'text-white' : 'text-gray-800'} mb-2 transition-colors duration-300`}>{dietPlan.name}</h1>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-500'} transition-colors duration-300`}>
              Shared on {new Date(dietPlan.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Calories and Macros */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-blue-50 p-4 rounded-lg text-center"
            >
              <div className="text-blue-500 font-bold text-xl mb-1">{plan.calories}</div>
              <div className="text-gray-600 text-sm">Daily Calories</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="bg-red-50 p-4 rounded-lg text-center"
            >
              <div className="text-red-500 font-bold text-xl mb-1">{plan.macros.protein}g</div>
              <div className="text-gray-600 text-sm">Protein</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="bg-yellow-50 p-4 rounded-lg text-center"
            >
              <div className="text-yellow-500 font-bold text-xl mb-1">{plan.macros.carbs}g</div>
              <div className="text-gray-600 text-sm">Carbs</div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="bg-green-50 p-4 rounded-lg text-center"
            >
              <div className="text-green-500 font-bold text-xl mb-1">{plan.macros.fats}g</div>
              <div className="text-gray-600 text-sm">Fats</div>
            </motion.div>
          </div>

          {/* Hydration */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-blue-50 p-4 rounded-lg mb-8"
          >
            <div className="flex items-center mb-2">
              <Droplet className="text-blue-500 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Hydration</h3>
            </div>
            <p className="text-gray-700">{plan.hydration}</p>
          </motion.div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
            <button
              onClick={() => setActiveTab('meals')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'meals' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Utensils className="inline mr-1" size={16} /> Meals
            </button>
            <button
              onClick={() => setActiveTab('weekly')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'weekly' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Calendar className="inline mr-1" size={16} /> Weekly Plan
            </button>
            <button
              onClick={() => setActiveTab('exercise')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'exercise' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Activity className="inline mr-1" size={16} /> Exercise
            </button>
            <button
              onClick={() => setActiveTab('analysis')}
              className={`px-4 py-2 font-medium text-sm ${activeTab === 'analysis' ? 'text-blue-600 border-b-2 border-blue-500' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Target className="inline mr-1" size={16} /> Analysis
            </button>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Meals Tab */}
            {activeTab === 'meals' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="space-y-6">
                  {Object.entries(plan.meals).map(([mealType, items]) => (
                    <div key={mealType} className="bg-gray-50 rounded-lg p-4">
                      <div 
                        className="flex justify-between items-center cursor-pointer"
                        onClick={() => toggleMealExpansion(mealType)}
                      >
                        <h3 className="text-lg font-semibold text-gray-800">{mealType}</h3>
                        {expandedMeals[mealType] ? (
                          <ChevronUp size={20} className="text-gray-500" />
                        ) : (
                          <ChevronDown size={20} className="text-gray-500" />
                        )}
                      </div>
                      
                      {expandedMeals[mealType] && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mt-3"
                        >
                          <ul className="space-y-2 text-gray-700">
                            {items.map((item, index) => (
                              <li key={index} className="pl-4 border-l-2 border-blue-200">{item}</li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Weekly Plan Tab */}
            {activeTab === 'weekly' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-4"
              >
                {Object.entries(plan.weeklyPlan).map(([day, plan]) => (
                  <div key={day} className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">{day}</h3>
                    <p className="text-gray-700">{plan}</p>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Exercise Tab */}
            {activeTab === 'exercise' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Activity className="mr-2 text-blue-500" size={20} />
                    Exercise Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {plan.exerciseRecommendations.map((exercise, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <div className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                          {index + 1}
                        </div>
                        <span className="text-gray-700">{exercise}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}

            {/* Analysis Tab */}
            {activeTab === 'analysis' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="space-y-6"
              >
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Flame className="mr-2 text-green-500" size={20} />
                    Nutritional Strengths
                  </h3>
                  <ul className="space-y-2">
                    {plan.nutritionAnalysis.strengths.map((strength, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <div className="text-green-500 mr-2">✓</div>
                        <span className="text-gray-700">{strength}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                    <Zap className="mr-2 text-yellow-500" size={20} />
                    Considerations
                  </h3>
                  <ul className="space-y-2">
                    {plan.nutritionAnalysis.considerations.map((consideration, index) => (
                      <motion.li 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        className="flex items-start"
                      >
                        <div className="text-yellow-500 mr-2">!</div>
                        <span className="text-gray-700">{consideration}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )}
          </div>

          {/* Nutrition Tips */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 bg-indigo-50 p-4 rounded-lg"
          >
            <div className="flex items-center mb-3">
              <Heart className="text-indigo-500 mr-2" size={20} />
              <h3 className="text-lg font-semibold text-gray-800">Nutrition Tips</h3>
            </div>
            <ul className="space-y-2">
              {plan.tips.map((tip, index) => (
                <motion.li 
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + (index * 0.1) }}
                  className="text-gray-700 flex items-start"
                >
                  <span className="text-indigo-500 mr-2">•</span>
                  {tip}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default SharedDietPlan;