const User = require('../models/User');
const Profile = require('../models/Profile');

/**
 * Get a user's profile by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and populate profile
    const user = await User.findById(userId).populate('profile');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get profile data
    const profile = user.profile;
    
    // Format response
    const userProfile = {
      uid: user._id,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || [],
      recipes: user.recipes || [],
      // Add profile fields if they exist
      ...(profile && {
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        interests: profile.interests,
        coverPhoto: profile.coverPhoto
      })
    };
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get the current user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getCurrentUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    
    // Find user and populate profile
    const user = await User.findById(userId).populate('profile');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Get profile data
    const profile = user.profile;
    
    // Format response
    const userProfile = {
      uid: user._id,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || [],
      recipes: user.recipes || [],
      // Add profile fields if they exist
      ...(profile && {
        bio: profile.bio,
        location: profile.location,
        website: profile.website,
        interests: profile.interests,
        coverPhoto: profile.coverPhoto
      })
    };
    
    res.status(200).json(userProfile);
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Update the current user's profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { displayName, photoURL, bio, location, website, interests, coverPhoto } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user fields
    if (displayName) user.displayName = displayName;
    if (photoURL) user.photoURL = photoURL;
    
    // Find or create profile
    let profile = await Profile.findOne({ user: userId });
    
    if (!profile) {
      profile = new Profile({
        user: userId,
        bio,
        location,
        website,
        interests,
        coverPhoto
      });
      
      // Link profile to user
      user.profile = profile._id;
    } else {
      // Update profile fields
      if (bio !== undefined) profile.bio = bio;
      if (location !== undefined) profile.location = location;
      if (website !== undefined) profile.website = website;
      if (interests !== undefined) profile.interests = interests;
      if (coverPhoto !== undefined) profile.coverPhoto = coverPhoto;
    }
    
    // Save both documents
    await Promise.all([user.save(), profile.save()]);
    
    // Format response
    const updatedProfile = {
      uid: user._id,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: user.createdAt,
      followers: user.followers || [],
      following: user.following || [],
      recipes: user.recipes || [],
      bio: profile.bio,
      location: profile.location,
      website: profile.website,
      interests: profile.interests,
      coverPhoto: profile.coverPhoto
    };
    
    res.status(200).json(updatedProfile);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Follow a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.followUser = async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const { userId } = req.params;
    
    // Check if trying to follow self
    if (currentUserId === userId) {
      return res.status(400).json({ message: 'You cannot follow yourself' });
    }
    
    // Find both users
    const [currentUser, userToFollow] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);
    
    if (!currentUser || !userToFollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already following
    if (currentUser.following && currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Already following this user' });
    }
    
    // Add to following/followers lists
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];
    
    currentUser.following.push(userId);
    userToFollow.followers.push(currentUserId);
    
    // Save both users
    await Promise.all([currentUser.save(), userToFollow.save()]);
    
    res.status(200).json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Unfollow a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.unfollowUser = async (req, res) => {
  try {
    const currentUserId = req.user.uid;
    const { userId } = req.params;
    
    // Find both users
    const [currentUser, userToUnfollow] = await Promise.all([
      User.findById(currentUserId),
      User.findById(userId)
    ]);
    
    if (!currentUser || !userToUnfollow) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if actually following
    if (!currentUser.following || !currentUser.following.includes(userId)) {
      return res.status(400).json({ message: 'Not following this user' });
    }
    
    // Remove from following/followers lists
    currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
    userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUserId);
    
    // Save both users
    await Promise.all([currentUser.save(), userToUnfollow.save()]);
    
    res.status(200).json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get a user's followers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and populate followers
    const user = await User.findById(userId).populate('followers', 'displayName photoURL');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.followers || []);
  } catch (error) {
    console.error('Error getting user followers:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

/**
 * Get users that a user is following
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find user and populate following
    const user = await User.findById(userId).populate('following', 'displayName photoURL');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.following || []);
  } catch (error) {
    console.error('Error getting user following:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};