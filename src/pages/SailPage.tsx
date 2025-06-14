import React, { useState, useEffect, useRef } from 'react';
import { Navigation, Compass, Gauge, AlertCircle, MapPin } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

interface GeolocationData {
  speed: number | null; // m/s
  heading: number | null; // degrees
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

function SailPage() {
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
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

  // Convert m/s to knots
  const convertToKnots = (speedMs: number | null): number => {
    if (speedMs === null) return 0;
    return speedMs * 1.94384; // 1 m/s = 1.94384 knots
  };

  // Format heading to compass direction
  const getCompassDirection = (heading: number | null): string => {
    if (heading === null) return 'N/A';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(heading / 22.5) % 16;
    return directions[index];
  };

  // Check geolocation permission
  const checkPermission = async () => {
    if ('permissions' in navigator) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      } catch (error) {
        console.log('Permission API not supported');
        setPermissionStatus('unknown');
      }
    }
  };

  // Start watching position with high accuracy settings
  const startWatching = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this device');
      setIsLoading(false);
      return;
    }

    // High accuracy options for better GPS data
    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 15000, // Increased timeout
      maximumAge: 500 // Reduced cache time for fresher data
    };

    const successCallback = (position: GeolocationPosition) => {
      const { coords, timestamp } = position;
      
      console.log('GPS Data received:', {
        speed: coords.speed,
        heading: coords.heading,
        accuracy: coords.accuracy,
        latitude: coords.latitude,
        longitude: coords.longitude
      });
      
      setGeoData({
        speed: coords.speed,
        heading: coords.heading,
        latitude: coords.latitude,
        longitude: coords.longitude,
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
          errorMessage = 'Location access denied. Please enable location services and allow location access for this website.';
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Location information unavailable. Make sure you are outdoors with clear sky view.';
          break;
        case error.TIMEOUT:
          errorMessage = 'Location request timed out. Please try again.';
          break;
      }
      
      console.error('Geolocation error:', error);
      setError(errorMessage);
      setIsLoading(false);
    };

    console.log('Starting GPS watch with options:', options);
    watchIdRef.current = navigator.geolocation.watchPosition(
      successCallback,
      errorCallback,
      options
    );
  };

  // Request location permission and start watching
  const requestLocation = () => {
    setIsLoading(true);
    setError(null);
    startWatching();
  };

  useEffect(() => {
    checkPermission();
    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Check if timer or stopwatch is active
  const isTimerActive = isRunning || isStopwatchRunning;
  const displayTime = timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime);
  const isLastTenSeconds = timeLeft <= 10 && timeLeft > 0 && isRunning;

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
            Make sure location services are enabled and you're in an area with good GPS reception.
          </p>
          <p className="text-xs text-gray-500 mt-2 text-center px-4">
            For best results, use outdoors with clear view of the sky.
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
          <div className="space-y-3 text-center">
            <button
              onClick={requestLocation}
              className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-200 active:bg-gray-300 transition-all duration-200"
            >
              Try Again
            </button>
            <div className="text-xs text-gray-400 px-4">
              <p className="mb-1">Troubleshooting tips:</p>
              <p>• Enable location services in browser settings</p>
              <p>• Allow location access when prompted</p>
              <p>• Use outdoors with clear sky view</p>
              <p>• Try refreshing the page</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!geoData) {
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
          <MapPin className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mb-4" />
          <p className="text-base sm:text-lg font-semibold">No GPS Data</p>
        </div>
      </div>
    );
  }

  const speedKnots = convertToKnots(geoData.speed);
  const compassDirection = getCompassDirection(geoData.heading);

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
      
      <div className="flex flex-col flex-1 px-4 py-2 min-h-0">
        {/* iPhone Portrait Mode: Stacked layout optimized for maximum space */}
        <div className="block lg:hidden space-y-4 flex-1 flex flex-col justify-center">
          {/* Speed Display */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <Gauge className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">SOG</h2>
            </div>
            
            <div className="text-center">
              <div className="text-[6rem] xs:text-[7rem] sm:text-[8rem] md:text-[9rem] font-black leading-none tracking-tighter text-blue-400">
                {speedKnots.toFixed(1)}
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-300 mt-1">
                KNOTS
              </div>
              {geoData.speed !== null ? (
                <div className="text-sm sm:text-base text-gray-400 mt-1">
                  {(geoData.speed * 3.6).toFixed(1)} km/h • {geoData.speed.toFixed(1)} m/s
                </div>
              ) : (
                <div className="text-sm sm:text-base text-red-400 mt-1">
                  No speed data available
                </div>
              )}
              <div className="text-xs text-gray-500 mt-1">
                Accuracy: ±{geoData.accuracy.toFixed(0)}m
              </div>
            </div>
          </div>

          {/* Heading Display */}
          <div className="flex flex-col items-center space-y-2">
            <div className="flex items-center space-x-2">
              <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-green-400" />
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold">COG</h2>
            </div>
            
            <div className="text-center">
              <div className="text-[5rem] xs:text-[6rem] sm:text-[7rem] md:text-[8rem] font-black leading-none tracking-tighter text-green-400">
                {geoData.heading !== null ? `${Math.round(geoData.heading)}°` : 'N/A'}
              </div>
              <div className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-300 mt-1">
                {compassDirection}
              </div>
              {geoData.heading === null && (
                <div className="text-sm sm:text-base text-red-400 mt-1">
                  No heading data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Landscape Mode: Side by side layout with maximized space */}
        <div className="hidden lg:flex lg:flex-1 lg:items-center lg:justify-center lg:space-x-8 xl:space-x-12 2xl:space-x-16">
          {/* Speed Display - Left Side */}
          <div className="flex flex-col items-center space-y-4 flex-1">
            <div className="flex items-center space-x-4">
              <Gauge className="w-12 h-12 xl:w-14 xl:h-14 text-blue-400" />
              <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold">SOG</h2>
            </div>
            
            <div className="text-center">
              <div className="text-[14rem] xl:text-[18rem] 2xl:text-[24rem] font-black leading-none tracking-tighter text-blue-400">
                {speedKnots.toFixed(1)}
              </div>
              <div className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-300 mt-4">
                KNOTS
              </div>
              {geoData.speed !== null ? (
                <div className="text-2xl xl:text-3xl text-gray-400 mt-3">
                  {(geoData.speed * 3.6).toFixed(1)} km/h • {geoData.speed.toFixed(1)} m/s
                </div>
              ) : (
                <div className="text-2xl xl:text-3xl text-red-400 mt-3">
                  No speed data available
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-gray-700 h-80 xl:h-96 2xl:h-[28rem]"></div>

          {/* Heading Display - Right Side */}
          <div className="flex flex-col items-center space-y-4 flex-1">
            <div className="flex items-center space-x-4">
              <Compass className="w-12 h-12 xl:w-14 xl:h-14 text-green-400" />
              <h2 className="text-4xl xl:text-5xl 2xl:text-6xl font-bold">COG</h2>
            </div>
            
            <div className="text-center">
              <div className="text-[14rem] xl:text-[18rem] 2xl:text-[24rem] font-black leading-none tracking-tighter text-green-400">
                {geoData.heading !== null ? `${Math.round(geoData.heading)}°` : 'N/A'}
              </div>
              <div className="text-4xl xl:text-5xl 2xl:text-6xl font-bold text-gray-300 mt-4">
                {compassDirection}
              </div>
              {geoData.heading === null && (
                <div className="text-2xl xl:text-3xl text-red-400 mt-3">
                  No heading data available
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status Indicator - Always at bottom */}
        <div className="flex items-center justify-center space-x-2 mt-2 flex-shrink-0">
          <div className={`w-2 h-2 rounded-full ${geoData.speed !== null || geoData.heading !== null ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></div>
          <span className="text-xs text-gray-400">
            {geoData.speed !== null || geoData.heading !== null ? 'GPS ACTIVE' : 'GPS LIMITED'}
          </span>
        </div>
      </div>
    </div>
  );
}

export default SailPage;