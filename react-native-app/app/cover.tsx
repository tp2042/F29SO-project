import React, { useEffect } from "react";
import { View, Image, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function CoverScreen() {
    const navigation = useNavigation();

    useEffect(() => {
        const timer = setTimeout(() => {
        navigation.navigate("Login");
    }, 1500);
    return () => clearTimeout(timer); 
}, []);

    return (
    <View style={styles.container}>
        <Image source={require("../assets/images/My Watt logo.png")} style={styles.logo} />
    </View>
    );
}
{/* blue background color = "#3b82f6" */}
const styles = StyleSheet.create({
    container: {
    flex: 1,
    backgroundColor: "#8B5CF6", 
    justifyContent: "center",
    alignItems: "center",
    },
    logo: {
    width: 200,
    height: 200,
    resizeMode: "contain",
    },
});
