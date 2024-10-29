import { StyleSheet, Text, TouchableWithoutFeedback, View } from 'react-native'
import React from 'react'

const FormSelect = ({ title, style, backgroundColor }) => {
  return (
    <TouchableWithoutFeedback>
        <View style={[styles.container, style, { backgroundColor }]}>
            <Text style={styles.title}>{title}</Text>
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
    title: {
        color: 'white',
        fontSize: 16
    }
})