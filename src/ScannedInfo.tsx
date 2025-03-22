import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ToastAndroid,
} from 'react-native';
import {memo} from 'react';
import Icon from '@react-native-vector-icons/fontawesome6';

const ScannedInfo = ({
  ownerInfo,
}: {
  ownerInfo?: {name: string; regNumber: string; model: string};
}) => {
  const {name, regNumber, model} = ownerInfo ?? {};

  const handleRaiseFIR = () => {
    ToastAndroid.show('FIR raised', 500);
  };

  const handleClaimInsurance = () => {
    ToastAndroid.show('Claim insurance', 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Vehicle Scanner</Text>
      <Text style={styles.subHeader}>
        Scan NFC tag to view vehicle information
      </Text>

      <View style={styles.card}>
        {/* Vehicle Details Header */}
        <View style={styles.cardHeader}>
          <Text style={styles.vehicleDetailsText}>Vehicle Details</Text>
          <Text style={styles.timestamp}>22/03/2025, 13:08:38</Text>
        </View>

        {/* Registration Number */}
        <View style={styles.infoBox}>
          <Icon name="car" size={20} iconStyle="solid" color="#4A64FE" />
          <Text style={styles.label}>Registration Number</Text>
          {regNumber ? <Text style={styles.value}>{regNumber}</Text> : null}
        </View>

        {/* Owner & Model */}
        <View style={styles.row}>
          {name ? (
            <View style={styles.column}>
              <Text style={styles.label}>Owner</Text>
              <Text style={styles.value}>{name}</Text>
            </View>
          ) : null}
          {model ? (
            <View style={styles.column}>
              <Text style={styles.label}>Model</Text>
              <Text style={styles.value}>{model}</Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.raiseFIR} onPress={handleRaiseFIR}>
          <Text style={styles.buttonText}>Raise FIR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.claimInsurance}
          onPress={handleClaimInsurance}>
          <Text style={styles.buttonText}>Claim Insurance</Text>
        </TouchableOpacity>
      </View>
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
    marginBottom: 6,
  },
  subHeader: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  card: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  vehicleDetailsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  timestamp: {
    fontSize: 14,
    color: '#777',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#777',
    marginLeft: 8,
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  column: {
    width: '48%',
    backgroundColor: '#F8F9FF',
    padding: 10,
    borderRadius: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  raiseFIR: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E53935',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    marginRight: 10,
  },
  claimInsurance: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    color: '#FFF',
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default memo(ScannedInfo);
