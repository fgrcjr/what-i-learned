import { StyleSheet, Text, View, Dimensions } from 'react-native'
import React from 'react'
import FormComtainer from './FormComtainer'

const LoginForm = () => {
  return (
    <FormComtainer>
        <Text style={styles.text}>Login</Text>
    </FormComtainer>
  )
}

export default LoginForm

const styles = StyleSheet.create({
    text: { 
        fontSize: 50, 
        fontWeight: 'bold' 
    }
})