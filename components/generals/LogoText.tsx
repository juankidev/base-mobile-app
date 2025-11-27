import React from 'react';
import { StyleSheet, View } from 'react-native';

export const LogoText = ({ style }: { style?: any }) => (
    <View style={[styles.container, style]}>
    </View>
);

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10, 
        position: 'relative',
    },
    meico: {
        width: 158,
        height: 32,
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 32,
        lineHeight: 32,
        opacity: 1,
    },
    track: {
        width: 118,
        height: 21,
        color: '#FFFFFF',
        textAlign: 'center',
        fontSize: 21,
        lineHeight: 21,
        opacity: 1,
    },
});

