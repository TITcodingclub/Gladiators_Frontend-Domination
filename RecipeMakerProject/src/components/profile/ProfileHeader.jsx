import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, 
  MapPin, 
  Link, 
  Calendar, 
  Shield, 
  Edit, 
  Save, 
  X,
  RefreshCw,
  Verified
} from 'lucide-react';

const ProfileHeader = ({ 
  profile, 
  editMode, 
  setEditMode, 
  editForm, 
  handleInputChange, 
  profileImagePreview, 
  handleImageChange, 
  saving,
  saveProfileChanges,
  isOwnProfile 
}) => {
  const [imageUploading, setImageUploading] = useState(false);

  const handleImageUpload = async (e) => {
    setImageUploading(true);
    try {
      await handleImageChange(e);
    } finally {
      setImageUploading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative overflow-hidden"
    >
      {/* Background Cover */}
      <div className="h-48 bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 relative">
        <div className="absolute inset-0 bg-black/20" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        
        {/* Floating Elements */}
        <div className="absolute top-8 right-8 w-24 h-24 bg-white/10 rounded-full blur-xl" />
        <div className="absolute bottom-12 left-12 w-16 h-16 bg-emerald-300/20 rounded-full blur-lg" />
        <div className="absolute top-16 left-1/3 w-8 h-8 bg-cyan-300/30 rounded-full blur-sm" />
      </div>

      {/* Content Container */}
      <div className="relative -mt-20 px-6">
        <div className="bg-gray-900/95 backdrop-blur-xl rounded-3xl border border-gray-700/50 p-8 shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-end gap-8">
            
            {/* Profile Image Section */}
            <div className="relative group">
              <motion.div 
                className="relative"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-emerald-400/30 shadow-xl relative">
                  <img
                    src={profileImagePreview || profile?.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile?.name || 'User')}&background=10b981&color=fff&size=128`}
                    alt={profile?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Online Status Indicator */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-400 rounded-full border-4 border-gray-900 flex items-center justify-center"
                  >
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                  </motion.div>
                </div>

                {/* Edit Overlay */}
                <AnimatePresence>
                  {editMode && (
                    <motion.button
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      disabled={imageUploading}
                      className="absolute inset-0 bg-black/60 backdrop-blur-sm rounded-3xl flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                    >
                      {imageUploading ? (
                        <RefreshCw className="w-6 h-6 animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6" />
                      )}
                    </motion.button>
                  )}
                </AnimatePresence>

                {editMode && (
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                )}
              </motion.div>
            </div>

            {/* Profile Info */}
            <div className="flex-1 text-center lg:text-left space-y-4">
              
              {/* Name and Title */}
              <div>
                {editMode ? (
                  <input
                    name="name"
                    value={editForm.name || ''}
                    onChange={handleInputChange}
                    placeholder="Your name"
                    className="text-3xl lg:text-4xl font-bold bg-transparent border-b-2 border-emerald-400/50 focus:border-emerald-400 outline-none text-white placeholder:text-gray-400 w-full"
                  />
                ) : (
                  <div className="flex items-center gap-3 justify-center lg:justify-start">
                    <h1 className="text-3xl lg:text-4xl font-bold text-white">
                      {profile?.name || profile?.displayName || 'Anonymous User'}
                    </h1>
                    {profile?.verified && (
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                      >
                        <Verified className="w-7 h-7 text-emerald-400 fill-current" />
                      </motion.div>
                    )}
                  </div>
                )}

                {profile?.title && (
                  <motion.p 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-emerald-400 font-medium mt-1"
                  >
                    {profile.title}
                  </motion.p>
                )}
              </div>

              {/* Bio */}
              <div>
                {editMode ? (
                  <textarea
                    name="bio"
                    value={editForm.bio || ''}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={3}
                    className="w-full bg-gray-800/50 border border-gray-600/50 rounded-2xl p-4 text-gray-200 placeholder:text-gray-400 focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50 outline-none resize-none"
                  />
                ) : (
                  <p className="text-gray-300 text-lg leading-relaxed max-w-2xl">
                    {profile?.bio || 'Welcome to my profile! I love sharing healthy recipes and nutrition tips.'}
                  </p>
                )}
              </div>

              {/* Meta Information */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap items-center gap-6 text-gray-400 justify-center lg:justify-start"
              >
                {(profile?.location || editMode) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-400" />
                    {editMode ? (
                      <input
                        name="location"
                        value={editForm.location || ''}
                        onChange={handleInputChange}
                        placeholder="Your location"
                        className="bg-transparent border-b border-gray-600/50 focus:border-emerald-400 outline-none text-gray-300 placeholder:text-gray-500"
                      />
                    ) : (
                      <span>{profile?.location || 'Add location'}</span>
                    )}
                  </div>
                )}

                {(profile?.website || editMode) && (
                  <div className="flex items-center gap-2">
                    <Link className="w-4 h-4 text-emerald-400" />
                    {editMode ? (
                      <input
                        name="website"
                        value={editForm.website || ''}
                        onChange={handleInputChange}
                        placeholder="Your website"
                        className="bg-transparent border-b border-gray-600/50 focus:border-emerald-400 outline-none text-gray-300 placeholder:text-gray-500"
                      />
                    ) : (
                      <a 
                        href={profile?.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-emerald-400 transition-colors"
                      >
                        {profile?.website || 'Add website'}
                      </a>
                    )}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  <span>Member since {new Date(profile?.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </div>
              </motion.div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
                className="flex gap-3"
              >
                {editMode ? (
                  <>
                    <motion.button
                      onClick={saveProfileChanges}
                      disabled={saving}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-800 disabled:cursor-not-allowed text-white rounded-2xl font-medium transition-all duration-200 shadow-lg"
                    >
                      {saving ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <Save className="w-4 h-4" />
                      )}
                      {saving ? 'Saving...' : 'Save Changes'}
                    </motion.button>

                    <motion.button
                      onClick={() => setEditMode(false)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </motion.button>
                  </>
                ) : (
                  <motion.button
                    onClick={() => setEditMode(true)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg border border-gray-600/50"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Profile
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProfileHeader;
