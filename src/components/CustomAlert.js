import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

export const showAlert = (setter, { title, message, buttons }) => {
  setter({ visible: true, title, message, buttons });
};

const CustomAlert = ({ visible, onClose, title, message, buttons = [] }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContainer, { width: '85%' }]}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalMessage}>{message}</Text>
          <View style={localStyles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  localStyles.button,
                  { backgroundColor: button.style === 'destructive' ? theme.colors.danger : (button.style === 'cancel' ? theme.colors.surface3 : theme.colors.primary) },
                  buttons.length > 1 && { flex: 1 },
                ]}
                onPress={() => {
                  if (button.onPress) button.onPress();
                  onClose();
                }}
              >
                <Text style={[styles.buttonText, { color: button.style === 'cancel' ? theme.colors.text : theme.colors.white }]}>{button.text}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  buttonContainer: { flexDirection: 'row', width: '100%', marginTop: 10, gap: 10, },
  button: { padding: 12, borderRadius: 8, alignItems: 'center', },
});

export default CustomAlert;