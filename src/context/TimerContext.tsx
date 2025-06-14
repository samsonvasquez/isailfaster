import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface TimerContextType {
  timeLeft: number;
  isRunning: boolean;
  stopwatchTime: number;
  isStopwatchRunning: boolean;
  handleStartStop: () => void;
  handleReset: () => void;
  handleAddMinute: () => void;
  handleSubtractMinute: () => void;
  handleSync: () => void;
  playBeep: (frequency?: number, duration?: number) => void;
  formatTime: (seconds: number) => string;
  formatStopwatchTime: (seconds: number) => string;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const useTimer = () => {
  const context = useContext(TimerContext);
  if (context === undefined) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return context;
};

interface TimerProviderProps {
  children: ReactNode;
}

export const TimerProvider: React.FC<TimerProviderProps> = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5:00 default
  const [isRunning, setIsRunning] = useState(false);
  const [stopwatchTime, setStopwatchTime] = useState(0); // Stopwatch time in seconds
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context
  useEffect(() => {
    // Create audio context on first user interaction
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };

    // Add event listener for first user interaction
    document.addEventListener('click', initAudio, { once: true });
    document.addEventListener('touchstart', initAudio, { once: true });

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('touchstart', initAudio);
    };
  }, []);

  // Function to speak text using Web Speech API with dynamic rate
  const speak = (text: string, timeRemaining: number) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      // Use faster rate for final 15 seconds to prevent overlapping
      utterance.rate = timeRemaining <= 15 ? 1.8 : 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      
      window.speechSynthesis.speak(utterance);
    }
  };

  // Function to play beep sound
  const playBeep = (frequency = 800, duration = 100) => {
    if (!audioContextRef.current) return;

    try {
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.1, audioContextRef.current.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + duration / 1000);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + duration / 1000);
    } catch (error) {
      console.log('Audio playback failed:', error);
    }
  };

  // Timer countdown logic with voice announcements
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTimeLeft = prev - 1;
          
          // Voice announcements based on time remaining
          if (newTimeLeft === 0) {
            speak("SAIL FAST", newTimeLeft);
            setIsRunning(false);
            setIsStopwatchRunning(true); // Start stopwatch when timer reaches zero
            return 0;
          } else if (newTimeLeft >= 1 && newTimeLeft <= 15) {
            // Announce 1-15 seconds
            speak(newTimeLeft.toString(), newTimeLeft);
          } else if (newTimeLeft < 60 && [20, 25, 30, 35, 40, 45, 50, 55].includes(newTimeLeft)) {
            // Announce specific seconds in last minute
            speak(newTimeLeft.toString(), newTimeLeft);
          } else if (newTimeLeft % 60 === 0 && newTimeLeft > 0) {
            // Announce full minutes
            const minutes = Math.floor(newTimeLeft / 60);
            speak(`${minutes} minutes`, newTimeLeft);
          } else {
            // Check for quarter-minute marks
            const minutes = Math.floor(newTimeLeft / 60);
            const seconds = newTimeLeft % 60;
            
            if ([15, 30, 45].includes(seconds)) {
              speak(`${minutes} ${seconds}`, newTimeLeft);
            }
          }
          
          return newTimeLeft;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, timeLeft]);

  // Stopwatch logic
  useEffect(() => {
    if (isStopwatchRunning) {
      stopwatchIntervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => prev + 1);
      }, 1000);
    } else {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    }

    return () => {
      if (stopwatchIntervalRef.current) {
        clearInterval(stopwatchIntervalRef.current);
      }
    };
  }, [isStopwatchRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatStopwatchTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartStop = () => {
    playBeep(isRunning ? 600 : 1000, 150); // Lower pitch for stop, higher for start
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playBeep(400, 200); // Lower pitch for reset
    setIsRunning(false);
    setTimeLeft(300); // Reset to 5:00
    setStopwatchTime(0); // Reset stopwatch
    setIsStopwatchRunning(false); // Stop stopwatch
  };

  const handleAddMinute = () => {
    playBeep(1200, 100); // Higher pitch for add
    // Limit timer to maximum of 15 minutes (900 seconds)
    setTimeLeft(prev => Math.min(prev + 60, 900));
  };

  const handleSubtractMinute = () => {
    if (timeLeft > 60) {
      playBeep(800, 100); // Medium pitch for subtract
      setTimeLeft(prev => prev - 60);
    }
  };

  const handleSync = () => {
    playBeep(1000, 120); // Standard pitch for sync
    // Sync functionality - rounds to nearest minute
    const nearestMinute = Math.ceil(timeLeft / 60) * 60;
    // Ensure we don't exceed 15 minutes when syncing
    setTimeLeft(Math.min(nearestMinute, 900));
  };

  const value: TimerContextType = {
    timeLeft,
    isRunning,
    stopwatchTime,
    isStopwatchRunning,
    handleStartStop,
    handleReset,
    handleAddMinute,
    handleSubtractMinute,
    handleSync,
    playBeep,
    formatTime,
    formatStopwatchTime,
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};