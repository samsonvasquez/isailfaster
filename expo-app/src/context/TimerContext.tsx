import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';

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
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stopwatchIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize audio
  useEffect(() => {
    Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      staysActiveInBackground: true,
      playsInSilentModeIOS: true,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
  }, []);

  // Function to speak text using Expo Speech
  const speak = (text: string, timeRemaining: number) => {
    const options = {
      rate: timeRemaining <= 15 ? 1.2 : 0.8,
      pitch: 1.0,
      language: 'en-US',
    };
    
    Speech.speak(text, options);
  };

  // Function to play beep sound
  const playBeep = async (frequency = 800, duration = 100) => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        { uri: `data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT` },
        { shouldPlay: true }
      );
      
      setTimeout(() => {
        sound.unloadAsync();
      }, duration);
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
            setIsStopwatchRunning(true);
            return 0;
          } else if (newTimeLeft >= 1 && newTimeLeft <= 15) {
            speak(newTimeLeft.toString(), newTimeLeft);
          } else if (newTimeLeft < 60 && [20, 25, 30, 35, 40, 45, 50, 55].includes(newTimeLeft)) {
            speak(newTimeLeft.toString(), newTimeLeft);
          } else if (newTimeLeft % 60 === 0 && newTimeLeft > 0) {
            const minutes = Math.floor(newTimeLeft / 60);
            speak(`${minutes} minutes`, newTimeLeft);
          } else {
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
    playBeep(isRunning ? 600 : 1000, 150);
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    playBeep(400, 200);
    setIsRunning(false);
    setTimeLeft(300);
    setStopwatchTime(0);
    setIsStopwatchRunning(false);
  };

  const handleAddMinute = () => {
    playBeep(1200, 100);
    setTimeLeft(prev => Math.min(prev + 60, 900));
  };

  const handleSubtractMinute = () => {
    if (timeLeft > 60) {
      playBeep(800, 100);
      setTimeLeft(prev => prev - 60);
    }
  };

  const handleSync = () => {
    playBeep(1000, 120);
    const nearestMinute = Math.ceil(timeLeft / 60) * 60;
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