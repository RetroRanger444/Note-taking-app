import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Alert, Modal, TouchableOpacity, Dimensions, Switch, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeContext';
import { getGlobalStyles } from '../styles/globalStyles';
import Header from '../components/Header';

const BIOMETRIC_ENABLED_KEY = 'biometric_auth_enabled';
const NOTIFICATIONS_ENABLED_KEY = 'notifications_enabled';
const SYNC_ENABLED_KEY = 'sync_enabled';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const INSPIRATIONAL_QUOTES = [
  "Every small step forward is progress worth celebrating.", 
  "Your ideas today shape tomorrow's reality.", 
  "Creativity flows best when captured in the moment.", 
  "The best time to plant a tree was 20 years ago. The second best time is now.", 
  "Your notes are the breadcrumbs to your brilliant ideas.", 
  "Today's thoughts become tomorrow's achievements.", 
  "Every note you take is an investment in your future self.", 
  "Great minds think on paper first.", 
  "Your journal is a conversation with your future self.", 
  "An idea, like a ghost, must be spoken to a little before it will explain itself.", 
  "Write it down. The universe is listening.", 
  "A single note can be the seed of a masterpiece.", 
  "Don't trust your memory. It's a net with holes.", 
  "Capture the whisper of an idea before it fades.", 
  "Your mind is for having ideas, not holding them.",
  "The faintest ink is more powerful than the strongest memory.",
  "Ideas are like butterflies - catch them before they fly away.",
  "Your thoughts deserve a permanent home on paper.",
  "Every breakthrough started with someone writing something down.",
  "The pen is the bridge between imagination and reality.",
  "Words written today become wisdom for tomorrow.",
  "A note taken is a promise kept to your future self.",
  "Inspiration without documentation is just daydreaming.",
  "The most ordinary moment can spark extraordinary ideas.",
  "Your notebook is a treasure chest waiting to be filled.",
  "Thoughts that aren't captured are thoughts that never happened.",
  "Writing is thinking on paper, one word at a time.",
  "The best ideas come to those who write them down.",
  "Your creativity is only as strong as your willingness to record it.",
  "Every great story begins with a single written word.",
  "Notes are the footprints of your thinking journey.",
  "Document your dreams before they dissolve into daylight.",
  "The space between thought and ink is where magic happens.",
  "Your ideas are gifts - unwrap them by writing them down.",
  "A written thought is a thought that can change the world.",
  "The quality of your notes reflects the quality of your thinking.",
  "Ideas multiply when they're written down and shared.",
  "Your journal is your mind's external hard drive.",
  "The act of writing transforms fleeting thoughts into lasting wisdom.",
  "Every note is a seed planted in the garden of your mind.",
  "Capture today's inspiration to fuel tomorrow's innovation.",
  "The difference between dreamers and achievers is documentation.",
  "Your thoughts are too valuable to trust to memory alone.",
  "Writing clarifies thinking like nothing else can.",
  "The best time to write down an idea is the moment you have it.",
  "Notes are the breadcrumbs that lead back to brilliant insights.",
  "Your pen is a time machine - use it to send messages to your future self.",
  "Ideas without ink are just wishes waiting to be forgotten.",
  "The most powerful tool for thinking is still pen and paper.",
  "Every word you write is a building block of your legacy.",
  "Thoughts written down have a way of becoming reality.",
  "Your notebook knows secrets your memory has already forgotten.",
  "The discipline of writing creates the discipline of thinking.",
  "Ideas are like shooting stars - capture them while you can see them.",
  "Your written words are love letters to your future self.",
  "The moment of insight is precious - preserve it in ink.",
  "Notes are the DNA of great ideas.",
  "Writing is the closest thing we have to telepathy with our future selves.",
  "Your thoughts deserve better than the recycling bin of your mind.",
  "Every great invention started as a scribble in someone's notebook.",
  "The universe speaks in whispers - write them down before they fade.",
  "Your ideas are original - don't let them become extinct through neglect.",
  "A thought captured is a thought that can compound over time.",
  "Writing is like breathing for the mind - essential and life-giving.",
  "Your notebook is a portal between what is and what could be.",
  "The best investment you can make is in documenting your thoughts."
];

