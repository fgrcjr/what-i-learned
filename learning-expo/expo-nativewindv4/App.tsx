import React from 'react';
import { SafeAreaView } from 'react-native';
import Register from './components/Register';

import './global.css'

const App: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 justify-center px-10">
      <Register />
    </SafeAreaView>
  );
};

export default App;
