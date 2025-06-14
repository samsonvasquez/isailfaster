import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Target, Navigation, AlertCircle, CheckCircle, X, Compass } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

interface Waypoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  name: string;
}

interface GeolocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number;
  timestamp: number;
}

function VMGPage() {
  const [leewardMark, setLeewardMark] = useState<Waypoint | null>(null);
  const [windwardMark, setWindwardMark] = useState<Waypoint | null>(null);
  const [currentPosition, setCurrentPosition] = useState<GeolocationData | null>(null);
  const [windwardDistance, setWindwardDistance] = useState<string>('1.0');
  const [windwardHeading, setWindwardHeading] = useState<string>('0');
  const [useDeviceHeading, setUseDeviceHeading] = useState(false);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vmgData, setVmgData] = useState<{
    vmgToWindward: number;
    vmgToLeeward: number;
    currentLeg: 'windward' | 'leeward';
    distanceToWindward: number;
    distanceToLeeward: number;
    currentSpeed: number;
    currentHeading: number;
  } | null>(null);

  const watchIdRef = useRef<number | null>(null);

  // Get timer state from context
  const {
    timeLeft,
    stopwatchTime,
    isRunning,
    isStopwatchRunning,
    formatTime,
    formatStopwatchTime,
  } = useTimer();

  // Check if timer or stopwatch is active
  const isTimerActive = isRunning || isStopwatchRunning;
  const displayTime = timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime);
  const isLastTenSeconds = timeLeft <= 10 && timeLeft > 0 && isRunning;

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };

  // Calculate bearing between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360; // Normalize to 0-360
  };

  // Calculate VMG (Velocity Made Good)
  const calculateVMG = (currentSpeed: number, currentHeading: number, targetBearing: number): number => {
    const angleDiff = Math.abs(currentHeading - targetBearing);
    const normalizedAngle = Math.min(angleDiff, 360 - angleDiff);
    return currentSpeed * Math.cos(normalizedAngle * Math.PI / 180);
  };

  // Update VMG calculations
  useEffect(() => {
    if (currentPosition && (leewardMark || windwardMark)) {
      // Use actual GPS speed if available, otherwise use a demo speed of 5 knots
      const speed = currentPosition.speed !== null ? currentPosition.speed * 1.94384 : 5.0; // Convert m/s to knots or use demo
      // Use actual GPS heading if available, otherwise use device heading or demo heading
      const heading = currentPosition.heading !== null 
        ? currentPosition.heading 
        : (useDeviceHeading && deviceHeading !== null ? deviceHeading : 45); // Use demo heading of 45 degrees
      
      let vmgToWindward = 0;
      let vmgToLeeward = 0;
      let currentLeg: 'windward' | 'leeward' = 'windward';
      let distanceToWindward = 0;
      let distanceToLeeward = 0;

      if (windwardMark) {
        const bearingToWindward = calculateBearing(
          currentPosition.latitude, currentPosition.longitude,
          windwardMark.latitude, windwardMark.longitude
        );
        vmgToWindward = calculateVMG(speed, heading, bearingToWindward);
        
        distanceToWindward = calculateDistance(
          currentPosition.latitude, currentPosition.longitude,
          windwardMark.latitude, windwardMark.longitude
        );
      }

      if (leewardMark) {
        const bearingToLeeward = calculateBearing(
          currentPosition.latitude, currentPosition.longitude,
          leewardMark.latitude, leewardMark.longitude
        );
        vmgToLeeward = calculateVMG(speed, heading, bearingToLeeward);
        
        distanceToLeeward = calculateDistance(
          currentPosition.latitude, currentPosition.longitude,
          leewardMark.latitude, leewardMark.longitude
        );
      }

      // Determine current leg based on which mark is closer
      if (windwardMark && leewardMark) {
        currentLeg = distanceToWindward < distanceToLeeward ? 'windward' : 'leeward';
      } else if (windwardMark) {
        currentLeg = 'windward';
      } else if (leewardMark) {
        currentLeg = 'leeward';
      }

      setVmgData({
        vmgToWindward,
        vmgToLeeward,
        currentLeg,
        distanceToWindward,
        distanceToLeeward,
        currentSpeed: speed,
        currentHeading: heading
      });
    } else {
      setVmgData(null);
    }
  }, [currentPosition, leewardMark, windwardMark, deviceHeading, useDeviceHeading]);

  // Start watching position
  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this device');
      setIsLoading(false);
      return;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 1000
    };

    const successCallback = (position: GeolocationPosition) => {
      const { coords, timestamp } = position;
      
      setCurrentPosition({
        latitude: coords.latitude,
        longitude: coords.longitude,
        speed: coords.speed,
        heading: coords.heading,
        accuracy: coords.accuracy,
        timestamp
      });
      
      setError(null);
      setIsLoading(false);
    };

    const errorCallback = (error: GeolocationPositionError) => {
      let errorMessage = 'Unknown error occurred';
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Location access denied. Please enable location services.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out.';
          break;
      }
      
      setError(errorMessage);
      setIsLoading(false);
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );
  };

  // Get device heading using DeviceOrientationEvent
  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        setDeviceHeading(event.alpha);
      }
    };

    if (useDeviceHeading && 'DeviceOrientationEvent' in window) {
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
    }
  }, [useDeviceHeading]);

  useEffect(() => {
    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  const handleSetLeewardMark = () => {
    if (currentPosition) {
      const newMark = {
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        timestamp: Date.now(),
        name: 'Leeward Mark'
      };
      setLeewardMark(newMark);
      console.log('Leeward mark set:', newMark);
    } else {
      console.log('No current position available');
    }
  };

  const handleSetWindwardMark = () => {
    if (currentPosition && leewardMark && windwardDistance) {
      const distance = parseFloat(windwardDistance); // Distance in nautical miles
      const heading = useDeviceHeading && deviceHeading !== null 
        ? deviceHeading 
        : parseFloat(windwardHeading || '0');

      // Calculate windward mark position
      const distanceKm = distance * 1.852; // Convert nautical miles to kilometers
      const bearingRad = heading * Math.PI / 180;
      
      const lat1 = leewardMark.latitude * Math.PI / 180;
      const lon1 = leewardMark.longitude * Math.PI / 180;
      
      const lat2 = Math.asin(
        Math.sin(lat1) * Math.cos(distanceKm / 6371) +
        Math.cos(lat1) * Math.sin(distanceKm / 6371) * Math.cos(bearingRad)
      );
      
      const lon2 = lon1 + Math.atan2(
        Math.sin(bearingRad) * Math.sin(distanceKm / 6371) * Math.cos(lat1),
        Math.cos(distanceKm / 6371) - Math.sin(lat1) * Math.sin(lat2)
      );

      const newMark = {
        latitude: lat2 * 180 / Math.PI,
        longitude: lon2 * 180 / Math.PI,
        timestamp: Date.now(),
        name: 'Windward Mark'
      };
      
      setWindwardMark(newMark);
      console.log('Windward mark set:', newMark);
    } else {
      console.log('Missing requirements for windward mark:', {
        currentPosition: !!currentPosition,
        leewardMark: !!leewardMark,
        windwardDistance
      });
    }
  };

  const handleResetLeewardMark = () => {
    setLeewardMark(null);
    console.log('Leeward mark reset');
  };

  const handleResetWindwardMark = () => {
    setWindwardMark(null);
    console.log('Windward mark reset');
  };

  const handleReset = () => {
    setLeewardMark(null);
    setWindwardMark(null);
    setVmgData(null);
    setWindwardDistance('1.0');
    setWindwardHeading('0');
    setUseDeviceHeading(false);
    console.log('All marks reset');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        {/* Timer Display at Top */}
        {isTimerActive && (
          <div className="flex justify-center items-center py-2 border-b border-gray-800">
            <div className={`text-base sm:text-lg font-bold tracking-wider transition-all duration-300 ${
              isLastTenSeconds 
                ? 'animate-pulse-urgent text-red-400' 
                : timeLeft === 0 && isStopwatchRunning
                ? 'text-blue-400'
                : 'text-white'
            }`}>
              TIMER: {displayTime}
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center flex-1 px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mb-4"></div>
          <p className="text-base sm:text-lg font-semibold text-center">Acquiring GPS Signal...</p>
          <p className="text-sm text-gray-400 mt-2 text-center px-4">
            VMG calculations require GPS location data.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        {/* Timer Display at Top */}
        {isTimerActive && (
          <div className="flex justify-center items-center py-2 border-b border-gray-800">
            <div className={`text-base sm:text-lg font-bold tracking-wider transition-all duration-300 ${
              isLastTenSeconds 
                ? 'animate-pulse-urgent text-red-400' 
                : timeLeft === 0 && isStopwatchRunning
                ? 'text-blue-400'
                : 'text-white'
            }`}>
              TIMER: {displayTime}
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-center justify-center flex-1 px-4">
          <AlertCircle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mb-4" />
          <h2 className="text-lg sm:text-xl font-bold mb-2 text-center">GPS Error</h2>
          <p className="text-center text-gray-300 mb-6 px-4">{error}</p>
          <button
            onClick={startWatching}
            className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 active:bg-gray-300 transition-all duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Timer Display at Top */}
      {isTimerActive && (
        <div className="flex justify-center items-center py-2 border-b border-gray-800">
          <div className={`text-base sm:text-lg font-bold tracking-wider transition-all duration-300 ${
            isLastTenSeconds 
              ? 'animate-pulse-urgent text-red-400' 
              : timeLeft === 0 && isStopwatchRunning
              ? 'text-blue-400'
              : 'text-white'
          }`}>
            TIMER: {displayTime}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-2 relative">
        {/* Large VMG Display - Maximized */}
        <div className="text-center mb-4">
          <div className="text-[9rem] xs:text-[11rem] sm:text-[13rem] md:text-[15rem] lg:text-[18rem] font-black leading-none tracking-tighter text-purple-400">
            {vmgData ? (vmgData.currentLeg === 'windward' 
              ? vmgData.vmgToWindward.toFixed(1)
              : vmgData.vmgToLeeward.toFixed(1)
            ) : '0.0'}
          </div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-300 mt-1">
            KNOTS
          </div>
          <div className="text-sm sm:text-base text-gray-400 mt-1">
            {vmgData ? (vmgData.currentLeg === 'windward' ? 'To Windward Mark' : 'To Leeward Mark') : 'Set marks to calculate VMG'}
          </div>
          
          {/* Additional data when VMG is active */}
          {vmgData && (
            <div className="mt-2 text-xs sm:text-sm text-gray-500">
              <p>Speed: {vmgData.currentSpeed.toFixed(1)} kts | Heading: {Math.round(vmgData.currentHeading)}°</p>
              {vmgData.distanceToWindward > 0 && (
                <p>Distance to windward: {(vmgData.distanceToWindward * 0.539957).toFixed(2)} nm</p>
              )}
              {vmgData.distanceToLeeward > 0 && (
                <p>Distance to leeward: {(vmgData.distanceToLeeward * 0.539957).toFixed(2)} nm</p>
              )}
            </div>
          )}
        </div>

        {/* Reset All Button - Centered */}
        {(leewardMark || windwardMark) && (
          <div className="mb-4 flex justify-center">
            <button
              onClick={handleReset}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg font-bold hover:bg-gray-600 active:bg-gray-800 transition-all duration-200 text-sm"
            >
              Reset All Marks
            </button>
          </div>
        )}

        {/* Status Indicator - Centered */}
        <div className="flex items-center justify-center space-x-2 pb-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">GPS ACTIVE</span>
        </div>

        {/* Mark Cards - Positioned at bottom corners with reduced size */}
        {/* Leeward Mark Card - Bottom Left */}
        <div className="absolute bottom-2 left-2 w-56 max-w-[calc(50vw-1rem)]">
          <div className="bg-gray-900 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-red-400" />
                <h3 className="text-xs font-bold">Leeward Mark</h3>
              </div>
              {leewardMark && (
                <div className="flex items-center space-x-1">
                  <button
                    onClick={handleResetLeewardMark}
                    className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 active:bg-red-800 transition-all duration-200"
                  >
                    <X className="w-2 h-2 text-white" />
                  </button>
                  <CheckCircle className="w-3 h-3 text-green-400" />
                </div>
              )}
            </div>
            
            {!leewardMark ? (
              <div>
                <p className="text-gray-300 mb-2 text-xs leading-relaxed">
                  Set the leeward mark at your current position to begin VMG calculations.
                </p>
                <button
                  onClick={handleSetLeewardMark}
                  disabled={!currentPosition}
                  className="w-full bg-red-600 text-white px-2 py-1.5 rounded-lg font-bold hover:bg-red-700 active:bg-red-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                >
                  Set Leeward Mark
                </button>
              </div>
            ) : (
              <div className="text-xs text-gray-300 space-y-1">
                <p className="leading-relaxed">Mark set at current position</p>
                <p className="text-gray-500 text-xs">
                  {new Date(leewardMark.timestamp).toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Windward Mark Card - Bottom Right */}
        {leewardMark && (
          <div className="absolute bottom-2 right-2 w-56 max-w-[calc(50vw-1rem)]">
            <div className="bg-gray-900 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Target className="w-3 h-3 text-blue-400" />
                  <h3 className="text-xs font-bold">Windward Mark</h3>
                </div>
                {windwardMark && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={handleResetWindwardMark}
                      className="w-4 h-4 bg-red-600 rounded-full flex items-center justify-center hover:bg-red-700 active:bg-red-800 transition-all duration-200"
                    >
                      <X className="w-2 h-2 text-white" />
                    </button>
                    <CheckCircle className="w-3 h-3 text-green-400" />
                  </div>
                )}
              </div>
              
              {!windwardMark ? (
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs font-medium text-gray-300 mb-1">
                      Distance (nautical miles)
                    </label>
                    <input
                      type="number"
                      value={windwardDistance}
                      onChange={(e) => setWindwardDistance(e.target.value)}
                      step="0.1"
                      min="0.1"
                      max="10"
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white focus:border-blue-400 focus:outline-none text-xs"
                      placeholder="1.0"
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <input
                        type="checkbox"
                        id="useDeviceHeading"
                        checked={useDeviceHeading}
                        onChange={(e) => setUseDeviceHeading(e.target.checked)}
                        className="rounded"
                      />
                      <label htmlFor="useDeviceHeading" className="text-xs font-medium text-gray-300">
                        Use device compass
                      </label>
                    </div>
                    
                    {!useDeviceHeading ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-300 mb-1">
                          Heading (degrees)
                        </label>
                        <input
                          type="number"
                          value={windwardHeading}
                          onChange={(e) => setWindwardHeading(e.target.value)}
                          min="0"
                          max="360"
                          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-white focus:border-blue-400 focus:outline-none text-xs"
                          placeholder="0"
                        />
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400 flex items-center space-x-1 p-1.5 bg-gray-800 rounded-lg">
                        <Compass className="w-2 h-2" />
                        <span>Heading: {deviceHeading !== null ? `${Math.round(deviceHeading)}°` : 'N/A'}</span>
                      </div>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSetWindwardMark}
                    disabled={!windwardDistance || (!useDeviceHeading && !windwardHeading)}
                    className="w-full bg-blue-600 text-white px-2 py-1.5 rounded-lg font-bold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs"
                  >
                    Set Windward Mark
                  </button>
                </div>
              ) : (
                <div className="text-xs text-gray-300 space-y-1">
                  <p className="leading-relaxed">Mark set {parseFloat(windwardDistance).toFixed(1)} nm from leeward mark</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(windwardMark.timestamp).toLocaleTimeString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VMGPage;