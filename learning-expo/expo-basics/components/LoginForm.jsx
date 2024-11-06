import React, { useState } from 'react'
import FormContainer from './FormContainer'
import FormInput from './FormInput'
import FormSubmitButton from './FormSubmitButton'
import { isValidEmail, isValidObjField, updateError } from '../utils/methods'
import { Text } from 'react-native'

const LoginForm = () => {

  const [userInfo, setUserInfo] = useState({
    email: '',
    password: '',
  })

  const [error, setError] = useState('')
  
  const { email, password } = userInfo

  const handleOnChangeText = (value, fieldName) => {
    setUserInfo({ ...userInfo, [fieldName]: value })
  }

  const isValidForm = () => {
    if(!isValidObjField(userInfo)) return updateError('All fields are required.', setError)
    if(!isValidEmail(email)) return updateError('Invalid email.', setError)
    if(!password.trim() || password.length < 8) return updateError('Password is less than 8 characters.', setError)
    return true
  }

  const submitForm = () => {
    if(isValidForm()){
      
    }
  }

  return (
    <FormContainer>

      { error ? <Text style={{color: 'red', fontSize: 18, textAlign: 'center' }}>{error}</Text>: null }

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
      
      {/* Form Submit */}
      <FormSubmitButton onPress={ submitForm } title='Login'/>
    </FormContainer>
  )
}

export default LoginForm