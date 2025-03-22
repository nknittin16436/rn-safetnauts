import FontAwesome6 from '@react-native-vector-icons/fontawesome6';
import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const VehicleScannerScreen = ({
  onPressScan,
}: {
  onPressScan: () => Promise<void>;
}) => {
  const [isRegistered, setIsRegistered] = useState(false);

  const handleScan = async () => {
    await onPressScan();
    setIsRegistered(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vehicle Scanner</Text>
      <Text style={styles.subHeader}>
        {isRegistered
          ? 'Please bring your device closer to NFC'
          : 'Scan NFC tag to view vehicle information'}
      </Text>

      {!isRegistered ? (
        <TouchableOpacity
          style={styles.scanBox}
          onPress={handleScan}
          hitSlop={100}>
          <FontAwesome6
            name="qrcode"
            size={50}
            color="#4A64FE"
            iconStyle="solid"
          />
          <Text style={styles.scanText}>Tap to Scan NFC Tag</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A64FE',
    marginBottom: 8,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  scanBox: {
    width: '90%',
    height: 180,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#4A64FE',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  scanText: {
    fontSize: 18,
    color: '#4A64FE',
    marginTop: 10,
    fontWeight: '500',
  },
});

export default VehicleScannerScreen;
