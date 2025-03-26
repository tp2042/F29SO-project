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
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [currentMoodId, setCurrentMoodId] = useState(null);

  const backgroundColor = isDarkMode ? "black" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  
  // Backend API URL - replace with your actual URL
  const API_URL = "https://backend-1-y12u.onrender.com"; 

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
          room_id: mood.room_id,
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

  // Handle mood selection and activation
  const handleMoodSelect = (moodId) => {
    // If this mood is already selected, deselect it
    if (selectedMood === moodId) {
      setSelectedMood(null);
      return;
    }
    
    // Otherwise, select it and activate it
    setSelectedMood(moodId);
    activateMood(moodId);
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
        color: selectedColor,
        room_id: roomId,
        devices: deviceConfig
      };
      
      let response;
      
      if (isEditMode) {
        // Update existing mood
        response = await axios.put(`${API_URL}/update_mood_profile/${currentMoodId}`, moodData);
        
        if (response.data && response.data["Mood Profile"] === "Update Successful") {
          // Update the mood in state
          setCustomMoods(customMoods.map(mood => 
            mood.id === parseInt(currentMoodId, 10) ? { 
              ...mood, 
              name: moodName, 
              color: selectedColor, 
              room_id: roomId, 
              room: roomForMood !== 'Select room' ? roomForMood : 'All Rooms', 
              devices: deviceConfig 
            } : mood
          ));
        }
      } else {
        // Add new mood
        response = await axios.post(`${API_URL}/add_mood_profile`, moodData);
        
        if (response.data && response.data.mood_profile) {
          const newMood = {
            id: parseInt(response.data.mood_profile.mood_id, 10), // Ensure it's an integer
            name: moodName,
            color: selectedColor,
            room_id: roomId,
            room: roomForMood !== 'Select room' ? roomForMood : 'All Rooms',
            devices: deviceConfig
          };
          setCustomMoods(prev => [...prev, newMood]);
        }
      }
      
      // Reset modal
      resetModalState();
    } catch (error) {
      console.error("Error saving mood:", error);
      Alert.alert("Error", `Failed to ${isEditMode ? 'update' : 'save'} mood profile. Please try again.`);
    }
  };

  // Delete mood profile
  // Modify the deleteMoodProfile function to ensure proper ID handling
