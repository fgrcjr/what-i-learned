import { StyleSheet, Text, View } from 'react-native'
import React, { useState } from 'react'
import FormContainer from './FormContainer'
import FormInput from './FormInput'
import FormSubmitButton from './FormSubmitButton'
import { isValidEmail, isValidObjField, updateError } from '../utils/methods'

const SignUpForm = () => {

  const [userInfo, setUserInfo] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  })

  const [error, setError] = useState('')

  const { fullName, email, password, confirmPassword } = userInfo

  const handleOnChangeText = (value, fieldName) => {
    setUserInfo({ ...userInfo, [fieldName]: value })
  }

  const isValidForm = () => {
    if(isValidObjField(userInfo)) return updateError('Required all fields!', setError)
    if(!fullName.trim() || fullName.length < 3) return updateError('Invalid name!', setError)
    if(!isValidEmail(email)) return updateError('Invalid email!', setError)
    if(!password.trim() || password.length < 8) return updateError('Password is less than 8 characters.', setError)
    if(password !== confirmPassword) return updateError('Password does not match.', setError)
  }

  const submitForm = () => {
    if(isValidForm()){
      
    }
  }

  return (
    <FormContainer>

      { error ? <Text style={{color: 'red', fontSize: 18, textAlign: 'center' }}>{error}</Text>: null }

      {/* Name */}
      <FormInput 
        value={fullName}
        onChangeText={(value) => handleOnChangeText(value, 'fullName')}
        title='Full Name'
        placeholder='ex. Juanito Lakarin'
      />

      {/* Email */}
      <FormInput
        value={email}
        onChangeText={(value) => handleOnChangeText(value, 'email')}
        autoCapitalize='none'
        title='Email'
        placeholder='example@email.com'
      />

      {/* Password */}
      <FormInput
        value={password}
        onChangeText={(value) => handleOnChangeText(value, 'password')}
        autoCapitalize='none'
        secureTextEntry
        title='Password'
        placeholder='********'
      />

      {/* Confirm Password */}
      <FormInput
        value={confirmPassword}
        onChangeText={(value) => handleOnChangeText(value, 'confirmPassword')}
        autoCapitalize='none'
        secureTextEntry
        title='Confirm Password'
        placeholder='********'
      />
      
      {/* Form Submit */}
      <FormSubmitButton onPress={ submitForm } title='Sign Up'/>
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