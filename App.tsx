/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';

import {ActivityIndicator, StyleSheet, ToastAndroid, View} from 'react-native';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import NFCNotFound from './src/NFCNotFound';
import Prototype from './src/Prototype';
import ScanNFC from './src/ScanNFC';
import ScannedInfo from './src/ScannedInfo';
import {getVehicleInfo} from './src/apis';

NfcManager.start();

function App(): React.JSX.Element {
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [showPrototype, setShowPrototype] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNFCSupported, setIsNFCSupported] = useState(false);
  console.log('🚀 ~ App ~ isNFCSupported:', isNFCSupported);

  useEffect(() => {
    const checkIsSupported = async () => {
      const deviceIsSupported = await NfcManager.isSupported();
      if (deviceIsSupported) {
        await NfcManager.start();
      } else {
        setIsNFCSupported(true);
      }
    };

    checkIsSupported();
  }, []);

  useEffect(() => {
    NfcManager.setEventListener(NfcEvents.DiscoverTag, tag => {
      setLoading(true);
      const msgs = tag?.ndefMessage ?? [];
      const regByteCode = msgs?.[0]?.payload?.splice(3);
      const timeByteCode = msgs?.[1]?.payload?.splice(3);
      const regNumber = regByteCode
        ? String.fromCharCode(...regByteCode)
        : 'Not available';
      const time = timeByteCode
        ? String.fromCharCode(...timeByteCode)
        : 'Not available';
      (async () => {
        const carOwnerInfo = await getVehicleInfo(regNumber);
        setOwnerInfo({
          time: time,
          regNumber: regNumber,
          ...carOwnerInfo,
        });
        setLoading(false);
      })();
    });

    return () => {
      NfcManager.setEventListener(NfcEvents.DiscoverTag, null);
    };
  }, []);

  const readTag = async () => {
    try {
      await NfcManager.registerTagEvent();
      ToastAndroid.show('Registererd', 100);
    } catch (err) {
      ToastAndroid.show('Something went wrong', 100);
    }
  };

  const RenderChild = () => {
    if (showPrototype) {
      return (
        <View style={{flex: 1}}>
          <Prototype />
        </View>
      );
    }

    if (isNFCSupported) {
      return <NFCNotFound />;
    }

    if (ownerInfo) {
      return (
        <ScannedInfo ownerInfo={ownerInfo} onClose={() => setOwnerInfo(null)} />
      );
    }

    return <ScanNFC onPressScan={readTag} />;
  };

  return (
    <View style={{flex: 1}}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size={'large'} color={'lightblue'} />
        </View>
      )}
      <RenderChild />
      {/* <View style={styles.button}>
        <Button
          title={showPrototype ? 'Hide Prototype' : 'View Prototype'}
          onPress={() => setShowPrototype(prev => !prev)}
        />
      </View> */}
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  button: {position: 'absolute', bottom: 20, left: 20, right: 20},
  loader: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 4,
    top: '50%',
    left: '50%',
    transform: [{translateX: '-50%'}, {translateY: '-50%'}],
  },
});
