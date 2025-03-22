import {memo} from 'react';
import {StyleSheet, Text, View} from 'react-native';

const NFCNotFound = () => {
  return (
    <View style={style.container}>
      <Text>NFC not supported</Text>
    </View>
  );
};

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default memo(NFCNotFound);
