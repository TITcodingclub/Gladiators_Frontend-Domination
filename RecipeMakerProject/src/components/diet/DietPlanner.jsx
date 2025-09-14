import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Activity, Target, Clock, Droplet, RefreshCw, Coffee, Utensils, ChevronDown, ChevronUp, Heart, Flame, Zap, Bookmark, Share2, X } from "lucide-react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import axiosInstance from "../../utils/axiosInstance";
import { useAuth } from "../../hooks/useAuth";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const MODEL_NAME = "gemini-1.5-pro";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

export default function DietPlanner() {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    age: "",
    weight: "",
    height: "",
    activityLevel: "moderate",
    goal: "maintain",
    dietaryPreference: "omnivore",
    mealPreference: "",
    allergies: "",
    medicalConditions: "",
    fitnessLevel: "moderate",
  });
  const [loading, setLoading] = useState(false);
  const [dietPlan, setDietPlan] = useState(null);
  const [activeSection, setActiveSection] = useState("form");
  const [savedPlans, setSavedPlans] = useState(() => {
    const saved = localStorage.getItem("savedDietPlans");
    return saved ? JSON.parse(saved) : [];
  });
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [error, setError] = useState("");
  const [savingToBackend, setSavingToBackend] = useState(false);
  const [sharingPlan, setSharingPlan] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);
  const dietPlanRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // GSAP animations setup
  useEffect(() => {
    if (dietPlan) {
      // Animate macros cards when they appear
      gsap.fromTo(".macro-card", 
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.6, ease: "power2.out" }
      );
      
      // Animate meal sections with scroll trigger
      gsap.utils.toArray(".meal-section").forEach((section, i) => {
        gsap.fromTo(section, 
          { x: i % 2 === 0 ? -50 : 50, opacity: 0 },
          { 
            x: 0, 
            opacity: 1, 
            duration: 0.8,
            scrollTrigger: {
              trigger: section,
              start: "top 80%",
              toggleActions: "play none none none"
            }
          }
        );
      });
    }
  }, [dietPlan]);

  // Save plans to localStorage when they change
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("savedDietPlans", JSON.stringify(savedPlans));
    }
  }, [savedPlans, currentUser]);
  
  // Fetch saved plans from backend for logged in users
  useEffect(() => {
    if (currentUser) {
      fetchSavedPlans();
    }
  }, [currentUser]);
  
  const fetchSavedPlans = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axiosInstance.get('/api/diet-plans');
      if (response.data.success) {
        setSavedPlans(response.data.dietPlans);
      }
    } catch (error) {
      console.error('Error fetching saved diet plans:', error);
      // Fallback to localStorage if API fails
      const loadedPlans = localStorage.getItem("savedDietPlans");
      if (loadedPlans) {
        setSavedPlans(JSON.parse(loadedPlans));
      }
    }
  };

  const generateDietPlan = async () => {
    setLoading(true);
    setError("");
    
    // Maximum number of retry attempts
    const MAX_RETRIES = 2;
    let retryCount = 0;
    let retryDelay = 2000; // Start with 2 seconds
    
    const attemptGeneration = async () => {
      try {
        if (!API_KEY) {
          setTimeout(() => {
            const enhancedMockPlan = {
              ...mockDietPlan,
              weeklyPlan: generateMockWeeklyPlan(),
              nutritionAnalysis: generateMockNutritionAnalysis(),
              exerciseRecommendations: generateMockExerciseRecommendations(formData.goal, formData.fitnessLevel)
            };
            setDietPlan(enhancedMockPlan);
            setLoading(false);
          }, 1500);
          return true;
        }

        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `
Generate a highly detailed personalized diet plan including:
- Age: ${formData.age}
- Weight: ${formData.weight} kg
- Height: ${formData.height} cm
- Activity Level: ${formData.activityLevel}
- Goal: ${formData.goal}
- Dietary Preference: ${formData.dietaryPreference} (vegan/vegetarian/omnivore/mix)
- Meal Preference: ${formData.mealPreference || 'None'}
${formData.allergies ? `- Allergies: ${formData.allergies}` : ''}
${formData.medicalConditions ? `- Medical Conditions: ${formData.medicalConditions}` : ''}
${formData.fitnessLevel ? `- Fitness Level: ${formData.fitnessLevel}` : ''}

Please include:
1. Daily calorie target
2. Macronutrient breakdown (protein, carbs, fats)
3. Hydration recommendation
4. Detailed meal plan for one day (Breakfast, Lunch, Dinner, Snacks)
5. 5 Nutrition Tips based on goals
6. Include alternatives for dietary restrictions
7. Weekly meal plan overview
8. Exercise recommendations based on goals

Return the result in JSON format as:
{
  "calories": number,
  "macros": { "protein": number, "carbs": number, "fats": number },
  "hydration": string,
  "meals": { "Breakfast": [string], "Lunch": [string], "Snack": [string], "Dinner": [string] },
  "tips": [string],
  "weeklyPlan": { "Monday": string, "Tuesday": string, "Wednesday": string, "Thursday": string, "Friday": string, "Saturday": string, "Sunday": string },
  "exerciseRecommendations": [string],
  "nutritionAnalysis": { "strengths": [string], "considerations": [string] }
}
`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = await response.text();

        // parse JSON safely
        const parsed = JSON.parse(text);
        
        // Add missing fields if API doesn't return them
        if (!parsed.weeklyPlan) parsed.weeklyPlan = generateMockWeeklyPlan();
        if (!parsed.nutritionAnalysis) parsed.nutritionAnalysis = generateMockNutritionAnalysis();
        if (!parsed.exerciseRecommendations) parsed.exerciseRecommendations = generateMockExerciseRecommendations(formData.goal, formData.fitnessLevel);
        
        setDietPlan(parsed);
        setActiveSection("results");
        return true; // Success
      } catch (err) {
        console.error("API Error:", err);
        
        // Check if it's a rate limit error (429)
        if (err.message && err.message.includes("429") && retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`Rate limit exceeded. Retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);
          setError(`Rate limit exceeded. Retrying in ${retryDelay/1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);
          
          // Wait for the retry delay
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          
          // Exponential backoff
          retryDelay *= 2;
          
          // Try again
          return await attemptGeneration();
        }
        
        // If we've exhausted retries or it's not a rate limit error, use fallback
        if (err.message && err.message.includes("429")) {
          setError("API rate limit exceeded. Using fallback diet plan instead.");
        } else {
          setError("Unable to generate diet plan. Using fallback plan instead.");
        }
        
        const enhancedMockPlan = {
          ...mockDietPlan,
          weeklyPlan: generateMockWeeklyPlan(),
          nutritionAnalysis: generateMockNutritionAnalysis(),
          exerciseRecommendations: generateMockExerciseRecommendations(formData.goal, formData.fitnessLevel)
        };
        setDietPlan(enhancedMockPlan);
        setActiveSection("results");
        return false; // Failed
      }
    };
    
    try {
      await attemptGeneration();
    } finally {
      setLoading(false);
    }
  };
  
  // Helper functions for mock data
  const generateMockWeeklyPlan = () => ({
    "Monday": "Protein focus: Higher protein meals with lean meats and legumes",
    "Tuesday": "Complex carbs: Whole grains and starchy vegetables",
    "Wednesday": "Healthy fats: Avocado, nuts, and olive oil",
    "Thursday": "Fiber focus: Beans, lentils, and high-fiber fruits",
    "Friday": "Antioxidant boost: Berries, leafy greens, and colorful vegetables",
    "Saturday": "Flexible day: Moderate treat meal allowed",
    "Sunday": "Prep day: Prepare meals for the upcoming week"
  });
  
  const generateMockNutritionAnalysis = () => ({
    "strengths": [
      "Balanced macronutrient profile",
      "Adequate protein for muscle maintenance",
      "Good variety of food groups",
      "Includes essential micronutrients"
    ],
    "considerations": [
      "Consider timing carbohydrates around workouts",
      "May need to adjust calories based on progress",
      "Monitor hydration levels throughout the day",
      "Consider supplementing vitamin D and omega-3s"
    ]
  });
  
  const generateMockExerciseRecommendations = (goal, fitnessLevel) => {
    const recommendations = [];
    
    if (goal === "lose") {
      recommendations.push(
        "Incorporate 3-4 days of moderate-intensity cardio (30-45 minutes)",
        "Add 2-3 days of full-body resistance training",
        "Include HIIT workouts 1-2 times per week for metabolic boost"
      );
    } else if (goal === "gain" || goal === "muscle") {
      recommendations.push(
        "Focus on progressive overload with 4-5 days of resistance training",
        "Limit cardio to 1-2 sessions of 20-30 minutes per week",
        "Ensure adequate post-workout nutrition with protein and carbs"
      );
    } else { // maintain
      recommendations.push(
        "Balance 2-3 days of resistance training with 2-3 days of cardio",
        "Include flexibility and mobility work 2 times per week",
        "Consider active recovery activities like walking or yoga"
      );
    }
    
    if (fitnessLevel === "beginner") {
      recommendations.push("Start with bodyweight exercises before progressing to weights");
    } else if (fitnessLevel === "advanced") {
      recommendations.push("Consider periodization in your training program for continued progress");
    }
    
    return recommendations;
  };

  const resetForm = () => {
    setFormData({
      age: "",
      weight: "",
      height: "",
      activityLevel: "moderate",
      goal: "maintain",
      dietaryPreference: "omnivore",
      mealPreference: "",
      allergies: "",
      medicalConditions: "",
      fitnessLevel: "moderate",
    });
    setDietPlan(null);
    setActiveSection("form");
    setShowAdvancedOptions(false);
  };
  
  const savePlan = async () => {
    if (!dietPlan) return;
    
    const planToSave = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      name: `Diet Plan (${formData.goal}) - ${new Date().toLocaleDateString()}`,
      plan: dietPlan,
      formData: {...formData}
    };
    
    // Show save confirmation animation
    gsap.to(".save-confirmation", {
      opacity: 1, 
      y: 0, 
      duration: 0.5,
      onComplete: () => {
        setTimeout(() => {
          gsap.to(".save-confirmation", {opacity: 0, y: 10, duration: 0.5});
        }, 2000);
      }
    });
    
    if (currentUser) {
      // Save to backend if user is logged in
      try {
        setSavingToBackend(true);
        const response = await axiosInstance.post('/api/diet-plans', {
          name: planToSave.name,
          formData: planToSave.formData,
          plan: planToSave.plan
        });
        
        if (response.data.success) {
          // Refresh the saved plans list
          fetchSavedPlans();
        }
      } catch (error) {
        console.error('Error saving diet plan to backend:', error);
        // Fallback to localStorage if API fails
        setSavedPlans(prev => [planToSave, ...prev]);
      } finally {
        setSavingToBackend(false);
      }
    } else {
      // Save to localStorage if user is not logged in
      setSavedPlans(prev => [planToSave, ...prev]);
    }
  };
  
  const deleteSavedPlan = async (id) => {
    if (currentUser) {
      // Delete from backend if user is logged in
      try {
        const response = await axiosInstance.delete(`/api/diet-plans/${id}`);
        if (response.data.success) {
          // Refresh the saved plans list
          fetchSavedPlans();
        }
      } catch (error) {
        console.error('Error deleting diet plan from backend:', error);
      }
    } else {
      // Delete from localStorage if user is not logged in
      setSavedPlans(prev => prev.filter(plan => plan.id !== id));
    }
  };
  
  const loadSavedPlan = async (plan) => {
    if (currentUser && plan.id) {
      // Load from backend if user is logged in and we have an ID
      try {
        const response = await axiosInstance.get(`/api/diet-plans/${plan.id}`);
        if (response.data.success) {
          setFormData(response.data.dietPlan.formData);
          setDietPlan(response.data.dietPlan.plan);
          setActiveSection("results");
        }
      } catch (error) {
        console.error('Error loading diet plan from backend:', error);
        // Fallback to the plan object we already have
        setFormData(plan.formData);
        setDietPlan(plan.plan);
        setActiveSection("results");
      }
    } else {
      // Use the plan object directly
      setFormData(plan.formData);
      setDietPlan(plan.plan);
      setActiveSection("results");
    }
  };
  
  const toggleMealExpansion = (mealName) => {
    setExpandedMeal(expandedMeal === mealName ? null : mealName);
  };
  
  const toggleAdvancedOptions = () => {
    setShowAdvancedOptions(!showAdvancedOptions);
  };
  

  
  const sharePlan = async () => {
    if (!dietPlan) return;
    
    try {
      setSharingPlan(true);
      
      if (currentUser) {
        // For logged in users, create a shareable link via backend
        const response = await axiosInstance.post('/api/diet-plans', {
          name: `Shared Diet Plan (${new Date().toLocaleDateString()})`,
          formData: { ...formData },
          plan: { ...dietPlan }
        });
        
        if (response.data.success) {
          const planId = response.data.dietPlan._id;
          const shareableUrl = `${window.location.origin}/shared-diet-plan/${planId}`;
          setShareUrl(shareableUrl);
          setShowShareModal(true);
        }
      } else {
        // For non-logged in users, create a temporary shareable link
        const planData = {
          name: `Shared Diet Plan (${new Date().toLocaleDateString()})`,
          formData: { ...formData },
          plan: { ...dietPlan }
        };
        
        // Store in localStorage with a unique ID
        const shareId = `share_${Date.now().toString()}`;
        const sharedPlans = JSON.parse(localStorage.getItem('sharedDietPlans') || '{}');
        sharedPlans[shareId] = planData;
        localStorage.setItem('sharedDietPlans', JSON.stringify(sharedPlans));
        
        const shareableUrl = `${window.location.origin}/shared-diet-plan?id=${shareId}`;
        setShareUrl(shareableUrl);
        setShowShareModal(true);
      }
    } catch (error) {
      console.error('Error sharing diet plan:', error);
      setError('Failed to share diet plan. Please try again.');
    } finally {
      setSharingPlan(false);
    }
  };
  
  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        // Show copied notification
        const copyBtn = document.getElementById('copy-btn');
        if (copyBtn) {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => {
            copyBtn.textContent = 'Copy Link';
          }, 2000);
        }
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  // Navigation tabs component
  const NavTabs = () => (
    <div className="flex justify-center mb-6 bg-gray-800 p-1 rounded-lg">
      {[
        { id: "form", label: "Create Plan", icon: Target },
        { id: "results", label: "Current Plan", icon: Utensils, disabled: !dietPlan },
        { id: "saved", label: "Saved Plans", icon: Bookmark }
      ].map(tab => (
        <motion.button
          key={tab.id}
          onClick={() => setActiveSection(tab.id)}
          disabled={tab.disabled}
          className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === tab.id ? 'bg-green-600 text-white' : 'text-gray-300 hover:text-white'} ${tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          whileHover={!tab.disabled ? { scale: 1.05 } : {}}
          whileTap={!tab.disabled ? { scale: 0.95 } : {}}
        >
          <tab.icon size={16} />
          {tab.label}
        </motion.button>
      ))}
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mx-auto my-8 p-6 bg-gray-900 rounded-2xl shadow-lg text-white relative overflow-hidden"
    >
      {/* Animated background gradient */}
      
      {/* Header */}
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-4">
          <motion.h2 
            className="text-3xl font-bold text-green-400 flex items-center gap-2"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <Utensils size={28} className="text-green-500" /> 
            <span>AI Diet Planner</span>
          </motion.h2>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <RefreshCw
              size={22}
              className="text-gray-400 cursor-pointer hover:text-green-500 transition-colors"
              onClick={resetForm}
            />
          </motion.div>
        </div>
        
        <motion.p 
          className="text-gray-400 mb-6 max-w-2xl"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Your personalized AI-powered nutrition assistant. Get customized meal plans, nutrition advice, and exercise recommendations tailored to your goals.
        </motion.p>
        
        <NavTabs />
      </div>
      
      {/* Save confirmation toast */}
      <div className="save-confirmation fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg opacity-0 translate-y-10 z-50">
        Plan saved successfully!
      </div>
      
      {/* Share modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-lg p-6 max-w-md w-full text-gray-800"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Share Your Diet Plan</h3>
              <button 
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>
            
            <p className="mb-4 text-gray-600">Share this link with others to view your diet plan:</p>
            
            <div className="flex items-center mb-6">
              <input 
                type="text" 
                value={shareUrl} 
                readOnly 
                className="flex-1 border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button 
                id="copy-btn"
                onClick={copyShareLink}
                className="bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-r-md transition-all"
              >
                Copy Link
              </button>
            </div>
            
            <div className="flex justify-end">
              <button 
                onClick={() => setShowShareModal(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-md transition-all"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Main content area */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {activeSection === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Basic form fields */}
                {[
                  { name: "age", label: "Age", icon: Calendar },
                  { name: "weight", label: "Weight (kg)", icon: Activity },
                  { name: "height", label: "Height (cm)", icon: Target },
                  { name: "activityLevel", label: "Activity Level", icon: Clock, select: true, options: ["sedentary","light","moderate","active","extreme"] },
                  { name: "goal", label: "Goal", icon: Target, select: true, options: ["lose","maintain","gain","muscle"] },
                  { name: "dietaryPreference", label: "Dietary Preference", icon: Utensils, select: true, options: ["vegan","vegetarian","omnivore","mix"] },
                  { name: "mealPreference", label: "Meal Preference", icon: Coffee, placeholder: "e.g., low-carb, high-protein, etc." },
                ].map(({ name, label, icon: Icon, select, options, placeholder }, index) => (
                  <motion.div 
                    key={name} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05, duration: 0.3 }}
                    className="form-field"
                  >
                    <label className="block mb-1 text-gray-300 font-medium">{label}</label>
                    <div className="flex items-center gap-2 bg-gray-800 rounded-md p-2 border border-gray-700 focus-within:border-green-500 transition-colors">
                      <Icon size={20} className="text-green-400" />
                      {select ? (
                        <select
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          className="bg-gray-800 flex-1 text-white outline-none px-2 py-1 rounded-md"
                        >
                          {options.map((o) => (
                            <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          placeholder={placeholder || label}
                          className="bg-gray-800 flex-1 outline-none text-white px-2 py-1 rounded-md"
                        />
                      )}
                    </div>
                  </motion.div>
                ))}
                
                {/* Advanced options toggle */}
                <motion.div 
                  className="md:col-span-2 mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <button 
                    onClick={toggleAdvancedOptions}
                    className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
                  >
                    {showAdvancedOptions ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    {showAdvancedOptions ? "Hide" : "Show"} Advanced Options
                  </button>
                </motion.div>
                
                {/* Advanced options */}
                <AnimatePresence>
                  {showAdvancedOptions && (
                    <>
                      {[
                        { name: "allergies", label: "Allergies", icon: Target, placeholder: "e.g., nuts, dairy, gluten" },
                        { name: "medicalConditions", label: "Medical Conditions", icon: Heart, placeholder: "e.g., diabetes, hypertension" },
                        { name: "fitnessLevel", label: "Fitness Level", icon: Activity, select: true, options: ["beginner","moderate","advanced"] },
                      ].map(({ name, label, icon: Icon, select, options, placeholder }, index) => (
                        <motion.div 
                          key={name} 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="form-field md:col-span-2 overflow-hidden"
                        >
                          <label className="block mb-1 text-gray-300 font-medium">{label}</label>
                          <div className="flex items-center gap-2 bg-gray-800 rounded-md p-2 border border-gray-700 focus-within:border-green-500 transition-colors">
                            <Icon size={20} className="text-green-400" />
                            {select ? (
                              <select
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                className="bg-gray-800 flex-1 text-white outline-none px-2 py-1 rounded-md"
                              >
                                {options.map((o) => (
                                  <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                                ))}
                              </select>
                            ) : (
                              <input
                                type="text"
                                name={name}
                                value={formData[name]}
                                onChange={handleChange}
                                placeholder={placeholder || label}
                                className="bg-gray-800 flex-1 outline-none text-white px-2 py-1 rounded-md"
                              />
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Error message */}
              {error && (
                <motion.div 
                  className="md:col-span-2 p-3 bg-red-900/30 border border-red-700/50 text-red-300 rounded-lg text-sm flex items-center justify-between mt-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>{error}</span>
                  <button onClick={() => setError("")} className="text-red-300 hover:text-red-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </motion.div>
              )}
              
              {/* Generate button */}
                <motion.button
                  onClick={generateDietPlan}
                  disabled={loading || !formData.age || !formData.weight || !formData.height}
                  className="md:col-span-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 py-3 rounded-lg text-white font-bold mt-4 flex justify-center items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      Generate AI Diet Plan
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          )}

          {activeSection === "results" && dietPlan && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="results-container"
              ref={dietPlanRef}
            >
              {/* Action buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <motion.button
                  onClick={savePlan}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Bookmark size={16} />
                  Save Plan
                </motion.button>
                

                
                <motion.button
                  onClick={sharePlan}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-600 hover:bg-gray-700 rounded-lg text-sm font-medium transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Share2 size={16} />
                  Share
                </motion.button>
              </div>

              {/* Macros */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Calories", value: `${dietPlan.calories} kcal`, icon: Flame, color: "from-orange-500 to-red-500" },
                  { label: "Protein", value: `${dietPlan.macros.protein}g`, icon: Target, color: "from-blue-500 to-indigo-500" },
                  { label: "Carbs", value: `${dietPlan.macros.carbs}g`, icon: Coffee, color: "from-yellow-500 to-amber-500" },
                  { label: "Fats", value: `${dietPlan.macros.fats}g`, icon: Droplet, color: "from-green-500 to-emerald-500" },
                ].map((item, index) => (
                  <motion.div 
                    key={item.label}
                    className={`macro-card p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-white text-xs font-medium">{item.label}</p>
                      <item.icon size={18} className="text-white opacity-80" />
                    </div>
                    <p className="text-white text-xl font-bold mt-1">{item.value}</p>
                  </motion.div>
                ))}
              </div>

              {/* Hydration */}
              <motion.div 
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-700/30 rounded-xl mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Droplet size={24} className="text-blue-400" />
                <div>
                  <h4 className="font-medium text-blue-300">Hydration</h4>
                  <p className="text-white">{dietPlan.hydration}</p>
                </div>
              </motion.div>

              {/* Tabs for different sections */}
              <div className="mb-6">
                <div className="flex border-b border-gray-700 mb-4">
                  {[
                    { id: "meals", label: "Daily Meals" },
                    { id: "weekly", label: "Weekly Plan" },
                    { id: "exercise", label: "Exercise" },
                    { id: "analysis", label: "Analysis" },
                  ].map((tab, index) => (
                    <button
                      key={tab.id}
                      onClick={() => setExpandedMeal(tab.id)}
                      className={`px-4 py-2 font-medium text-sm transition-colors ${expandedMeal === tab.id ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                
                <AnimatePresence mode="wait">
                  {/* Daily Meals Section */}
                  {expandedMeal === "meals" && (
                    <motion.div
                      key="meals"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {Object.entries(dietPlan.meals).map(([mealName, items], index) => (
                        <motion.div 
                          key={mealName} 
                          className="meal-section mb-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                          initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <h4 className="font-bold text-green-400 flex items-center gap-2 mb-2">
                            <Clock size={18} /> 
                            {mealName}
                          </h4>
                          <ul className="pl-6 list-disc text-white space-y-1">
                            {items.map((item, idx) => (
                              <li key={idx} className="text-gray-200">{item}</li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {/* Weekly Plan Section */}
                  {expandedMeal === "weekly" && dietPlan.weeklyPlan && (
                    <motion.div
                      key="weekly"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="space-y-3"
                    >
                      {Object.entries(dietPlan.weeklyPlan).map(([day, plan], index) => (
                        <motion.div 
                          key={day} 
                          className="p-3 bg-gray-800/50 rounded-lg border border-gray-700/50"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                        >
                          <h4 className="font-bold text-blue-400">{day}</h4>
                          <p className="text-gray-200">{plan}</p>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                  
                  {/* Exercise Recommendations Section */}
                  {expandedMeal === "exercise" && dietPlan.exerciseRecommendations && (
                    <motion.div
                      key="exercise"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="p-4 bg-gray-800/50 rounded-lg border border-gray-700/50"
                    >
                      <h4 className="font-bold text-purple-400 mb-3 flex items-center gap-2">
                        <Activity size={20} /> Exercise Recommendations
                      </h4>
                      <ul className="space-y-2">
                        {dietPlan.exerciseRecommendations.map((rec, idx) => (
                          <motion.li 
                            key={idx} 
                            className="flex items-start gap-2"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                          >
                            <div className="mt-1 min-w-4 h-4 w-4 rounded-full bg-purple-500 flex-shrink-0"></div>
                            <p className="text-gray-200">{rec}</p>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                  
                  {/* Nutrition Analysis Section */}
                  {expandedMeal === "analysis" && dietPlan.nutritionAnalysis && (
                    <motion.div
                      key="analysis"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="grid grid-cols-1 md:grid-cols-2 gap-4"
                    >
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg border border-green-700/30"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <h4 className="font-bold text-green-400 mb-2">Strengths</h4>
                        <ul className="space-y-1">
                          {dietPlan.nutritionAnalysis.strengths.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="mt-1 min-w-4 h-4 w-4 rounded-full bg-green-500 flex-shrink-0"></div>
                              <p className="text-gray-200">{item}</p>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                      
                      <motion.div 
                        className="p-4 bg-gradient-to-br from-amber-900/30 to-amber-800/20 rounded-lg border border-amber-700/30"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                      >
                        <h4 className="font-bold text-amber-400 mb-2">Considerations</h4>
                        <ul className="space-y-1">
                          {dietPlan.nutritionAnalysis.considerations.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="mt-1 min-w-4 h-4 w-4 rounded-full bg-amber-500 flex-shrink-0"></div>
                              <p className="text-gray-200">{item}</p>
                            </li>
                          ))}
                        </ul>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Tips */}
              <motion.div 
                className="mt-6 p-4 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl border border-gray-700/50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="font-bold mb-3 text-yellow-400 flex items-center gap-2">
                  <Zap size={18} /> Nutrition Tips
                </h4>
                <ul className="space-y-2">
                  {dietPlan.tips.map((tip, idx) => (
                    <motion.li 
                      key={idx} 
                      className="flex items-start gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6 + idx * 0.1 }}
                    >
                      <div className="mt-1 min-w-4 h-4 w-4 rounded-full bg-yellow-500 flex-shrink-0"></div>
                      <p className="text-gray-200">{tip}</p>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
          )}
          
          {activeSection === "saved" && (
            <motion.div
              key="saved"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-green-400 mb-4">Your Saved Plans</h3>
              
              {savedPlans.length === 0 ? (
                <motion.div 
                  className="text-center py-10 text-gray-400"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <Bookmark size={40} className="mx-auto mb-4 opacity-30" />
                  <p>You don't have any saved plans yet.</p>
                  <p className="mt-2">Create a plan and save it to see it here!</p>
                </motion.div>
              ) : (
                <div className="space-y-4">
                  {savedPlans.map((plan, index) => (
                    <motion.div 
                      key={plan.id} 
                      className="p-4 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-500 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-white">{plan.name}</h4>
                          <p className="text-gray-400 text-sm">{plan.date}</p>
                          <div className="flex gap-2 mt-2 text-xs">
                            <span className="px-2 py-0.5 bg-blue-900/50 text-blue-300 rounded-full">
                              {plan.formData.goal}
                            </span>
                            <span className="px-2 py-0.5 bg-green-900/50 text-green-300 rounded-full">
                              {plan.formData.dietaryPreference}
                            </span>
                            <span className="px-2 py-0.5 bg-purple-900/50 text-purple-300 rounded-full">
                              {plan.plan.calories} kcal
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <motion.button
                            onClick={() => loadSavedPlan(plan)}
                            className="p-1.5 bg-green-600 hover:bg-green-700 rounded-md text-white"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <Activity size={16} />
                          </motion.button>
                          <motion.button
                            onClick={() => deleteSavedPlan(plan.id)}
                            className="p-1.5 bg-red-600 hover:bg-red-700 rounded-md text-white"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <RefreshCw size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// Mock diet plan fallback with enhanced data
const mockDietPlan = {
  calories: 2200,
  macros: { protein: 150, carbs: 250, fats: 70 },
  hydration: "Drink 2.5-3 liters water daily",
  meals: {
    "Breakfast": [
      "Oatmeal (1 cup) with almond milk and berries", 
      "2 boiled eggs", 
      "1 medium apple"
    ],
    "Lunch": [
      "Grilled chicken breast (150g)", 
      "Brown rice (1 cup)", 
      "Steamed broccoli and carrots",
      "Olive oil dressing (1 tbsp)"
    ],
    "Snack": [
      "Greek yogurt (1 cup) with honey and walnuts",
      "Protein shake with banana"
    ],
    "Dinner": [
      "Grilled salmon (150g)", 
      "Quinoa (3/4 cup)", 
      "Mixed green salad with avocado",
      "Lemon and herb dressing"
    ]
  },
  tips: [
    "Include protein with every meal to support muscle maintenance",
    "Time carbohydrates around workouts for optimal energy",
    "Include healthy fats for satiety and hormone production",
    "Stay consistent with meal timing to regulate blood sugar",
    "Prioritize whole foods over processed alternatives"
  ]
};
