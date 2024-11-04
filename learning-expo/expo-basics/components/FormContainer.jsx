import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FormContainer = ({ children }) => {
  return (
    <View style={styles.container}>
      { children }
    </View>
  )
}

export default FormContainer

const styles = StyleSheet.create({
    container: {   
        width: Dimensions.get('window').width,
        paddingHorizontal: 20
    },
})