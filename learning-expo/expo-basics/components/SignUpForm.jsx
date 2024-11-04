import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import FormContainer from './FormContainer'
import FormInput from './FormInput'
import FormSubmitButton from './FormSubmitButton'

const SignUpForm = () => {
  return (
    <FormContainer>
      <FormInput title='Full Name' placeholder='ex. Juanito Lakarin' />
      <FormInput title='Email' placeholder='example@email.com' />
      <FormInput title='Password' placeholder='********' />
      <FormInput title='Confirm Password' placeholder='********' />
      <FormSubmitButton title='Sign Up'/>
    </FormContainer>
  )
}

export default SignUpForm

const styles = StyleSheet.create({
    text: { 
        fontSize: 50,  
        fontWeight: 'bold' 
    }
})