const CustomDialog = ({ visible, onClose, title, message, buttons = [], type = 'info', theme }) => {
  const [scaleAnim] = useState(new Animated.Value(0));
  const [opacityAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const getIconAndColor = () => {
    switch (type) {
      case 'success':
        return { icon: 'checkmark-circle', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.1)' };
      case 'error':
        return { icon: 'close-circle', color: '#EF4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
      case 'warning':
        return { icon: 'warning', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.1)' };
      case 'question':
        return { icon: 'help-circle', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.1)' };
      default:
        return { icon: 'information-circle', color: '#6366F1', bgColor: 'rgba(99, 102, 241, 0.1)' };
    }
  };

  const { icon, color, bgColor } = getIconAndColor();

  return (
    <Modal visible={visible} transparent={true} animationType="none" onRequestClose={onClose}>
      <Animated.View 
        style={{ 
          flex: 1, 
          backgroundColor: 'rgba(0, 0, 0, 0.6)', 
          justifyContent: 'center', 
          alignItems: 'center', 
          padding: 24,
          opacity: opacityAnim 
        }}
      >
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            width: screenWidth * 0.85,
            maxWidth: 400,
          }}
        >
          <BlurView intensity={95} style={{ borderRadius: 24, overflow: 'hidden' }}>
            <LinearGradient
              colors={['rgba(255, 255, 255, 0.95)', 'rgba(248, 250, 252, 0.9)']}
              style={{ padding: 0 }}
            >
              {/* Header with Icon */}
              <View style={{ 
                alignItems: 'center', 
                paddingTop: 32, 
                paddingHorizontal: 24,
                paddingBottom: 20
              }}>
                <View style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  backgroundColor: bgColor,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: 16
                }}>
                  <Ionicons name={icon} size={32} color={color} />
                </View>
                
                <Text style={{
                  fontFamily: 'Montserrat-Bold',
                  fontSize: 20,
                  color: '#1F2937',
                  textAlign: 'center',
                  marginBottom: 8
                }}>
                  {title}
                </Text>
                
                <Text style={{
                  fontFamily: 'Montserrat-Regular',
                  fontSize: 15,
                  color: '#6B7280',
                  textAlign: 'center',
                  lineHeight: 22,
                  paddingHorizontal: 8
                }}>
                  {message}
                </Text>
              </View>

              {/* Buttons */}
              <View style={{ 
                paddingHorizontal: 24, 
                paddingBottom: 24,
                paddingTop: 8
              }}>
                {buttons.length === 1 ? (
                  <TouchableOpacity
                    onPress={buttons[0].onPress}
                    style={{
                      backgroundColor: buttons[0].style === 'destructive' ? '#EF4444' : color,
                      paddingVertical: 14,
                      borderRadius: 12,
                      alignItems: 'center',
                      shadowColor: buttons[0].style === 'destructive' ? '#EF4444' : color,
                      shadowOffset: { width: 0, y: 4 },
                      shadowOpacity: 0.3,
                      shadowRadius: 8,
                      elevation: 6,
                    }}
                  >
                    <Text style={{
                      fontFamily: 'Montserrat-Bold',
                      fontSize: 16,
                      color: 'white'
                    }}>
                      {buttons[0].text}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {buttons.map((button, index) => (
                      <TouchableOpacity
                        key={index}
                        onPress={button.onPress}
                        style={{
                          flex: 1,
                          backgroundColor: button.style === 'cancel' 
                            ? 'rgba(107, 114, 128, 0.1)' 
                            : button.style === 'destructive' 
                              ? '#EF4444' 
                              : color,
                          paddingVertical: 14,
                          borderRadius: 12,
                          alignItems: 'center',
                          borderWidth: button.style === 'cancel' ? 1 : 0,
                          borderColor: button.style === 'cancel' ? 'rgba(107, 114, 128, 0.3)' : 'transparent',
                          shadowColor: button.style === 'cancel' ? 'transparent' : (button.style === 'destructive' ? '#EF4444' : color),
                          shadowOffset: { width: 0, y: 2 },
                          shadowOpacity: button.style === 'cancel' ? 0 : 0.2,
                          shadowRadius: 4,
                          elevation: button.style === 'cancel' ? 0 : 3,
                        }}
                      >
                        <Text style={{
                          fontFamily: 'Montserrat-Bold',
                          fontSize: 16,
                          color: button.style === 'cancel' ? '#6B7280' : 'white'
                        }}>
                          {button.text}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </LinearGradient>
          </BlurView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const PremiumSyncModal = ({ visible, onClose, onPurchase, theme }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);
  const colorSchemes = [['rgba(255, 107, 107, 0.9)', 'rgba(255, 142, 83, 0.9)', 'rgba(255, 177, 59, 0.8)'], ['rgba(72, 219, 251, 0.9)', 'rgba(88, 86, 214, 0.9)', 'rgba(129, 84, 216, 0.8)'], ['rgba(161, 196, 253, 0.9)', 'rgba(194, 233, 251, 0.9)', 'rgba(147, 197, 253, 0.8)'], ['rgba(34, 193, 195, 0.9)', 'rgba(253, 187, 45, 0.9)', 'rgba(251, 146, 60, 0.8)'], ['rgba(235, 51, 73, 0.9)', 'rgba(244, 92, 67, 0.9)', 'rgba(248, 165, 194, 0.8)'], ['rgba(168, 85, 247, 0.9)', 'rgba(236, 72, 153, 0.9)', 'rgba(251, 113, 133, 0.8)'],];
  const handlePurchase = () => {
    setColorIndex((prev) => (prev + 1) % colorSchemes.length);
    setIsProcessing(true);
    setTimeout(() => { setIsProcessing(false); onPurchase(); }, 1500);
  };
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.8)', justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <BlurView intensity={80} style={{ borderRadius: 20, overflow: 'hidden', width: screenWidth * 0.85, maxWidth: 350, maxHeight: screenHeight * 0.7 }}>
          <LinearGradient colors={colorSchemes[colorIndex]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: 24 }}>
            <TouchableOpacity onPress={onClose} style={{ position: 'absolute', top: 12, right: 12, zIndex: 10, backgroundColor: 'rgba(255, 255, 255, 0.25)', borderRadius: 16, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' }}>
              <Ionicons name="close" size={18} color="white" />
            </TouchableOpacity>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, alignSelf: 'center', marginBottom: 16 }}>
              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 12, color: '#333', textAlign: 'center' }}>DEMO PREVIEW</Text>
            </View>
            <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 22, color: 'white', textAlign: 'center', marginBottom: 8 }}>Premium Sync</Text>
            <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, color: 'rgba(255, 255, 255, 0.9)', textAlign: 'center', marginBottom: 20, lineHeight: 20 }}>Experience seamless note synchronization across all your devices</Text>
            <View style={{ marginBottom: 20 }}>
              {[{ icon: 'cloud-outline', text: 'Instant cloud sync' }, { icon: 'devices-outline', text: 'Multi-device access' }, { icon: 'shield-checkmark-outline', text: 'Secure encryption' }].map((feature, index) => (
                <View key={index} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10, backgroundColor: 'rgba(255, 255, 255, 0.15)', padding: 10, borderRadius: 10 }}>
                  <Ionicons name={feature.icon} size={20} color="white" style={{ marginRight: 12 }} />
                  <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 14, color: 'white', flex: 1 }}>{feature.text}</Text>
                </View>
              ))}
            </View>
            <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderRadius: 12, padding: 16, marginBottom: 20, alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 28, color: 'white' }}>$1.99</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 16, color: 'rgba(255, 255, 255, 0.8)', marginLeft: 4 }}>/month</Text>
              </View>
              <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 12, color: 'rgba(255, 255, 255, 0.8)', marginTop: 4 }}>Demo pricing • Not actual purchase</Text>
            </View>
            <TouchableOpacity onPress={handlePurchase} disabled={isProcessing} style={{ backgroundColor: 'white', paddingVertical: 14, paddingHorizontal: 24, borderRadius: 12, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, y: 4 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 6 }}>
              <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: colorSchemes[colorIndex][0].replace('0.9)', '1)') }}>{isProcessing ? 'Activating Magic...' : 'Unlock Premium Features'}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
};

