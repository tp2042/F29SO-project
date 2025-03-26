import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, Linking, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

export default function SupportScreen() {
    const navigation = useNavigation();
    const { isDarkMode} = useTheme();
    const [FAQ, setFAQ] = useState(false);
    const [tut, setTut] = useState(false);

    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    return (
            <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
                <View style={{padding: 10}}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back-outline" size={27} color={textColor} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Support</Text>
                
                <TouchableOpacity style={styles.settingItem} onPress={() => setFAQ(prev => !prev)}>
                    <View>
                        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>FAQs</Text>
                    </View>
                    <Ionicons name={FAQ? "chevron-down-outline" : "chevron-forward"} size={20} color={isDarkMode ? "#fff" : "#888"} />
                </TouchableOpacity>

                {FAQ && ( 
                    <ScrollView style={{ maxHeight: 420 }}>
                        <Text style={{ padding: 16, lineHeight: 22 }}>
                        <Text style={[{ color: '#8B5CF6' }, { fontSize: 24 }]}>FAQs{"\n"}{"\n"}</Text>
                        <Text style={[{ color: textColor }, { fontSize: 20 }]}>
        <Text style={{ fontWeight: "bold" }}>Which devices are compatible with MyWatt?{"\n"}</Text>
        Our app works with a wide range of smart home devices, including smart lights, thermostats, plugs, cameras, and sensors. Check our Compatibility List for a full list of supported devices.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>Can I use the app without an internet connection?{"\n"}</Text>
        Some features may work locally (e.g., controlling devices on the same Wi-Fi network), but most functions, including remote access and automations, require an active internet connection.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>How do I update the app or my devices?{"\n"}</Text>
        Go to your app store (Google Play or Apple App Store) and check for updates.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>Can I share access to my devices with family members?{"\n"}</Text>
        Yes! You can invite family members or housemates to control your devices:{"\n"}
        {"\u2022"} Go to "Settings" &gt; "Shared Access."{"\n"}
        {"\u2022"} Enter their email address and assign permissions (e.g., full control or limited access).{"\n"}
        {"\u2022"} They’ll receive an invitation to join.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>What should I do if a device isn’t responding in the app?{"\n"}</Text>
        Try these troubleshooting steps:{"\n"}
        {"\u2022"} Check if the device is powered on and connected to Wi-Fi.{"\n"}
        {"\u2022"} Restart the device and your router.{"\n"}
        {"\u2022"} Ensure the app is updated to the latest version.{"\n"}
        {"\u2022"} If the issue persists, contact our support team at mywattapp@gmail.com.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>Can I control my air conditioner with the app?{"\n"}</Text>
        Yes! You can:{"\n"}
        {"\u2022"} Adjust the temperature.{"\n"}
        {"\u2022"} Set heating/cooling schedules.{"\n"}
        {"\u2022"} Monitor energy usage.{"\n"}
        Go to the "Climate Control" section to manage your settings.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>How do I add a new device to the app?{"\n"}</Text>
        To add a new device:{"\n"}
        {"\u2022"} Tap the "+" or "Add Device" button in the app.{"\n"}
        {"\u2022"} Follow the on-screen instructions to connect your device to your Wi-Fi network.{"\n"}
        {"\u2022"} Once connected, your device will appear in the app dashboard.{"\n\n"}

        <Text style={{ fontWeight: "bold" }}>Can I control my devices when I’m away from home?{"\n"}</Text>
        Yes! As long as your devices are connected to the internet, you can control them remotely using the app from anywhere in the world.
    </Text>
    </Text>
                    </ScrollView> )}
                
                <TouchableOpacity style={styles.settingItem} onPress={() => setTut(prev => !prev)}>
                <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>App tutorial demo</Text>
                </View>
                <Ionicons name={tut ? "chevron-down-outline" : "chevron-forward"} size={20} color={isDarkMode ? "#fff" : "#888"} />
                </TouchableOpacity>

                {/* add tutorial video */}

                <View style={styles.contactUs}>
                    <Text style={[styles.settingTitle, {color: '#fff'}, {fontSize: 30}]}>Contact Us</Text>
                    <Text style={[{color: '#fff'}, {fontSize: 20}]}>
                        Address: 
                        Email: mywattapp@gmail.com
                    </Text>
                    <View style={styles.links}>
                    <TouchableOpacity style={styles.linksicons} onPress={() => Linking.openURL('https://www.instagram.com/mywatt_app?igsh=MzRlODBiNWFlZA==')}>
                        <Ionicons name="logo-instagram" size={24} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linksicons} onPress={() => Linking.openURL('https://github.com/tp2042/F29SO-project')}>
                        <Ionicons name="logo-github" size={24} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.linksicons} onPress={() => Linking.openURL('')}>
                        <Ionicons name="logo-linkedin" size={24} color="#fff"></Ionicons>
                    </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    }
    
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
        header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
        greeting: { fontSize: 22 },
        bold: { fontWeight: "bold" },
        profileImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#ddd" },
        title: { fontSize: 28, fontWeight: "bold", marginBottom: 15 },
        settingItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
        settingTitle: { fontSize: 18, fontWeight: "bold" },
        settingSubtitle: { fontSize: 14, color: "#777" },
        footer: { alignItems: "center", marginTop: 20 },
        button: { backgroundColor: "#8B5CF6", padding: 15, borderRadius: 25, width: "30%", alignItems: "center", marginVertical: 5 },
        buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
        houseId: { color: "gray", marginTop: 10 },
        modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
        modalContent: { width: '54%', borderRadius: 15, padding: 20 },
        modalTitle: { fontSize: 22, fontWeight: '600', marginBottom: 50, alignSelf: 'center'},
        modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
        cancelButton: { padding: 10 },
        addButton: { backgroundColor: '#8B5CF6', padding: 10, borderRadius: 8 },
        contactUs: {
            alignItems: "center",
            padding: 30,
            width: Platform.OS==="web" ? '30%' : '90%',
            backgroundColor: '#8B5CF6',
            flex: 1,
            alignSelf: 'center',
            marginTop: 200,
            borderRadius: 15,
        },
        links: {
            flex:1,
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: 5,
        },
        linksicons: {
            marginTop: 5,
            marginLeft: 20,
            marginRight: 20
        }
    });