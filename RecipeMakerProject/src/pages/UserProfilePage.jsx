import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUser, FaCalendarAlt, FaUtensils, FaHeart, FaComment, FaShare } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../hooks/useAuth';
import * as communityService from '../services/communityService';
import * as userService from '../services/userService';
import LoadingSpinner from '../components/LoadingSpinner';
import CommentSection from '../components/CommentSection';

const UserProfilePage = () => {
  const { userId } = useParams();
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('posts');
  const [expandedPostId, setExpandedPostId] = useState(null);

  // Fetch user profile and posts
  useEffect(() => {
    const fetchProfileAndPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch user profile
        const profileData = await userService.getUserProfile(userId);
        setProfile(profileData);
        
        // Fetch user posts
        const postsData = await communityService.fetchUserPosts(userId);
        setPosts(postsData);
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile. Please try again later.');
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileAndPosts();
  }, [userId]);

  // Handle post interactions
  const handleInteraction = async (postId, type) => {
    try {
      if (type === 'like') {
        await communityService.likePost(postId);
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, likes: post.likes + 1, isLiked: true };
          }
          return post;
        }));
        toast.success('Post liked!');
      } else if (type === 'comment') {
        setExpandedPostId(expandedPostId === postId ? null : postId);
      } else if (type === 'share') {
        await communityService.sharePost(postId);
        setPosts(posts.map(post => {
          if (post._id === postId) {
            return { ...post, shares: post.shares + 1 };
          }
          return post;
        }));
        toast.success('Post shared!');
      }
    } catch (err) {
      console.error(`Error handling ${type}:`, err);
      toast.error(`Failed to ${type} post`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
        <div className="text-red-500 mb-4 text-xl">{error}</div>
        <Link to="/community" className="text-green-500 hover:text-green-400 transition-colors">
          Return to Community
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      {profile && (
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <motion.div 
            className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-lg mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Cover Photo */}
            <div className="h-48 bg-gradient-to-r from-green-600 to-blue-600 relative">
              {profile.coverPhoto && (
                <img 
                  src={profile.coverPhoto} 
                  alt="Cover" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            
            {/* Profile Info */}
            <div className="p-6 relative">
              {/* Profile Picture */}
              <div className="absolute -top-16 left-6 w-32 h-32 rounded-full border-4 border-gray-800 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt={profile.displayName} className="w-full h-full object-cover" />
                ) : (
                  <FaUser />
                )}
              </div>
              
              <div className="ml-40 mb-4">
                <h1 className="text-2xl font-bold">{profile.displayName}</h1>
                <p className="text-gray-400 flex items-center gap-2 mt-1">
                  <FaCalendarAlt className="text-green-400" />
                  Joined {new Date(profile.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {/* Bio */}
              {profile.bio && (
                <p className="text-gray-300 mt-4 mb-2">{profile.bio}</p>
              )}
              
              {/* Stats */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t border-gray-700/50">
                <div className="text-center px-4">
                  <div className="text-xl font-bold">{posts.length}</div>
                  <div className="text-sm text-gray-400">Posts</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-xl font-bold">{profile.followers?.length || 0}</div>
                  <div className="text-sm text-gray-400">Followers</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-xl font-bold">{profile.following?.length || 0}</div>
                  <div className="text-sm text-gray-400">Following</div>
                </div>
                <div className="text-center px-4">
                  <div className="text-xl font-bold">{profile.recipes?.length || 0}</div>
                  <div className="text-sm text-gray-400">Recipes</div>
                </div>
              </div>
              
              {/* Follow Button (if not current user) */}
              {currentUser && currentUser.uid !== userId && (
                <button 
                  className="absolute top-6 right-6 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-full transition-colors"
                  onClick={() => toast.info('Follow functionality coming soon!')}
                >
                  Follow
                </button>
              )}
            </div>
          </motion.div>
          
          {/* Content Tabs */}
          <div className="mb-6 border-b border-gray-700/50">
            <div className="flex">
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'posts' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('posts')}
              >
                Posts
              </button>
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'recipes' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('recipes')}
              >
                Recipes
              </button>
              <button 
                className={`px-6 py-3 font-medium ${activeTab === 'about' ? 'text-green-400 border-b-2 border-green-400' : 'text-gray-400 hover:text-white'}`}
                onClick={() => setActiveTab('about')}
              >
                About
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === 'posts' && (
              <motion.div
                key="posts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {posts.length > 0 ? (
                  <motion.div 
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {posts.map(post => (
                      <UserPostCard 
                        key={post._id}
                        post={post}
                        onInteraction={handleInteraction}
                        isExpanded={expandedPostId === post._id}
                        variants={itemVariants}
                      />
                    ))}
                  </motion.div>
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <FaUtensils className="mx-auto text-4xl mb-4 text-gray-600" />
                    <p className="text-xl">No posts yet</p>
                    <p className="mt-2">This user hasn't shared any posts</p>
                  </div>
                )}
              </motion.div>
            )}
            
            {activeTab === 'recipes' && (
              <motion.div
                key="recipes"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-center py-12 text-gray-400"
              >
                <FaUtensils className="mx-auto text-4xl mb-4 text-gray-600" />
                <p className="text-xl">Recipe collection coming soon</p>
                <p className="mt-2">We're working on this feature</p>
              </motion.div>
            )}
            
            {activeTab === 'about' && (
              <motion.div
                key="about"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-lg p-6"
              >
                <h2 className="text-xl font-bold mb-4">About {profile.displayName}</h2>
                
                {profile.bio ? (
                  <p className="text-gray-300 mb-6">{profile.bio}</p>
                ) : (
                  <p className="text-gray-400 mb-6">No bio provided</p>
                )}
                
                <div className="space-y-4">
                  {profile.location && (
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">Location:</span>
                      <span>{profile.location}</span>
                    </div>
                  )}
                  
                  {profile.website && (
                    <div className="flex items-center gap-3">
                      <span className="text-green-400">Website:</span>
                      <a 
                        href={profile.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  
                  {profile.interests && profile.interests.length > 0 && (
                    <div>
                      <span className="text-green-400 block mb-2">Interests:</span>
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, index) => (
                          <span 
                            key={index}
                            className="bg-gray-700/50 text-gray-300 px-3 py-1 rounded-full text-sm"
                          >
                            {interest}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

// User Post Card Component
const UserPostCard = ({ post, onInteraction, isExpanded, variants }) => {
  return (
    <motion.div 
      className="bg-gray-800/60 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 shadow-lg"
      variants={variants}
      whileHover={{ y: -5 }}
      layout
    >
      {/* Post Content */}
      <div className="p-4">
        <p className="text-gray-200 mb-3">{post.content}</p>
        
        {/* Post Image */}
        {post.image && (
          <div className="mb-4 rounded-lg overflow-hidden">
            <img 
              src={post.image} 
              alt="Post" 
              className="w-full h-auto object-cover"
            />
          </div>
        )}
        
        {/* Recipe Card (if post has recipe) */}
        {post.recipe && (
          <motion.div 
            className="mb-4 bg-gray-700/40 rounded-lg overflow-hidden border border-gray-600/50 hover:border-green-500/30 transition-all"
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex">
              {post.recipe.image && (
                <div className="w-1/3">
                  <img 
                    src={post.recipe.image} 
                    alt={post.recipe.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-3 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <FaUtensils className="text-green-400" />
                  <h4 className="font-medium text-white">{post.recipe.title}</h4>
                </div>
                {post.recipe.description && (
                  <p className="text-sm text-gray-300 line-clamp-2">{post.recipe.description}</p>
                )}
                <button 
                  onClick={() => post.recipe.url && window.open(post.recipe.url, '_blank')}
                  className="mt-2 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  View Recipe →
                </button>
              </div>
            </div>
          </motion.div>
        )}
        
        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag, index) => (
              <span 
                key={index} 
                className="text-xs bg-gray-700/50 text-gray-300 px-2 py-1 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        {/* Post Metadata */}
        <div className="text-xs text-gray-400 mt-2">
          {new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </div>
      </div>
      
      {/* Post Actions */}
      <div className="px-4 py-3 border-t border-gray-700/50 flex justify-between items-center">
        <div className="flex gap-6">
          <button 
            onClick={() => onInteraction(post._id, 'like')} 
            className={`flex items-center gap-2 ${post.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'} transition-colors`}
          >
            <motion.div whileTap={{ scale: 1.4 }}>
              <FaHeart />
            </motion.div>
            <span>{post.likes}</span>
          </button>
          <button 
            onClick={() => onInteraction(post._id, 'comment')}
            className={`flex items-center gap-2 ${isExpanded ? 'text-blue-400' : 'text-gray-400 hover:text-blue-400'} transition-colors`}
          >
            <FaComment />
            <span>{post.commentCount || 0}</span>
          </button>
          <button 
            onClick={() => onInteraction(post._id, 'share')} 
            className="flex items-center gap-2 text-gray-400 hover:text-green-400 transition-colors"
          >
            <FaShare />
            <span>{post.shares}</span>
          </button>
        </div>
      </div>
      
      {/* Comments Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">
              <CommentSection 
                postId={post._id} 
                initialComments={post.comments || []} 
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default UserProfilePage;