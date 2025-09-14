// src/pages/UserProfilePage.jsx
import { motion } from "framer-motion";
import { AlertCircle, User } from "lucide-react";

import { useUserProfile } from "../hooks/useUserProfile";

import ProfileHeader from "../components/user/profilePage/ProfileHeader";
import ProfileStats from "../components/user/profilePage/ProfileStats";
import ProfileInfo from "../components/user/profilePage/ProfileInfo";
import Recipes from "../components/user/profilePage/Recipes";
import FollowButton from "../components/user/profilePage/FollowButton";

export default function UserProfilePage({
  userData,
  loading: userDataLoading,
  error: userDataError,
}) {
  const {
    userId,
    currentUser,
    profile,
    loading,
    error,
    loadingProgress,
    editMode,
    saving,
    editForm,
    profileImagePreview,
    handleInputChange,
    initializeEditForm,
    handleImageChange,
    saveProfileChanges,
    setEditMode,
  } = useUserProfile(userData, userDataLoading, userDataError);

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
        <h2 className="text-2xl font-bold text-white mb-2">
          Error Loading Profile
        </h2>
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
      <ProfileHeader
        editMode={editMode}
        saving={saving}
        profile={profile}
        userId={userId}
        profileImagePreview={profileImagePreview}
        handleImageChange={handleImageChange}
        editForm={editForm}
        handleInputChange={handleInputChange}
        setEditMode={setEditMode}
        initializeEditForm={initializeEditForm}
        saveProfileChanges={saveProfileChanges}
      />

      <ProfileStats profile={profile} userId={userId} />

      <ProfileInfo
        editMode={editMode}
        editForm={editForm}
        handleInputChange={handleInputChange}
        profile={profile}
        userId={userId}
      />

      <Recipes profile={profile} userId={userId} />

      <FollowButton userId={userId} currentUserId={profile?.uid} />
    </motion.div>
  );
}
