import React from 'react';
import { Ionicons } from '@expo/vector-icons';

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
}

const iconMap: { [key: string]: keyof typeof Ionicons.glyphMap } = {
  timer: 'timer-outline',
  navigation: 'navigate-outline',
  target: 'locate-outline',
  'bar-chart': 'bar-chart-outline',
  'help-circle': 'help-circle-outline',
};

export default function TabBarIcon({ name, color, size }: TabBarIconProps) {
  const iconName = iconMap[name] || 'help-circle-outline';
  return <Ionicons name={iconName} size={size} color={color} />;
}