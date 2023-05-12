import { Platform, StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  webView: {
    flex: 0,
    height: '100%',
    backgroundColor: 'transparent',
    // resolving old issue with react-native-webview on Android
    opacity: Platform.OS === 'android' ? 0.99 : 1,
  },
  hiddenInput: {
    position: 'absolute',
    zIndex: -999,
    left: -999,
    bottom: -999,
    width: 1,
    height: 1,
  },
});