const LoginModal = ({ visible, onClose, onLogin, theme }) => {
  const [email, setEmail] = useState('demo@vellum.app');
  const [password, setPassword] = useState('YouaretrulyGay');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const handleAuth = () => { setIsLoading(true); setTimeout(() => { setIsLoading(false); onLogin(email, password, isLogin); }, 2000); };
  return (
    <Modal visible={visible} transparent={true} animationType="slide">
      <View style={{ flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.85)', justifyContent: 'flex-end' }}>
        <BlurView intensity={90} style={{ borderTopLeftRadius: 28, borderTopRightRadius: 28, overflow: 'hidden' }}>
          <LinearGradient colors={['rgba(255, 255, 255, 0.98)', 'rgba(248, 250, 252, 0.95)']} style={{ padding: 28, minHeight: 420 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(0, 0, 0, 0.08)' }}>
              <View>
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 26, color: '#1a1a1a', marginBottom: 4 }}>{isLogin ? 'Welcome Back' : 'Join Vellum'}</Text>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 14, color: '#6b7280' }}>Demo authentication experience</Text>
              </View>
              <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(0, 0, 0, 0.05)', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' }}>
                <Ionicons name="close" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>
            <View style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 12, padding: 16, marginBottom: 24, borderLeftWidth: 4, borderLeftColor: '#3b82f6' }}>
              <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#1e40af', marginBottom: 4 }}>Demo Mode Active</Text>
              <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, color: '#3730a3', lineHeight: 18 }}>Pre-filled credentials for testing !</Text>
            </View>
            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#374151', marginBottom: 8 }}>Email Address</Text>
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', marginBottom: 16 }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1f2937' }}>{email}</Text>
              </View>
              <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#374151', marginBottom: 8 }}>Password</Text>
              <View style={{ backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(0, 0, 0, 0.1)', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 16, color: '#1f2937', flex: 1, paddingTop: 4 }}>{showPassword ? password : '●'.repeat(password.length)}</Text>
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                  <Ionicons name={showPassword ? 'eye-outline' : 'eye-off-outline'} size={20} color="#9ca3af" />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity onPress={handleAuth} disabled={isLoading} style={{ backgroundColor: isLoading ? '#9ca3af' : '#3b82f6', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginBottom: 16, shadowColor: '#3b82f6', shadowOffset: { width: 0, y: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 6 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                {isLoading && (<View style={{ width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: 'rgba(255, 255, 255, 0.3)', borderTopColor: 'white', marginRight: 12 }} />)}
                <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 16, color: 'white' }}>{isLoading ? 'Authenticating...' : (isLogin ? 'Sign In to Demo' : 'Create Demo Account')}</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)} style={{ alignItems: 'center', paddingVertical: 8 }}>
              <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 14, color: '#3b82f6' }}>{isLogin ? "New to Vellum? Create account" : "Already have an account? Sign in"}</Text>
            </TouchableOpacity>
          </LinearGradient>
        </BlurView>
      </View>
    </Modal>
  );
};

