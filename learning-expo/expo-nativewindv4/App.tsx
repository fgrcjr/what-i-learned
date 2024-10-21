import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Register from './components/Register';

const App: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <Register />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});

export default App;
