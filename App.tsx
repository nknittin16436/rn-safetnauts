/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState} from 'react';

import ScanNFC from './src/ScanNFC';
import ScannedInfo from './src/ScannedInfo';

// NfcManager.start();

function App(): React.JSX.Element {
  const [isScanned, setIsScanned] = useState(false);
  const [ownerInfo, setOwnerInfo] = useState();

  const onPressScan = () => {
    // get nfc data and set nfc data
    setOwnerInfo({
      name: 'ABC',
      regNumber: 'HR20ABJHSBD',
      model: 'Ford ecosport',
    });
    setIsScanned(true);
  };

  return isScanned ? (
    <ScannedInfo ownerInfo={ownerInfo} />
  ) : (
    <ScanNFC onPressScan={onPressScan} />
  );
}

export default App;
