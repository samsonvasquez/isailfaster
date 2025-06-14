import React, { useState, useEffect, useRef } from 'react';
import { Gauge, Compass, Timer, Target, AlertCircle, MapPin } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

interface GeolocationData {
  speed: number | null; // m/s
  heading: number | null; // degrees
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

function DataPage() {
  const [geoData, setGeoData] = useState<GeolocationData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  // Calculate demo VMG (simplified calculation for display)
  const calculateDemoVMG = (): number => {
    if (!geoData || geoData.speed === null || geoData.heading === null) {
      return 0;
    }
    
    const speed = convertToKnots(geoData.speed);
    // Simple VMG calculation assuming 45-degree angle to target
    return speed * Math.cos(45 * Math.PI / 180);
  };

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

  useEffect(() => {
    startWatching();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-col items-center justify-center flex-1 px-4">
          <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-white mb-4"></div>
          <p className="text-base sm:text-lg font-semibold text-center">Acquiring GPS Signal...</p>
          <p className="text-sm text-gray-400 mt-2 text-center px-4">
            Loading sailing data display...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
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

  const speedKnots = convertToKnots(geoData?.speed || null);
  const compassDirection = getCompassDirection(geoData?.heading || null);
  const vmgValue = calculateDemoVMG();

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 px-2 py-2 min-h-0">
        {/* Two Rows of Data Fields - Maximized */}
        <div className="h-full flex flex-col space-y-2">
          {/* Top Row: Speed and Heading */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {/* Speed Display */}
            <div className="bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 mb-1">
                <Gauge className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
                <h2 className="text-xs sm:text-sm font-bold">SOG</h2>
              </div>
              
              <div className="text-center">
                <div className="text-[3.5rem] xs:text-[4rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-black leading-none tracking-tighter text-blue-400">
                  {speedKnots.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm md:text-base font-bold text-gray-300 mt-1">
                  KNOTS
                </div>
                {geoData?.speed !== null && (
                  <div className="text-xs text-gray-400 mt-1">
                    {((geoData?.speed || 0) * 3.6).toFixed(1)} km/h
                  </div>
                )}
              </div>
            </div>

            {/* Heading Display */}
            <div className="bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 mb-1">
                <Compass className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                <h2 className="text-xs sm:text-sm font-bold">COG</h2>
              </div>
              
              <div className="text-center">
                <div className="text-[3rem] xs:text-[3.5rem] sm:text-[4rem] md:text-[4.5rem] lg:text-[6rem] font-black leading-none tracking-tighter text-green-400">
                  {geoData?.heading !== null ? `${Math.round(geoData.heading)}°` : 'N/A'}
                </div>
                <div className="text-xs sm:text-sm md:text-base font-bold text-gray-300 mt-1">
                  {compassDirection}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Row: Timer and VMG */}
          <div className="flex-1 grid grid-cols-2 gap-2">
            {/* Timer Display */}
            <div className="bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 mb-1">
                <Timer className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400" />
                <h2 className="text-xs sm:text-sm font-bold">TIMER</h2>
              </div>
              
              <div className="text-center">
                <div className={`text-[3.5rem] xs:text-[4rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-black leading-none tracking-tighter transition-all duration-300 ${
                  isLastTenSeconds 
                    ? 'animate-pulse-urgent text-red-400' 
                    : timeLeft === 0 && isStopwatchRunning
                    ? 'text-blue-400'
                    : 'text-yellow-400'
                }`}>
                  {timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime)}
                </div>
                <div className="text-xs sm:text-sm md:text-base font-bold text-gray-300 mt-1">
                  {timeLeft > 0 ? 'COUNTDOWN' : 'ELAPSED'}
                </div>
              </div>
            </div>

            {/* VMG Display */}
            <div className="bg-gray-900 rounded-lg p-2 flex flex-col items-center justify-center">
              <div className="flex items-center space-x-2 mb-1">
                <Target className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                <h2 className="text-xs sm:text-sm font-bold">VMG</h2>
              </div>
              
              <div className="text-center">
                <div className="text-[3.5rem] xs:text-[4rem] sm:text-[4.5rem] md:text-[5.5rem] lg:text-[7rem] font-black leading-none tracking-tighter text-purple-400">
                  {vmgValue.toFixed(1)}
                </div>
                <div className="text-xs sm:text-sm md:text-base font-bold text-gray-300 mt-1">
                  KNOTS
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Velocity Made Good
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center justify-center space-x-2 mt-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-400">DATA ACTIVE</span>
        </div>
      </div>
    </div>
  );
}

export default DataPage;