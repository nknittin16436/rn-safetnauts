import {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Platform,
} from 'react-native';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6';

interface PersonInfo {
  name: string;
  carMake: string;
  carModel: string;
  carYear: number;
  insuranceActive: boolean;
  insuranceProvider: string;
  policyNumber: string;
  lastIncident: string | null;
  profileImage: string;
}

const maskName = (name: string) => {
  const parts = name.split(' ');
  return parts
    .map(
      part =>
        part.charAt(0) +
        '*'.repeat(part.length - 2) +
        part.charAt(part.length - 1),
    )
    .join(' ');
};

const formatDate = (date: string | null) => {
  if (!date) return 'No incidents reported';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

function isDatePassed(dateString: string) {
  const givenDate = new Date(dateString);
  const today = new Date();

  // Normalize time to avoid issues with different time zones
  today.setHours(0, 0, 0, 0);
  givenDate.setHours(0, 0, 0, 0);

  return givenDate < today;
}

const ScannedInfo = ({ownerInfo: personInfo, onClose}) => {
  const handleFIRPress = () => {
    Alert.alert('Register FIR', 'Are you sure you want to register an FIR?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Register',
        onPress: () =>
          Alert.alert('FIR Registration', 'FIR registered successfully'),
        style: 'destructive',
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <FontAwesome6
              name="arrow-left"
              size={20}
              color="#2D3748"
              iconStyle="solid"
            />
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            <Text style={styles.title}>Person Information</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Name</Text>
              <Text style={styles.value}>
                {personInfo?.rc_owner_name_masked}
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Registration Number</Text>
              <Text style={styles.value}>{personInfo?.regNumber}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Incident Time</Text>
              <Text style={styles.value}>{personInfo?.time}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Vehicle Information</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Vehicle</Text>
              <Text style={styles.value}>
                {personInfo?.brand?.make_display}{' '}
                {personInfo?.model?.model_display}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            {/* <Shield size={20} color="#4A5568" /> */}
            <Text style={styles.sectionTitle}>Insurance Details</Text>
          </View>
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Status</Text>
              <View style={styles.insuranceContainer}>
                <View
                  style={[
                    styles.insuranceStatus,
                    !isDatePassed(personInfo?.insurance_up_to)
                      ? styles.active
                      : styles.inactive,
                  ]}
                />
                <Text
                  style={[
                    styles.insuranceText,
                    !isDatePassed(personInfo?.insurance_up_to)
                      ? styles.activeText
                      : styles.inactiveText,
                  ]}>
                  {!isDatePassed(personInfo?.insurance_up_to)
                    ? 'Active'
                    : 'Inactive'}
                </Text>
              </View>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.label}>Provider</Text>
              <Text style={styles.value}>{personInfo?.insurance_company}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.firButton} onPress={handleFIRPress}>
        <Text style={styles.firButtonText}>Register FIR</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.doneButton} onPress={handleFIRPress}>
        <Text style={styles.firButtonText}>Insurance Claim</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ScannedInfo;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7FAFC',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerInfo: {
    marginLeft: 15,
    flex: 1,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E2E8F0',
  },
  title: {
    fontSize: 24,
    color: '#1A202C',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#718096',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    color: '#2D3748',
    marginLeft: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EDF2F7',
  },
  label: {
    fontSize: 14,
    color: '#718096',
  },
  value: {
    fontSize: 14,
    color: '#2D3748',
    flex: 1,
    textAlign: 'right',
  },
  insuranceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  insuranceStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  active: {
    backgroundColor: '#48BB78',
  },
  inactive: {
    backgroundColor: '#F56565',
  },
  insuranceText: {
    fontSize: 14,
  },
  activeText: {
    color: '#48BB78',
  },
  inactiveText: {
    color: '#F56565',
  },
  actionButton: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  actionButtonLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButtonText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#4A5568',
  },
  firButton: {
    backgroundColor: '#F56565',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    borderRadius: 12,
    ...Platform.select({
      web: {
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      },
    }),
  },
  doneButton: {
    backgroundColor: 'green',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    margin: 20,
    marginTop: 0,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  firIcon: {
    marginRight: 8,
  },
  firButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
