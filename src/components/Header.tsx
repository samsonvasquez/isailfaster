import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Timer, Navigation as NavigationIcon, Target, BarChart3 } from 'lucide-react';

function Header() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const location = useLocation();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const isActive = (path: string) => {
    if (path === '/timer') {
      return location.pathname === '/' || location.pathname === '/timer';
    }
    return location.pathname === path;
  };

  return (
    <header className="safe-area-top border-b border-gray-800">
      {/* Main header content */}
      <div className="flex justify-between items-center px-3 sm:px-4 py-2 sm:py-3">
        {/* Navigation buttons on left */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link
            to="/timer"
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 ${
              isActive('/timer')
                ? 'text-white bg-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Timer className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs font-semibold tracking-wide">TIMER</span>
          </Link>
          
          <Link
            to="/sail"
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 ${
              isActive('/sail')
                ? 'text-white bg-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <NavigationIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs font-semibold tracking-wide">SAIL</span>
          </Link>
          
          <Link
            to="/vmg"
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 ${
              isActive('/vmg')
                ? 'text-white bg-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs font-semibold tracking-wide">VMG</span>
          </Link>
          
          <Link
            to="/data"
            className={`flex items-center space-x-1 px-2 py-1.5 rounded-lg transition-all duration-200 ${
              isActive('/data')
                ? 'text-white bg-gray-700'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs font-semibold tracking-wide">DATA</span>
          </Link>
        </div>
        
        {/* Time on right */}
        <div className="text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold tracking-wider">
          {formatCurrentTime().toUpperCase()}
        </div>
      </div>
      
      {/* iSailFaster.com text below header content */}
      <div className="flex justify-center items-center pb-1 sm:pb-2">
        <span className="text-xs text-gray-600 font-medium tracking-wide">
          iSailFaster.com
        </span>
      </div>
    </header>
  );
}

export default Header;