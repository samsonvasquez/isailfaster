import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../context/TimerContext';

interface LocationData {
  speed: number | null;
  heading: number | null;
  latitude: number;
  longitude: number;
  accuracy: number;
}

export default function DataScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const {
    timeLeft,
    stopwatchTime,
    isRunning,
    isStopwatchRunning,
    formatTime,
    formatStopwatchTime,
  } = useTimer();

  const isTimerActive = isRunning || isStopwatchRunning;
  const displayTime = timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime);
  const isLastTenSeconds = timeLeft <= 10 && timeLeft > 0 && isRunning;

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsLoading(false);
        return;
      }

      try {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 1000,
            distanceInterval: 1,
          },
          (position) => {
            const { coords } = position;
            setLocation({
              speed: coords.speed,
              heading: coords.heading,
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy || 0,
            });
            setIsLoading(false);
          }
        );

        return () => subscription.remove();
      } catch (error) {
        setIsLoading(false);
      }
    })();
  }, []);

  const convertToKnots = (speedMs: number | null): number => {
    if (speedMs === null) return 0;
    return speedMs * 1.94384;
  };

  const getCompassDirection = (heading: number | null): string => {
    if (heading === null) return 'N/A';
    
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(heading / 22.5) % 16;
    return directions[index];
  };

  const calculateDemoVMG = (): number => {
    if (!location || location.speed === null) return 0;
    const speed = convertToKnots(location.speed);
    return speed * Math.cos(45 * Math.PI / 180);
  };

  const speedKnots = convertToKnots(location?.speed || null);
  const compassDirection = getCompassDirection(location?.heading || null);
  const vmgValue = calculateDemoVMG();

  return (
    <SafeAreaView style={styles.container}>
      {isTimerActive && (
        <View style={styles.timerHeader}>
          <Text style={[
            styles.timerHeaderText,
            isLastTenSeconds && styles.urgentTimer,
            timeLeft === 0 && isStopwatchRunning && styles.stopwatchTimer
          ]}>
            TIMER: {displayTime}
          </Text>
        </View>
      )}
      
      <View style={styles.dataContainer}>
        {/* Top Row: Speed and Heading */}
        <View style={styles.row}>
          {/* Speed */}
          <View style={styles.dataCard}>
            <View style={styles.dataHeader}>
              <Ionicons name="speedometer" size={24} color="#4488ff" />
              <Text style={styles.dataTitle}>SPEED</Text>
            </View>
            <Text style={styles.dataValue}>{speedKnots.toFixed(1)}</Text>
            <Text style={styles.dataUnit}>KNOTS</Text>
            {location?.speed !== null && (
              <Text style={styles.dataSubtext}>
                {((location?.speed || 0) * 3.6).toFixed(1)} km/h
              </Text>
            )}
          </View>

          {/* Heading */}
          <View style={styles.dataCard}>
            <View style={styles.dataHeader}>
              <Ionicons name="compass" size={24} color="#44ff88" />
              <Text style={styles.dataTitle}>HEADING</Text>
            </View>
            <Text style={styles.dataValue}>
              {location?.heading !== null ? `${Math.round(location.heading)}°` : 'N/A'}
            </Text>
            <Text style={styles.dataUnit}>{compassDirection}</Text>
          </View>
        </View>

        {/* Bottom Row: Timer and VMG */}
        <View style={styles.row}>
          {/* Timer */}
          <View style={styles.dataCard}>
            <View style={styles.dataHeader}>
              <Ionicons name="timer" size={24} color="#ffaa44" />
              <Text style={styles.dataTitle}>TIMER</Text>
            </View>
            <Text style={[
              styles.dataValue,
              isLastTenSeconds && styles.urgentTimer,
              timeLeft === 0 && isStopwatchRunning && styles.stopwatchTimer
            ]}>
              {timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime)}
            </Text>
            <Text style={styles.dataUnit}>
              {timeLeft > 0 ? 'COUNTDOWN' : 'ELAPSED'}
            </Text>
          </View>

          {/* VMG */}
          <View style={styles.dataCard}>
            <View style={styles.dataHeader}>
              <Ionicons name="locate" size={24} color="#aa44ff" />
              <Text style={styles.dataTitle}>VMG</Text>
            </View>
            <Text style={styles.dataValue}>{vmgValue.toFixed(1)}</Text>
            <Text style={styles.dataUnit}>KNOTS</Text>
            <Text style={styles.dataSubtext}>Velocity Made Good</Text>
          </View>
        </View>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={styles.statusDot} />
        <Text style={styles.statusText}>DATA ACTIVE</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  timerHeader: {
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  timerHeaderText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  urgentTimer: {
    color: '#ff4444',
  },
  stopwatchTimer: {
    color: '#4488ff',
  },
  dataContainer: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    gap: 16,
  },
  dataCard: {
    flex: 1,
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  dataTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dataValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#4488ff',
    letterSpacing: -1,
    textAlign: 'center',
  },
  dataUnit: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 4,
  },
  dataSubtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#44ff88',
  },
  statusText: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
  },
});