import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View, Animated, Dimensions } from 'react-native';
import Header from './components/Header';
import FormSelect from './components/FormSelect';
import LoginForm from './components/LoginForm';
import SignUpForm from './components/SignUpForm';
import { useRef } from 'react';

const { width } = Dimensions.get('window')

export default function App() {

  const animation = useRef(new Animated.Value(0)).current

  const rightHeaderOpacity = animation.interpolate({
    inputRange: [0, width],
    outputRange: [1, 0]
  })

  const leftHeaderTranslateX = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, 40]
  })

  const rightHeaderTranslateY = animation.interpolate({
    inputRange: [0, width],
    outputRange: [0, -20]
  })

  return (
    <View style={{ flex: 1, paddingTop: 60 }}>
        <View style= {{ height: 80 }}>
          <Header 
            leftHeading = 'Welcome '
            rightHeading = 'Back'
            subHeading = 'Random Tester'
            rightHeaderOpacity = { rightHeaderOpacity }
            leftHeaderTranslateX = { leftHeaderTranslateX }
            rightHeaderTranslateY = { rightHeaderTranslateY }
          />
        </View>
        <View style = {{ flexDirection: 'row', paddingHorizontal: 20, marginBottom: 20}}>
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
        <ScrollView 
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false} 
          scrollEventThrottle={16}
          onScroll={ Animated.event(
            [{ nativeEvent: { contentOffset: { x:animation }}}],
            { useNativeDriver: false }
          )}
          >
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