import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'

const FormSelect = () => {
  return (
    <TouchableWithoutFeedback>
        <View style={styles.container}>
            <Text style={styles.button}>Login</Text>
        </View>
    </TouchableWithoutFeedback>

  )
}

export default FormSelect

const styles = StyleSheet.create({
    container:{
        height: 45,
        width: '50%',
        backgroundColor: '#1b1b33',
        alignItems: 'center',
        justifyContent: 'center',
    },
    button: {
        color: 'white',
        fontSize: 16
    }
})