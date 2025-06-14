# iSailFaster - Expo React Native App

A professional sailing timer and GPS tracking app built with Expo React Native.

## Features

- **Professional Sailing Timer**: Countdown timer with voice announcements for race starts
- **GPS Speed & Heading**: Real-time sailing data display
- **VMG Calculations**: Velocity Made Good tracking for performance optimization
- **Data Dashboard**: Four-panel view of all sailing metrics
- **Voice Announcements**: Audio countdown and race start calls
- **Cross-Platform**: Works on both iOS and Android

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- Expo CLI: `npm install -g @expo/cli`
- iOS Simulator (for iOS development)
- Android Studio/Emulator (for Android development)

### Installation

1. Navigate to the expo-app directory:
   ```bash
   cd expo-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Run on your preferred platform:
   - iOS: `npm run ios`
   - Android: `npm run android`
   - Web: `npm run web`

### Building for Production

#### iOS

1. Configure your app in `app.json`
2. Build for iOS:
   ```bash
   npm run build:ios
   ```

#### Android

1. Configure your app in `app.json`
2. Build for Android:
   ```bash
   npm run build:android
   ```

### Publishing to App Stores

#### iOS App Store

1. Build the app using EAS Build
2. Submit to App Store:
   ```bash
   npm run submit:ios
   ```

#### Google Play Store

1. Build the app using EAS Build
2. Submit to Google Play:
   ```bash
   npm run submit:android
   ```

## App Structure

```
src/
├── components/          # Reusable components
│   └── TabBarIcon.tsx  # Tab navigation icons
├── context/            # React Context providers
│   └── TimerContext.tsx # Timer state management
├── screens/            # Main app screens
│   ├── TimerScreen.tsx # Countdown timer
│   ├── SailScreen.tsx  # GPS speed & heading
│   ├── VMGScreen.tsx   # VMG calculations
│   ├── DataScreen.tsx  # Four-panel data view
│   └── SupportScreen.tsx # Help & support
└── App.tsx             # Main app component
```

## Key Features

### Timer Screen
- Large, easy-to-read countdown display
- Voice announcements at key intervals
- Touch-optimized control buttons
- Automatic stopwatch when timer reaches zero

### Sail Screen
- Real-time GPS speed in knots
- Compass heading with cardinal directions
- High-contrast display for outdoor use
- Continuous GPS tracking

### VMG Screen
- Set leeward and windward marks
- Calculate Velocity Made Good
- Distance and bearing calculations
- Performance optimization data

### Data Screen
- Four-panel dashboard layout
- Speed, heading, timer, and VMG
- Large numbers optimized for mobile
- Real-time data updates

## Permissions

The app requires the following permissions:

### iOS
- Location Services (for GPS tracking)
- Speech Synthesis (for voice announcements)

### Android
- ACCESS_FINE_LOCATION (for GPS tracking)
- ACCESS_COARSE_LOCATION (for GPS tracking)

## Development

### Adding New Features

1. Create new components in `src/components/`
2. Add new screens in `src/screens/`
3. Update navigation in `App.tsx`
4. Add any new permissions to `app.json`

### Testing

- Test on both iOS and Android devices
- Verify GPS functionality outdoors
- Test voice announcements in various conditions
- Ensure proper handling of location permissions

## Deployment

### App Store Requirements

- App Store Connect account
- iOS Developer Program membership
- Proper app icons and screenshots
- App Store review guidelines compliance

### Google Play Requirements

- Google Play Console account
- Android app bundle (AAB) format
- Proper app icons and screenshots
- Google Play policy compliance

## Support

For support and questions:
- Email: support@isailfaster.com
- Website: https://isailfaster.com

## License

© 2025 iSailFaster.com - All rights reserved