import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Switch, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "./ThemeContext";
import EnergyTrackingScreen from "./energyTracking";
import ProfileSettings from "./ProfileSettings";
import LegalSettings from "./LegalSettings";
import Constants from 'expo-constants';

export default function SettingsScreen() {
    const navigation = useNavigation();
    const { isDarkMode, toggleDarkMode } = useTheme();
    
    const [userName, setUserName] = useState("User");
    const [householdId, setHouseholdId] = useState("Loading...");

    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        const loadUserData = async () => {
            try {
                const storedName = await AsyncStorage.getItem("name");
                const storedHouseholdId = await AsyncStorage.getItem("householdId");

                if (storedName) setUserName(storedName);
                if (storedHouseholdId) setHouseholdId(storedHouseholdId);
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };

        loadUserData();
    }, [navigation]);

    const settingsOptions = [
        { title: "Profile Settings", subtitle: "Passwords, Personal details, Preferences", screen: "ProfileSettings" },
        { title: "Privacy & Security", subtitle: "Data Privacy, Camera and Microphone Access", screen: "PrivacySettings" },
        { title: "Support", subtitle: "Help Center, Community forums, Contact Support", screen: "SupportScreen" },
        { title: "Terms and Privacy", subtitle: "Terms Of Service, Privacy Policy, Delete Account", screen: "LegalSettings" },
    ];

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
            <View style={styles.header}>
                <Text style={[styles.greeting, { color: isDarkMode ? "#fff" : "#000" }]}>
                    Hey, <Text style={styles.bold}>{userName} 👋</Text>
                </Text>
                <TouchableOpacity onPress={() => navigation.navigate(ProfileSettings)}>
                    {/*<Image source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} style={styles.profileImage} />*/}
                   <View style={styles.profileIcon}>
                                           <Text style={styles.profileText}>
                                               {userName ? userName.charAt(0).toUpperCase() : "U"}
                                           </Text>
                                       </View>
                </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Settings</Text>
            
            {settingsOptions.map((item, index) => (
                <TouchableOpacity key={index} style={styles.settingItem} onPress={() => navigation.navigate(item.screen)}>
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
                <TouchableOpacity style={styles.button} onPress={() => navigation.navigate("Login")}>
                    <Text style={styles.buttonText}>Sign Out</Text>
                </TouchableOpacity>
                <Text style={[styles.houseId, { color: isDarkMode ? "#bbb" : "gray" }]}>House ID - {householdId}</Text>
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
    footer: { alignItems: "center", marginTop: 50 },
    button: { backgroundColor: "#8B5CF6", padding: 15, borderRadius: 25, 
        width:Platform.OS==="web" ? "20%" : '42%', 
        alignItems: "center", marginVertical: 5 },
    buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
    houseId: { color: "gray", marginTop: 10 },
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#6200ea", // Change color as needed
        justifyContent: "center",
        alignItems: "center",
    },
    profileText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    }
});