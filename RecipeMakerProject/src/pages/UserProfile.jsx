import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { useNavigate } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { getAuth, signOut } from "firebase/auth";
import axios from "axios";

import ProfileHeader from "../components/user/ProfileHeader";
import RecipeStats from "../components/user/RecipeStats";
import FavoriteRecipes from "../components/user/FavoriteRecipes";
import NutritionTracking from "../components/user/NutritionTracking";
import PersonalInfo from "../components/user/PersonalInfo";
import AccountSettings from "../components/user/AccountSettings";
import PreferencesPanel from "../components/user/PreferencesPanel";


export default function UserProfile() {
  const navigate = useNavigate();
  const auth = getAuth();
  const firebaseUser = auth.currentUser;

  const [user, setUser] = useState(firebaseUser || null);
  const [favorites, setFavorites] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAccountManagement, setShowAccountManagement] = useState(false);
  
  // User statistics
  const [userStats, setUserStats] = useState({
    totalRecipes: 0,
    favoriteCount: 0,
    searchCount: 0,
    lastActive: "",
    topCategories: [],
    streakDays: 0
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
          // setRecentSearches(searches);
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
          // setProfileCompletion logic removed (unused)
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
  // const words = query.split(' ');
        
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

  // const handleEditChange = (e) => {
  //   const { name, value } = e.target;
  //   setEditForm((prev) => ({ ...prev, [name]: value }));
  // };

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
    <div className="relative">
      <div className="relative max-w-6xl mx-auto py-10 px-6 flex flex-col gap-8 z-10">
        <ProfileHeader user={user} profile={profile} />
        <RecipeStats userStats={userStats} />
        <FavoriteRecipes
          favorites={favorites}
          setFavorites={setFavorites}
        />
        {/* Share Recipe Modal and other modals can be kept here if needed */}
        <NutritionTracking profile={profile} />
        <PersonalInfo profile={profile} setEditMode={setEditMode} />
        <PreferencesPanel />
        <AccountSettings
          showAccountManagement={showAccountManagement}
          setShowAccountManagement={setShowAccountManagement}
          editMode={editMode}
          setEditMode={setEditMode}
          editForm={editForm}
          setEditForm={setEditForm}
          handleSaveProfile={handleSaveProfile}
          saving={saving}
          showConfirmLogout={showConfirmLogout}
          setShowConfirmLogout={setShowConfirmLogout}
          handleLogout={handleLogout}
          showConfirmDelete={showConfirmDelete}
          setShowConfirmDelete={setShowConfirmDelete}
        />
      </div>
    </div>
  );
}
