import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, Footprints, Zap, Clock, Droplet, TrendingUp,
  Activity, Target, Calendar, RefreshCw, AlertCircle, 
  CheckCircle, Smartphone, Watch
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import healthDataService from '../../services/healthDataService';

const HealthDataDisplay = ({ showConnectionButtons = false, onConnect }) => {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState({
    googleFit: false,
    smartwatch: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    if (user) {
      loadHealthData();
      checkConnectionStatus();

      // Subscribe to real-time health data updates
      const unsubscribe = healthDataService.subscribeToHealthData(user.uid, (data) => {
        if (data) {
          setHealthData(data);
          setLastUpdate(data.lastUpdate);
        }
      });

      return () => unsubscribe();
    }
  }, [user]);

  const loadHealthData = async () => {
    try {
      setIsLoading(true);
      const data = await healthDataService.getHealthData(user.uid);
      setHealthData(data);
      if (data) {
        setLastUpdate(data.lastUpdate);
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const checkConnectionStatus = async () => {
    try {
      const status = await healthDataService.getConnectionStatus(user.uid);
      setConnectionStatus({
        googleFit: status?.googleFitConnected || false,
        smartwatch: status?.smartwatchConnected || false
      });
    } catch (error) {
      console.error('Error checking connection status:', error);
    }
  };

  const syncHealthData = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const data = await healthDataService.fetchHealthData(yesterday, today);
      setHealthData(data);
      setLastUpdate(data.lastUpdate);
    } catch (error) {
      console.error('Error syncing health data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const healthMetrics = [
    {
      id: 'steps',
      label: 'Steps',
      icon: Footprints,
      value: healthData?.steps || 0,
      unit: '',
      color: 'text-blue-400',
      bgColor: 'from-blue-900/30 to-blue-800/30',
      borderColor: 'border-blue-700/40',
      target: 10000,
      format: (value) => value.toLocaleString()
    },
    {
      id: 'heartRate',
      label: 'Heart Rate',
      icon: Heart,
      value: healthData?.heartRate?.value || 0,
      unit: 'bpm',
      color: 'text-red-400',
      bgColor: 'from-red-900/30 to-red-800/30',
      borderColor: 'border-red-700/40',
      target: null,
      format: (value) => Math.round(value)
    },
    {
      id: 'calories',
      label: 'Calories Burned',
      icon: Zap,
      value: healthData?.calories || 0,
      unit: 'kcal',
      color: 'text-orange-400',
      bgColor: 'from-orange-900/30 to-orange-800/30',
      borderColor: 'border-orange-700/40',
      target: 2000,
      format: (value) => Math.round(value)
    },
    {
      id: 'distance',
      label: 'Distance',
      icon: TrendingUp,
      value: healthData?.distance || 0,
      unit: 'km',
      color: 'text-green-400',
      bgColor: 'from-green-900/30 to-green-800/30',
      borderColor: 'border-green-700/40',
      target: 5,
      format: (value) => value.toFixed(1)
    },
    {
      id: 'sleep',
      label: 'Sleep',
      icon: Clock,
      value: healthData?.sleep?.hours || 0,
      unit: 'hours',
      color: 'text-purple-400',
      bgColor: 'from-purple-900/30 to-purple-800/30',
      borderColor: 'border-purple-700/40',
      target: 8,
      format: (value) => `${value}h`
    }
  ];

  const getProgressPercentage = (value, target) => {
    if (!target) return 0;
    return Math.min(100, (value / target) * 100);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700 animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-8 bg-gray-700 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  const hasConnectedDevices = connectionStatus.googleFit || connectionStatus.smartwatch;
  const hasHealthData = healthData && Object.values(healthData).some(value => 
    value !== null && value !== 0 && value !== undefined
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity size={24} className="text-blue-500" />
          <div>
            <h3 className="text-xl font-bold text-white">Health Metrics</h3>
            <p className="text-gray-400 text-sm">Real-time health data from your devices</p>
          </div>
        </div>
        
        {hasConnectedDevices && healthData && (
          <button
            onClick={syncHealthData}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 rounded-lg text-blue-400 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
            <span className="text-sm">Sync</span>
          </button>
        )}
      </div>

      {/* Connection Status */}
      {showConnectionButtons && (
        <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connectionStatus.googleFit ? 'bg-green-500' : 'bg-gray-500'}`}></div>
            <Smartphone size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300">Google Fit</span>
            <span className={`text-xs px-2 py-1 rounded ${
              connectionStatus.googleFit ? 'bg-green-600/20 text-green-400' : 'bg-gray-600/20 text-gray-400'
            }`}>
              {connectionStatus.googleFit ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${connectionStatus.smartwatch ? 'bg-blue-500' : 'bg-gray-500'}`}></div>
            <Watch size={16} className="text-gray-400" />
            <span className="text-sm text-gray-300">Smartwatch</span>
            <span className={`text-xs px-2 py-1 rounded ${
              connectionStatus.smartwatch ? 'bg-blue-600/20 text-blue-400' : 'bg-gray-600/20 text-gray-400'
            }`}>
              {connectionStatus.smartwatch ? 'Connected' : 'Not Connected'}
            </span>
          </div>

          {onConnect && (
            <button
              onClick={onConnect}
              className="ml-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white text-sm font-medium transition-colors"
            >
              Connect Devices
            </button>
          )}
        </div>
      )}

      {/* No Data State */}
      {!hasHealthData && (
        <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <Activity size={48} className="text-gray-500 mx-auto mb-4" />
          <h4 className="text-lg font-semibold text-gray-400 mb-2">No Health Data Available</h4>
          <p className="text-gray-500 text-sm mb-6">
            {!hasConnectedDevices 
              ? 'Connect your devices to start tracking your health metrics'
              : 'Sync your devices to see your latest health data'
            }
          </p>
          {onConnect && (
            <button
              onClick={onConnect}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
            >
              Connect Health Devices
            </button>
          )}
        </div>
      )}

      {/* Health Metrics Grid */}
      {hasHealthData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {healthMetrics.map((metric, index) => (
              <motion.div
                key={metric.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-gradient-to-br ${metric.bgColor} p-6 rounded-xl border ${metric.borderColor}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <metric.icon size={24} className={metric.color} />
                    <h4 className="text-white font-semibold">{metric.label}</h4>
                  </div>
                  {metric.target && (
                    <span className="text-xs text-gray-400">
                      Goal: {metric.format(metric.target)}{metric.unit}
                    </span>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-end gap-2">
                    <span className={`text-3xl font-bold ${metric.color}`}>
                      {metric.format(metric.value)}
                    </span>
                    <span className="text-gray-400 text-sm mb-1">{metric.unit}</span>
                  </div>

                  {metric.target && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Progress</span>
                        <span className={metric.color}>
                          {Math.round(getProgressPercentage(metric.value, metric.target))}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <motion.div
                          className={`h-full rounded-full ${metric.color.replace('text-', 'bg-').replace('-400', '-500')}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${getProgressPercentage(metric.value, metric.target)}%` }}
                          transition={{ duration: 1, ease: "easeOut" }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Last Update Info */}
          {lastUpdate && (
            <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
              <Clock size={14} />
              <span>Last updated: {new Date(lastUpdate).toLocaleString()}</span>
            </div>
          )}

          {/* Sleep Quality (if available) */}
          {healthData?.sleep?.quality && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 p-6 rounded-xl border border-indigo-700/30"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock size={24} className="text-indigo-400" />
                <h4 className="text-white font-semibold">Sleep Quality</h4>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-indigo-400">
                  {healthData.sleep.quality}%
                </div>
                <div className="flex-1">
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <motion.div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${healthData.sleep.quality}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    {healthData.sleep.quality >= 80 ? 'Excellent' : 
                     healthData.sleep.quality >= 70 ? 'Good' : 
                     healthData.sleep.quality >= 60 ? 'Fair' : 'Poor'} sleep quality
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default HealthDataDisplay;
