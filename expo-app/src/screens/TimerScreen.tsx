import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../context/TimerContext';

const { width, height } = Dimensions.get('window');

export default function TimerScreen() {
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

  const isLastTenSeconds = timeLeft <= 10 && timeLeft > 0 && isRunning;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>iSailFaster.com</Text>
      </View>

      <View style={styles.timerContainer}>
        <Text style={[
          styles.timerText,
          isLastTenSeconds && styles.urgentTimer,
          timeLeft === 0 && isStopwatchRunning && styles.stopwatchTimer
        ]}>
          {timeLeft > 0 ? formatTime(timeLeft) : formatStopwatchTime(stopwatchTime)}
        </Text>
      </View>

      <View style={styles.controlsContainer}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <TouchableOpacity style={styles.smallButton} onPress={handleReset}>
            <Ionicons name="refresh" size={24} color="#000" />
            <Text style={styles.buttonLabel}>RESET</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.largeButton, !isRunning && styles.pulsingButton]} 
            onPress={handleStartStop}
          >
            <Ionicons 
              name={isRunning ? "pause" : "play"} 
              size={32} 
              color="#000" 
            />
            <Text style={styles.buttonLabel}>
              {isRunning ? 'STOP' : 'START'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.smallButton} onPress={handleSync}>
            <Ionicons name="sync" size={24} color="#000" />
            <Text style={styles.buttonLabel}>SYNC</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Row */}
        <View style={styles.bottomRow}>
          <TouchableOpacity 
            style={[styles.smallButton, timeLeft >= 900 && styles.disabledButton]} 
            onPress={handleAddMinute}
            disabled={timeLeft >= 900}
          >
            <Ionicons name="add" size={24} color="#000" />
            <Text style={styles.buttonLabel}>+1 MIN</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.smallButton, timeLeft <= 60 && styles.disabledButton]} 
            onPress={handleSubtractMinute}
            disabled={timeLeft <= 60}
          >
            <Ionicons name="remove" size={24} color="#000" />
            <Text style={styles.buttonLabel}>-1 MIN</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    position: 'absolute',
    top: 60,
    alignItems: 'center',
  },
  headerText: {
    color: '#666',
    fontSize: 12,
    fontWeight: '500',
    letterSpacing: 1,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -50,
  },
  timerText: {
    fontSize: Math.min(width * 0.25, 120),
    fontWeight: '900',
    color: '#fff',
    letterSpacing: -2,
  },
  urgentTimer: {
    color: '#ff4444',
  },
  stopwatchTimer: {
    color: '#4488ff',
  },
  controlsContainer: {
    paddingBottom: 40,
    alignItems: 'center',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    gap: 20,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 40,
  },
  smallButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  largeButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  pulsingButton: {
    // Animation would be added here with react-native-reanimated
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonLabel: {
    color: '#000',
    fontSize: 8,
    fontWeight: 'bold',
    marginTop: 2,
    letterSpacing: 0.5,
  },
});