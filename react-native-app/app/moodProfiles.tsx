import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Modal, TextInput, Switch, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

// Add this near the top to avoid browser warnings when using ngrok
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

export default function MoodProfilesScreen() {
  const navigation = useNavigation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('Select room');
  const [selectedMood, setSelectedMood] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [moodName, setMoodName] = useState('');
  const [roomForMood, setRoomForMood] = useState('Select room');
  const [deviceConfig, setDeviceConfig] = useState({});
  const [customMoods, setCustomMoods] = useState([]);
  const { isDarkMode } = useTheme();
  
  const [userName, setUserName] = useState("User");
  const [householdId, setHouseholdId] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const backgroundColor = isDarkMode ? "black" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  
  // Backend API URL - replace with your actual URL
  const API_URL = "http://localhost:5003"; 

  // Load user data, household ID and fetch rooms on component mount
  useEffect(() => {
    navigation.setOptions({ headerShown: false });

    const loadUserData = async () => {
      try {
        const storedName = await AsyncStorage.getItem("name");
        const storedHouseholdId = await AsyncStorage.getItem("householdId");

        if (storedName) setUserName(storedName);
        if (storedHouseholdId) {
          setHouseholdId(storedHouseholdId);
          fetchRooms(storedHouseholdId);
          fetchMoodProfiles(storedHouseholdId);
        } else {
          setIsLoading(false);
          setErrorMessage("No household ID found. Please log in again.");
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        setIsLoading(false);
        setErrorMessage("Failed to load user data.");
      }
    };

    loadUserData();
  }, [navigation]);

  // Fetch rooms from backend
  const fetchRooms = async (householdId) => {
    try {
      const response = await axios.get(`${API_URL}/rooms/${householdId}`);
      
      if (response.data && response.data.rooms) {
        setRooms(response.data.rooms);
      } else {
        console.warn("No rooms found in response!");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error.response?.data || error.message);
      setErrorMessage(`Failed to fetch rooms: ${error.message}`);
    }
  };

  // Fetch mood profiles from backend
  const fetchMoodProfiles = async (householdId, roomId = null) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      let url = `${API_URL}/mood_profiles/${householdId}`;
      if (roomId) {
        url += `?room_id=${roomId}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data && response.data.mood_profiles) {
        // Transform the data to match our UI requirements
        const formattedMoods = response.data.mood_profiles.map(mood => ({
          id: mood.id.toString(),
          name: mood.name,
          color: mood.color,
          room: mood.room_id ? rooms.find(r => r.id === mood.room_id)?.name : 'All Rooms',
          devices: mood.devices || {}
        }));
        
        setCustomMoods(formattedMoods);
      }
    } catch (error) {
      console.error("Error fetching mood profiles:", error);
      setErrorMessage("Failed to fetch mood profiles.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch devices for a specific room
  const fetchDevices = async (roomId) => {
    if (!householdId || !roomId) return;
    
    try {
      const response = await axios.get(`${API_URL}/devices?roomId=${roomId}&householdId=${householdId}`);
      
      if (response.data) {
        // Format devices to match our UI
        const formattedDevices = response.data.map(device => device.device_name);
        setDevices(formattedDevices);
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
      // If no devices, provide some defaults
      setDevices(['Ceiling Light', 'Desk Lamp', 'Fan', 'Heater', 'Smart Plug']);
    }
  };

  // When room selection changes, fetch devices for that room
  useEffect(() => {
    if (selectedRoomId) {
      fetchDevices(selectedRoomId);
    }
  }, [selectedRoomId]);

  const handleDeviceToggle = (device) => {
    setDeviceConfig(prev => ({
      ...prev,
      [device]: !prev[device]
    }));
  };

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room.name);
    setSelectedRoomId(room.id);
    setIsDropdownOpen(false);
    
    // If a room is selected, fetch mood profiles for that room
    if (householdId) {
      fetchMoodProfiles(householdId, room.id);
    }
  };

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
  };
  
  // Add new mood profile
  const handleSaveMood = async () => {
    if (!moodName.trim()) {
      Alert.alert("Error", "Please enter a mood name");
      return;
    }
    
    try {
      // Prepare mood data
      const roomId = roomForMood !== 'Select room' ? 
        rooms.find(room => room.name === roomForMood)?.id : null;
      
      const moodData = {
        household_id: householdId,
        name: moodName,
        color: isDarkMode ? '#6B5B95' : '#C0C0C0', // Default color
        room_id: roomId,
        devices: deviceConfig
      };
      
      // Send to backend
      const response = await axios.post(`${API_URL}/add_mood_profile`, moodData);
      
      if (response.data && response.data.mood_profile) {
        const newMood = {
          id: response.data.mood_profile.mood_id.toString(),
          name: moodName,
          color: moodData.color,
          room: roomForMood !== 'Select room' ? roomForMood : 'All Rooms',
          devices: deviceConfig
        };
        
        setCustomMoods(prev => [...prev, newMood]);
        
        // Reset modal
        setIsModalVisible(false);
        setMoodName('');
        setRoomForMood('Select room');
        setDeviceConfig({});
      }
    } catch (error) {
      console.error("Error saving mood:", error);
      Alert.alert("Error", "Failed to save mood profile. Please try again.");
    }
  };

  // Delete mood profile
  const deleteMoodProfile = async (moodId) => {
    if (!moodId) return;
    
    try {
      const response = await axios.delete(`${API_URL}/delete_mood_profile/${moodId}`);
      
      if (response.data && response.data["Mood Profile Deletion"] === "Successful") {
        // Remove from local state
        setCustomMoods(customMoods.filter(mood => mood.id !== moodId));
        
        if (selectedMood === moodId) {
          setSelectedMood(null);
        }
      }
    } catch (error) {
      console.error("Error deleting mood profile:", error);
      Alert.alert("Error", "Failed to delete mood profile.");
    }
  };

  // Predefined mood profiles
  const lightMoods = [
    { id: 'work', name: 'Work', color: '#AED6F1' },
    { id: 'party', name: 'Party', color: '#DCC7FF' },
    { id: 'relaxed', name: 'Relaxed', color: '#B8E4F0' },
    { id: 'sleep', name: 'Sleep', color: '#A3E4D7' }
  ];
  const darkMoods = [
    { id: 'work', name: 'Work', color: '#4A90E2' },
    { id: 'party', name: 'Party', color: '#7D5CD3' },
    { id: 'relaxed', name: 'Relaxed', color: '#4DA6C3' },
    { id: 'sleep', name: 'Sleep', color: '#3DA98F' }
  ];
  const defaultMoods = isDarkMode ? darkMoods : lightMoods;

  // Combine default and custom moods
  const combinedMoods = [...defaultMoods, ...customMoods];
  
  return (
    <ScrollView style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, {color: textColor}]}>
              Hey, <Text style={{fontWeight: 'bold'}}>{userName}</Text>
              <Text style={styles.waveEmoji}> 👋</Text>
            </Text>
            <Text style={[styles.subTitle, {color: textColor}]}>Mood Profiles</Text>
          </View>
        </View>
        
        <View style={styles.mainContent}>
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
          
          <View style={styles.roomSelectorWrapper}>
            <TouchableOpacity 
              style={[styles.roomSelector, {backgroundColor: backgroundColor}]} 
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={[styles.roomText, {color: textColor}]}>{selectedRoom}</Text>
              <Text style={[styles.chevronDown, isDropdownOpen && styles.chevronUp, {color: textColor}]}>▼</Text>
            </TouchableOpacity>
            
            {isDropdownOpen && (
              <View style={[styles.dropdownMenu, {backgroundColor: backgroundColor}]}>
                <ScrollView style={styles.dropdownScroll}>
                  {rooms.map((room) => (
                    <TouchableOpacity 
                      key={room.id} 
                      style={[styles.dropdownItem, {backgroundColor: backgroundColor}]}
                      onPress={() => handleRoomSelect(room)}
                    >
                      <Text style={[styles.dropdownItemText, {color: textColor}]}>{room.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
          
          {isDropdownOpen && (
            <TouchableOpacity 
              style={styles.overlay} 
              onPress={() => setIsDropdownOpen(false)} 
            />
          )}
          
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={{color: textColor}}>Loading mood profiles...</Text>
            </View>
          ) : (
            <View style={styles.profilesGrid}>
              {combinedMoods.map((mood) => (
                <TouchableOpacity 
                  key={mood.id}
                  style={[
                    styles.profileCard, 
                    { backgroundColor: mood.color },
                    selectedMood === mood.id && styles.selectedCard
                  ]}
                  onPress={() => handleMoodSelect(mood.id)}
                  onLongPress={() => {
                    // Only allow deletion of custom moods, not default ones
                    if (!defaultMoods.some(m => m.id === mood.id)) {
                      Alert.alert(
                        "Delete Mood",
                        `Are you sure you want to delete "${mood.name}"?`,
                        [
                          { text: "Cancel", style: "cancel" },
                          { text: "Delete", style: "destructive", onPress: () => deleteMoodProfile(mood.id) }
                        ]
                      );
                    }
                  }}
                >
                  {selectedMood === mood.id && (
                    <View style={styles.selectedIndicator}>
                      <Text style={styles.selectedIndicatorText}>✓</Text>
                    </View>
                  )}
                  <View style={styles.profileImage}>
                    <Image 
                      source={{ uri: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" }} 
                      style={styles.profileImg} 
                    />
                  </View>
                  <Text style={styles.profileName}>{mood.name}</Text>
                  {mood.room && mood.room !== 'All Rooms' && (
                    <Text style={styles.roomLabel}>{mood.room}</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
          
          <TouchableOpacity style={styles.addNewButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addNewButtonText}>Add New Mood</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Add Mood Popup */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
            <Text style={styles.modalTitle}>Create New Mood</Text>
            
            <TextInput
              placeholder="Mood Name"
              placeholderTextColor="#888"
              style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#eee", color: isDarkMode ? '#fff' : '#000' }]}
              value={moodName}
              onChangeText={setMoodName}
            />

            {/* Room Selector */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Select Room:</Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, { backgroundColor: isDarkMode ? "#333" : "#eee" }]} 
              onPress={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{roomForMood}</Text>
            </TouchableOpacity>
            {isDropdownOpen && (
              <View style={[styles.dropdownMenuSmall, { backgroundColor: isDarkMode ? "#333" : "#eee" }]}>
                {rooms.map((room) => (
                  <TouchableOpacity 
                    key={room.id} 
                    onPress={() => { 
                      setRoomForMood(room.name); 
                      setIsDropdownOpen(false); 
                      fetchDevices(room.id);
                    }}
                  >
                    <Text style={{ padding: 10, color: isDarkMode ? '#fff' : '#000' }}>{room.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* Devices List */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Select devices to turn ON:</Text>
            {devices.length > 0 ? devices.map((device, idx) => (
              <View key={idx} style={styles.deviceRow}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{device}</Text>
                <Switch 
                  value={!!deviceConfig[device]} 
                  onValueChange={() => handleDeviceToggle(device)}
                  trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                  thumbColor={isDarkMode ? '#ffffff': "#8B5CF6"}
                />
              </View>
            )) : (
              <Text style={{ color: isDarkMode ? '#aaa' : '#666', marginTop: 10 }}>
                No devices found for this room.
              </Text>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
                <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addButton, !moodName.trim() && styles.disabledButton]} 
                onPress={handleSaveMood}
                disabled={!moodName.trim()}
              >
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  contentWrapper: {
    padding: Platform.OS === 'web' ? '2% 10%' : 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
    minHeight: '100%',
  },
  header: {
    marginTop: Platform.OS === 'web' ? 60 : 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'web' ? 50 : 30,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: Platform.OS === 'web' ? 42 : 28,
    marginBottom: Platform.OS === 'web' ? 10 : 5,
  },
  waveEmoji: {
    marginLeft: 10,
  },
  subTitle: {
    fontSize: Platform.OS === 'web' ? 42 : 28,
    color: '#6B7280',
    fontWeight: '500',
  },
  profilePic: {
    width: Platform.OS === 'web' ? 80 : 50,
    height: Platform.OS === 'web' ? 80 : 50,
    borderRadius: Platform.OS === 'web' ? 40 : 25,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  mainContent: {
    position: 'relative',
  },
  roomSelectorWrapper: {
    position: 'relative',
    marginBottom: Platform.OS === 'web' ? 50 : 30,
    zIndex: 10,
    maxWidth: Platform.OS === 'web' ? 800 : undefined,
  },
  roomSelector: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 60 : 50,
    padding: Platform.OS === 'web' ? 30 : 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  roomText: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '500',
  },
  chevronDown: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 90 : 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 30 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: Platform.OS === 'web' ? 400 : 300,
    zIndex: 20,
  },
  dropdownScroll: {
    padding: Platform.OS === 'web' ? 10 : 5,
  },
  dropdownItem: {
    padding: Platform.OS === 'web' ? 25 : 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    zIndex: 5,
  },
  profilesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 40 : 15,
    marginBottom: Platform.OS === 'web' ? 50 : 30,
  },
  profileCard: {
    width: Platform.OS === 'web' ? 'calc(25% - 30px)' : '48%',
    borderRadius: Platform.OS === 'web' ? 40 : 30,
    padding: Platform.OS === 'web' ? 40 : 30,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    position: 'relative',
    minHeight: Platform.OS === 'web' ? 300 : 'auto',
  },
  selectedCard: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 5,
    transform: [{ translateY: -5 }],
  },
  selectedIndicator: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 25 : 15,
    right: Platform.OS === 'web' ? 25 : 15,
    width: Platform.OS === 'web' ? 40 : 24,
    height: Platform.OS === 'web' ? 40 : 24,
    borderRadius: Platform.OS === 'web' ? 20 : 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 20 : 14,
  },
  profileImage: {
    width: Platform.OS === 'web' ? 120 : 80,
    height: Platform.OS === 'web' ? 120 : 80,
    borderRadius: Platform.OS === 'web' ? 60 : 40,
    overflow: 'hidden',
    marginBottom: Platform.OS === 'web' ? 25 : 15,
    backgroundColor: '#ccc',
  },
  profileName: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  roomLabel: {
    fontSize: Platform.OS === 'web' ? 18 : 14,
    color: 'rgba(0, 0, 0, 0.6)',
    marginTop: 5,
  },
  addNewButton: {
    backgroundColor: '#8B5CF6',
    padding: Platform.OS === 'web' ? 25 : 15,
    borderRadius: Platform.OS === 'web' ? 60 : 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  addNewButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: Platform.OS === 'web' ? '50%' : '90%',
    maxWidth: 600,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 0,
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    marginTop: 10,
  },
  dropdownButton: {
    backgroundColor: '#eee',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownMenuSmall: {
    backgroundColor: '#eee',
    borderRadius: 10,
    marginBottom: 20,
    maxHeight: 150,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  cancelButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    opacity: 0.5,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  }
});