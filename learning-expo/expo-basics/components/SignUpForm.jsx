import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const SignUpForm = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Login</Text>
    </View>
  )
}

export default SignUpForm

const styles = StyleSheet.create({
    container: { 
        justifyContent: 'center', 
        alignItems: 'center',  
        width: Dimensions.get('window').width 
    },
    text: { 
        fontSize: 50,  
        fontWeight: 'bold' 
    }
})