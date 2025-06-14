import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTimer } from '../context/TimerContext';

export default function SupportScreen() {
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

  const faqs = [
    {
      question: "How do I use the sailing timer?",
      answer: "Set your desired countdown time using the +1 MIN and -1 MIN buttons, then press START. The timer will count down and announce key time intervals. When it reaches zero, it automatically switches to a stopwatch to track your race time."
    },
    {
      question: "What do the voice announcements include?",
      answer: "The timer announces minutes, quarter-minute marks (15, 30, 45 seconds), the final 60 seconds in 5-second intervals, and counts down the final 15 seconds individually. When the timer reaches zero, it announces 'SAIL FAST'."
    },
    {
      question: "How does the GPS speed tracking work?",
      answer: "On the SAIL page, the app uses your device's GPS to display your current speed in knots and heading in degrees/compass direction. Make sure location services are enabled for accurate readings."
    },
    {
      question: "Why isn't my GPS working?",
      answer: "Ensure location services are enabled in your device settings for the app. GPS works best outdoors with a clear view of the sky. Indoor or covered areas may have poor GPS reception."
    },
    {
      question: "Can I use this app offline?",
      answer: "The timer functions work offline, but GPS speed tracking requires location services to be active. Voice announcements work offline once the app has loaded."
    },
    {
      question: "What's the SYNC button for?",
      answer: "The SYNC button rounds your current timer to the nearest minute. This is useful for synchronizing with official race timing or making quick adjustments."
    },
    {
      question: "What is VMG and how do I use it?",
      answer: "VMG (Velocity Made Good) shows your effective speed toward a target. Set the leeward mark at your current position, then define the windward mark by distance and heading. The app will calculate your VMG to help optimize your sailing performance."
    }
  ];

  const openEmail = () => {
    Linking.openURL('mailto:support@isailfaster.com');
  };

  const openWebsite = () => {
    Linking.openURL('https://isailfaster.com');
  };

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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SUPPORT</Text>
          <Text style={styles.headerSubtitle}>Get help with iSailFaster</Text>
        </View>

        {/* Quick Contact */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <Ionicons name="chatbubble" size={24} color="#4488ff" />
            <Text style={styles.contactTitle}>Need Help?</Text>
          </View>
          <Text style={styles.contactDescription}>
            Get quick support for your sailing timer and GPS tracking needs.
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.emailButton} onPress={openEmail}>
              <Ionicons name="mail" size={20} color="#000" />
              <Text style={styles.emailButtonText}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.websiteButton} onPress={openWebsite}>
              <Ionicons name="globe" size={20} color="#fff" />
              <Text style={styles.websiteButtonText}>Website</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.faqSection}>
          <View style={styles.faqHeader}>
            <Ionicons name="help-circle" size={24} color="#44ff88" />
            <Text style={styles.faqTitle}>Frequently Asked Questions</Text>
          </View>
          
          {faqs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.faqQuestion}>{faq.question}</Text>
              <Text style={styles.faqAnswer}>{faq.answer}</Text>
            </View>
          ))}
        </View>

        {/* Feature Overview */}
        <View style={styles.featuresCard}>
          <Text style={styles.featuresTitle}>App Features</Text>
          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons name="timer" size={20} color="#4488ff" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Sailing Timer</Text>
                <Text style={styles.featureDescription}>Countdown timer with voice announcements for race starts</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="navigate" size={20} color="#44ff88" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>GPS Tracking</Text>
                <Text style={styles.featureDescription}>Real-time speed and heading display</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="phone-portrait" size={20} color="#aa44ff" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Mobile Optimized</Text>
                <Text style={styles.featureDescription}>Designed for iPhone and Android devices</Text>
              </View>
            </View>
            <View style={styles.featureItem}>
              <Ionicons name="volume-high" size={20} color="#ffaa44" />
              <View style={styles.featureText}>
                <Text style={styles.featureName}>Voice Announcements</Text>
                <Text style={styles.featureDescription}>Audio countdown and race start calls</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>iSailFaster - Professional Sailing Timer</Text>
          <Text style={styles.footerText}>© 2025 iSailFaster.com - All rights reserved</Text>
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
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: 1,
  },
  headerSubtitle: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
  },
  contactCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  contactDescription: {
    color: '#ccc',
    fontSize: 14,
    marginBottom: 20,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  emailButton: {
    flex: 1,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  emailButtonText: {
    color: '#000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  websiteButton: {
    flex: 1,
    backgroundColor: '#333',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  websiteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  faqSection: {
    marginBottom: 30,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 12,
  },
  faqTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  faqItem: {
    backgroundColor: '#111',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  faqQuestion: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  faqAnswer: {
    color: '#ccc',
    fontSize: 14,
    lineHeight: 20,
  },
  featuresCard: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  featuresTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  featureText: {
    flex: 1,
  },
  featureName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureDescription: {
    color: '#666',
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
  },
});