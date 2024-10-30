import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FormComtainer from './FormComtainer'

const SignUpForm = () => {
  return (
    <FormComtainer>
        <Text style={styles.text}>Sign Up</Text>
    </FormComtainer>
  )
}

export default SignUpForm

const styles = StyleSheet.create({
    text: { 
        fontSize: 50,  
        fontWeight: 'bold' 
    }
})