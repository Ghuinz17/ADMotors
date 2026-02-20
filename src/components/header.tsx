// src/components/Header.tsx

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { spacing } from '../styles/global';

interface HeaderProps {
  title: string;
  onBackPress?: () => void;
  showBackButton?: boolean;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  title,
  onBackPress,
  showBackButton = true,
  rightComponent = null,
}) => {
  return (
    <View style={styles.wrapper}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={Colors.secondaryBackground}
        translucent={false}
      />
      <View style={styles.header}>
        <View style={styles.headerContent}>
          {showBackButton ? (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              activeOpacity={0.6}
            >
              <Ionicons name="chevron-back" size={28} color={Colors.textPrimary} />
            </TouchableOpacity>
          ) : (
            <View style={styles.backButton} />
          )}

          <Text style={styles.title}>{title}</Text>

          {rightComponent ? rightComponent : <View style={styles.rightSpace} />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: Colors.secondaryBackground,
  } as ViewStyle,
  header: {
    backgroundColor: Colors.secondaryBackground,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
  } as ViewStyle,
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: Colors.textPrimary,
    textAlign: 'center',
  } as TextStyle,
  rightSpace: {
    width: 44,
  } as ViewStyle,
});

export default Header;