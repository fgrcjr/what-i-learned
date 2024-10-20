import { StatusBar } from 'expo-status-bar';
import { Text, View } from 'react-native';
import "./global.css"

import { vars } from 'nativewind'

const userTheme = vars({
  '--color-primary': '255 0 0'
});

export default function App() {
  return (
    <View className='flex-1 items-center justify-center'>
      <Text className="text-2xl font-extrabold text-primary">Access as a theme value</Text>
      <Text className="text-2xl font-semibold text-[--color-primary]">Or the variable directly</Text>

      {/* Variables can be changed inline */}
      <View style={userTheme}>
        <Text className="text-5xl font-bold text-primary">I am now red!</Text>
      </View>
    </View>
  );
}

