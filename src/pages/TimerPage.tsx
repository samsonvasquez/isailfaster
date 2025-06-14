import React, { useEffect } from 'react';
import { Play, Pause, RotateCcw, Plus, Minus, RefreshCw } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

function TimerPage() {
  const {
    timeLeft,
    isRunning,
    stopwatchTime,
    isStopwatchRunning,
    handleStartStop,
    handleReset,
    handleAddMinute,
    handleSubtractMinute,
    handleSync,
    formatTime,
    formatStopwatchTime,
  } = useTimer();

  // Prevent zoom on double tap for iOS
  useEffect(() => {
    const preventDefault = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', preventDefault, { passive: false });
    document.addEventListener('touchend', preventZoom, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventDefault);
      document.removeEventListener('touchend', preventZoom);
    };
  }, []);

  // Check if we're in the last 10 seconds
  const isLastTenSeconds = timeLeft <= 10 && timeLeft > 0 && isRunning;

  return (
    <div className="flex flex-col items-center justify-center px-4 py-2 h-full min-h-0">
      {/* Large Timer Display - Maximized for iPhone */}
      <div className={`text-[7rem] xs:text-[8rem] sm:text-[9rem] md:text-[11rem] lg:text-[14rem] xl:text-[18rem] 2xl:text-[24rem] font-black leading-none tracking-tighter mb-2 sm:mb-3 md:mb-4 select-none text-center transition-all duration-300 ${
        isLastTenSeconds 
          ? 'animate-pulse-urgent text-red-400' 
          : timeLeft === 0 && isStopwatchRunning
          ? 'text-blue-400'
          : 'text-white'
      }`}>
        {timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime)}
      </div>

      {/* Control Buttons - Optimized for Maximum Space */}
      <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-6xl">
        {/* iPhone Portrait Mode: Compact layout */}
        <div className="block lg:hidden">
          {/* Top Row - 3 buttons: RESET, START (larger), SYNC */}
          <div className="flex items-center justify-center space-x-3 xs:space-x-4 sm:space-x-6 mb-3 xs:mb-4 sm:mb-5">
            {/* RESET Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleReset}
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform touch-manipulation shadow-lg"
              >
                <RotateCcw className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-black" />
              </button>
              <span className="text-xs font-bold tracking-wider">RESET</span>
            </div>

            {/* START/STOP Button - Larger */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleStartStop}
                className={`w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform touch-manipulation shadow-xl ${
                  !isRunning ? 'animate-pulse-start' : ''
                }`}
              >
                {isRunning ? (
                  <Pause className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-black" />
                ) : (
                  <Play className="w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-black ml-0.5" />
                )}
              </button>
              <span className={`text-xs font-bold tracking-wider ${
                !isRunning ? 'animate-pulse-start-text' : ''
              }`}>
                {isRunning ? 'STOP' : 'START'}
              </span>
            </div>

            {/* SYNC Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleSync}
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform touch-manipulation shadow-lg"
              >
                <RefreshCw className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-black" />
              </button>
              <span className="text-xs font-bold tracking-wider">SYNC</span>
            </div>
          </div>

          {/* Bottom Row - 2 buttons centered: +1 MIN, -1 MIN */}
          <div className="flex items-center justify-center space-x-5 xs:space-x-6 sm:space-x-8">
            {/* +1 MIN Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleAddMinute}
                disabled={timeLeft >= 900} // Disable when at 15 minutes
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg"
              >
                <Plus className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-black" />
              </button>
              <span className="text-xs font-bold tracking-wider">+1 MIN</span>
            </div>

            {/* -1 MIN Button */}
            <div className="flex flex-col items-center space-y-1">
              <button
                onClick={handleSubtractMinute}
                disabled={timeLeft <= 60}
                className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg"
              >
                <Minus className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-black" />
              </button>
              <span className="text-xs font-bold tracking-wider">-1 MIN</span>
            </div>
          </div>
        </div>

        {/* Landscape Mode: Single row layout - iPad Landscape & Desktop */}
        <div className="hidden lg:flex lg:justify-center lg:space-x-6 xl:space-x-8 2xl:space-x-10">
          {/* -1 MIN Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleSubtractMinute}
              disabled={timeLeft <= 60}
              className="w-20 h-20 xl:w-24 xl:h-24 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg"
            >
              <Minus className="w-8 h-8 xl:w-10 xl:h-10 text-black" />
            </button>
            <span className="text-sm xl:text-base font-bold tracking-wider">-1 MIN</span>
          </div>

          {/* SYNC Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleSync}
              className="w-20 h-20 xl:w-24 xl:h-24 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform touch-manipulation shadow-lg"
            >
              <RefreshCw className="w-8 h-8 xl:w-10 xl:h-10 text-black" />
            </button>
            <span className="text-sm xl:text-base font-bold tracking-wider">SYNC</span>
          </div>

          {/* Start/Stop Button - Center */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleStartStop}
              className={`w-24 h-24 xl:w-28 xl:h-28 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform touch-manipulation shadow-xl ${
                !isRunning ? 'animate-pulse-start' : ''
              }`}
            >
              {isRunning ? (
                <Pause className="w-10 h-10 xl:w-12 xl:h-12 text-black" />
              ) : (
                <Play className="w-10 h-10 xl:w-12 xl:h-12 text-black ml-0.5" />
              )}
            </button>
            <span className={`text-sm xl:text-base font-bold tracking-wider ${
              !isRunning ? 'animate-pulse-start-text' : ''
            }`}>
              {isRunning ? 'STOP' : 'START'}
            </span>
          </div>

          {/* RESET Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleReset}
              className="w-20 h-20 xl:w-24 xl:h-24 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform touch-manipulation shadow-lg"
            >
              <RotateCcw className="w-8 h-8 xl:w-10 xl:h-10 text-black" />
            </button>
            <span className="text-sm xl:text-base font-bold tracking-wider">RESET</span>
          </div>

          {/* +1 MIN Button */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleAddMinute}
              disabled={timeLeft >= 900} // Disable when at 15 minutes
              className="w-20 h-20 xl:w-24 xl:h-24 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 active:scale-95 transform disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation shadow-lg"
            >
              <Plus className="w-8 h-8 xl:w-10 xl:h-10 text-black" />
            </button>
            <span className="text-sm xl:text-base font-bold tracking-wider">+1 MIN</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TimerPage;