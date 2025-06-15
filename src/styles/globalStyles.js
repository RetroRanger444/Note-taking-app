import { StyleSheet, Platform, StatusBar } from 'react-native';

export const getGlobalStyles = (theme, displaySettings = {}) => {
  const { colors, spacing, typography } = theme;
  const { roundedCorners = true, showDividers = true } = displaySettings;
  // REMOVED: const fontMultiplier = theme.fontMultiplier || 1.0;

  const borderRadius = roundedCorners ? 12 : 4;

  return StyleSheet.create({
    // Globals & Layout
    container: { flex: 1, backgroundColor: colors.background },
    flex1: { flex: 1 },
    centered: { justifyContent: 'center', alignItems: 'center' },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.sm,
      minHeight: 50,
      marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      color: colors.text,
      fontSize: typography.fontSize.xl, // No more multiplier
      fontFamily: typography.fontFamily.bold,
    },
    pixelTitle: {
      color: colors.text,
      fontSize: typography.fontSize.xl, // No more multiplier
      fontFamily: 'PressStart',
    },
    headerActionText: {
      color: colors.primary,
      fontSize: typography.fontSize.md, // No more multiplier
      fontFamily: typography.fontFamily.semiBold,
    },

    // Typography
    text: {
      color: colors.text,
      fontSize: typography.fontSize.md, // No more multiplier
      fontFamily: typography.fontFamily.regular,
    },
    textSecondary: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm, // No more multiplier
      fontFamily: typography.fontFamily.regular,
    },
    textMuted: {
      color: colors.textMuted,
      fontSize: typography.fontSize.xs, // No more multiplier
      fontFamily: typography.fontFamily.regular,
    },
    sectionTitle: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm, // No more multiplier
      fontFamily: typography.fontFamily.semiBold,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
      textTransform: 'uppercase',
    },
    sectionDescription: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.md, // No more multiplier
      fontFamily: typography.fontFamily.regular,
      textAlign: 'center',
      marginBottom: spacing.lg,
      paddingHorizontal: spacing.md,
    },

    // Buttons
    button: {
      backgroundColor: colors.primary,
      padding: spacing.md,
      borderRadius,
      alignItems: 'center',
    },
    buttonText: {
      color: colors.white,
      fontSize: typography.fontSize.md, // No more multiplier
      fontFamily: typography.fontFamily.bold,
    },
    buttonDisabled: { opacity: 0.5 },
    iconButton: { padding: spacing.sm },

    // Cards & List Items
    card: {
      backgroundColor: colors.surface,
      borderRadius: borderRadius,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
        color: colors.text,
        fontSize: typography.fontSize.lg, // No more multiplier
        fontFamily: typography.fontFamily.bold,
        marginBottom: spacing.xs,
    },
    cardContent: {
        color: colors.textSecondary,
        fontSize: typography.fontSize.sm, // No more multiplier
        fontFamily: typography.fontFamily.regular,
        lineHeight: 20, // No more multiplier
    },
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: showDividers ? StyleSheet.hairlineWidth : 0,
      borderBottomColor: colors.border,
      paddingHorizontal: spacing.md,
    },
    listItemLabel: {
      color: colors.text,
      fontSize: typography.fontSize.md, // No more multiplier
      fontFamily: typography.fontFamily.regular,
    },
    listItemIcon: {
      marginRight: spacing.md,
      width: 22,
      textAlign: 'center',
      color: colors.text,
    },
    listItemValueContainer: { flexDirection: 'row', alignItems: 'center' },
    listItemValueText: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.md, // No more multiplier
      marginRight: spacing.sm,
    },

    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.surface2,
      borderRadius,
      padding: spacing.lg,
      width: '90%',
      alignItems: 'center',
    },
    modalTitle: {
      color: colors.text,
      fontSize: typography.fontSize.xl, // No more multiplier
      fontFamily: typography.fontFamily.bold,
      marginBottom: spacing.sm,
    },
    modalMessage: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.md, // No more multiplier
      textAlign: 'center',
      lineHeight: 22, // No more multiplier
      marginBottom: spacing.lg,
    },
    
    // Empty State
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      opacity: 0.8,
    },
    emptyStateText: {
      color: colors.text,
      fontSize: typography.fontSize.xl, // No more multiplier
      fontFamily: typography.fontFamily.bold,
      marginTop: spacing.md,
      textAlign: 'center',
    },
    emptyStateSubtext: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.md, // No more multiplier
      textAlign: 'center',
      fontFamily: typography.fontFamily.regular,
      marginTop: spacing.sm,
      paddingHorizontal: spacing.md,
    },
  });
};