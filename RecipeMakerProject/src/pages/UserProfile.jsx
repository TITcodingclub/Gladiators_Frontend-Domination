import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, Heart, Settings, User, Calendar, Phone, Activity, Thermometer, Droplet, Image, RefreshCw, ChefHat, Clock, Share2, PieChart, TrendingUp, Award, Bell, Palette, Save, Edit3 } from "lucide-react";
import { MdEmail, MdPhone, MdFavorite, MdFavoriteBorder, MdPhotoCamera, MdShare,MdRadioButtonUnchecked, MdRestaurant,MdCheckCircle } from "react-icons/md"; // Icons
import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { getAuth, signOut } from "firebase/auth";
import ThreadBackground from "../components/ThreadBackground";
import axios from "axios";
import { Utensils, Flame, Target, Plus, UserCircle, Stethoscope, Search } from "lucide-react";


export default function UserProfile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  const [user, setUser] = useState(firebaseUser || null);
  const [favorites, setFavorites] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showProfileImageSelector, setShowProfileImageSelector] = useState(false);
  const [unsplashImages, setUnsplashImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [imageSearchQuery, setImageSearchQuery] = useState("profile picture");
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [shareUrl, setShareUrl] = useState("");
  const [shareSuccess, setShareSuccess] = useState(false);
  const [copiedToClipboard, setCopiedToClipboard] = useState(false);
  
  // User statistics
  const [userStats, setUserStats] = useState({
    totalRecipes: 0,
    favoriteCount: 0,
    searchCount: 0,
    lastActive: "",
    topCategories: [],
    streakDays: 0
  });
  
  // Profile completion tracking
  const [profileCompletion, setProfileCompletion] = useState({
    percentage: 0,
    items: [
      { name: "Profile Picture", completed: false },
      { name: "Personal Info", completed: false },
      { name: "Medical History", completed: false },
      { name: "Favorite Recipes", completed: false },
      { name: "Notification Settings", completed: false }
    ]
  });

  // Extended profile details
  const [profile, setProfile] = useState({
    age: "",
    gender: "",
    weight: "",
    height: "",
    phone: "",
    bloodGroup: "",
    medicalHistory: "",
    bmi: "",
    dailyCalories: "",
    goalStatus: "",
  });

  const [editForm, setEditForm] = useState({
    dob: "",
    gender: "",
    weight: "",
    height: "",
    phone: "",
    bloodGroup: "",
    medicalHistory: "",
    dailyCalories: "",
    goalStatus: "",
    notificationsEnabled: true,
    privacy: "public",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!firebaseUser) return navigate("/login");

      try {
        const { data } = await axiosInstance.get("/api/users/me");

        const u = data.user || {};
        const p = data.profile || {};

          setUser((prev) => ({
            ...prev,
            name: u.name || prev?.displayName,
            email: u.email || prev?.email,
            photo: u.photo || prev?.photoURL,
          }));

          setProfile({
          age: p.age || "",
          gender: p.gender || "",
          weight: p.weight || "",
          height: p.height || "",
          phone: p.phone || "",
          bloodGroup: p.bloodGroup || "",
          medicalHistory: p.medicalHistory || "",
          bmi: p.bmi || "",
          dailyCalories: p.dailyCalories || "",
          goalStatus: p.goalStatus || "",
        });
        
        // Calculate profile completion
        const completionItems = [
          { name: "Profile Picture", completed: !!u.photo },
          { name: "Personal Info", completed: !!(p.age && p.gender && p.phone) },
          { name: "Medical History", completed: !!(p.medicalHistory && p.bloodGroup) },
          { name: "Favorite Recipes", completed: false }, // Will update when favorites are loaded
          { name: "Notification Settings", completed: true } // Default to true as it's a toggle
        ];
        
        const completedCount = completionItems.filter(item => item.completed).length;
        const percentage = Math.round((completedCount / completionItems.length) * 100);
        
        setProfileCompletion({
          percentage,
          items: completionItems
        });

        setEditForm({
          dob: p.dob || "",
          gender: p.gender || "",
          weight: p.weight || "",
          height: p.height || "",
          phone: p.phone || "",
          bloodGroup: p.bloodGroup || "",
          medicalHistory: p.medicalHistory || "",
          dailyCalories: p.dailyCalories || "",
          goalStatus: p.goalStatus || "",
          notificationsEnabled: typeof p.notificationsEnabled === 'boolean' ? p.notificationsEnabled : true,
          privacy: p.privacy || "public",
        });

        try {
          const recent = await axiosInstance.get('/api/users/searches/recent');
          const searches = recent.data?.searches || [];
          setRecentSearches(searches);
          const favs = searches.filter((s) => s.isFavorite);
          setFavorites(favs);
          
          // Update user statistics
          setUserStats({
            totalRecipes: searches.length,
            favoriteCount: favs.length,
            searchCount: searches.length,
            lastActive: searches.length > 0 ? new Date(searches[0].createdAt).toLocaleDateString() : 'Never',
            topCategories: getTopCategories(searches),
            streakDays: calculateStreak(searches)
          });
          
          // Update favorites completion status
          setProfileCompletion(prev => {
            const updatedItems = prev.items.map(item => 
              item.name === "Favorite Recipes" 
                ? { ...item, completed: favs.length > 0 } 
                : item
            );
            const completedCount = updatedItems.filter(item => item.completed).length;
            const percentage = Math.round((completedCount / updatedItems.length) * 100);
            
            return {
              percentage,
              items: updatedItems
            };
          });
        } catch (error) {
          console.error("Failed to fetch recent searches", error);
        }
      } catch (error) {
        console.error(error);
        navigate("/login");
      }
    };
    
    // Helper function to extract top categories from searches
    const getTopCategories = (searches) => {
      const categories = {};
      searches.forEach(search => {
        // Extract category from search query or title
        const query = search.query?.toLowerCase() || '';
        const words = query.split(' ');
        
        // Simple category extraction - could be improved with NLP
        const possibleCategories = ['breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'vegetarian', 'vegan', 'gluten-free', 'keto', 'healthy'];
        
        possibleCategories.forEach(category => {
          if (query.includes(category)) {
            categories[category] = (categories[category] || 0) + 1;
          }
        });
      });
      
      // Convert to array and sort by count
      return Object.entries(categories)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3); // Top 3 categories
    };
    
    // Calculate user streak based on search dates
    const calculateStreak = (searches) => {
      if (searches.length === 0) return 0;
      
      // Get unique dates of activity
      const dates = searches.map(s => new Date(s.createdAt).toDateString());
      const uniqueDates = [...new Set(dates)].map(d => new Date(d));
      uniqueDates.sort((a, b) => b - a); // Sort descending
      
      // Check if most recent date is today or yesterday
      const today = new Date().toDateString();
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const mostRecent = uniqueDates[0]?.toDateString();
      
      if (mostRecent !== today && mostRecent !== yesterday) {
        return 0; // Streak broken
      }
      
      // Count consecutive days
      let streak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const current = uniqueDates[i];
        const prev = uniqueDates[i-1];
        
        // Check if dates are consecutive
        const diffTime = prev - current;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          streak++;
        } else {
          break; // Streak broken
        }
      }
      
      return streak;
    };

    fetchUserData();
    // Refetch when window regains focus to stay in sync
    const onFocus = () => fetchUserData();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [firebaseUser, navigate]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const payload = {
        ...editForm,
        weight: editForm.weight ? Number(editForm.weight) : undefined,
        height: editForm.height ? Number(editForm.height) : undefined,
      };
      const { data } = await axiosInstance.put("/api/users/profile", payload);
      if (data && data.profile) {
        const p = data.profile;
        setProfile({
          age: p.age || "",
          gender: p.gender || "",
          weight: p.weight || "",
          height: p.height || "",
          phone: p.phone || "",
          bloodGroup: p.bloodGroup || "",
          medicalHistory: p.medicalHistory || "",
          bmi: p.bmi || "",
          dailyCalories: p.dailyCalories || "",
          goalStatus: p.goalStatus || "",
        });
        setEditMode(false);
      }
    } catch (error) {
      console.error("Failed to save profile", error);
    } finally {
      setSaving(false);
    }
  };

  // Fetch profile images from Unsplash
  const fetchUnsplashImages = async (query = imageSearchQuery) => {
    try {
      setLoadingImages(true);
      // Using the Unsplash API
      const response = await axios.get(
        `https://api.unsplash.com/search/photos?query=${query}&per_page=9&orientation=squarish`,
        {
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_KEY || '7sDvEbdILJIrn7gP0LMQQi7LZkTNCt8K4_C5-UYnClg'}`
          }
        }
      );
      setUnsplashImages(response.data.results);
    } catch (error) {
      console.error("Failed to fetch images from Unsplash", error);
    } finally {
      setLoadingImages(false);
    }
  };

  // Update profile image
  const updateProfileImage = async (imageUrl) => {
    try {
      setSaving(true);
      const { data } = await axiosInstance.put("/api/users/profile", { photo: imageUrl });
      if (data && data.user) {
        setUser(prev => ({
          ...prev,
          photo: imageUrl
        }));
      }
      setShowProfileImageSelector(false);
    } catch (error) {
      console.error("Failed to update profile image", error);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      try {
        await axios.post("/api/users/logout");
      } catch {(e)=>
      console.log(e)
      }
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

  if (!user)
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex justify-center items-center h-screen"
      >
        <p className="text-xl font-semibold text-white">Loading profile...</p>
      </motion.div>
    );

  return (
    <div className="relative py-24">
      <ThreadBackground />

      <div className="relative max-w-6xl mx-auto py-10 px-6 flex flex-col gap-8 z-10">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/10 p-6 rounded-3xl flex flex-col gap-6 shadow-2xl backdrop-blur-md"
        >
          {/* User info section with avatar and details */}
          <div className="flex flex-col sm:flex-row items-center gap-6 w-full">
            <div className="relative group">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={
                  user.photo ||
                  user.photoURL ||
                  `https://ui-avatars.com/api/?name=${user.name || user.displayName}`
                }
                alt="User Avatar"
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg object-cover"
              />
              <button 
                onClick={() => {
                  setShowProfileImageSelector(true);
                  fetchUnsplashImages();
                }}
                className="absolute bottom-0 right-0 bg-green-500 text-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-green-600"
              >
                <MdPhotoCamera size={20} />
              </button>
            </div>
            <div className="text-center sm:text-left w-full">
              <motion.h2
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold text-white"
              >
                {user.name || user.displayName || "User"}
              </motion.h2>

              {/* ✅ Email with icon */}
              <p className="text-white/70 mt-2 flex items-center gap-2">
                <MdEmail className="text-green-400" size={20} />
                <a href={`mailto:${user.email}`} className="hover:underline">
                  {user.email}
                </a>
              </p>

              {/* ✅ Phone with icon */}
              {profile.phone && (
                <p className="text-white/70 mt-1 flex items-center gap-2">
                  <MdPhone className="text-green-400" size={20} />
                  <a href={`tel:${profile.phone}`} className="hover:underline">
                    {profile.phone}
                  </a>
                </p>
              )}
            </div>
          </div>
          
          {/* Profile completion progress */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="w-full bg-white/5 p-4 rounded-xl backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-medium">Profile Completion</h3>
              <span className="text-white font-bold text-lg">{profileCompletion.percentage}%</span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion.percentage}%` }}
                transition={{ delay: 0.5, duration: 1 }}
                className="h-full rounded-full bg-gradient-to-r from-green-400 to-blue-500"
              />
            </div>
            
            {/* Completion items */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {profileCompletion.items.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  {item.completed ? (
                    <div className="text-green-400"><MdCheckCircle size={18} /></div>
                  ) : (
                    <div className="text-white/30"><MdRadioButtonUnchecked size={18} /></div>
                  )}
                  <span className={`text-sm ${item.completed ? 'text-white' : 'text-white/50'}`}>
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Profile Image Selector Modal */}
        <AnimatePresence>
          {showProfileImageSelector && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowProfileImageSelector(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1d1f31] rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Choose Profile Picture</h2>
                  <button 
                    onClick={() => setShowProfileImageSelector(false)}
                    className="text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>

                {/* Search input */}
                <div className="flex gap-2 mb-6">
                  <input
                    type="text"
                    value={imageSearchQuery}
                    onChange={(e) => setImageSearchQuery(e.target.value)}
                    placeholder="Search for images..."
                    className="flex-1 bg-[#161825] border border-gray-700 rounded-lg px-4 py-2 text-white"
                  />
                  <button
                    onClick={() => fetchUnsplashImages()}
                    disabled={loadingImages}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
                  >
                    {loadingImages ? (
                      <RefreshCw className="animate-spin" size={18} />
                    ) : (
                      <Image size={18} />
                    )}
                    Search
                  </button>
                </div>

                {/* Image grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {loadingImages ? (
                    <div className="col-span-full flex justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
                    </div>
                  ) : unsplashImages.length > 0 ? (
                    unsplashImages.map((image) => (
                      <div 
                        key={image.id} 
                        className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-green-500 transition-all"
                        onClick={() => updateProfileImage(image.urls.regular)}
                      >
                        <img 
                          src={image.urls.small} 
                          alt={image.alt_description || "Unsplash image"}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <p className="col-span-full text-center text-white/70 py-8">
                      No images found. Try a different search term.
                    </p>
                  )}
                </div>

                <div className="mt-4 text-xs text-white/50 text-center">
                  Images provided by <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:underline">Unsplash</a>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe Activity Stats Dashboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-gradient-to-tr from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"></div>
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <PieChart className="text-green-400" size={24} /> Recipe Activity
          </h3>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard 
              icon={<ChefHat size={20} />} 
              label="Total Recipes" 
              value={userStats.totalRecipes} 
              color="from-blue-400 to-blue-500"
            />
            <StatCard 
              icon={<Heart size={20} />} 
              label="Favorites" 
              value={userStats.favoriteCount} 
              color="from-red-400 to-red-500"
            />
            <StatCard 
              icon={<TrendingUp size={20} />} 
              label="Streak" 
              value={`${userStats.streakDays} days`} 
              color="from-green-400 to-green-500"
            />
            <StatCard 
              icon={<Clock size={20} />} 
              label="Last Active" 
              value={userStats.lastActive} 
              color="from-purple-400 to-purple-500"
            />
          </div>
          
          {userStats.topCategories.length > 0 && (
            <div className="mt-4">
              <h4 className="text-lg font-semibold text-white mb-3">Top Categories</h4>
              <div className="flex flex-wrap gap-2">
                {userStats.topCategories.map((category, index) => (
                  <span 
                    key={index}
                    className="px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-green-400/80 to-green-500/80 text-white"
                  >
                    {category.name} ({category.count})
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {/* Activity chart */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3">Weekly Activity</h4>
            <div className="flex items-end justify-between h-32 gap-1">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
                // Generate random height for demo purposes - in real app, use actual data
                const height = Math.floor(Math.random() * 80) + 20;
                return (
                  <div key={day} className="flex flex-col items-center flex-1">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${height}%` }}
                      transition={{ delay: 0.1 * index, duration: 0.8 }}
                      className="w-full rounded-t-md bg-gradient-to-t from-green-400 to-green-300"
                    />
                    <span className="text-xs text-white/70 mt-2">{day}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </motion.div>
        
        {/* Nutrition Tracking Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-br from-purple-400/10 to-pink-500/10 rounded-full blur-3xl"></div>
          
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <Utensils className="text-purple-400" size={24} /> Nutrition Tracking
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Daily Calorie Intake */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Flame size={18} className="text-orange-400" /> Daily Calories
              </h4>
              
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold inline-block text-white">
                      {Math.floor(Math.random() * 500) + 1500} / 2000 kcal
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold inline-block text-white">
                      {Math.floor(Math.random() * 30) + 70}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-white/10">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.floor(Math.random() * 30) + 70}%` }}
                    transition={{ duration: 1 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-orange-400 to-red-500"
                  ></motion.div>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 mt-4">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/70">Protein</div>
                  <div className="text-sm font-bold text-white">{Math.floor(Math.random() * 30) + 70}g</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/70">Carbs</div>
                  <div className="text-sm font-bold text-white">{Math.floor(Math.random() * 50) + 150}g</div>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                  <div className="text-xs text-white/70">Fat</div>
                  <div className="text-sm font-bold text-white">{Math.floor(Math.random() * 20) + 40}g</div>
                </div>
              </div>
            </div>
            
            {/* Nutrient Goals */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                <Target size={18} className="text-blue-400" /> Nutrient Goals
              </h4>
              
              <div className="space-y-4">
                {['Protein', 'Fiber', 'Vitamin C', 'Iron'].map((nutrient, index) => {
                  const progress = Math.floor(Math.random() * 60) + 40;
                  return (
                    <div key={nutrient} className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white">{nutrient}</span>
                        <span className="text-xs text-white/70">{progress}%</span>
                      </div>
                      <div className="overflow-hidden h-1.5 text-xs flex rounded-full bg-white/10">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ delay: 0.1 * index, duration: 0.8 }}
                          className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-400 to-indigo-500"
                        ></motion.div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2">
                <Plus size={16} /> Track New Meal
              </button>
            </div>
          </div>
        </motion.div>
        
        {/* Extended Profile Info (read-only) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -left-20 -top-20 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-green-500/10 rounded-full blur-3xl"></div>
          
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <UserCircle className="text-blue-400" size={24} /> Personal Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCard 
              icon={<Calendar size={20} className="text-blue-400" />} 
              label="Age" 
              value={profile.age || "Not specified"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<User size={20} className="text-purple-400" />} 
              label="Gender" 
              value={profile.gender || "Not specified"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<Droplet size={20} className="text-red-400" />} 
              label="Blood Group" 
              value={profile.bloodGroup || "Not specified"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<Thermometer size={20} className="text-orange-400" />} 
              label="Weight" 
              value={profile.weight ? `${profile.weight} kg` : "Not specified"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<Activity size={20} className="text-green-400" />} 
              label="Height" 
              value={profile.height ? `${profile.height} cm` : "Not specified"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<Activity size={20} className="text-indigo-400" />} 
              label="BMI" 
              value={profile.bmi || "Not calculated"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<Flame size={20} className="text-yellow-400" />} 
              label="Daily Calories" 
              value={profile.dailyCalories ? `${profile.dailyCalories} kcal` : "Not calculated"} 
              onClick={() => setEditMode(true)}
            />
            <ProfileCard 
              icon={<Target size={20} className="text-pink-400" />} 
              label="Goals" 
              value={profile.goalStatus || "Not specified"} 
              onClick={() => setEditMode(true)}
            />
          </div>
          
          {/* Medical History Section */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl">
            <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Stethoscope size={18} className="text-red-400" /> Medical History
            </h4>
            <p className="text-white/80 p-3 bg-white/5 rounded-lg">
              {profile.medicalHistory || "No medical history provided. Click to add your medical information."}
            </p>
            <button 
              onClick={() => setEditMode(true)}
              className="mt-4 py-2 px-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2 w-full md:w-auto"
            >
              <Edit3 size={16} /> Update Medical Info
            </button>
          </div>
        </motion.div>

        {/* Settings Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/10 p-6 rounded-3xl backdrop-blur-md border border-white/20 shadow-xl relative overflow-hidden"
        >
          {/* Background decoration */}
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-gradient-to-br from-indigo-400/10 to-blue-500/10 rounded-full blur-3xl"></div>
          
          <h3 className="text-2xl font-bold mb-6 text-white flex items-center gap-2">
            <Settings className="text-indigo-400" size={24} /> Preferences
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Preferences */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Bell size={18} className="text-indigo-400" /> Notifications
              </h4>
              
              {['Recipe Recommendations', 'New Features', 'Health Tips', 'Weekly Summary'].map((item, index) => (
                <div key={item} className="flex items-center justify-between py-2 border-b border-white/10 last:border-0">
                  <span className="text-white">{item}</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only"
                      defaultChecked={index < 2}
                    />
                    <span className="w-10 h-5 bg-white/20 rounded-full shadow-inner relative transition-all">
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-md transition-transform ${index < 2 ? 'translate-x-5 bg-indigo-400' : ''}`}
                      ></span>
                    </span>
                  </label>
                </div>
              ))}
              
              <button className="w-full mt-4 py-2 px-4 bg-gradient-to-r from-indigo-500 to-blue-600 text-white text-sm font-medium rounded-lg hover:from-indigo-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center gap-2">
                <Save size={16} /> Save Preferences
              </button>
            </div>
            
            {/* Theme Preferences */}
            <div className="bg-white/5 rounded-xl p-4">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Palette size={18} className="text-blue-400" /> Appearance
              </h4>
              
              <div className="space-y-4">
                {/* Theme Selection */}
                <div>
                  <p className="text-white mb-2">Theme</p>
                  <div className="grid grid-cols-3 gap-2">
                    {['System', 'Light', 'Dark'].map((theme, index) => (
                      <div 
                        key={theme}
                        className={`p-2 rounded-lg text-center cursor-pointer transition-all ${index === 2 ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/70 hover:bg-white/20'}`}
                      >
                        {theme}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Color Scheme */}
                <div>
                  <p className="text-white mb-2">Color Scheme</p>
                  <div className="flex gap-2">
                    {['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#3b82f6'].map((color) => (
                      <div 
                        key={color}
                        className={`w-8 h-8 rounded-full cursor-pointer transition-all ${color === '#6366f1' ? 'ring-2 ring-white ring-offset-2 ring-offset-gray-800' : ''}`}
                        style={{ backgroundColor: color }}
                      ></div>
                    ))}
                  </div>
                </div>
                
                {/* Font Size */}
                <div>
                  <div className="flex justify-between mb-2">
                    <p className="text-white">Font Size</p>
                    <p className="text-white/70">Medium</p>
                  </div>
                  <input 
                    type="range" 
                    min="1" 
                    max="3" 
                    defaultValue="2"
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-white/50 mt-1">
                    <span>Small</span>
                    <span>Medium</span>
                    <span>Large</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
        
        {/* Recent Searches section removed - now available in RecipeGuide.jsx */}

        {/* Favorite Recipes */}
        <motion.div>
          <h3 className="text-2xl font-bold mb-4 flex items-center gap-2 text-white">
            <Heart size={24} className="text-red-500" /> Favorite Recipes
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.length > 0 ? (
              favorites.map((recipe) => (
                <motion.div
                  key={recipe._id}
                  whileHover={{ scale: 1.02 }}
                  className="bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden shadow-xl border border-white/20"
                >
                  <div className="relative">
                    <img
                      src={recipe.image || "/images/default.jpg"}
                      alt={recipe.recipeTitle || recipe.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-0 right-0 p-2 flex gap-2">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white/30 transition-all"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecipe(recipe);
                          setShareUrl(`${window.location.origin}/recipe/${recipe._id}`);
                          setShowShareModal(true);
                        }}
                      >
                        <Share2 size={18} className="text-white" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="bg-white/20 backdrop-blur-md p-2 rounded-full shadow-lg hover:bg-white/30 transition-all"
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await axiosInstance.delete(`/api/users/searches/${recipe._id}/favorite`);
                            setRecentSearches((prev) =>
                              prev.map((it) =>
                                it._id === recipe._id ? { ...it, isFavorite: false } : it
                              )
                            );
                            setFavorites((prev) => prev.filter((it) => it._id !== recipe._id));
                          } catch (e) {
                            console.error("Favorite toggle failed", e);
                          }
                        }}
                      >
                        <MdFavorite size={18} className="text-red-500" />
                      </motion.button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h4 className="text-white font-bold text-lg mb-2 line-clamp-1">
                      {recipe.recipeTitle || recipe.title || recipe.query}
                    </h4>
                    
                    {recipe.description && (
                      <p className="text-white/70 text-sm mb-3 line-clamp-2">
                        {recipe.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-1 text-white/60 text-xs">
                        <Clock size={14} />
                        <span>{recipe.cookTime || 'Unknown'}</span>
                      </div>
                      
                      <button 
                        onClick={() => navigate(`/recipe/${recipe._id}`)}
                        className="text-green-400 text-sm font-medium hover:text-green-300 transition-colors"
                      >
                        View Recipe →
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center border border-white/20">
                <div className="flex flex-col items-center gap-4">
                  <Heart size={48} className="text-white/30" />
                  <p className="text-white/60 text-lg">
                    No favorite recipes yet.
                  </p>
                  <p className="text-white/40 text-sm max-w-md mx-auto">
                    Start exploring recipes and mark your favorites to see them here!
                  </p>
                  <button
                    onClick={() => navigate('/recipes')}
                    className="mt-4 px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded-full font-medium hover:from-green-500 hover:to-green-600 transition-all shadow-lg"
                  >
                    Discover Recipes
                  </button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Share Recipe Modal */}
        <AnimatePresence>
          {showShareModal && selectedRecipe && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowShareModal(false)}
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[#1d1f31] rounded-xl p-6 max-w-md w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Share Recipe</h2>
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="text-white/70 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <p className="text-white/70 mb-2">Share this delicious recipe with friends:</p>
                  <h3 className="text-white font-semibold mb-4">{selectedRecipe.recipeTitle || selectedRecipe.title || selectedRecipe.query}</h3>
                  
                  <div className="flex items-center gap-2 bg-[#161825] p-3 rounded-lg mb-4">
                    <input 
                      type="text" 
                      value={shareUrl} 
                      readOnly 
                      className="bg-transparent text-white flex-1 outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedToClipboard(true);
                        setTimeout(() => setCopiedToClipboard(false), 2000);
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                    >
                      {copiedToClipboard ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  
                  <div className="flex justify-center gap-4 mt-6">
                    <ShareButton 
                      icon={<MdShare size={20} />} 
                      label="Share" 
                      onClick={() => {
                        if (navigator.share) {
                          navigator.share({
                            title: selectedRecipe.recipeTitle || selectedRecipe.title || 'Check out this recipe!',
                            text: selectedRecipe.description || 'I found this amazing recipe!',
                            url: shareUrl
                          }).catch(err => console.error('Share failed:', err));
                        }
                      }} 
                    />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Account Settings */}
        <div className="mt-auto">
          <motion.div
            className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-md"
          >
            <div className="flex items-center gap-2 text-white">
              <Settings size={20} /> <span className="font-medium">Account Settings</span>
            </div>
            <button
              onClick={() => setShowAccountManagement(!showAccountManagement)}
              className="text-green-400 font-semibold cursor-pointer"
            >
              {showAccountManagement ? "Close" : "Manage"}
            </button>
          </motion.div>

          <AnimatePresence>
            {showAccountManagement && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden mt-4 p-6 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-2xl flex flex-col gap-6"
              >
                {/* Title */}
                <h2 className="text-xl font-semibold text-white/90 tracking-wide">
                  Account Management
                </h2>
                <p className="text-white/70 text-sm">
                  Manage your account settings and preferences below:
                </p>

                {/* Edit Profile Toggle */}
                <button
                  onClick={() => setEditMode((v) => !v)}
                  className="px-5 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-black font-semibold hover:from-green-500 hover:to-green-600 transition-all shadow-md text-base"
                >
                  {editMode ? "Close Edit" : "Edit Profile"}
                </button>

                {/* Editable Fields */}
                {editMode && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                    <EditField label="Date of Birth" name="dob" type="date" value={editForm.dob} onChange={handleEditChange} />
                    <EditField label="Phone" name="phone" value={editForm.phone} onChange={handleEditChange} />
                    <EditField label="Gender" name="gender" value={editForm.gender} onChange={handleEditChange} placeholder="Male/Female/Other" />
                    <EditField label="Blood Group" name="bloodGroup" value={editForm.bloodGroup} onChange={handleEditChange} placeholder="O+ / A- ..." />
                    <EditField label="Weight (kg)" name="weight" type="number" value={editForm.weight} onChange={handleEditChange} />
                    <EditField label="Height (cm)" name="height" type="number" value={editForm.height} onChange={handleEditChange} />
                    <EditField label="Daily Calories" name="dailyCalories" type="number" value={editForm.dailyCalories} onChange={handleEditChange} />
                    <EditField label="Goal Status" name="goalStatus" value={editForm.goalStatus} onChange={handleEditChange} />

                    {/* Medical History */}
                    <div className="md:col-span-2">
                      <label className="mb-1 block text-white text-sm font-semibold">
                        Medical History
                      </label>
                      <textarea
                        name="medicalHistory"
                        value={editForm.medicalHistory}
                        onChange={handleEditChange}
                        className="w-full rounded-xl px-3 py-2 bg-gray-100 text-black focus:outline-none focus:ring-2 focus:ring-green-400 transition"
                        rows={3}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="md:col-span-2 flex justify-end gap-3 mt-4">
                      <button
                        onClick={() => setEditMode(false)}
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition shadow"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={saving}
                        type="button"
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-green-400 to-green-500 text-black font-semibold hover:from-green-500 hover:to-green-600 disabled:opacity-50 transition shadow"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>
                    </div>
                  </div>
                )}

                {/* Extra Account Options */}

                <div className="flex flex-col gap-4 mt-4">
                  {/* Notifications Toggle */}
                  <motion.div
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-base font-medium">Notifications</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={!!editForm.notificationsEnabled}
                        onChange={(e) =>
                          setEditForm((p) => ({ ...p, notificationsEnabled: e.target.checked }))
                        }
                      />
                      <span className="w-12 h-6 bg-gray-400 rounded-full shadow-inner relative transition-all">
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            editForm.notificationsEnabled ? "translate-x-6 bg-green-400" : ""
                          }`}
                        ></span>
                      </span>
                    </label>
                  </motion.div>

                  {/* Privacy Toggle */}
                  <motion.div
                    className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-gray-700 to-gray-800 text-white shadow-lg"
                    transition={{ type: "spring", stiffness: 200 }}
                  >
                    <span className="text-base font-medium">Privacy</span>
                    <label className="inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={editForm.privacy === "private"}
                        onChange={(e) =>
                          setEditForm((p) => ({
                            ...p,
                            privacy: e.target.checked ? "private" : "public",
                          }))
                        }
                      />
                      <span className="mr-3 text-sm font-medium text-gray-300">
                        {editForm.privacy === "private" ? "Private" : "Public"}
                      </span>
                      <span className="w-12 h-6 bg-gray-400 rounded-full shadow-inner relative transition-all">
                        <span
                          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform ${
                            editForm.privacy === "private"
                              ? "translate-x-6 bg-blue-400"
                              : ""
                          }`}
                        ></span>
                      </span>
                    </label>
                  </motion.div>

                  {/* Buttons */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {/* Logout Button */}
                    <motion.button
                      onClick={() => setShowConfirmLogout(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-900 text-white font-semibold shadow-md hover:from-red-500 hover:to-red-600 hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"
                        />
                      </svg>
                      Logout
                    </motion.button>

                    {/* Delete Account Button */}
                <motion.button
                      onClick={() => setShowConfirmDelete(true)}
                      className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold shadow-md hover:from-red-600 hover:to-red-700 hover:shadow-xl transition-all duration-300"
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete Account
                    </motion.button>
                  </div>
                </div>


                {/* Logout at Bottom */}
                {/* <motion.button
                  onClick={() => setShowConfirmLogout(true)}
                  whileTap={{ scale: 0.95 }}
                  whileHover={{ scale: 1.05 }}
                  className="mt-6 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  <LogOut size={20} /> Logout
                </motion.button> */}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Confirm Logout Modal */}
          {showConfirmLogout && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-black rounded-2xl w-11/12 max-w-md p-6 text-white shadow-2xl">
                <h3 className="text-lg font-semibold mb-2">Confirm Logout</h3>
                <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
                <div className="flex justify-end gap-3">
                  <button onClick={() => setShowConfirmLogout(false)} className="px-4 py-2 rounded-lg bg-white text-black hover:bg-gray-300">Cancel</button>
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-700"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Account Modal */}
          {showConfirmDelete && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
              <div className="bg-black rounded-2xl w-11/12 max-w-md p-6 text-white shadow-2xl">
                <h3 className="text-lg font-semibold mb-2">Delete Account</h3>
                <p className="text-md text-gray-700 mb-4">
                  This action is permanent and will remove your profile and data. Type DELETE to confirm.
                </p>
                <DeleteConfirmForm
                  onCancel={() => setShowConfirmDelete(false)}
                  onConfirm={async () => {
                    try {
                      await axiosInstance.delete('/api/users/account');
                      await signOut(auth);
                      navigate('/login', { replace: true });
                    } catch (e) {
                      console.error('Delete failed', e);
                    }
                  }}
                />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function ProfileCard({ icon, label, value, onClick }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onClick={onClick}
      className={`flex items-center gap-4 p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl group ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="text-green-400 group-hover:scale-110 transition-transform duration-300">{icon}</div>
      <div className="flex-1">
        <p className="text-white/70 text-sm">{label}</p>
        <p className="text-white font-semibold">{value || "-"}</p>
      </div>
      {onClick && (
        <div className="text-white/40 group-hover:text-white/80 transition-colors duration-300">
          <Edit3 size={16} />
        </div>
      )}
    </motion.div>
  );
}

// Component for statistics card
function StatCard({ icon, label, value, color }) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20 shadow-lg"
    >
      <div className={`bg-gradient-to-br ${color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 shadow-lg`}>
        {icon}
      </div>
      <h4 className="text-white/60 text-sm mb-1">{label}</h4>
      <p className="text-white text-2xl font-bold">{value}</p>
    </motion.div>
  );
}

// Component for share buttons
function ShareButton({ icon, label, onClick }) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex flex-col items-center gap-1"
      onClick={onClick}
    >
      <div className="bg-white/10 hover:bg-white/20 p-3 rounded-full transition-colors">
        {icon}
      </div>
      <span className="text-white/70 text-xs">{label}</span>
    </motion.button>
  );
}

function EditField({ label, name, value, onChange, type = "text", placeholder }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-white">{label}</label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="rounded-xl px-3 py-2 bg-gray-200 text-black"
      />
    </div>
  );
}

function DeleteConfirmForm({ onCancel, onConfirm }) {
  const [value, setValue] = React.useState("");
  const canConfirm = value.trim().toUpperCase() === "DELETE";
  return (
    <div className="flex flex-col gap-3">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type DELETE to confirm"
        className="w-full rounded-xl px-3 py-2 bg-white text-black border border-gray-300"
      />
      <div className="flex justify-end gap-3">
        <button onClick={onCancel} className="px-4 py-2 rounded-lg bg-white/90 text-black hover:bg-white">Cancel</button>
        <button
          onClick={onConfirm}
          disabled={!canConfirm}
          className={`px-4 py-2 rounded-lg ${canConfirm ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-300 text-white/70 cursor-not-allowed'}`}
        >
          Delete
        </button>
      </div>
    </div>
  );
}
