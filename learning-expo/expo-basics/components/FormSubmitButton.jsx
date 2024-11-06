import { TouchableOpacity, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FormSubmitButton = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress} style={styles.container}>
        <Text style={{ fontSize: 18, color: '#fff' }}>{ title }</Text>
    </TouchableOpacity>
  )
}

export default FormSubmitButton

const styles = StyleSheet.create({
    container: {
        height: 45,
        backgroundColor: 'rgba(27,27,51,1)',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center'
    }
})