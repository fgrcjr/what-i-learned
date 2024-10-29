import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'

const LoginForm = () => {
  return (
    <View style={styles.container}>
        <Text style={styles.text}>Login</Text>
    </View>
  )
}

export default LoginForm

const styles = StyleSheet.create({
    container: { 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'black', 
        width: Dimensions.get('window').width 
    },
    text: { 
        fontSize: 50, 
        color: 'white', 
        fontWeight: 'bold' 
    }
})