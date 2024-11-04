import React from 'react'
import FormContainer from './FormContainer'
import FormInput from './FormInput'
import FormSubmitButton from './FormSubmitButton'

const LoginForm = () => {
  return (
    <FormContainer>
      <FormInput title='Email' placeholder='example@email.com' />
      <FormInput title='Password' placeholder='********' />
      <FormSubmitButton title='Login'/>
    </FormContainer>
  )
}

export default LoginForm