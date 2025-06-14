import React from 'react';
import { Mail, Globe, MessageCircle, Star, HelpCircle, Clock, Navigation, Smartphone } from 'lucide-react';
import { useTimer } from '../context/TimerContext';

function SupportPage() {
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
      answer: "Ensure location services are enabled in your device settings for the browser/app. GPS works best outdoors with a clear view of the sky. Indoor or covered areas may have poor GPS reception."
    },
    {
      question: "Can I use this app offline?",
      answer: "The timer functions work offline, but GPS speed tracking requires location services to be active. Voice announcements work offline once the page has loaded."
    },
    {
      question: "What's the SYNC button for?",
      answer: "The SYNC button rounds your current timer to the nearest minute. This is useful for synchronizing with official race timing or making quick adjustments."
    },
    {
      question: "Can I set custom timer durations?",
      answer: "Currently, you can adjust the timer in 1-minute increments from 1 to 15 minutes using the +1 MIN and -1 MIN buttons. The default starting time is 5 minutes."
    },
    {
      question: "Does the timer continue when I switch pages?",
      answer: "Yes! The timer continues running when you switch between the TIMER and SAIL pages. You'll see a small timer display at the top of the SAIL page when the timer is active."
    },
    {
      question: "What is VMG and how do I use it?",
      answer: "VMG (Velocity Made Good) shows your effective speed toward a target. Set the leeward mark at your current position, then define the windward mark by distance and heading. The app will calculate your VMG to help optimize your sailing performance."
    }
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Timer Display at Top */}
      {isTimerActive && (
        <div className="flex justify-center items-center py-2 border-b border-gray-800">
          <div className={`text-base sm:text-lg font-bold tracking-wider transition-all duration-300 ${
            isLastTenSeconds 
              ? 'animate-pulse-urgent text-red-400' 
              : timeLeft === 0 && isStopwatchRunning
              ? 'text-blue-400'
              : 'text-white'
          }`}>
            TIMER: {displayTime}
          </div>
        </div>
      )}
      
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black mb-2">SUPPORT</h1>
          <p className="text-gray-400 text-sm sm:text-base">Get help with iSailFaster</p>
        </div>

        {/* Quick Contact */}
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-3 flex items-center">
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 mr-2 text-blue-400" />
            Need Help?
          </h2>
          <p className="text-gray-300 mb-4 text-sm sm:text-base">
            Get quick support for your sailing timer and GPS tracking needs.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <a
              href="mailto:support@isailfaster.com"
              className="flex items-center justify-center space-x-2 bg-white text-black px-4 py-3 rounded-lg font-bold hover:bg-gray-200 active:bg-gray-300 transition-all duration-200 text-sm"
            >
              <Mail className="w-4 h-4" />
              <span>Email</span>
            </a>
            <a
              href="https://isailfaster.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 bg-gray-700 text-white px-4 py-3 rounded-lg font-bold hover:bg-gray-600 active:bg-gray-800 transition-all duration-200 text-sm"
            >
              <Globe className="w-4 h-4" />
              <span>Website</span>
            </a>
            <a
              href="#rate"
              className="flex items-center justify-center space-x-2 bg-blue-600 text-white px-4 py-3 rounded-lg font-bold hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 text-sm"
            >
              <Star className="w-4 h-4" />
              <span>Rate App</span>
            </a>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-4 flex items-center">
            <HelpCircle className="w-6 h-6 sm:w-7 sm:h-7 mr-2 text-green-400" />
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <details key={index} className="bg-gray-900 rounded-lg">
                <summary className="p-3 sm:p-4 cursor-pointer hover:bg-gray-800 rounded-lg transition-colors duration-200 font-semibold text-sm sm:text-base">
                  {faq.question}
                </summary>
                <div className="px-3 sm:px-4 pb-3 sm:pb-4 text-gray-300 leading-relaxed text-sm sm:text-base">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* Feature Overview */}
        <div className="bg-gray-900 rounded-lg p-4 sm:p-6 mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">App Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start space-x-3">
              <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">Sailing Timer</h3>
                <p className="text-xs sm:text-sm text-gray-400">Countdown timer with voice announcements for race starts</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Navigation className="w-5 h-5 sm:w-6 sm:h-6 text-green-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">GPS Tracking</h3>
                <p className="text-xs sm:text-sm text-gray-400">Real-time speed and heading display</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Smartphone className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">Mobile Optimized</h3>
                <p className="text-xs sm:text-sm text-gray-400">Designed for iPhone and touch devices</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-sm sm:text-base">Voice Announcements</h3>
                <p className="text-xs sm:text-sm text-gray-400">Audio countdown and race start calls</p>
              </div>
            </div>
          </div>
        </div>

        {/* Rate the App */}
        <div id="rate" className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-lg p-4 sm:p-6 mb-6">
          <div className="text-center">
            <Star className="w-10 h-10 sm:w-12 sm:h-12 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-lg sm:text-xl font-bold mb-2">Enjoying iSailFaster?</h2>
            <p className="text-blue-100 mb-4 text-sm sm:text-base">
              Help other sailors discover this app by leaving a review on the App Store!
            </p>
            <button className="bg-white text-blue-900 px-6 py-3 rounded-lg font-bold hover:bg-gray-100 active:bg-gray-200 transition-all duration-200 text-sm sm:text-base">
              Rate on App Store
            </button>
          </div>
        </div>

        {/* Contact Info */}
        <div className="text-center text-gray-400 text-xs sm:text-sm pb-4">
          <p className="mb-2">iSailFaster - Professional Sailing Timer</p>
          <p>© 2025 iSailFaster.com - All rights reserved</p>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;