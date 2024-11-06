import { StyleSheet, Text, TextInput, View } from 'react-native'
import React from 'react'

const FormInput = (props) => {

  const { title, placeholder } = props

  return (
    <>
      <Text style={{ fontWeight: 'bold' }}>{ title }</Text>
      <TextInput
        {...props}
        placeholder={ placeholder }
        style={styles.text}>
      </TextInput>
    </>
  )
}

export default FormInput

const styles = StyleSheet.create({
    text: { 
        borderWidth: 1,
        borderColor: '#1b1b33',
        height: 35,
        borderRadius: 8,
        fontSize: 16,
        paddingLeft: 10,
        marginBottom: 20
    }
})