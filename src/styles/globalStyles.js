import { StyleSheet, Platform, StatusBar, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const getGlobalStyles = (theme) => {
  const { colors, spacing, typography } = theme;

  return StyleSheet.create({
    // Globals & Layout
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: spacing.md,
    },
    flex1: { flex: 1 },
    screenContainer: {
      flex: 1,
      backgroundColor: colors.background,
      padding: spacing.md,
      paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : spacing.xl,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      minHeight: 48,
      marginTop: Platform.OS === 'android' ? StatusBar.currentHeight : spacing.sm,
    },
    headerTitle: {
      color: colors.text,
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
    },
    headerBack: {
      padding: spacing.sm,
    },
    headerActionText: {
      color: colors.primary,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
    },
    headerCenter: {
      flex: 2,
      alignItems: 'center',
    },
    headerLeft: { flex: 1, alignItems: 'flex-start' },
    headerRight: { flex: 1, alignItems: 'flex-end' },
    logoText: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.logo,
      letterSpacing: 6,
      textTransform: 'uppercase',
    },

    // Typography
    text: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
    },
    textSecondary: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
    },
    textMuted: {
      color: colors.textMuted,
      fontSize: typography.fontSize.xs,
      fontFamily: typography.fontFamily.regular,
    },
    title: {
      color: colors.text,
      fontSize: typography.fontSize.h2,
      fontFamily: typography.fontFamily.bold,
      marginBottom: spacing.sm,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.regular,
      marginBottom: spacing.md,
    },
    sectionTitle: {
      color: colors.text,
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      marginTop: spacing.lg,
      marginBottom: spacing.md,
    },
    sectionDescription: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      lineHeight: 20,
      marginBottom: spacing.md,
    },

    // Buttons
    button: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.lg,
      borderRadius: spacing.xl,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    },
    buttonText: {
      color: colors.white,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.bold,
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    iconButton: {
      padding: spacing.sm,
    },

    // Cards
    card: {
      backgroundColor: colors.surface,
      borderRadius: spacing.md,
      padding: spacing.md,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    cardTitle: {
      color: colors.text,
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.semiBold,
    },
    cardContent: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      marginTop: spacing.sm,
    },

    // List Items (e.g., in Settings)
    listItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      minHeight: 48,
    },
    listItemLabel: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
    },
    listItemLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    listItemIcon: {
      marginRight: spacing.md,
      width: 20,
      textAlign: 'center',
    },
    listItemValueContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    listItemValueText: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      marginRight: spacing.sm,
    },

    // Inputs
    input: {
      backgroundColor: colors.surface2,
      borderRadius: spacing.sm,
      padding: spacing.md,
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      borderWidth: 1,
      borderColor: colors.border,
      height: 48,
    },
    textInput: {
      color: colors.text,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      paddingVertical: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      marginBottom: spacing.md,
    },

    // Modals
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContainer: {
      backgroundColor: colors.surface,
      borderRadius: spacing.md,
      padding: spacing.lg,
      width: '90%',
      maxWidth: 340,
      alignItems: 'center',
    },
    modalTitle: {
      color: colors.text,
      fontSize: typography.fontSize.xl,
      fontFamily: typography.fontFamily.bold,
      marginBottom: spacing.sm,
    },
    modalMessage: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.regular,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    modalSheetContainer: {
      flex: 1,
      backgroundColor: colors.surface,
      borderTopLeftRadius: spacing.lg,
      borderTopRightRadius: spacing.lg,
      padding: spacing.md,
    },
    modalSheetHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingBottom: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },

    // Tabs
    tabBar: {
      flexDirection: 'row',
      paddingHorizontal: spacing.md,
      marginBottom: spacing.md,
    },
    tabButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      marginRight: spacing.lg,
      position: 'relative',
      minHeight: 48,
      justifyContent: 'center',
    },
    tabButtonText: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.md,
      fontFamily: typography.fontFamily.semiBold,
    },
    activeTabButtonText: {
      color: colors.text,
      fontFamily: typography.fontFamily.bold,
    },
    activeTabIndicator: {
      position: 'absolute',
      bottom: 0,
      left: spacing.sm,
      right: spacing.sm,
      height: 2,
      backgroundColor: colors.text,
    },

    // Empty State
    emptyStateContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    emptyStateText: {
      color: colors.text,
      fontSize: typography.fontSize.lg,
      fontFamily: typography.fontFamily.bold,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    emptyStateSubtext: {
      color: colors.textSecondary,
      fontSize: typography.fontSize.sm,
      fontFamily: typography.fontFamily.regular,
      textAlign: 'center',
    },

    // Checkbox
    checkboxBase: {
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.textSecondary,
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  });
};
