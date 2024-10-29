import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, Text, View, Dimensions } from 'react-native';
import Header from './components/Header';
import FormSelect from './components/FormSelect';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';


export default function App() {
  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
        <View style= {{ height: 80 }}>
          <Header 
            leftHeading = 'Welcome '
            rightHeading = 'Back'
            subHeading = 'Random Tester'
          />
        </View>
        <View style = {{ flexDirection: 'row', paddingHorizontal: 20}}>
          {/* Login */}
          <FormSelect 
            style={styles.borderLeft} 
            backgroundColor='rgba(27,27,51,1)' 
            title='Login' 
          />
          {/* Sign Up */}
          <FormSelect 
            style={styles.borderRight} 
            backgroundColor='rgba(27,27,51,0.4)' 
            title='Sign Up' 
          />
        </View>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          <LoginForm />
          <SignUpForm />
        </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container:{
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  borderLeft: {
    borderTopLeftRadius: 8,
    borderBottomLeftRadius: 8
  },
  borderRight: {
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8
  }
})