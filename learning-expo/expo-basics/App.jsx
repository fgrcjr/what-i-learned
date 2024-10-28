import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import Header from './components/Header';
import FormSelect from './components/FormSelect';

export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 120 }}>
        <View style= {{ height: 100 }}>
          <Header 
            leftHeading = 'Welcome '
            rightHeading = 'Back'
            subHeading = 'Random Tester'
          />
        </View>
        <View style = {{ flexDirection: 'row', padding: 20}}>
        </View>   
        <FormSelect />
    </View>
  );
}
