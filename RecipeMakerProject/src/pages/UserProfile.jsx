import React, { useCallback, Suspense, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, User, RefreshCw } from 'lucide-react';
import { useUserProfile } from '../hooks/useUserProfile';
import LoadingFallback from '../components/common/LoadingFallback';
import toast from 'react-hot-toast';

// Import enhanced modern components
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileStats from '../components/profile/ProfileStats';
import ActivityFeed from '../components/profile/ActivityFeed';
import FavoriteRecipes from '../components/user/FavoriteRecipes';
import NutritionTracking from '../components/user/NutritionTracking';
import PersonalInfo from '../components/user/PersonalInfo';
import AccountSettings from '../components/user/AccountSettings';
import PreferencesPanel from '../components/user/PreferencesPanel';
import HealthDataDisplay from '../components/health/HealthDataDisplay';
import DevicePairingModal from '../components/health/DevicePairingModal';

// Modern UserProfile Component (unified with UserProfilePage)
export default function UserProfile({
  userData,
  loading: userDataLoading,
  error: userDataError,
}) {
  const {
    userId,
    profile,
    loading,
    error,
    editMode,
    saving,
    editForm,
    profileImagePreview,
    handleInputChange,
    handleImageChange,
    saveProfileChanges,
    setEditMode,
  } = useUserProfile(userData, userDataLoading, userDataError);

  // Initialize missing properties with default values or state
  const [favorites] = React.useState([]);
  const [userStats] = React.useState({
    totalRecipes: 0,
    favoriteCount: 0,
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  });
  const [showAccountManagement, setShowAccountManagement] = React.useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = React.useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = React.useState(false);
  const [showDevicePairing, setShowDevicePairing] = useState(false);
  
  // Basic logout handler
  const handleLogout = React.useCallback(() => {
    // Add logout logic here if needed
    localStorage.removeItem('token');
    window.location.href = '/login';
  }, []);

  // Enhanced save function with toast notifications
  const handleSaveProfile = useCallback(async () => {
    try {
      await saveProfileChanges();
      toast.success('Profile updated successfully! ✨');
    } catch (error) {
      toast.error('Failed to update profile. Please try again.');
    }
  }, [saveProfileChanges]);

  // Loading state with modern loader
  if (loading) {
    return (
      <LoadingFallback 
        message="Loading nutrition profile..." 
      />
    );
  }

  // Error state with modern design
  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="max-w-md w-full bg-gray-800/60 backdrop-blur-xl rounded-3xl p-8 text-center border border-gray-700/50 shadow-2xl"
        >
          <div className="w-20 h-20 bg-red-500/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-400" />
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-3">
            Profile Loading Error
          </h2>
          
          <p className="text-gray-300 mb-6 leading-relaxed">
            {error || 'Unable to load the profile. Please check your connection and try again.'}
          </p>
          
          <div className="space-y-3">
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </motion.button>
            
            <motion.button
              onClick={() => window.history.back()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-2xl font-medium transition-all duration-200"
            >
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Profile not found state
  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className="w-24 h-24 bg-gray-800/60 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto mb-6 border border-gray-700/50">
            <User className="w-12 h-12 text-gray-400" />
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-4">
            Profile Not Found
          </h2>
          
          <p className="text-gray-400 mb-8 leading-relaxed">
            The requested profile could not be found or may have been removed. The user might have deactivated their account.
          </p>
          
          <motion.button
            onClick={() => window.history.back()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-8 py-3 bg-gray-800/60 backdrop-blur-xl hover:bg-gray-700/60 text-white rounded-2xl font-medium transition-all duration-200 border border-gray-700/50"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const isOwnProfile = !userId || profile?.uid === profile?.currentUserId;

  return (
    <div className="min-h-screen">
      {/* Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-400/5 blur-3xl" />
        <div className="absolute top-1/2 -left-40 w-80 h-80 rounded-full bg-blue-400/5 blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-80 h-80 rounded-full bg-purple-400/5 blur-3xl" />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-7xl mx-auto px-4 py-8"
        >
          {/* Modern Profile Header */}
          <Suspense fallback={<LoadingFallback message="Loading profile header..." minimal />}>
            <ProfileHeader
              profile={profile}
              editMode={editMode}
              setEditMode={setEditMode}
              editForm={editForm}
              handleInputChange={handleInputChange}
              profileImagePreview={profileImagePreview}
              handleImageChange={handleImageChange}
              saving={saving}
              saveProfileChanges={handleSaveProfile}
              isOwnProfile={isOwnProfile}
            />
          </Suspense>

          {/* Enhanced Profile Stats */}
          <Suspense fallback={<LoadingFallback message="Loading statistics..." minimal />}>
            <ProfileStats profile={profile} userStats={userStats} />
          </Suspense>

          {/* Activity Feed */}
          <Suspense fallback={<LoadingFallback message="Loading activity feed..." minimal />}>
            <ActivityFeed profile={profile} />
          </Suspense>

          {/* Health Metrics Section (Only for own profile) */}
          {isOwnProfile && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="mt-12"
            >
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 backdrop-blur-sm rounded-3xl p-8 border border-gray-700/50">
                <HealthDataDisplay 
                  showConnectionButtons={true} 
                  onConnect={() => setShowDevicePairing(true)} 
                />
              </div>
            </motion.div>
          )}

          {/* Legacy Components (Enhanced) */}
          <div className="grid lg:grid-cols-2 gap-8 mt-12">
            <div className="space-y-8">
              <FavoriteRecipes
                favorites={favorites}
                profile={profile}
              />
              <NutritionTracking profile={profile} />
            </div>
            
            <div className="space-y-8">
              <PersonalInfo profile={profile} setEditMode={setEditMode} />
              <PreferencesPanel profile={profile} />
            </div>
          </div>

          {/* Account Settings */}
          {isOwnProfile && (
            <div className="mt-12">
              <AccountSettings
                showAccountManagement={showAccountManagement}
                setShowAccountManagement={setShowAccountManagement}
                editMode={editMode}
                setEditMode={setEditMode}
                editForm={editForm}
                handleSaveProfile={handleSaveProfile}
                saving={saving}
                showConfirmLogout={showConfirmLogout}
                setShowConfirmLogout={setShowConfirmLogout}
                handleLogout={handleLogout}
                showConfirmDelete={showConfirmDelete}
                setShowConfirmDelete={setShowConfirmDelete}
              />
            </div>
          )}
        </motion.div>
      </div>

      {/* Device Pairing Modal (Only for own profile) */}
      {isOwnProfile && (
        <DevicePairingModal 
          isVisible={showDevicePairing}
          onClose={() => setShowDevicePairing(false)}
          onSuccess={(deviceType) => {
            toast.success(`${deviceType === 'googlefit' ? 'Google Fit' : 'Smartwatch'} connected successfully! 🎉`);
            setShowDevicePairing(false);
          }}
        />
      )}
    </div>
  );
}
