import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';

const PurchaseModal = ({ visible, onClose, onPurchaseSuccess }) => {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);

  const handleSubscribe = () => {
    Alert.alert(
      "Login Required",
      "To sync your subscription, please log in or create an account.",
      [
        { text: "Later", style: "cancel" },
        { text: "Login", onPress: onPurchaseSuccess }
      ]
    );
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <LinearGradient
        colors={['rgba(30, 0, 70, 0.4)', 'rgba(0, 20, 40, 0.4)']}
        style={styles.modalOverlay}
      >
        <View style={localStyles.glassContainer}>
          <TouchableOpacity onPress={onClose} style={localStyles.closeButton}>
            <Ionicons name="close-circle" size={30} color={theme.colors.textMuted} />
          </TouchableOpacity>
          <Ionicons name="sparkles" size={48} color={'#C976FF'} />
          <Text style={[styles.modalTitle, { marginTop: 10, color: '#FFFFFF' }]}>Unlock Vellum Sync</Text>
          <Text style={[styles.modalMessage, { color: 'rgba(255,255,255,0.8)'}]}>
            Keep your notes and tasks synced across all your devices. Secure, fast, and reliable.
          </Text>
          <View style={localStyles.priceContainer}>
            <Text style={localStyles.priceText}>$2.99</Text>
            <Text style={localStyles.priceFrequency}>/ month</Text>
          </View>
          <Text style={[styles.textMuted, { fontFamily: theme.typography.fontFamily.regular }]}>Cheapest among all major note apps!</Text>
          <TouchableOpacity style={[styles.button, localStyles.subscribeButton]} onPress={handleSubscribe}>
            <Text style={styles.buttonText}>Subscribe & Sync</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </Modal>
  );
};

const localStyles = StyleSheet.create({
  glassContainer: {
    width: '90%',
    backgroundColor: 'rgba(28, 28, 30, 0.85)',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20,
  },
  closeButton: { position: 'absolute', top: 10, right: 10, },
  priceContainer: { flexDirection: 'row', alignItems: 'flex-end', marginVertical: 15, },
  priceText: { fontFamily: 'Montserrat-Bold', fontSize: 42, color: '#FFFFFF', },
  priceFrequency: { fontFamily: 'Montserrat-Regular', fontSize: 18, color: '#EBEBF599', marginLeft: 5, marginBottom: 5, },
  subscribeButton: { width: '100%', marginTop: 20, paddingVertical: 15, backgroundColor: '#BF5AF2' },
});

export default PurchaseModal;