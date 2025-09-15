import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Smartphone, Watch, Activity, Heart, Footprints, 
  Zap, CheckCircle, AlertCircle, Loader2, RefreshCw,
  Bluetooth, Wifi, Shield, Clock, ChevronLeft, ChevronRight,
  Signal, Battery, Vibrate, Info, Settings, Star,
  ArrowRight, Check, ExternalLink, Download, Zap as Lightning
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import healthDataService from '../../services/healthDataService';
import '../../styles/modal-utils.css';

const DevicePairingModal = ({ isVisible, onClose, onSuccess }) => {
  const { user } = useAuth();
  const modalRef = useRef(null);
  
  // Enhanced state management
  const [activeTab, setActiveTab] = useState('googlefit');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState('');
  const [connectionStatus, setConnectionStatus] = useState({
    googleFit: false,
    smartwatch: false
  });
  const [smartwatchDevices, setSmartwatchDevices] = useState([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [currentStep, setCurrentStep] = useState('overview');
  const [deviceSearching, setDeviceSearching] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState([]);
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [signalStrength, setSignalStrength] = useState(null);
  
  // Mobile detection
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      setIsFullScreen(window.innerWidth < 640);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Touch gesture handling
  useEffect(() => {
    if (!isVisible || !isMobile) return;
    
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        const touch = e.touches[0];
        modalRef.current?.style.setProperty('--initial-y', touch.clientY);
      }
    };
    
    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && modalRef.current) {
        const touch = e.touches[0];
        const initialY = parseFloat(modalRef.current.style.getPropertyValue('--initial-y') || 0);
        const deltaY = touch.clientY - initialY;
        
        if (deltaY > 50) {
          modalRef.current.style.transform = `translateY(${Math.min(deltaY - 50, 100)}px)`;
          modalRef.current.style.opacity = Math.max(1 - (deltaY - 50) / 200, 0.7);
        }
      }
    };
    
    const handleTouchEnd = (e) => {
      if (modalRef.current) {
        const transform = modalRef.current.style.transform;
        const translateY = parseInt(transform.match(/translateY\((.+)px\)/)?.[1] || 0);
        
        if (translateY > 50) {
          onClose();
        } else {
          modalRef.current.style.transform = '';
          modalRef.current.style.opacity = '';
        }
      }
    };
    
    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isVisible, isMobile, onClose]);

  useEffect(() => {
    if (isVisible && user) {
      checkConnectionStatus();
      setCurrentStep('overview');
    }
  }, [isVisible, user]);
  
  // Prevent body scroll on mobile when modal is open
  useEffect(() => {
    if (isVisible && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [isVisible, isMobile]);

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

  const handleGoogleFitConnect = async () => {
    setIsConnecting(true);
    setConnectionError('');
    
    try {
      const result = await healthDataService.connectGoogleFit();
      if (result.pending) {
        // User will be redirected, close the modal
        onClose();
      } else if (result.success) {
        setConnectionStatus(prev => ({ ...prev, googleFit: true }));
        onSuccess?.('googlefit');
      }
    } catch (error) {
      console.error('Google Fit connection error:', error);
      setConnectionError(
        error.message.includes('cancelled')
          ? 'Connection was cancelled. Please try again.'
          : 'Failed to connect to Google Fit. Please check your browser settings and try again.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleGoogleFitDisconnect = async () => {
    setIsConnecting(true);
    try {
      await healthDataService.disconnectGoogleFit();
      setConnectionStatus(prev => ({ ...prev, googleFit: false }));
    } catch (error) {
      console.error('Error disconnecting Google Fit:', error);
      setConnectionError('Failed to disconnect Google Fit.');
    } finally {
      setIsConnecting(false);
    }
  };

  const scanForDevices = async () => {
    setDeviceSearching(true);
    setNearbyDevices([]);
    
    // Simulate device scanning with mock devices for demo
    const mockDevices = [
      { name: 'Apple Watch Series 9', type: 'apple', rssi: -45, battery: 85 },
      { name: 'Samsung Galaxy Watch6', type: 'samsung', rssi: -52, battery: 72 },
      { name: 'Fitbit Sense 2', type: 'fitbit', rssi: -38, battery: 91 },
      { name: 'Garmin Venu 3', type: 'garmin', rssi: -60, battery: 68 }
    ];
    
    for (let i = 0; i < mockDevices.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setNearbyDevices(prev => [...prev, mockDevices[i]]);
    }
    
    setDeviceSearching(false);
  };

  const handleSmartwatchConnect = async (selectedDevice = null) => {
    setIsConnecting(true);
    setConnectionError('');
    setSmartwatchDevices([]);
    
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth is not supported in this browser');
      }

      // Enhanced device filtering with more brands and services
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: ['heart_rate'] },
          { services: ['fitness_machine'] },
          { services: ['battery_service'] },
          { namePrefix: 'Fitbit' },
          { namePrefix: 'Garmin' },
          { namePrefix: 'Samsung' },
          { namePrefix: 'Apple' },
          { namePrefix: 'Polar' },
          { namePrefix: 'Suunto' },
          { namePrefix: 'Amazfit' },
          { namePrefix: 'Huawei' },
          { namePrefix: 'Xiaomi' }
        ],
        optionalServices: [
          'battery_service', 
          'device_information',
          'heart_rate',
          'fitness_machine',
          'running_speed_and_cadence',
          'cycling_speed_and_cadence'
        ]
      });

      setCurrentStep('connecting');
      const server = await device.gatt.connect();
      
      // Get battery level if available
      try {
        const batteryService = await server.getPrimaryService('battery_service');
        const batteryCharacteristic = await batteryService.getCharacteristic('battery_level');
        const batteryValue = await batteryCharacteristic.readValue();
        setBatteryLevel(batteryValue.getUint8(0));
      } catch (e) {
        console.log('Battery service not available');
      }
      
      // Simulate signal strength
      setSignalStrength(Math.floor(Math.random() * 30) + 70);
      
      // Save connection status
      await healthDataService.saveConnectionStatus(user.uid, {
        smartwatchConnected: true,
        smartwatchName: device.name,
        smartwatchId: device.id,
        batteryLevel: batteryLevel,
        signalStrength: signalStrength,
        connectedAt: new Date()
      });

      setConnectionStatus(prev => ({ ...prev, smartwatch: true }));
      setSmartwatchDevices([{
        name: device.name,
        id: device.id,
        connected: true,
        battery: batteryLevel,
        signal: signalStrength
      }]);
      
      setCurrentStep('success');
      setTimeout(() => {
        onSuccess?.('smartwatch');
        setCurrentStep('overview');
      }, 2000);
    } catch (error) {
      console.error('Smartwatch connection error:', error);
      setCurrentStep('overview');
      setConnectionError(
        error.name === 'NotFoundError' 
          ? 'Device selection was cancelled.'
          : error.name === 'NotSupportedError'
          ? 'This device is not supported. Try a different smartwatch.'
          : 'Failed to connect to smartwatch. Make sure Bluetooth is enabled and the device is in pairing mode.'
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSmartwatchDisconnect = async () => {
    setIsConnecting(true);
    try {
      await healthDataService.saveConnectionStatus(user.uid, {
        smartwatchConnected: false,
        disconnectedAt: new Date()
      });
      setConnectionStatus(prev => ({ ...prev, smartwatch: false }));
      setSmartwatchDevices([]);
    } catch (error) {
      console.error('Error disconnecting smartwatch:', error);
      setConnectionError('Failed to disconnect smartwatch.');
    } finally {
      setIsConnecting(false);
    }
  };

  const deviceFeatures = {
    googlefit: [
      { 
        icon: Footprints, 
        label: 'Steps & Distance', 
        description: 'Track daily steps and distance walked',
        value: '10,247 steps',
        color: 'text-blue-400'
      },
      { 
        icon: Heart, 
        label: 'Heart Rate', 
        description: 'Monitor heart rate throughout the day',
        value: 'Avg 72 bpm',
        color: 'text-red-400'
      },
      { 
        icon: Zap, 
        label: 'Calories', 
        description: 'Track calories burned from activities',
        value: '2,340 kcal',
        color: 'text-orange-400'
      },
      { 
        icon: Clock, 
        label: 'Sleep Tracking', 
        description: 'Monitor sleep duration and quality',
        value: '7h 42m',
        color: 'text-purple-400'
      }
    ],
    smartwatch: [
      { 
        icon: Heart, 
        label: 'Real-time Heart Rate', 
        description: 'Live heart rate monitoring with alerts',
        value: 'Live monitoring',
        color: 'text-red-400'
      },
      { 
        icon: Activity, 
        label: 'Workout Tracking', 
        description: 'Track specific workouts and exercises',
        value: '40+ activities',
        color: 'text-green-400'
      },
      { 
        icon: Bluetooth, 
        label: 'Instant Sync', 
        description: 'Real-time data synchronization',
        value: 'Auto sync',
        color: 'text-blue-400'
      },
      { 
        icon: Shield, 
        label: 'Secure Connection', 
        description: 'Encrypted device communication',
        value: 'End-to-end',
        color: 'text-indigo-400'
      }
    ]
  };
  
  const supportedDevices = {
    smartwatch: [
      { brand: 'Apple', models: ['Watch Series 9', 'Watch Ultra 2', 'Watch SE'], icon: '🍎' },
      { brand: 'Samsung', models: ['Galaxy Watch6', 'Galaxy Watch6 Classic'], icon: '📱' },
      { brand: 'Fitbit', models: ['Sense 2', 'Versa 4', 'Charge 6'], icon: '⌚' },
      { brand: 'Garmin', models: ['Venu 3', 'Forerunner 965', 'Fenix 7'], icon: '🏃' },
      { brand: 'Polar', models: ['Vantage V3', 'Grit X2 Pro'], icon: '❄️' },
      { brand: 'Suunto', models: ['9 Peak Pro', 'Vertical'], icon: '🏔️' }
    ]
  };
  
  // Steps for connection process
  const connectionSteps = {
    googlefit: [
      { id: 'overview', title: 'Overview', icon: Info },
      { id: 'permissions', title: 'Permissions', icon: Shield },
      { id: 'connecting', title: 'Connecting', icon: Loader2 },
      { id: 'success', title: 'Success', icon: CheckCircle }
    ],
    smartwatch: [
      { id: 'overview', title: 'Overview', icon: Info },
      { id: 'scan', title: 'Scan Devices', icon: Bluetooth },
      { id: 'connecting', title: 'Connecting', icon: Loader2 },
      { id: 'success', title: 'Success', icon: CheckCircle }
    ]
  };

  if (!isVisible) return null;

  const MobileHeader = () => (
    <div className={`${isMobile ? 'sticky top-0 bg-gray-900/95 backdrop-blur-xl z-10 -mx-4 -mt-4 px-4 pt-4 pb-2 mb-4' : 'mb-6'}`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'} rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center`}>
            <Activity size={isMobile ? 20 : 24} className="text-blue-400" />
          </div>
          <div>
            <h2 className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-white`}>
              {isMobile ? 'Health Devices' : 'Connect Health Devices'}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm">
              {isMobile ? 'Track metrics in real-time' : 'Connect your devices to track health metrics in real-time'}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`${isMobile ? 'p-2.5' : 'p-2'} bg-gray-800 hover:bg-gray-700 rounded-xl text-white transition-all duration-200 active:scale-95`}
        >
          <X size={isMobile ? 18 : 20} />
        </button>
      </div>
      
      {/* Mobile swipe indicator */}
      {isMobile && (
        <div className="flex justify-center mt-3">
          <div className="w-12 h-1 bg-gray-600 rounded-full"></div>
        </div>
      )}
    </div>
  );

  const TabNavigation = () => (
    <div className={`${isMobile ? 'flex space-x-2' : 'flex space-x-4'} mb-6`}>
      <button
        onClick={() => setActiveTab('googlefit')}
        className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2.5 text-sm' : 'px-4 py-2'} rounded-xl font-medium transition-all duration-200 ${
          activeTab === 'googlefit' 
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' 
            : 'bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-700/70'
        }`}
      >
        <Smartphone size={isMobile ? 16 : 20} />
        {!isMobile && 'Google Fit'}
        {isMobile && 'Fit'}
        {connectionStatus.googleFit && (
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        )}
      </button>
      <button
        onClick={() => setActiveTab('smartwatch')}
        className={`flex items-center gap-2 ${isMobile ? 'px-3 py-2.5 text-sm' : 'px-4 py-2'} rounded-xl font-medium transition-all duration-200 ${
          activeTab === 'smartwatch' 
            ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg' 
            : 'bg-gray-800/70 text-gray-400 hover:text-white hover:bg-gray-700/70'
        }`}
      >
        <Watch size={isMobile ? 16 : 20} />
        {!isMobile && 'Smartwatch'}
        {isMobile && 'Watch'}
        {connectionStatus.smartwatch && (
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
        )}
      </button>
    </div>
  );

  const FeatureCard = ({ feature, index, type }) => {
    const paddingClass = isMobile ? 'p-3' : 'p-4';
    const iconSize = isMobile ? 'w-10 h-10' : 'w-12 h-12';
    const gradientClass = type === 'googlefit' ? 'from-blue-500/20 to-green-500/20' : 'from-purple-500/20 to-pink-500/20';
    
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className={`flex items-start gap-3 ${paddingClass} bg-gray-800/50 hover:bg-gray-800/70 rounded-xl transition-all duration-200 group border border-gray-700/30 hover:border-gray-600/50`}
      >
        <div className={`${iconSize} rounded-xl bg-gradient-to-br ${gradientClass} flex items-center justify-center`}>
          <feature.icon size={isMobile ? 18 : 20} className={feature.color} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className={`text-white font-semibold ${isMobile ? 'text-sm' : 'text-base'}`}>{feature.label}</h4>
            <span className={`${feature.color} font-bold ${isMobile ? 'text-xs' : 'text-sm'} opacity-80`}>
              {feature.value}
            </span>
          </div>
          <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>{feature.description}</p>
        </div>
      </motion.div>
    );
  };

  const ConnectionStatusCard = () => {
    return (
      <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-700/50">
        <h4 className={`text-white font-bold ${isMobile ? 'text-base' : 'text-lg'} mb-4 flex items-center gap-2`}>
          <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
            <Activity size={16} className="text-green-400" />
          </div>
          Connection Status
        </h4>
        
        <div className="space-y-3">
          <div className={`flex items-center justify-between p-3 ${isMobile ? 'rounded-xl' : 'rounded-lg'} bg-gray-700/30 border border-gray-600/30`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.googleFit ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>Google Fit</span>
            </div>
            <span className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} rounded-lg font-medium ${
              connectionStatus.googleFit ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
            }`}>
              {connectionStatus.googleFit ? 'Connected' : 'Disconnected'}
            </span>
          </div>

          <div className={`flex items-center justify-between p-3 ${isMobile ? 'rounded-xl' : 'rounded-lg'} bg-gray-700/30 border border-gray-600/30`}>
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.smartwatch ? 'bg-blue-500 animate-pulse' : 'bg-gray-500'}`}></div>
              <span className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>Smartwatch</span>
              {smartwatchDevices.length > 0 && batteryLevel && (
                <div className="flex items-center gap-1">
                  <Battery size={12} className="text-green-400" />
                  <span className="text-xs text-green-400">{batteryLevel}%</span>
                </div>
              )}
            </div>
            <span className={`${isMobile ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5'} rounded-lg font-medium ${
              connectionStatus.smartwatch ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 'bg-gray-600/20 text-gray-400 border border-gray-600/30'
            }`}>
              {connectionStatus.smartwatch ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex ${isFullScreen ? 'items-end' : 'items-center justify-center'} z-50 ${isMobile ? 'p-0' : 'p-4'}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={isMobile ? undefined : onClose}
      >
        <motion.div
          ref={modalRef}
          className={`bg-gray-900/95 backdrop-blur-2xl border border-gray-700/50 overflow-hidden ${
            isFullScreen 
              ? 'rounded-t-3xl w-full h-[85vh] max-h-[85vh]' 
              : isMobile 
                ? 'rounded-2xl w-full h-[80vh] max-h-[80vh] mx-2 mb-2' 
                : 'rounded-3xl w-full max-w-5xl max-h-[90vh]'
          }`}
          initial={{
            scale: isFullScreen ? 0.95 : 0.9,
            opacity: 0,
            y: isFullScreen ? 100 : 20
          }}
          animate={{
            scale: 1,
            opacity: 1,
            y: 0
          }}
          exit={{
            scale: isFullScreen ? 0.95 : 0.9,
            opacity: 0,
            y: isFullScreen ? 100 : 20
          }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={`${isMobile ? 'p-4' : 'p-6'} h-full overflow-y-auto scrollbar-hide`}>
            <MobileHeader />

            <TabNavigation />
            
            {/* Progress Steps for Mobile */}
            {isMobile && currentStep !== 'overview' && (
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-400">Connection Progress</span>
                  <span className="text-xs text-blue-400">
                    {currentStep === 'connecting' ? 'Connecting...' : currentStep === 'success' ? 'Success!' : ''}
                  </span>
                </div>
                <div className="w-full bg-gray-700/30 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{
                      width: currentStep === 'connecting' ? '70%' : currentStep === 'success' ? '100%' : '0%'
                    }}
                  ></div>
                </div>
              </div>
            )}

            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 lg:grid-cols-2 gap-6'}`}>
              {/* Device Info Section */}
              <div className={isMobile ? '' : 'space-y-6'}>
                <AnimatePresence mode="wait">
                  {activeTab === 'googlefit' && (
                    <motion.div
                      key="googlefit"
                      initial={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? 20 : 0 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? -20 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-gradient-to-br from-blue-900/30 to-green-900/30 p-4 sm:p-6 rounded-2xl border border-blue-700/30 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-2xl bg-gradient-to-br from-blue-500/30 to-green-500/30 flex items-center justify-center`}>
                            <Smartphone size={isMobile ? 24 : 28} className="text-blue-400" />
                          </div>
                          <div>
                            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`}>Google Fit</h3>
                            <p className="text-gray-400 text-sm">Comprehensive health tracking</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {deviceFeatures.googlefit.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} type="googlefit" />
                          ))}
                        </div>
                        
                        {/* Quick Stats for Mobile */}
                        {isMobile && (
                          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl">
                            <p className="text-blue-400 text-xs mb-2 font-medium">Today's Overview</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="text-white">Steps: <span className="text-blue-400">8,247</span></div>
                              <div className="text-white">Calories: <span className="text-orange-400">1,890</span></div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {activeTab === 'smartwatch' && (
                    <motion.div
                      key="smartwatch"
                      initial={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? 20 : 0 }}
                      animate={{ opacity: 1, x: 0, y: 0 }}
                      exit={{ opacity: 0, x: isMobile ? 0 : -20, y: isMobile ? -20 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 p-4 sm:p-6 rounded-2xl border border-purple-700/30 backdrop-blur-xl">
                        <div className="flex items-center gap-3 mb-4">
                          <div className={`${isMobile ? 'w-12 h-12' : 'w-14 h-14'} rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 flex items-center justify-center`}>
                            <Watch size={isMobile ? 24 : 28} className="text-purple-400" />
                          </div>
                          <div>
                            <h3 className={`${isMobile ? 'text-lg' : 'text-xl'} font-bold text-white`}>Smartwatch</h3>
                            <p className="text-gray-400 text-sm">Real-time fitness monitoring</p>
                          </div>
                        </div>

                        <div className="space-y-3">
                          {deviceFeatures.smartwatch.map((feature, index) => (
                            <FeatureCard key={index} feature={feature} index={index} type="smartwatch" />
                          ))}
                        </div>
                        
                        {/* Supported Devices */}
                        {!isMobile && (
                          <div className="mt-4 p-3 bg-purple-900/20 border border-purple-700/40 rounded-xl">
                            <p className="text-purple-400 text-sm mb-3 font-medium">Supported Devices</p>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {supportedDevices.smartwatch.slice(0, 4).map((device, index) => (
                                <div key={index} className="flex items-center gap-2 text-gray-300">
                                  <span>{device.icon}</span>
                                  <span>{device.brand}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Mobile Warning */}
                        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/40 rounded-xl">
                          <p className="text-yellow-400 text-xs sm:text-sm">
                            <strong>Note:</strong> {isMobile ? 'Enable Bluetooth for pairing.' : 'Ensure your smartwatch is in pairing mode and Bluetooth is enabled.'}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Connection Interface Section */}
              <div className={isMobile ? 'space-y-4' : 'space-y-6'}>
                <ConnectionStatusCard />
                
                {/* Connection Actions */}
                <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-4 sm:p-6 border border-gray-700/50">
                  <h4 className={`text-white font-bold ${isMobile ? 'text-base' : 'text-lg'} mb-4 flex items-center gap-2`}>
                    <div className={`w-8 h-8 rounded-lg ${activeTab === 'googlefit' ? 'bg-blue-500/20' : 'bg-purple-500/20'} flex items-center justify-center`}>
                      {activeTab === 'googlefit' ? (
                        <Smartphone size={16} className="text-blue-400" />
                      ) : (
                        <Watch size={16} className="text-purple-400" />
                      )}
                    </div>
                    {activeTab === 'googlefit' ? 'Google Fit Connection' : 'Smartwatch Connection'}
                  </h4>

                  <AnimatePresence mode="wait">
                    {activeTab === 'googlefit' && (
                      <motion.div
                        key="googlefit-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {!connectionStatus.googleFit ? (
                          <>
                            <button
                              onClick={handleGoogleFitConnect}
                              disabled={isConnecting}
                              className={`w-full flex items-center justify-center gap-2 ${isMobile ? 'py-3.5 px-4' : 'py-3 px-4'} bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-blue-500/25 active:scale-[0.98]`}
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 size={20} className="animate-spin" />
                                  {isMobile ? 'Connecting...' : 'Connecting to Google Fit...'}
                                </>
                              ) : (
                                <>
                                  <Smartphone size={20} />
                                  {isMobile ? 'Connect Fit' : 'Connect Google Fit'}
                                  <ExternalLink size={16} className="opacity-60" />
                                </>
                              )}
                            </button>
                            
                            {/* Instructions for mobile */}
                            {isMobile && (
                              <div className="p-3 bg-blue-900/20 border border-blue-700/40 rounded-xl">
                                <p className="text-blue-400 text-xs">
                                  📱 You'll be redirected to Google to authorize access
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-3">
                            <div className={`flex items-center gap-3 p-3 ${isMobile ? 'rounded-xl' : 'rounded-lg'} bg-green-500/10 border border-green-500/30`}>
                              <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
                                <CheckCircle size={16} className="text-green-400" />
                              </div>
                              <div className="flex-1">
                                <span className={`text-green-400 font-semibold ${isMobile ? 'text-sm' : ''}`}>Google Fit Connected</span>
                                <p className="text-green-400/70 text-xs">Syncing health data automatically</p>
                              </div>
                            </div>
                            
                            <button
                              onClick={handleGoogleFitDisconnect}
                              disabled={isConnecting}
                              className={`w-full ${isMobile ? 'py-2.5 px-4' : 'py-2 px-4'} bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/50 rounded-xl text-red-400 font-medium transition-all duration-200 active:scale-[0.98]`}
                            >
                              {isMobile ? 'Disconnect' : 'Disconnect Google Fit'}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}

                    {activeTab === 'smartwatch' && (
                      <motion.div
                        key="smartwatch-actions"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        {!connectionStatus.smartwatch ? (
                          <>
                            <button
                              onClick={handleSmartwatchConnect}
                              disabled={isConnecting}
                              className={`w-full flex items-center justify-center gap-2 ${isMobile ? 'py-3.5 px-4' : 'py-3 px-4'} bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl text-white font-medium transition-all duration-200 shadow-lg hover:shadow-purple-500/25 active:scale-[0.98]`}
                            >
                              {isConnecting ? (
                                <>
                                  <Loader2 size={20} className="animate-spin" />
                                  {currentStep === 'connecting' ? 'Connecting...' : 'Searching...'}
                                </>
                              ) : (
                                <>
                                  <Bluetooth size={20} />
                                  {isMobile ? 'Pair Watch' : 'Pair Smartwatch'}
                                  <Vibrate size={16} className="opacity-60" />
                                </>
                              )}
                            </button>
                            
                            {/* Bluetooth status for mobile */}
                            {isMobile && (
                              <div className="p-3 bg-purple-900/20 border border-purple-700/40 rounded-xl">
                                <p className="text-purple-400 text-xs">
                                  🔵 Make sure Bluetooth is enabled and device is discoverable
                                </p>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="space-y-3">
                            <div className={`flex items-center gap-3 p-3 ${isMobile ? 'rounded-xl' : 'rounded-lg'} bg-blue-500/10 border border-blue-500/30`}>
                              <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <CheckCircle size={16} className="text-blue-400" />
                              </div>
                              <div className="flex-1">
                                <span className={`text-blue-400 font-semibold ${isMobile ? 'text-sm' : ''}`}>Smartwatch Connected</span>
                                <p className="text-blue-400/70 text-xs">Real-time data streaming</p>
                              </div>
                              {batteryLevel && (
                                <div className="flex items-center gap-1">
                                  <Battery size={14} className="text-green-400" />
                                  <span className="text-xs text-green-400 font-medium">{batteryLevel}%</span>
                                </div>
                              )}
                            </div>
                            
                            {smartwatchDevices.length > 0 && (
                              <div className={`p-3 bg-gray-700/30 border border-gray-600/30 ${isMobile ? 'rounded-xl' : 'rounded-lg'}`}>
                                <div className="flex items-center justify-between">
                                  <div>
                                    <p className={`text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'} mb-1`}>Connected Device:</p>
                                    <p className={`text-white font-medium ${isMobile ? 'text-sm' : ''}`}>{smartwatchDevices[0].name}</p>
                                  </div>
                                  {signalStrength && (
                                    <div className="flex items-center gap-1">
                                      <Signal size={14} className="text-blue-400" />
                                      <span className="text-xs text-blue-400">{signalStrength}%</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <button
                              onClick={handleSmartwatchDisconnect}
                              disabled={isConnecting}
                              className={`w-full ${isMobile ? 'py-2.5 px-4' : 'py-2 px-4'} bg-red-600/10 hover:bg-red-600/20 border border-red-600/30 hover:border-red-600/50 rounded-xl text-red-400 font-medium transition-all duration-200 active:scale-[0.98]`}
                            >
                              {isMobile ? 'Disconnect' : 'Disconnect Smartwatch'}
                            </button>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Error Message */}
                  <AnimatePresence>
                    {connectionError && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className={`mt-4 p-3 bg-red-900/20 border border-red-700/40 ${isMobile ? 'rounded-xl' : 'rounded-lg'} backdrop-blur-sm`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <AlertCircle size={14} className="text-red-400" />
                          </div>
                          <div className="flex-1">
                            <p className={`text-red-400 ${isMobile ? 'text-xs' : 'text-sm'} leading-relaxed`}>{connectionError}</p>
                            <button
                              onClick={() => setConnectionError('')}
                              className="text-red-400/60 hover:text-red-400 text-xs mt-1 transition-colors"
                            >
                              Dismiss
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DevicePairingModal;
