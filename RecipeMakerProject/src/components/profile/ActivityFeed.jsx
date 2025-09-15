import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, 
  ChefHat, 
  Heart, 
  Star, 
  MessageCircle, 
  Share2,
  Clock,
  TrendingUp,
  Award,
  Users,
  Calendar
} from 'lucide-react';

// Activity type configurations
const ACTIVITY_CONFIG = {
  recipe_created: {
    icon: ChefHat,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10'
  },
  recipe_liked: {
    icon: Heart,
    color: 'text-pink-400',
    bg: 'bg-pink-400/10'
  },
  recipe_rated: {
    icon: Star,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10'
  },
  comment_added: {
    icon: MessageCircle,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10'
  },
  recipe_shared: {
    icon: Share2,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10'
  },
  follower_gained: {
    icon: Users,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10'
  },
  achievement_earned: {
    icon: Award,
    color: 'text-orange-400',
    bg: 'bg-orange-400/10'
  }
};

const ActivityCard = React.memo(({ activity, index }) => {
  const config = ACTIVITY_CONFIG[activity.type] || {
    icon: Activity,
    color: 'text-gray-400',
    bg: 'bg-gray-400/10'
  };
  
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ scale: 1.02, y: -2 }}
      className="group relative"
    >
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-2xl p-6 hover:border-gray-600/50 transition-all duration-300">
        
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${config.bg} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
              <Icon className={`w-6 h-6 ${config.color}`} />
            </div>
            
            <div>
              <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                {activity.title}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {activity.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{activity.timeAgo}</span>
          </div>
        </div>

        {/* Content */}
        {activity.content && (
          <div className="bg-gray-700/30 rounded-xl p-4 mb-4">
            <p className="text-gray-300 text-sm leading-relaxed">
              {activity.content}
            </p>
          </div>
        )}

        {/* Media */}
        {activity.image && (
          <div className="mb-4 overflow-hidden rounded-xl">
            <img 
              src={activity.image} 
              alt={activity.title}
              className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Stats */}
        {activity.stats && (
          <div className="flex items-center gap-6 text-sm">
            {activity.stats.likes && (
              <div className="flex items-center gap-1 text-pink-400">
                <Heart className="w-4 h-4" />
                <span>{activity.stats.likes}</span>
              </div>
            )}
            {activity.stats.comments && (
              <div className="flex items-center gap-1 text-blue-400">
                <MessageCircle className="w-4 h-4" />
                <span>{activity.stats.comments}</span>
              </div>
            )}
            {activity.stats.shares && (
              <div className="flex items-center gap-1 text-purple-400">
                <Share2 className="w-4 h-4" />
                <span>{activity.stats.shares}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});

ActivityCard.displayName = 'ActivityCard';

const ActivityFeed = ({ profile = {} }) => {
  const [filter, setFilter] = useState('all');
  const [showMore, setShowMore] = useState(false);

  // Mock activity data - replace with real data from API or profile.activities
  const activities = useMemo(() => profile.activities || [
    {
      id: 1,
      type: 'recipe_created',
      title: 'Created a new recipe',
      description: 'Quinoa Buddha Bowl with Tahini Dressing',
      content: 'A nutritious and colorful bowl packed with protein, healthy fats, and fresh vegetables. Perfect for meal prep!',
      image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400',
      timeAgo: '2 hours ago',
      stats: { likes: 24, comments: 8, shares: 3 }
    },
    {
      id: 2,
      type: 'achievement_earned',
      title: 'Achievement Unlocked!',
      description: 'Healthy Habits Champion',
      content: 'Completed 30 days of consistent healthy eating. Keep up the great work!',
      timeAgo: '1 day ago'
    },
    {
      id: 3,
      type: 'recipe_liked',
      title: 'Liked a recipe',
      description: 'Mediterranean Chickpea Salad by @chef_maria',
      timeAgo: '2 days ago',
      stats: { likes: 156 }
    },
    {
      id: 4,
      type: 'follower_gained',
      title: 'New followers',
      description: '5 people started following you',
      timeAgo: '3 days ago'
    },
    {
      id: 5,
      type: 'recipe_rated',
      title: 'Rated a recipe',
      description: 'Gave 5 stars to Green Smoothie Detox',
      timeAgo: '4 days ago'
    },
    {
      id: 6,
      type: 'comment_added',
      title: 'Left a comment',
      description: 'On Avocado Toast Variations',
      content: 'This recipe changed my breakfast game! The everything bagel seasoning tip is genius 🥑',
      timeAgo: '5 days ago'
    }
  ], [profile.activities]);

  const filterOptions = useMemo(() => [
    { value: 'all', label: 'All Activity', icon: Activity },
    { value: 'recipe_created', label: 'Recipes', icon: ChefHat },
    { value: 'recipe_liked', label: 'Likes', icon: Heart },
    { value: 'achievement_earned', label: 'Achievements', icon: Award },
    { value: 'follower_gained', label: 'Followers', icon: Users }
  ], []);

  const filteredActivities = useMemo(() => {
    return filter === 'all' 
      ? activities 
      : activities.filter(activity => activity.type === filter);
  }, [activities, filter]);

  const displayedActivities = useMemo(() => {
    return showMore 
      ? filteredActivities 
      : filteredActivities.slice(0, 4);
  }, [filteredActivities, showMore]);

  const handleFilterChange = useCallback((newFilter) => {
    setFilter(newFilter);
    setShowMore(false); // Reset show more when filter changes
  }, []);

  const handleToggleShowMore = useCallback(() => {
    setShowMore(prev => !prev);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className="mt-12"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center gap-3"
          >
            <TrendingUp className="w-8 h-8 text-emerald-400" />
            Recent Activity
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-gray-400"
          >
            Your nutrition journey timeline and achievements
          </motion.p>
        </div>

        {/* Filter Tabs */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9 }}
          className="flex items-center gap-2 bg-gray-800/50 backdrop-blur-sm rounded-2xl p-1 border border-gray-700/30"
        >
          {filterOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.value}
                onClick={() => handleFilterChange(option.value)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                  filter === option.value
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                }`}
                aria-pressed={filter === option.value}
                aria-label={`Filter by ${option.label}`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{option.label}</span>
              </button>
            );
          })}
        </motion.div>
      </div>

      {/* Activity Cards */}
      <div className="space-y-4">
        <AnimatePresence mode="wait">
          {displayedActivities.length > 0 ? (
            displayedActivities.map((activity, index) => (
              <ActivityCard 
                key={`${filter}-${activity.id}`} 
                activity={activity} 
                index={index} 
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No Activity Yet</h3>
              <p className="text-gray-400 max-w-md mx-auto">
                Start your nutrition journey by creating recipes, following others, or engaging with the community.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Load More Button */}
      {filteredActivities.length > 4 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2 }}
          className="text-center mt-8"
        >
          <button
            onClick={handleToggleShowMore}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800/50 hover:bg-gray-700/50 text-white rounded-2xl font-medium transition-all duration-200 border border-gray-700/30 hover:shadow-lg"
            aria-expanded={showMore}
            aria-label={showMore ? 'Show fewer activities' : 'Show more activities'}
          >
            {showMore ? 'Show Less' : 'Load More Activities'}
            <TrendingUp className={`w-4 h-4 transition-transform duration-200 ${showMore ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>
      )}

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.4 }}
        className="mt-8 grid md:grid-cols-3 gap-6"
      >
        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6 text-center hover:border-emerald-400/30 transition-colors duration-300"
        >
          <div className="w-12 h-12 bg-emerald-400/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">
            {profile.daysActive || Math.floor((Date.now() - new Date(profile.createdAt || Date.now())) / (1000 * 60 * 60 * 24)) || 7}
          </div>
          <div className="text-sm text-gray-400">Days Active</div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6 text-center hover:border-purple-400/30 transition-colors duration-300"
        >
          <div className="w-12 h-12 bg-purple-400/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{activities.length}</div>
          <div className="text-sm text-gray-400">Total Activities</div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02, y: -2 }}
          className="bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/30 p-6 text-center hover:border-blue-400/30 transition-colors duration-300"
        >
          <div className="w-12 h-12 bg-blue-400/10 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white mb-1">{profile.engagementGrowth || '156%'}</div>
          <div className="text-sm text-gray-400">Engagement Growth</div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ActivityFeed;
