import React, { useEffect } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

import ProfileSettings from "./ProfileSettings";

export default function managerSettingsScreen() {
    const navigation = useNavigation();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        }, [navigation]);

    const settingsOptions = [
        { title: "Profile Settings", subtitle: "Passwords, Personal details, Preferences", screen: "ProfileSettings" },
        { title: "Privacy & Security", subtitle: "Data Privacy, Camera and Microphone Access", screen: "PrivacySettings" },
        { title: "Energy and Usage Monitoring", subtitle: "Energy Tracking, Usage reports", screen: "EnergyTrackingScreen", params: { propertyName: 'My Home' } },
        { title: "Support", subtitle: "Help Center, FAQs, Contact Support", screen: "SupportScreen" },
        { title: "Terms and Privacy", subtitle: "Terms Of Service, Privacy Policy, Delete Account", screen: "LegalSettings" },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]} >
            <View style={{padding: 10}}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                <Ionicons name="chevron-back-outline" size={27} color={textColor} />
                </TouchableOpacity>
            </View>
            <View style={styles.header}>
                <Text style={[styles.greeting, { color: isDarkMode ? "#fff" : "#000" }]}>Hey, <Text style={styles.bold}>Maria 👋</Text></Text>
                <TouchableOpacity onPress={() => navigation.navigate(ProfileSettings)}>
                <Image source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} style={styles.profileImage} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Settings</Text>
            
            {settingsOptions.map((item, index) => (
                <TouchableOpacity key={index} style={styles.settingItem} onPress={() => navigation.getParent()?.navigate(item.screen)}>
                    <View>
                        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>{item.title}</Text>
                        <Text style={[styles.settingSubtitle, { color: isDarkMode ? "#fff" : "#000" }]}>{item.subtitle}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={isDarkMode ? "#fff" : "#888"} />
                </TouchableOpacity>
            ))}
            
            <View style={styles.settingItem}>
                <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Dark Mode</Text>
                <Switch value={isDarkMode} onValueChange={toggleDarkMode} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>
            </View>
            
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}><Text style={styles.buttonText}>Sign Out</Text></TouchableOpacity>
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
    houseId: { color: "gray", marginTop: 10 }
});