const AboutSection = ({ theme }) => (
  <View style={{ alignItems: 'center', paddingVertical: theme.spacing?.xl || 24, paddingHorizontal: theme.spacing?.lg || 20, backgroundColor: 'rgba(0, 0, 0, 0.02)', borderRadius: 16, marginHorizontal: 16, marginBottom: 32 }}>
    <Text style={{ fontFamily: 'PressStart', fontSize: 14 * (theme.fontMultiplier || 1), color: theme.colors?.primary || '#007AFF', letterSpacing: 2, marginBottom: 14 }}>Vellum</Text>
    <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 15 * (theme.fontMultiplier || 1), color: theme.colors?.textSecondary || '#666', textAlign: 'center', lineHeight: 22 }}>
      A Tote-naking app made for fun!
    </Text>
    <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 12 * (theme.fontMultiplier || 1), color: theme.colors?.textMuted || '#999', marginTop: theme.spacing?.lg || 16 }}>Version 3.2.0</Text>
  </View>
);

const CustomListItem = ({ label, icon, onPress, type, value, onValueChange, subtitle, theme }) => (
  <TouchableOpacity onPress={type !== 'toggle' ? onPress : undefined} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 16, paddingHorizontal: 20, backgroundColor: theme.colors?.surface || '#fff', marginHorizontal: 16, marginVertical: 4, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, y: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: (theme.colors?.primary || '#007AFF') + '20', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
      <Ionicons name={icon} size={24} color={theme.colors?.primary || '#007AFF'} />
    </View>
    <View style={{ flex: 1 }}>
      <Text style={{ fontFamily: 'Montserrat-Medium', fontSize: 16, color: theme.colors?.text || '#000', marginBottom: subtitle ? 2 : 0 }}>{label}</Text>
      {subtitle && (<Text style={{ fontFamily: 'Montserrat-Regular', fontSize: 13, color: theme.colors?.textSecondary || '#666' }}>{subtitle}</Text>)}
    </View>
    {type === 'toggle' && (<Switch value={value} onValueChange={onValueChange} trackColor={{ false: theme.colors?.border || '#ccc', true: (theme.colors?.primary || '#007AFF') + '50' }} thumbColor={value ? (theme.colors?.primary || '#007AFF') : (theme.colors?.textMuted || '#999')} />)}
    {type !== 'toggle' && (<Ionicons name="chevron-forward" size={20} color={theme.colors?.textMuted || '#999'} />)}
  </TouchableOpacity>
);

