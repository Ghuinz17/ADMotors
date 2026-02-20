// src/components/Input.tsx

import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Text,
  ViewStyle,
  TextStyle,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { spacing, borderRadius } from '../styles/global';

interface InputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad' | 'email-address' | 'phone-pad';
  multiline?: boolean;
  numberOfLines?: number;
  required?: boolean;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  value,
  onChangeText,
  icon,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  required = false,
  error,
}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {label} {required && <Text style={styles.required}>*</Text>}
        </Text>
      )}
      <View style={[styles.inputWrapper, error ? styles.inputError : {}]}>
        {icon && <Ionicons name={icon as any} size={20} color={Colors.textSecondary} />}
        <TextInput
          style={[
            styles.input,
            { paddingLeft: icon ? spacing.md : spacing.lg },
          ]}
          placeholder={placeholder}
          placeholderTextColor={Colors.textTertiary}
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
        />
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  } as ViewStyle,
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  } as TextStyle,
  required: {
    color: Colors.danger,
  } as TextStyle,
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.tertiaryBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: 'transparent',
  } as ViewStyle,
  inputError: {
    borderColor: Colors.danger,
  } as ViewStyle,
  input: {
    flex: 1,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 0,
  } as TextStyle,
  errorText: {
    fontSize: 12,
    color: Colors.danger,
    marginTop: spacing.sm,
  } as TextStyle,
});

export default Input;