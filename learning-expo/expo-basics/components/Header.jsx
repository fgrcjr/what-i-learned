import { StyleSheet, Text, View } from 'react-native'
import React from 'react'

const Header = ({leftHeading, rightHeading, subHeading}) => {
  return (
    <>
        <View style = {styles.container}>
            <Text style = {styles.heading}>
                {leftHeading}
            </Text>
            <Text style = {styles.heading}>
                {rightHeading}
            </Text>
        </View>
        <Text style = {styles.subheading}>{subHeading}</Text>
    </>
 
  )
}

export default Header

const styles = StyleSheet.create({
    container: { 
        flexDirection: 'row', 
        justifyContent: 'center', 
        alignItems: 'center'
    },
    heading: { 
        fontSize: 30, 
        fontWeight: 'bold',
        color: '#1b1b33'
    },
    subheading: { 
        fontSize: 16, 
        color: '#1b1b33',
        textAlign: 'center'
    }
})