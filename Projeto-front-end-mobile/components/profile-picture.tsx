import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export function ProfilePicture() {
  return (
    <View style={styles.container}>
      <Text style={styles.initials}>CM</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ffb703',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: '#101a31',
    fontWeight: '800',
    fontSize: 16,
  },
});
