import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../context/TimerContext';

interface Waypoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  name: string;
}

interface LocationData {
  latitude: number;
  longitude: number;
  speed: number | null;
  heading: number | null;
  accuracy: number;
}

export default function VMGScreen() {
  const [leewardMark, setLeewardMark] = useState<Waypoint | null>(null);
  const [windwardMark, setWindwardMark] = useState<Waypoint | null>(null);
  const [currentPosition, setCurrentPosition] = useState<LocationData | null>(null);
  const [windwardDistance, setWindwardDistance] = useState('1.0');
  const [windwardHeading, setWindwardHeading] = useState('0');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [vmgData, setVmgData] = useState<{
    vmgToWindward: number;
    vmgToLeeward: number;
    currentLeg: 'windward' | 'leeward';
    currentSpeed: number;
    currentHeading: number;
  } | null>(null);

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
        setError('Permission to access location was denied');
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
            setCurrentPosition({
              latitude: coords.latitude,
              longitude: coords.longitude,
              speed: coords.speed,
              heading: coords.heading,
              accuracy: coords.accuracy || 0,
            });
            setIsLoading(false);
            setError(null);
          }
        );

        return () => subscription.remove();
      } catch (error) {
        setError('Failed to get location');
        setIsLoading(false);
      }
    })();
  }, []);

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
    return R * c;
  };

  // Calculate bearing between two points
  const calculateBearing = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  };

  // Calculate VMG
  const calculateVMG = (currentSpeed: number, currentHeading: number, targetBearing: number): number => {
    const angleDiff = Math.abs(currentHeading - targetBearing);
    const normalizedAngle = Math.min(angleDiff, 360 - angleDiff);
    return currentSpeed * Math.cos(normalizedAngle * Math.PI / 180);
  };

  // Update VMG calculations
  useEffect(() => {
    if (currentPosition && (leewardMark || windwardMark)) {
      const speed = currentPosition.speed !== null ? currentPosition.speed * 1.94384 : 5.0;
      const heading = currentPosition.heading !== null ? currentPosition.heading : 45;
      
      let vmgToWindward = 0;
      let vmgToLeeward = 0;
      let currentLeg: 'windward' | 'leeward' = 'windward';

      if (windwardMark) {
        const bearingToWindward = calculateBearing(
          currentPosition.latitude, currentPosition.longitude,
          windwardMark.latitude, windwardMark.longitude
        );
        vmgToWindward = calculateVMG(speed, heading, bearingToWindward);
      }

      if (leewardMark) {
        const bearingToLeeward = calculateBearing(
          currentPosition.latitude, currentPosition.longitude,
          leewardMark.latitude, leewardMark.longitude
        );
        vmgToLeeward = calculateVMG(speed, heading, bearingToLeeward);
      }

      if (windwardMark && leewardMark) {
        const distanceToWindward = calculateDistance(
          currentPosition.latitude, currentPosition.longitude,
          windwardMark.latitude, windwardMark.longitude
        );
        const distanceToLeeward = calculateDistance(
          currentPosition.latitude, currentPosition.longitude,
          leewardMark.latitude, leewardMark.longitude
        );
        currentLeg = distanceToWindward < distanceToLeeward ? 'windward' : 'leeward';
      }

      setVmgData({
        vmgToWindward,
        vmgToLeeward,
        currentLeg,
        currentSpeed: speed,
        currentHeading: heading
      });
    } else {
      setVmgData(null);
    }
  }, [currentPosition, leewardMark, windwardMark]);

  const handleSetLeewardMark = () => {
    if (currentPosition) {
      setLeewardMark({
        latitude: currentPosition.latitude,
        longitude: currentPosition.longitude,
        timestamp: Date.now(),
        name: 'Leeward Mark'
      });
      Alert.alert('Success', 'Leeward mark set at current position');
    }
  };

  const handleSetWindwardMark = () => {
    if (currentPosition && leewardMark && windwardDistance && windwardHeading) {
      const distance = parseFloat(windwardDistance);
      const heading = parseFloat(windwardHeading);

      const distanceKm = distance * 1.852;
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

      setWindwardMark({
        latitude: lat2 * 180 / Math.PI,
        longitude: lon2 * 180 / Math.PI,
        timestamp: Date.now(),
        name: 'Windward Mark'
      });
      
      Alert.alert('Success', `Windward mark set ${distance} nm from leeward mark`);
    }
  };

  const handleReset = () => {
    setLeewardMark(null);
    setWindwardMark(null);
    setVmgData(null);
    setWindwardDistance('1.0');
    setWindwardHeading('0');
    Alert.alert('Reset', 'All marks have been reset');
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
          <Text style={styles.subText}>VMG calculations require GPS location data.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
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
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* VMG Display */}
        <View style={styles.vmgContainer}>
          <Text style={styles.vmgValue}>
            {vmgData ? (vmgData.currentLeg === 'windward' 
              ? vmgData.vmgToWindward.toFixed(1)
              : vmgData.vmgToLeeward.toFixed(1)
            ) : '0.0'}
          </Text>
          <Text style={styles.vmgUnit}>KNOTS</Text>
          <Text style={styles.vmgLabel}>
            {vmgData ? (vmgData.currentLeg === 'windward' ? 'To Windward Mark' : 'To Leeward Mark') : 'Set marks to calculate VMG'}
          </Text>
        </View>

        {/* Reset Button */}
        {(leewardMark || windwardMark) && (
          <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
            <Text style={styles.resetButtonText}>Reset All Marks</Text>
          </TouchableOpacity>
        )}

        {/* Mark Setup */}
        <View style={styles.marksContainer}>
          {/* Leeward Mark */}
          <View style={styles.markCard}>
            <View style={styles.markHeader}>
              <Ionicons name="location" size={20} color="#ff4444" />
              <Text style={styles.markTitle}>Leeward Mark</Text>
              {leewardMark && <Ionicons name="checkmark-circle" size={20} color="#44ff88" />}
            </View>
            
            {!leewardMark ? (
              <View>
                <Text style={styles.markDescription}>
                  Set the leeward mark at your current position to begin VMG calculations.
                </Text>
                <TouchableOpacity 
                  style={[styles.markButton, { backgroundColor: '#ff4444' }]} 
                  onPress={handleSetLeewardMark}
                  disabled={!currentPosition}
                >
                  <Text style={styles.markButtonText}>Set Leeward Mark</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View>
                <Text style={styles.markInfo}>Mark set at current position</Text>
                <Text style={styles.markTime}>
                  {new Date(leewardMark.timestamp).toLocaleTimeString()}
                </Text>
              </View>
            )}
          </View>

          {/* Windward Mark */}
          {leewardMark && (
            <View style={styles.markCard}>
              <View style={styles.markHeader}>
                <Ionicons name="locate" size={20} color="#4488ff" />
                <Text style={styles.markTitle}>Windward Mark</Text>
                {windwardMark && <Ionicons name="checkmark-circle" size={20} color="#44ff88" />}
              </View>
              
              {!windwardMark ? (
                <View>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Distance (nautical miles)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={windwardDistance}
                      onChangeText={setWindwardDistance}
                      keyboardType="numeric"
                      placeholder="1.0"
                      placeholderTextColor="#666"
                    />
                  </View>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Heading (degrees)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={windwardHeading}
                      onChangeText={setWindwardHeading}
                      keyboardType="numeric"
                      placeholder="0"
                      placeholderTextColor="#666"
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.markButton, { backgroundColor: '#4488ff' }]} 
                    onPress={handleSetWindwardMark}
                    disabled={!windwardDistance || !windwardHeading}
                  >
                    <Text style={styles.markButtonText}>Set Windward Mark</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View>
                  <Text style={styles.markInfo}>
                    Mark set {parseFloat(windwardDistance).toFixed(1)} nm from leeward mark
                  </Text>
                  <Text style={styles.markTime}>
                    {new Date(windwardMark.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Status Indicator */}
        <View style={styles.statusContainer}>
          <View style={styles.statusDot} />
          <Text style={styles.statusText}>GPS ACTIVE</Text>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
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
  },
  vmgContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  vmgValue: {
    fontSize: 80,
    fontWeight: '900',
    color: '#4488ff',
    letterSpacing: -2,
  },
  vmgUnit: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ccc',
    marginTop: 8,
  },
  vmgLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
  },
  resetButton: {
    backgroundColor: '#333',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  marksContainer: {
    gap: 20,
  },
  markCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 16,
  },
  markHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  markTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginLeft: 8,
  },
  markDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  markInfo: {
    color: '#ccc',
    fontSize: 14,
  },
  markTime: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#222',
    borderColor: '#333',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 16,
  },
  markButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  markButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
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