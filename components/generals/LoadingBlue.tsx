// components/generals/LoadingBlue.tsx
import { ActivityIndicator, StyleSheet, View } from "react-native";

export function LoadingBlue() {
    return (
        <View style={styles.overlay}>
            <ActivityIndicator
                size={50}        
                color="#F1F2F5"
                style={{ transform: [{ scale: 1.5 }] }} 
            />
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(255, 255, 255, 0.9)", 
        zIndex: 9999,
        justifyContent: "center",
        alignItems: "center",
    },
});
