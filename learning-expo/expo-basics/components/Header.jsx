import { StyleSheet, Text, View, Animated } from 'react-native'
import React from 'react'

const Header = ({leftHeading, rightHeading, subHeading, leftHeaderTranslateX = 0, rightHeaderTranslateY = 0, rightHeaderOpacity = 0 }) => {
  return (
    <>
        <View style = {styles.container}>
            <Animated.Text style = {[ styles.heading, { transform: [{ translateX: leftHeaderTranslateX }]} ]}>
                {leftHeading}
            </Animated.Text>
            <Animated.Text style = {[ styles.heading, { opacity: rightHeaderOpacity, transform: [{ translateY: rightHeaderTranslateY }] } ]}>
                {rightHeading}
            </Animated.Text>
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