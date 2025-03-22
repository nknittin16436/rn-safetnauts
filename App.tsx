/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';

import ScanNFC from './src/ScanNFC';
import NfcManager, {NfcEvents, NfcTech} from 'react-native-nfc-manager';
import {Alert, Button, ToastAndroid, View, StyleSheet} from 'react-native';
import Prototype from './src/Prototype';
import ScannedInfo, {OwnerInfo} from './src/ScannedInfo';
import NFCNotFound from './src/NFCNotFound';

NfcManager.start();

function App(): React.JSX.Element {
  const [isScanned, setIsScanned] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState();
  const [showPrototype, setShowPrototype] = useState(false);
  const [isNFCSupported, setIsNFCSupported] = useState(false);

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
      const msgs = tag?.ndefMessage ?? [];
      const regByteCode = msgs?.[0]?.payload?.splice(3);
      const nameByteCode = msgs?.[1]?.payload?.splice(3);
      const modelByteCode = msgs?.[2]?.payload?.splice(3);
      const regNumber = regByteCode
        ? String.fromCharCode(...regByteCode)
        : 'Not available';
      const name = nameByteCode
        ? String.fromCharCode(...nameByteCode)
        : 'Not available';
      const model = modelByteCode
        ? String.fromCharCode(...modelByteCode)
        : 'Not available';
      setOwnerInfo({
        name,
        model,
        regNumber,
      });
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

  if (isNFCSupported) {
    return <NFCNotFound />;
  }

  if (ownerInfo) {
    <ScannedInfo ownerInfo={ownerInfo} />;
  }

  //     console.warn('Oops!', ex);
  //   } finally {
  //     ToastAndroid.show('Tag cancelled', 1000);
  //     // stop the nfc scanning
  //     NfcManager.cancelTechnologyRequest();
  //   }
  // }

  return (
    <View style={{flex: 1}}>
      {!showPrototype ? (
        <View style={{flex: 1}}>
          {isScanned ? (
            <ScannedInfo ownerInfo={ownerInfo} />
          ) : (
            <ScanNFC onPressScan={readTag} />
          )}
        </View>
      ) : (
        <View style={{flex: 1}}>
          <Prototype />
        </View>
      )}
      <View style={styles.button}>
        <Button
          title={showPrototype ? 'Hide Prototype' : 'View Prototype'}
          onPress={() => setShowPrototype(prev => !prev)}
        />
      </View>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  button: {position: 'absolute', bottom: 20, left: 20, right: 20},
});
