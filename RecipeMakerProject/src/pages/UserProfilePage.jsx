// src/pages/UserProfilePage.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../utils/axiosInstance";
import { useAuth } from "../hooks/useAuth";

import { AlertCircle, User, MapPin, Globe, Tag, Clock, Award, Edit, Save, X, ChefHat } from "lucide-react";
import { FaUtensils } from "react-icons/fa";


export default function UserProfilePage({ userData, loading: userDataLoading, error: userDataError }) {
  const { userId } = useParams();
  const { user: currentUser } = useAuth();
  // Use profile state only when viewing other users' profiles
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
    website: "",
    interests: "",
    dietaryPreferences: "",
    allergies: "",
    cookingExperience: "",
    favoriteIngredients: ""
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Initialize edit form with current profile data
  const initializeEditForm = (profileData) => {
    setEditForm({
      name: profileData.name || profileData.displayName || "",
      bio: profileData.bio || "",
      location: profileData.location || "",
      website: profileData.website || "",
      interests: profileData.interests?.join(", ") || "",
      dietaryPreferences: profileData.dietaryPreferences?.join(", ") || "",
      allergies: profileData.allergies?.join(", ") || "",
      cookingExperience: profileData.cookingExperience || "",
      favoriteIngredients: profileData.favoriteIngredients?.join(", ") || ""
    });
    setProfileImagePreview(profileData.photoURL || profileData.photo || null);
  };

  // Handle profile image file selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  // Save profile changes
  const saveProfileChanges = async () => {
    try {
      setSaving(true);
      setError(null);
      
      // Format comma-separated strings to arrays
      const formattedInterests = editForm.interests
        ? editForm.interests.split(",").map(item => item.trim()).filter(Boolean)
        : [];
      
      const formattedDietaryPreferences = editForm.dietaryPreferences
        ? editForm.dietaryPreferences.split(",").map(item => item.trim()).filter(Boolean)
        : [];
        
      const formattedAllergies = editForm.allergies
        ? editForm.allergies.split(",").map(item => item.trim()).filter(Boolean)
        : [];
        
      const formattedFavoriteIngredients = editForm.favoriteIngredients
        ? editForm.favoriteIngredients.split(",").map(item => item.trim()).filter(Boolean)
        : [];

      const formData = new FormData();
      formData.append("name", editForm.name);
      formData.append("bio", editForm.bio);
      formData.append("location", editForm.location);
      formData.append("website", editForm.website);
      formData.append("interests", JSON.stringify(formattedInterests)); // Send as JSON string
      formData.append("dietaryPreferences", JSON.stringify(formattedDietaryPreferences));
      formData.append("allergies", JSON.stringify(formattedAllergies));
      formData.append("cookingExperience", editForm.cookingExperience);
      formData.append("favoriteIngredients", JSON.stringify(formattedFavoriteIngredients));

      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

  const endpoint = userId ? `/api/users/${userId}/profile` : `/api/users/profile`;
      const { data } = await axiosInstance.put(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      // Update local profile state with new data
      setProfile(prev => ({
        ...prev,
        ...data,
        name: editForm.name,
        interests: formattedInterests,
        dietaryPreferences: formattedDietaryPreferences,
        allergies: formattedAllergies,
        cookingExperience: editForm.cookingExperience,
        favoriteIngredients: formattedFavoriteIngredients
      }));
      
      setEditMode(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      setError(err.response?.data?.message || "Failed to save profile changes");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let progressInterval;

    const fetchProfile = async () => {
      try {
        setError(null);
        setLoading(true);
        setLoadingProgress(0);
        
        // Simulate progress for better UX
        progressInterval = setInterval(() => {
          setLoadingProgress(prev => Math.min(prev + 10, 90));
        }, 300);
        
        // If viewing own profile, use currentUser data
        let data;
        
        if (!userId && currentUser) {
          // Use the currentUser from auth context
          data = currentUser;
        } else if (userData && !userDataLoading && !userId) {
          // Use the userData passed from parent component
          data = userData;
        } else {
          // Enhanced endpoint to fetch complete user profile data from MongoDB
          const endpoint = userId
            ? `/api/users/${userId}?include=full_profile`
            : `/api/users/me?include=full_profile`;

          const response = await axiosInstance.get(endpoint);
          data = response.data;
        }
        if (isMounted) {
          setProfile(data);
          initializeEditForm(data);
          setLoadingProgress(100);
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
        if (isMounted) {
          // Use userDataError if available, otherwise use the caught error
          setError(userDataError || err.response?.data?.message || "Failed to load profile data");
        }
      } finally {
        if (isMounted) {
          clearInterval(progressInterval);
          // If we're using currentUser or userData from props, respect the loading state
          if (!userId && currentUser) {
            setLoading(false);
          } else if (userData && !userId) {
            setLoading(userDataLoading);
          } else {
            setLoading(false);
          }
        }
      }
    };

    fetchProfile();
    return () => {
      isMounted = false;
      clearInterval(progressInterval);
    };
  }, [userId, currentUser, userData, userDataError, userDataLoading]);

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col justify-center items-center h-screen gap-4"
      >
        <div className="animate-spin rounded-full h-20 w-20 border-t-2 border-b-2 border-[#FF742C]" />
        <div className="w-64 h-3 bg-gray-700 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-[#FF742C]" 
            initial={{ width: 0 }}
            animate={{ width: `${loadingProgress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <p className="text-white font-medium">Loading profile...</p>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col items-center justify-center h-screen text-center px-4"
      >
        <AlertCircle size={48} className="text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Error Loading Profile</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-[#FF742C] text-white rounded-lg hover:bg-[#e35e12] transition-colors"
        >
          Try Again
        </button>
      </motion.div>
    );
  }

  // If viewing own profile and currentUser is available, but profile is not loaded yet
  if (!userId && currentUser && !profile) {
    // Set profile to currentUser
    setProfile(currentUser);
    initializeEditForm(currentUser);
    setLoading(false);
  }
  
  if (!profile && !currentUser) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-10 px-4"
      >
        <User size={48} className="text-gray-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Profile Not Found</h2>
        <p className="text-gray-400">The requested profile could not be found.</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-6 text-white"
    >
      {/* Profile Header */}
      <div className="flex items-center gap-6 bg-white/5 p-6 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg relative">
        {/* Edit button - only show if viewing own profile */}
        {!userId && !editMode && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setEditMode(true)}
            className="absolute top-4 right-4 bg-[#FF742C]/20 p-2 rounded-full text-[#FF742C] hover:bg-[#FF742C]/30 transition-colors"
          >
            <Edit size={18} />
          </motion.button>
        )}
        
        {/* Cancel edit button */}
        {editMode && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              setEditMode(false);
              initializeEditForm(profile);
            }}
            className="absolute top-4 right-16 bg-gray-700/50 p-2 rounded-full text-white hover:bg-gray-700/70 transition-colors"
          >
            <X size={18} />
          </motion.button>
        )}
        
        {/* Save button */}
        {editMode && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={saveProfileChanges}
            disabled={saving}
            className="absolute top-4 right-4 bg-[#FF742C]/80 p-2 rounded-full text-white hover:bg-[#FF742C] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <div className="h-[18px] w-[18px] border-2 border-t-transparent border-white rounded-full animate-spin" />
            ) : (
              <Save size={18} />
            )}
          </motion.button>
        )}
        
        <div className="relative group">
          <img 
            src={profileImagePreview || 
              (!userId && currentUser ? 
                (currentUser.photoURL || currentUser.photo) : 
                (profile?.photoURL || profile?.photo)
              ) || 
              `https://ui-avatars.com/api/?name=${encodeURIComponent((!userId && currentUser ? currentUser.displayName : profile?.name) || 'User')}&background=FF742C&color=fff`
            } 
            alt="Profile" 
            className="w-24 h-24 rounded-full border-2 border-[#FF742C] object-cover"
          />
          {editMode && (
            <label htmlFor="profile-image-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Edit size={24} className="text-white" />
              <input
                id="profile-image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
          <div className="absolute -bottom-2 -right-2 bg-[#FF742C] text-white p-1 rounded-full">
            <User size={16} />
          </div>
        </div>
        <div className="flex-1">
          {editMode ? (
            <div>
              <div className="mb-2">
                <label className="text-sm text-gray-400 block mb-1">Name</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full bg-black/30 border border-white/10 rounded-lg p-2 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                  placeholder="Your name"
                />
              </div>
              <label className="text-sm text-gray-400 block mb-1">Bio</label>
              <textarea
                name="bio"
                value={editForm.bio}
                onChange={handleInputChange}
                className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white resize-none focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
          ) : (
            <>
              <h1 className="text-3xl font-bold">
                {!userId && currentUser ? 
                  (currentUser.displayName || "User") : 
                  (profile?.name || profile?.displayName || "User")
                }
              </h1>
              <p className="text-gray-300">
                {!userId && currentUser ? currentUser.email : profile?.email}
              </p>
              {(!userId && currentUser ? currentUser.bio : profile?.bio) && (
                <p className="mt-2 text-gray-300 italic bg-black/20 p-3 rounded-lg border-l-2 border-[#FF742C]">"{!userId && currentUser ? currentUser.bio : profile?.bio}"</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mt-8">
        <motion.div 
          whileHover={{ y: -5 }}
          className="text-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg"
        >
          <p className="font-bold text-3xl text-[#FF742C]">
            {!userId && currentUser ? 
              (currentUser.recipes?.length || 0) : 
              (profile?.recipes?.length || 0)
            }
          </p>
          <p className="text-gray-400 flex items-center justify-center gap-1">
            <Award size={16} className="text-[#FF742C]" /> Recipes
          </p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -5 }}
          className="text-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg"
        >
          <p className="font-bold text-3xl text-[#FF742C]">
            {!userId && currentUser ? 
              (currentUser.followers?.length || 0) : 
              (profile?.followers?.length || 0)
            }
          </p>
          <p className="text-gray-400 flex items-center justify-center gap-1">
            <User size={16} className="text-[#FF742C]" /> Followers
          </p>
        </motion.div>
        <motion.div 
          whileHover={{ y: -5 }}
          className="text-center bg-white/5 p-4 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg"
        >
          <p className="font-bold text-3xl text-[#FF742C]">
            {!userId && currentUser ? 
              (currentUser.following?.length || 0) : 
              (profile?.following?.length || 0)
            }
          </p>
          <p className="text-gray-400 flex items-center justify-center gap-1">
            <User size={16} className="text-[#FF742C]" /> Following
          </p>
        </motion.div>
      </div>

      {/* Extra Info */}
      <div className="mt-10 p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg space-y-4">
        <h2 className="text-xl font-semibold border-b border-white/10 pb-2 mb-4">Profile Information</h2>
        
        {editMode ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <input
                    type="text"
                    name="location"
                    value={editForm.location}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                    placeholder="Your location"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <input
                    type="url"
                    name="website"
                    value={editForm.website}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Interests (comma separated)</label>
                <div className="relative">
                  <Tag size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <input
                    type="text"
                    name="interests"
                    value={editForm.interests}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                    placeholder="cooking, baking, healthy eating"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Dietary Preferences (comma separated)</label>
                <div className="relative">
                  <FaUtensils size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <input
                    type="text"
                    name="dietaryPreferences"
                    value={editForm.dietaryPreferences}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                    placeholder="vegetarian, vegan, keto, paleo"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Allergies (comma separated)</label>
                <div className="relative">
                  <AlertCircle size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <input
                    type="text"
                    name="allergies"
                    value={editForm.allergies}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                    placeholder="nuts, dairy, gluten, shellfish"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Cooking Experience</label>
                <div className="relative">
                  <ChefHat size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <select
                    name="cookingExperience"
                    value={editForm.cookingExperience}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                  >
                    <option value="">Select your experience level</option>
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="professional">Professional</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Favorite Ingredients (comma separated)</label>
                <div className="relative">
                  <FaUtensils size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#FF742C]" />
                  <input
                    type="text"
                    name="favoriteIngredients"
                    value={editForm.favoriteIngredients}
                    onChange={handleInputChange}
                    className="w-full bg-black/30 border border-white/10 rounded-lg py-2 pl-10 pr-3 text-white focus:outline-none focus:ring-1 focus:ring-[#FF742C]"
                    placeholder="garlic, olive oil, basil, avocado"
                  />
                </div>
              </div>
              
              {((!userId && currentUser?.joinedDate) || (userId && profile?.joinedDate)) && (
                <div className="flex items-center gap-3 mt-4">
                  <Clock size={20} className="text-[#FF742C]" />
                  <div>
                    <p className="text-sm text-gray-400">Joined</p>
                    <p className="text-white">{new Date(!userId && currentUser ? currentUser.joinedDate : profile?.joinedDate).toLocaleDateString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {((!userId && currentUser?.location) || (userId && profile?.location)) && (
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Location</p>
                  <p className="text-white">{!userId && currentUser ? currentUser.location : profile?.location}</p>
                </div>
              </div>
            )}
            {((!userId && currentUser?.website) || (userId && profile?.website)) && (
              <div className="flex items-center gap-3">
                <Globe size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Website</p>
                  <a
                    href={!userId && currentUser ? currentUser.website : profile?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white hover:text-[#FF742C] transition-colors"
                  >
                    {!userId && currentUser ? currentUser.website : profile?.website}
                  </a>
                </div>
              </div>
            )}
            {((!userId && currentUser?.cookingExperience) || (userId && profile?.cookingExperience)) && (
              <div className="flex items-center gap-3">
                <ChefHat size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Cooking Experience</p>
                  <p className="text-white capitalize">{!userId && currentUser ? currentUser.cookingExperience : profile?.cookingExperience}</p>
                </div>
              </div>
            )}
            
            {(((!userId && currentUser?.favoriteIngredients?.length > 0) || (userId && profile?.favoriteIngredients?.length > 0))) && (
              <div className="flex items-center gap-3">
                <FaUtensils size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Favorite Ingredients</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(userId
                      ? (profile?.favoriteIngredients || [])
                      : (currentUser?.favoriteIngredients || [])
                    ).map((ingredient, index) => (
                      <span key={index} className="bg-[#FF742C]/20 text-white text-xs px-2 py-1 rounded-full">
                        {ingredient}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {profile.joinedDate && (
              <div className="flex items-center gap-3">
                <Clock size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Joined</p>
                  <p className="text-white">{new Date(profile.joinedDate).toLocaleDateString()}</p>
                </div>
              </div>
            )}
            {(((!userId && currentUser?.interests?.length > 0) || (userId && profile?.interests?.length > 0))) && (
              <div className="flex items-center gap-3">
                <Tag size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Interests</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(userId
                      ? (profile?.interests || [])
                      : (currentUser?.interests || [])
                    ).map((interest, index) => (
                      <span key={index} className="bg-[#FF742C]/20 text-white text-xs px-2 py-1 rounded-full">
                        {interest}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {(((!userId && currentUser?.dietaryPreferences?.length > 0) || (userId && profile?.dietaryPreferences?.length > 0))) && (
              <div className="flex items-center gap-3">
                <FaUtensils size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Dietary Preferences</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(userId
                      ? (profile?.dietaryPreferences || [])
                      : (currentUser?.dietaryPreferences || [])
                    ).map((pref, index) => (
                      <span key={index} className="bg-[#FF742C]/20 text-white text-xs px-2 py-1 rounded-full">
                        {pref}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {(((!userId && currentUser?.allergies?.length > 0) || (userId && profile?.allergies?.length > 0))) && (
              <div className="flex items-center gap-3">
                <AlertCircle size={20} className="text-[#FF742C]" />
                <div>
                  <p className="text-sm text-gray-400">Allergies</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {(userId
                      ? (profile?.allergies || [])
                      : (currentUser?.allergies || [])
                    ).map((allergy, index) => (
                      <span key={index} className="bg-red-500/20 text-white text-xs px-2 py-1 rounded-full">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recipes */}
      <div className="mt-12 p-6 bg-white/5 rounded-xl backdrop-blur-sm border border-white/10 shadow-lg">
        <h2 className="text-2xl font-semibold mb-6 border-b border-white/10 pb-2 flex items-center gap-2">
          <Award className="text-[#FF742C]" size={24} /> Shared Recipes
        </h2>
        {(((!userId && currentUser?.recipes?.length > 0) || (userId && profile?.recipes?.length > 0))) ? (
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(userId
                ? (profile?.recipes || [])
                : (currentUser?.recipes || [])
              ).map((recipe) => (
                <motion.li
                  key={recipe._id}
                whileHover={{ y: -5, scale: 1.02 }}
                className="p-5 rounded-xl bg-white/10 border border-white/10 shadow-md hover:shadow-xl transition overflow-hidden group"
              >
                {recipe.image && (
                  <div className="h-40 -mx-5 -mt-5 mb-4 overflow-hidden">
                    <img 
                      src={recipe.image} 
                      alt={recipe.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <h3 className="font-bold text-lg text-[#FF742C]">{recipe.title}</h3>
                {recipe.description && (
                  <p className="text-gray-300 text-sm mt-2 line-clamp-2">{recipe.description}</p>
                )}
                <div className="mt-3 flex justify-between items-center">
                  <span className="text-xs text-gray-400">{new Date(recipe.createdAt).toLocaleDateString()}</span>
                  <button className="text-xs bg-[#FF742C]/20 text-[#FF742C] px-3 py-1 rounded-full hover:bg-[#FF742C]/30 transition-colors">
                    View Recipe
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-10">
            <Award size={48} className="text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">No recipes shared yet.</p>
          </div>
        )}
      </div>

      {/* Follow button (only if viewing other user) */}
      {userId && userId !== currentUser?.uid && (
        <div className="mt-8 flex justify-center">
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 rounded-xl bg-[#FF742C] text-white font-semibold hover:bg-[#e35e12] shadow-md flex items-center gap-2"
          >
            <User size={18} />
            Follow
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
