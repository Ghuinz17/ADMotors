// src/styles/global.ts

import { StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../constants/colors';

// ==================== DECLARAR PRIMERO ====================
// Spacing scale - usado en todos lados
export const spacing = {
  xs: 4,      // Muy pequeño
  sm: 8,      // Pequeño
  md: 12,     // Medio
  lg: 16,     // Grande (más usado)
  xl: 24,     // Extra grande
  xxl: 32,    // Mega (márgenes principales)
};

// Border radius scale
export const borderRadius = {
  sm: 4,      // Muy redondeado
  md: 8,      // Redondeado
  lg: 16,     // Muy redondeado (botones grandes)
  xl: 20,     // Mega redondeado
};

// Font sizes (para consistencia)
export const fontSize = {
  xs: 11,      // Muy pequeño (labels)
  sm: 12,      // Pequeño (detalles)
  md: 14,      // Medio (inputs)
  lg: 16,      // Grande (cuerpo)
  xl: 18,      // Extra grande (subtítulos)
  xxl: 24,     // Mega (títulos)
  xxxl: 36,    // Enorme (encabezados)
};

// Font weights
export const fontWeight = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
};

// Line heights
export const lineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
};

// Shadows
export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
};

// ==================== AHORA SÍ USAR EN GlobalStyles ====================
export const GlobalStyles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,

  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  container: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
  } as ViewStyle,

  screenContainer: {
    flex: 1,
    backgroundColor: Colors.primaryBackground,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  scrollViewContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  } as ViewStyle,

  text: {
    color: Colors.textPrimary,
    fontFamily: 'System',
  } as TextStyle,

  textSecondary: {
    color: Colors.textSecondary,
    fontFamily: 'System',
  } as TextStyle,

  textTertiary: {
    color: Colors.textTertiary,
    fontFamily: 'System',
  } as TextStyle,

  // Inputs
  input: {
    backgroundColor: Colors.tertiaryBackground,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    color: Colors.textPrimary,
    fontSize: fontSize.lg,
    marginBottom: spacing.lg,
  } as ViewStyle,

  inputLabel: {
    fontSize: fontSize.sm,
    fontWeight: fontWeight.semibold,
    color: Colors.textPrimary,
    marginBottom: spacing.sm,
  } as TextStyle,

  // Cards
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: spacing.md,
  } as ViewStyle,

  cardSmall: {
    backgroundColor: Colors.cardBackground,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,

  // Buttons
  button: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  } as ViewStyle,

  buttonPrimary: {
    backgroundColor: Colors.primary,
  } as ViewStyle,

  buttonSecondary: {
    backgroundColor: Colors.tertiaryBackground,
    borderWidth: 1,
    borderColor: Colors.border,
  } as ViewStyle,

  buttonDanger: {
    backgroundColor: Colors.danger,
  } as ViewStyle,

  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  } as ViewStyle,

  buttonText: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: Colors.textPrimary,
  } as TextStyle,

  buttonTextSecondary: {
    fontSize: fontSize.lg,
    fontWeight: fontWeight.semibold,
    color: Colors.textSecondary,
  } as TextStyle,

  // Sections
  section: {
    marginBottom: spacing.xl,
  } as ViewStyle,

  sectionTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.bold,
    color: Colors.textPrimary,
    marginBottom: spacing.md,
  } as TextStyle,

  // List items
  listItem: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  } as ViewStyle,

  listItemText: {
    fontSize: fontSize.lg,
    color: Colors.textPrimary,
    fontWeight: fontWeight.medium,
  } as TextStyle,

  // Forms
  formGroup: {
    marginBottom: spacing.lg,
  } as ViewStyle,

  radioGroup: {
    gap: spacing.md,
    marginBottom: spacing.lg,
  } as ViewStyle,

  // Empty states
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  emptyStateText: {
    fontSize: fontSize.lg,
    color: Colors.textSecondary,
    marginTop: spacing.lg,
    textAlign: 'center',
  } as TextStyle,

  // Headers
  header: {
    backgroundColor: Colors.secondaryBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  } as ViewStyle,

  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: fontWeight.semibold,
    color: Colors.textPrimary,
  } as TextStyle,

  // Dividers
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: spacing.md,
  } as ViewStyle,

  dividerThick: {
    height: 2,
    backgroundColor: Colors.primary,
  } as ViewStyle,

  // Badges
  badge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
    backgroundColor: Colors.tertiaryBackground,
    alignSelf: 'flex-start',
  } as ViewStyle,

  badgeText: {
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    color: Colors.primary,
  } as TextStyle,

  // Grid
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.md,
  } as ViewStyle,

  gridItem: {
    flex: 1,
    minWidth: '45%',
  } as ViewStyle,

  // Spacing utilities
  marginBottom: {
    marginBottom: spacing.lg,
  } as ViewStyle,

  marginHorizontal: {
    marginHorizontal: spacing.lg,
  } as ViewStyle,

  paddingBottom: {
    paddingBottom: spacing.xl,
  } as ViewStyle,
});