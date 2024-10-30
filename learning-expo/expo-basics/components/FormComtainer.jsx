import { Dimensions, StyleSheet, Text, View } from 'react-native'
import React from 'react'

const FormComtainer = ({ children }) => {
  return (
    <View style={styles.container}>
      { children }
    </View>
  )
}

export default FormComtainer

const styles = StyleSheet.create({
    container: { 
        justifyContent: 'center', 
        alignItems: 'center',  
        width: Dimensions.get('window').width 
    },
})