/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';

import ScanNFC from './src/ScanNFC';
import ScannedInfo, {OwnerInfo} from './src/ScannedInfo';
import NfcManager, {NfcEvents} from 'react-native-nfc-manager';
import {ToastAndroid} from 'react-native';
import NFCNotFound from './src/NFCNotFound';

NfcManager.start();

function App(): React.JSX.Element {
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo>();
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
    return <ScannedInfo ownerInfo={ownerInfo} />;
  }

  return <ScanNFC onPressScan={readTag} />;
}

export default App;
