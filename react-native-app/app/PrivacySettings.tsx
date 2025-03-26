import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import axios from "axios"; 
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PrivacySettings() {
  const navigation = useNavigation();
  const { isDarkMode } = useTheme();
  
  // State for privacy settings
  const [location, setLocation] = useState(false);
  const [camera, setCamera] = useState(false);
  const [bluetooth, setBluetooth] = useState(false);
  const [notifications, setNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  
  const API_URL = 'https://backend-1-y12u.onrender.com'; // Replace with your actual API URL
  
  // Fetch current settings on component mount
  useEffect(() => {
    fetchCurrentSettings();
  }, []);
  
  const fetchCurrentSettings = async () => {
    try {
      const storedUserId = await AsyncStorage.getItem("userId");
      console.log('User ID:', storedUserId);
      
      if (!storedUserId) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        return;
      }
      
      // Convert to integer since AsyncStorage stores as string
      const userIdInt = parseInt(storedUserId, 10);
      setUserId(userIdInt);
      
      // Make API call to get current settings
      const response = await axios.get(`${API_URL}/user_settings/${userIdInt}`);
      
      if (response.data.success) {
        const settings = response.data.settings;
        setLocation(settings.location);
        setCamera(settings.camera);
        setBluetooth(settings.bluetooth);
        setNotifications(settings.notifications);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
      Alert.alert("Error", "Failed to load your privacy settings");
    }
  };
  
  // Update a single setting
  const updateSetting = async (setting, value) => {
    setIsLoading(true);
    
    try {
      if (!userId) {
        console.error("Invalid User ID:", userId);
        Alert.alert("Error", "User ID is missing. Please log in again.");
        setIsLoading(false);
        return;
      }
      
      // Update the local state first based on which setting is being changed
      let updatedSettings = {
        location,
        camera,
        bluetooth,
        notifications
      };
      
      // Update the specific setting being changed
      updatedSettings[setting] = value;
      
      // Update the local state
      switch (setting) {
        case 'location':
          setLocation(value);
          break;
        case 'camera':
          setCamera(value);
          break;
        case 'bluetooth':
          setBluetooth(value);
          break;
        case 'notifications':
          setNotifications(value);
          break;
      }
      
      // Prepare the data to send
      const updateData = {
        user_id: userId,
        ...updatedSettings
      };
      
      console.log("Sending update with payload:", updateData);
      
      // Send to the API
      const response = await axios.put(`${API_URL}/update_privacy_settings`, updateData);
      
      if (!response.data.success) {
        Alert.alert("Error", response.data.message || "Failed to update setting");
        // Revert the change if the API call fails
        fetchCurrentSettings();
      }
    } catch (error) {
      console.error("Error updating setting:", error);
      Alert.alert("Error", "Failed to update setting");
      // Revert the change if the API call fails
      fetchCurrentSettings();
    } finally {
      setIsLoading(false);
    }
  };
  const backgroundColor = isDarkMode ? "#000" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
      <View style={{padding: 10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back-outline" size={27} color={textColor} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Privacy and Security</Text>
      
      <View style={styles.setting}>
        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Location Access</Text>
        <Switch
          value={location}
          onValueChange={(value) => updateSetting('location', value)}
          trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
          thumbColor={isDarkMode ? '#ffffff': "#8B5CF6"}
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.setting}>
        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Camera Access</Text>
        <Switch
          value={camera}
          onValueChange={(value) => updateSetting('camera', value)}
          trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
          thumbColor={isDarkMode ? '#ffffff': "#8B5CF6"}
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.setting}>
        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Bluetooth Access</Text>
        <Switch
          value={bluetooth}
          onValueChange={(value) => updateSetting('bluetooth', value)}
          trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
          thumbColor={isDarkMode ? '#ffffff': "#8B5CF6"}
          disabled={isLoading}
        />
      </View>
      
      <View style={styles.setting}>
        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Notifications</Text>
        <Switch
          value={notifications}
          onValueChange={(value) => updateSetting('notifications', value)}
          trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
          thumbColor={isDarkMode ? '#ffffff': "#8B5CF6"}
          disabled={isLoading}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  title: { fontSize: 28, fontWeight: "bold", marginBottom: 15 },
  settingTitle: { fontSize: 18, fontWeight: "bold" },
  setting: {
    flexDirection: 'row',
    padding: 10,
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff20',
    marginBottom: 10,
    borderRadius: 8,
    paddingVertical: 15,
    paddingHorizontal: 20
  }
});