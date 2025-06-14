import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TimerProvider } from './src/context/TimerContext';
import TimerScreen from './src/screens/TimerScreen';
import SailScreen from './src/screens/SailScreen';
import VMGScreen from './src/screens/VMGScreen';
import DataScreen from './src/screens/DataScreen';
import SupportScreen from './src/screens/SupportScreen';
import TabBarIcon from './src/components/TabBarIcon';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <TimerProvider>
        <NavigationContainer
          theme={{
            dark: true,
            colors: {
              primary: '#ffffff',
              background: '#000000',
              card: '#111111',
              text: '#ffffff',
              border: '#333333',
              notification: '#ffffff',
            },
          }}
        >
          <StatusBar style="light" backgroundColor="#000000" />
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: '#000000',
                borderTopColor: '#333333',
                height: 90,
                paddingBottom: 20,
                paddingTop: 10,
              },
              tabBarActiveTintColor: '#ffffff',
              tabBarInactiveTintColor: '#666666',
              tabBarLabelStyle: {
                fontSize: 10,
                fontWeight: 'bold',
                letterSpacing: 0.5,
              },
            }}
          >
            <Tab.Screen
              name="Timer"
              component={TimerScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabBarIcon name="timer" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Sail"
              component={SailScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabBarIcon name="navigation" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="VMG"
              component={VMGScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabBarIcon name="target" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Data"
              component={DataScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabBarIcon name="bar-chart" color={color} size={size} />
                ),
              }}
            />
            <Tab.Screen
              name="Support"
              component={SupportScreen}
              options={{
                tabBarIcon: ({ color, size }) => (
                  <TabBarIcon name="help-circle" color={color} size={size} />
                ),
              }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </TimerProvider>
    </SafeAreaProvider>
  );
}