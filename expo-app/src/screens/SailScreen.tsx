import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity } from 'react-native';
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

export default function SailScreen() {
  const [location, setLocation] = useState<LocationData | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
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
      // Request foreground permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        setIsLoading(false);
        return;
      }

      // Request background permissions for better GPS tracking
      try {
        const backgroundStatus = await Location.requestBackgroundPermissionsAsync();
        console.log('Background location permission:', backgroundStatus.status);
      } catch (error) {
        console.log('Background permission not available:', error);
      }

      try {
        // Start watching position with high accuracy
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: 500, // Update every 500ms for better responsiveness
            distanceInterval: 0.5, // Update every 0.5 meters
          },
          (position) => {
            const { coords } = position;
            
            console.log('GPS Data received:', {
              speed: coords.speed,
              heading: coords.heading,
              accuracy: coords.accuracy,
              latitude: coords.latitude,
              longitude: coords.longitude
            });
            
            setLocation({
              speed: coords.speed,
              heading: coords.heading,
              latitude: coords.latitude,
              longitude: coords.longitude,
              accuracy: coords.accuracy || 0,
            });
            setIsLoading(false);
            setErrorMsg(null);
          }
        );

        return () => subscription.remove();
      } catch (error) {
        console.error('Location watch error:', error);
        setErrorMsg('Failed to get location data');
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

  const requestLocation = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setErrorMsg('Permission to access location was denied');
      setIsLoading(false);
      return;
    }

    try {
      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation,
      });
      
      const { coords } = position;
      setLocation({
        speed: coords.speed,
        heading: coords.heading,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy || 0,
      });
      setIsLoading(false);
    } catch (error) {
      console.error('Get location error:', error);
      setErrorMsg('Failed to get location');
      setIsLoading(false);
    }
  };

  if (isLoading) {
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
        
        <View style={styles.centerContent}>
          <Ionicons name="location" size={60} color="#666" />
          <Text style={styles.loadingText}>Acquiring GPS Signal...</Text>
          <Text style={styles.subText}>
            Make sure location services are enabled and you're in an area with good GPS reception.
          </Text>
          <Text style={styles.troubleshootText}>
            For best results, use outdoors with clear view of the sky.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (errorMsg) {
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
        
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle" size={60} color="#ff4444" />
          <Text style={styles.errorTitle}>GPS Error</Text>
          <Text style={styles.errorText}>{errorMsg}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={requestLocation}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <View style={styles.troubleshootContainer}>
            <Text style={styles.troubleshootTitle}>Troubleshooting tips:</Text>
            <Text style={styles.troubleshootText}>• Enable location services in device settings</Text>
            <Text style={styles.troubleshootText}>• Allow location access for this app</Text>
            <Text style={styles.troubleshootText}>• Use outdoors with clear sky view</Text>
            <Text style={styles.troubleshootText}>• Restart the app if needed</Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const speedKnots = convertToKnots(location?.speed || null);
  const compassDirection = getCompassDirection(location?.heading || null);

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
        {/* Speed Display */}
        <View style={styles.dataSection}>
          <View style={styles.dataHeader}>
            <Ionicons name="speedometer" size={32} color="#4488ff" />
            <Text style={styles.dataTitle}>SPEED (SOG)</Text>
          </View>
          
          <Text style={styles.dataValue}>{speedKnots.toFixed(1)}</Text>
          <Text style={styles.dataUnit}>KNOTS</Text>
          {location?.speed !== null ? (
            <View style={styles.dataSubContainer}>
              <Text style={styles.dataSubtext}>
                {((location?.speed || 0) * 3.6).toFixed(1)} km/h
              </Text>
              <Text style={styles.dataSubtext}>
                {(location?.speed || 0).toFixed(1)} m/s
              </Text>
            </View>
          ) : (
            <Text style={styles.dataError}>No speed data available</Text>
          )}
          <Text style={styles.accuracyText}>
            Accuracy: ±{location?.accuracy?.toFixed(0) || 0}m
          </Text>
        </View>

        {/* Heading Display */}
        <View style={styles.dataSection}>
          <View style={styles.dataHeader}>
            <Ionicons name="compass" size={32} color="#44ff88" />
            <Text style={styles.dataTitle}>HEADING (COG)</Text>
          </View>
          
          <Text style={styles.dataValue}>
            {location?.heading !== null ? `${Math.round(location.heading)}°` : 'N/A'}
          </Text>
          <Text style={styles.dataUnit}>{compassDirection}</Text>
          {location?.heading === null && (
            <Text style={styles.dataError}>No heading data available</Text>
          )}
        </View>
      </View>

      {/* Status Indicator */}
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusDot, 
          { backgroundColor: (location?.speed !== null || location?.heading !== null) ? '#44ff88' : '#ff4444' }
        ]} />
        <Text style={styles.statusText}>
          {(location?.speed !== null || location?.heading !== null) ? 'GPS ACTIVE' : 'GPS LIMITED'}
        </Text>
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
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 20,
    textAlign: 'center',
  },
  subText: {
    color: '#666',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
    lineHeight: 20,
  },
  troubleshootText: {
    color: '#555',
    fontSize: 12,
    marginTop: 5,
    textAlign: 'center',
    lineHeight: 16,
  },
  troubleshootContainer: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  troubleshootTitle: {
    color: '#666',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
  },
  errorText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dataContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 60,
  },
  dataSection: {
    alignItems: 'center',
  },
  dataHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  dataTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  dataValue: {
    color: '#4488ff',
    fontSize: 80,
    fontWeight: '900',
    letterSpacing: -2,
  },
  dataUnit: {
    color: '#ccc',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
  },
  dataSubContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  dataSubtext: {
    color: '#666',
    fontSize: 16,
    marginTop: 2,
  },
  dataError: {
    color: '#ff4444',
    fontSize: 14,
    marginTop: 4,
  },
  accuracyText: {
    color: '#555',
    fontSize: 12,
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
  },
  statusText: {
    color: '#666',
    fontSize: 12,
    letterSpacing: 1,
  },
});