const deleteMoodProfile = async (moodId) => {
  // Make sure moodId is treated as a number
  const numericMoodId = Number(moodId);
  
  console.log(`Attempting to delete mood with ID: ${numericMoodId} (original: ${moodId}, type: ${typeof moodId})`);
  
  if (isNaN(numericMoodId)) {
    console.error("Invalid mood ID for deletion:", moodId);
    Alert.alert("Error", "Invalid mood ID. Cannot delete this mood.");
    return;
  }
  
  try {
    console.log(`Making DELETE request to: ${API_URL}/delete_mood_profile/${numericMoodId}`);
    
    // Use the numeric ID explicitly in the URL
    const response = await axios.delete(`${API_URL}/delete_mood_profile/${numericMoodId}`);
    
    console.log("Delete response:", response.data);
    console.log("Delete response status:", response.status);
    
    if (response.status === 200 || (response.data && response.data["Mood Profile Deletion"] === "Successful")) {
      // If successful, update the local state
      if (selectedMood === numericMoodId) {  
        setSelectedMood(null);
      }
      
      setCustomMoods(prevMoods => {
        const filtered = prevMoods.filter(mood => {
          // Convert both to same type for comparison
          return Number(mood.id) !== numericMoodId;
        });
        console.log(`Moods before deletion: ${prevMoods.length}, after: ${filtered.length}`);
        return filtered;
      });
      
      Alert.alert("Success", "Mood profile deleted successfully.");
    } else {
      console.error("Unexpected response:", response);
      Alert.alert("Error", "Failed to delete mood profile. Server returned an unexpected response.");
    }
  } catch (error) {
    console.error("Error deleting mood profile:", error);
    console.error("Error response:", error.response);
    console.error("Error response data:", error.response?.data);
    console.error("Error message:", error.message);
    
    Alert.alert("Error", `Failed to delete mood profile: ${error.message || "Unknown error"}`);
  }
};
  
  // Edit mood profile
  const editMoodProfile = (mood) => {
    setIsEditMode(true);
    setCurrentMoodId(mood.id);
    setMoodName(mood.name);
    setSelectedColor(mood.color);
    
    // Set room for this mood
    if (mood.room_id) {
      const room = rooms.find(r => r.id === mood.room_id);
      if (room) {
        setRoomForMood(room.name);
        setSelectedRoomId(room.id);
        fetchDevices(room.id);
      }
    } else {
      setRoomForMood('Select room');
      setSelectedRoomId(null);
    }
    
    // Set device configuration
    setDeviceConfig(mood.devices || {});
    
    // Open modal
    setIsModalVisible(true);
  };
  
  // Reset modal state
  const resetModalState = () => {
    setIsModalVisible(false);
    setIsEditMode(false);
    setCurrentMoodId(null);
    setMoodName('');
    setRoomForMood('Select room');
    setSelectedRoomId(null);
    setDeviceConfig({});
    setSelectedColor(isDarkMode ? '#6B5B95' : '#8B5CF6');
  };

  // Activate a mood profile
  const activateMood = async (moodId) => {
    if (!moodId) return;
    
    try {
      const response = await axios.post(`${API_URL}/activate_mood/${parseInt(moodId, 10)}`);
      
      if (response.data && response.data["Mood Activation"] === "Successful") {
        // We don't need to show an alert here anymore since activation happens automatically on selection
        console.log("Mood activated successfully");
      } else {
        Alert.alert("Error", "Failed to activate mood. Server returned an unexpected response.");
      }
    } catch (error) {
      console.error("Error activating mood:", error);
      Alert.alert("Error", "Failed to activate mood. Please check your connection and try again.");
    }
  };
  
  // Color options for mood profiles
  const colorOptions = [
    '#8B5CF6', '#4A90E2', '#7D5CD3', '#4DA6C3', '#3DA98F', 
    '#F59E0B', '#EF4444', '#10B981', '#6366F1', '#EC4899'
  ];


  
  
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
              {customMoods.length > 0 ? (
                customMoods.map((mood) => (
                  <TouchableOpacity 
                    key={mood.id}
                    style={[
                      styles.profileCard, 
                      { backgroundColor: mood.color },
                      selectedMood === mood.id && styles.selectedCard
                    ]}
                    onPress={() => handleMoodSelect(mood.id)}
                    
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
                    <View style={styles.moodActionsContainer}>
                      <TouchableOpacity 
                        style={styles.moodActionButton}
                        onPress={() => editMoodProfile(mood)}
                      >
                        <Ionicons name="pencil" size={Platform.OS === 'web' ? 24 : 18} color="#fff" />
                      </TouchableOpacity>
                                      <TouchableOpacity 
                  style={[styles.moodActionButton, { backgroundColor: '#EF4444' }]}
                  onPress={() => {
                    console.log("Delete button pressed for:", mood.id, typeof mood.id);
                    Alert.alert(
                      "Delete Mood",
                      `Are you sure you want to delete "${mood.name}"?`,
                      [
                        { text: "Cancel", style: "cancel" },
                        { 
                          text: "Delete", 
                          style: "destructive", 
                          onPress: () => {
                            console.log("Delete confirmed for mood ID:", mood.id);
                            deleteMoodProfile(mood.id);
                          }
                        }
                      ]
                    );
                  }}
                >
                  <Ionicons name="trash" size={Platform.OS === 'web' ? 24 : 18} color="#fff" />
                </TouchableOpacity>
                                      </View>
                                    </TouchableOpacity>
                ))
              ) : (
                <View style={styles.noMoodsContainer}>
                  <Text style={[styles.noMoodsText, {color: textColor}]}>
                    No mood profiles found. Create your first mood profile!
                  </Text>
                </View>
              )}
            </View>
          )}
          
          <TouchableOpacity 
            style={styles.addNewButton} 
            onPress={() => {
              resetModalState();
              setIsModalVisible(true);
            }}
          >
            <Text style={styles.addNewButtonText}>Add New Mood</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Add/Edit Mood Popup */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => resetModalState()}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
            <Text style={[styles.modalTitle, {color: textColor}]}>
              {isEditMode ? 'Edit Mood Profile' : 'Create New Mood'}
            </Text>
            
            <TextInput
              placeholder="Mood Name"
              placeholderTextColor="#888"
              style={[styles.input, { backgroundColor: isDarkMode ? "#333" : "#eee", color: isDarkMode ? '#fff' : '#000' }]}
              value={moodName}
              onChangeText={setMoodName}
            />

            {/* Color Selection */}
            <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Select Color:</Text>
            <View style={styles.colorOptions}>
              {colorOptions.map((color) => (
                <TouchableOpacity 
                  key={color}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    selectedColor === color && styles.selectedColorOption
                  ]}
                  onPress={() => setSelectedColor(color)}
                />
              ))}
            </View>

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
              <TouchableOpacity style={styles.cancelButton} onPress={resetModalState}>
                <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addButton, !moodName.trim() && styles.disabledButton]} 
                onPress={handleSaveMood}
                disabled={!moodName.trim()}
              >
                <Text style={{ color: '#fff' }}>{isEditMode ? 'Update' : 'Save'}</Text>
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
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'web' ? 50 : 30,
  },
  profileCard: {
    width: Platform.OS === 'web' ? '23%' : '48%',
    borderRadius: Platform.OS === 'web' ? 30 : 20,
    padding: Platform.OS === 'web' ? 25 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'web' ? 25 : 15,
    position: 'relative',
    minHeight: Platform.OS === 'web' ? 250 : 180,
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
    top: Platform.OS === 'web' ? 20 : 10,
    right: Platform.OS === 'web' ? 20 : 10,
    width: Platform.OS === 'web' ? 30 : 20,
    height: Platform.OS === 'web' ? 30 : 20,
    borderRadius: Platform.OS === 'web' ? 15 : 10,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 16 : 12,
  },
  profileImage: {
    width: Platform.OS === 'web' ? 100 : 60,
    height: Platform.OS === 'web' ? 100 : 60,
    borderRadius: Platform.OS === 'web' ? 50 : 30,
    overflow: 'hidden',
    marginBottom: Platform.OS === 'web' ? 20 : 10,
    backgroundColor: '#ccc',
  },
  profileName: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
    color: '#fff',
  },
  roomLabel: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Platform.OS === 'web' ? 40 : 30,
  },
  moodActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 20 : 15,
    width: '100%',
  },
  moodActionButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: Platform.OS === 'web' ? 40 : 30,
    height: Platform.OS === 'web' ? 40 : 30,
    borderRadius: Platform.OS === 'web' ? 20 : 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  addNewButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: Platform.OS === 'web' ? 60 : 40,
    padding: Platform.OS === 'web' ? 30 : 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  addNewButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '600',
  },
  noMoodsContainer: {
    width: '100%',
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noMoodsText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    textAlign: 'center',
    opacity: 0.7,
  },
  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: Platform.OS === 'web' ? '50%' : '90%',
    maxWidth: 600,
    maxHeight: '90%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#F3F4F6',
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
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    margin: 5,
  },
  selectedColorOption: {
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  dropdownButton: {
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  dropdownMenuSmall: {
    backgroundColor: '#F3F4F6',
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
    justifyContent: 'center',
    flex: 1,
    marginRight: 10,
    backgroundColor: '#F3F4F6',
  },
  addButton: {
    backgroundColor: '#8B5CF6',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginLeft: 10,
  },
  disabledButton: {
    backgroundColor: '#A78BFA',
    opacity: 0.7,
  }
});