export default function SettingsScreen({ navigation }) {
  const { theme, displaySettings } = useTheme();
  const styles = getGlobalStyles(theme, displaySettings);
  const [biometricAuth, setBiometricAuth] = useState(false);
  const [autoSync, setAutoSync] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const [dialogConfig, setDialogConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info',
    buttons: []
  });

  const showCustomDialog = (title, message, buttons = [], type = 'info') => {
    setDialogConfig({
      visible: true,
      title,
      message,
      type,
      buttons: buttons.map(button => ({
        ...button,
        onPress: () => {
          setDialogConfig(prev => ({ ...prev, visible: false }));
          if (button.onPress) button.onPress();
        }
      }))
    });
  };

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setBiometricAuth(await AsyncStorage.getItem(BIOMETRIC_ENABLED_KEY) === 'true');
        setAutoSync(await AsyncStorage.getItem(SYNC_ENABLED_KEY) === 'true');
        setNotifications(await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY) === 'true');
      } catch (error) { console.error('Error loading settings:', error); }
    };
    loadSettings();
  }, []);

  const scheduleNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const randomQuote = INSPIRATIONAL_QUOTES[Math.floor(Math.random() * INSPIRATIONAL_QUOTES.length)];
    await Notifications.scheduleNotificationAsync({
      content: { title: "A Thought from Vellum", body: randomQuote, sound: true, },
      trigger: { seconds: 5 * 60 * 60, repeats: true, }, // Every 5 hours
    });
  };

  const handleNotificationsToggle = async (value) => {
    if (value) {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status === 'granted') {
        await scheduleNotifications();
        await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'true');
        setNotifications(true);
        showCustomDialog(
          'Notifications Enabled',
          'You\'ll receive an inspirational quote every 5 hours to spark your creativity.',
          [{ text: 'Perfect!', style: 'default' }],
          'success'
        );
      } else { 
        showCustomDialog(
          'Permission Required',
          'Please enable notifications in your device settings to use this feature.',
          [{ text: 'Got it', style: 'default' }],
          'warning'
        );
      }
    } else {
      await Notifications.cancelAllScheduledNotificationsAsync();
      await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, 'false');
      setNotifications(false);
      showCustomDialog(
        'Notifications Disabled',
        'You won\'t receive any more notifications from Vellum.',
        [{ text: 'Understood', style: 'default' }],
        'info'
      );
    }
  };

  const handleBiometricToggle = async (value) => {
    if (value) {
      if (!await LocalAuthentication.hasHardwareAsync()) { 
        showCustomDialog(
          'Not Supported',
          'Your device does not support biometric authentication.',
          [{ text: 'OK', style: 'default' }],
          'error'
        );
        return; 
      }
      if (!await LocalAuthentication.isEnrolledAsync()) { 
        showCustomDialog(
          'Setup Required',
          'You have not set up Face ID / Fingerprint on your device. Please set it up in Settings first.',
          [{ text: 'Got it', style: 'default' }],
          'warning'
        );
        return; 
      }
      const { success } = await LocalAuthentication.authenticateAsync({ promptMessage: 'Confirm to enable Biometric Auth' });
      if (success) { 
        await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'true'); 
        setBiometricAuth(true); 
        showCustomDialog(
          'Security Enhanced',
          'Biometric authentication is now active. Your notes are safer than ever!',
          [{ text: 'Awesome!', style: 'default' }],
          'success'
        );
      }
    } else { 
              showCustomDialog(
        'Disable Biometric Auth?',
        'Are you sure you want to turn off biometric authentication? This will make your app less secure.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.setItem(BIOMETRIC_ENABLED_KEY, 'false'); 
              setBiometricAuth(false);
              showCustomDialog(
                'Security Disabled',
                'Biometric authentication has been turned off.',
                [{ text: 'OK', style: 'default' }],
                'info'
              );
            }
          }
        ],
        'question'
      );
    }
  };

  const handleAutoSyncToggle = (value) => {
    if (value) { 
      setShowSyncModal(true); 
      return; 
    } else { 
      showCustomDialog(
        'Disable Cloud Sync?',
        'Your notes will only be stored locally on this device. You won\'t be able to access them from other devices.',
        [
          { text: 'Keep Sync', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: async () => {
              await AsyncStorage.setItem(SYNC_ENABLED_KEY, 'false'); 
              setAutoSync(false);
              showCustomDialog(
                'Sync Disabled',
                'Notes will now only be stored locally on this device.',
                [{ text: 'Got it', style: 'default' }],
                'info'
              );
            }
          }
        ],
        'question'
      );
    }
  };

  const handlePurchaseSync = async () => { 
    setShowSyncModal(false); 
    setShowLoginModal(true); 
  };

  const handleLogin = (email, password, isLogin) => {
    setShowLoginModal(false);
    AsyncStorage.setItem(SYNC_ENABLED_KEY, 'true');
    setAutoSync(true);
    showCustomDialog(
      'Demo Login Success!',
      'Authentication simulated successfully! In a real app, your notes would now sync across all your devices.',
      [{ text: 'Continue Demo', style: 'default' }],
      'success'
    );
  };

  const goTo = (screen) => { if (screen && navigation) navigation.navigate(screen); };
  const defaultTheme = { colors: { primary: '#007AFF', surface: '#fff', text: '#000', textSecondary: '#666', textMuted: '#999', border: '#ccc' }, spacing: { sm: 8, md: 16, lg: 20, xl: 24 }, fontMultiplier: 1 };
  const currentTheme = theme || defaultTheme;

  return (
    <View style={styles?.container || { flex: 1, backgroundColor: '#f5f5f5' }}>
      <Header title="Settings" navigation={navigation} />
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 18, marginTop: 24, marginBottom: 12, marginLeft: 20, color: currentTheme.colors.primary }}>Appearance</Text>
        <CustomListItem label="Theme" icon="color-palette-outline" onPress={() => goTo('Theme')} theme={currentTheme} />
        <CustomListItem label="Display" icon="tv-outline" onPress={() => goTo('Display')} theme={currentTheme} />
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 18, marginTop: 32, marginBottom: 12, marginLeft: 20, color: currentTheme.colors.primary }}>General</Text>
        <CustomListItem label="Notifications" icon="notifications-outline" type="toggle" value={notifications} onValueChange={handleNotificationsToggle} subtitle={notifications ? "Inspiration every 5 hours" : "No notifications"} theme={currentTheme}/>
        <CustomListItem label="Cloud Sync" icon="cloud-outline" type="toggle" value={autoSync} onValueChange={handleAutoSyncToggle} subtitle={autoSync ? "Syncing to cloud" : "Local only • Tap to upgrade"} theme={currentTheme}/>
        <Text style={{ fontFamily: 'Montserrat-Bold', fontSize: 18, marginTop: 32, marginBottom: 12, marginLeft: 20, color: currentTheme.colors.primary }}>Security</Text>
        <CustomListItem label="Biometric Auth" icon="finger-print-outline" type="toggle" value={biometricAuth} onValueChange={handleBiometricToggle} subtitle={biometricAuth ? "App is secured" : "App is unlocked"} theme={currentTheme}/>
        <CustomListItem label="Language" icon="language-outline" onPress={() => goTo('Language')} theme={currentTheme} />
        <AboutSection theme={currentTheme} />
      </ScrollView>
      
      {/* Custom Dialog */}
      <CustomDialog
        visible={dialogConfig.visible}
        onClose={() => setDialogConfig(prev => ({ ...prev, visible: false }))}
        title={dialogConfig.title}
        message={dialogConfig.message}
        type={dialogConfig.type}
        buttons={dialogConfig.buttons}
        theme={currentTheme}
      />
      
      <PremiumSyncModal visible={showSyncModal} onClose={() => setShowSyncModal(false)} onPurchase={handlePurchaseSync} theme={currentTheme}/>
      <LoginModal visible={showLoginModal} onClose={() => setShowLoginModal(false)} onLogin={handleLogin} theme={currentTheme}/>
    </View>
  );
}