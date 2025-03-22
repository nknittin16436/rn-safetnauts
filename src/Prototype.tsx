import {useEffect, useState} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {LinearGradient} from 'react-native-linear-gradient';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';

const Prototype = () => {
  const [isCollision, setIsCollision] = useState(false);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    getPermissions();
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, []);

  const getPermissions = async () => {
    const result = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.BLUETOOTH_ADVERTISE,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
    ]);
  };

  return (
    <LinearGradient colors={['#1a1a1a', '#2a2a2a']} style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.indicator,
            {
              backgroundColor: isCollision ? '#ff4444' : '#00ff88',
              transform: [{scale: pulseAnim}],
            },
          ]}
        />
        <Text style={styles.status}>
          {isCollision ? 'Collision Detected!' : 'Waiting for Collision...'}
        </Text>
        <Text style={styles.description}>
          {isCollision
            ? 'Impact detected. The device has started broadcasting information.'
            : 'Keep the device steady. Monitoring for sudden movements...'}
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Device Monitoring Active</Text>
      </View>
    </LinearGradient>
  );
};

export default Prototype;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  indicator: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 30,
    shadowColor: '#00ff88',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 8,
  },
  status: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    maxWidth: 300,
    lineHeight: 24,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  footerText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 14,
  },
});
