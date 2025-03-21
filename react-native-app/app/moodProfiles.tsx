import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Modal, TextInput, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import { Colors } from 'react-native/Libraries/NewAppScreen';

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
  const {isDarkMode} = useTheme();

  const backgroundColor = isDarkMode ? "black" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  
  useEffect(() => {
          navigation.setOptions({ headerShown: false });
          }, [navigation]);
  
  const dummyDevices = ['Ceiling Light', 'Desk Lamp', 'Fan', 'Heater', 'Smart Plug'];

  const handleDeviceToggle = (device) => {
    setDeviceConfig(prev => ({
      ...prev,
      [device]: !prev[device]
    }));
  };

  const rooms = [
    'Master Bedroom', 'Living Room', 'Kitchen', 'Bathroom',
    'Guest Room', 'Office', 'Dining Room', 'Kids Room',
    'Garage', 'Basement'
  ];
  
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
  const moods = isDarkMode ? darkMoods : lightMoods;

  const combinedMoods = [...moods, ...customMoods]; // COMBINED DATA

  const handleSaveMood = () => {
    const newMood = {
      id: `${moodName.toLowerCase()}-${Date.now()}`,
      name: moodName,
      color: isDarkMode ? '#6B5B95' : '#C0C0C0', // You could add color picker later
      room: roomForMood,
      devices: deviceConfig
    };
    setCustomMoods(prev => [...prev, newMood]);
    
    // Reset modal
    setIsModalVisible(false);
    setMoodName('');
    setRoomForMood('Select room');
    setDeviceConfig({});
  };
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsDropdownOpen(false);
  };

  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
  };
  
  return (
    <ScrollView style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]} contentContainerStyle={styles.contentContainer}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.greeting, {color: textColor}]}>
              Hey, <Text style={{fontWeight: 'bold'}}>Maria</Text>
              <Text style={styles.waveEmoji}> 👋</Text>
            </Text>
            <Text style={[styles.subTitle, {color: textColor}]}>Mood Profiles</Text>
          </View>
        </View>
        
        <View style={styles.mainContent}>
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
                  {rooms.map((room, index) => (
                    <TouchableOpacity 
                      key={index} 
                      style={[styles.dropdownItem, {backgroundColor: backgroundColor}]}
                      onPress={() => handleRoomSelect(room)}
                    >
                      <Text style={[styles.dropdownItemText, {color: textColor}]}>{room}</Text>
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
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.addNewButton} onPress={() => setIsModalVisible(true)}>
            <Text style={styles.addNewButtonText}>Add New Mood</Text>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Add Mood Popup */}
      <Modal visible={isModalVisible} transparent animationType="slide" onRequestClose={() => setIsModalVisible(false)}>
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
          <TouchableOpacity 
            style={[styles.dropdownButton, { backgroundColor: isDarkMode ? "#333" : "#eee" }]} 
            onPress={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{roomForMood}</Text>
          </TouchableOpacity>
          {isDropdownOpen && (
            <View style={[styles.dropdownMenuSmall, { backgroundColor: isDarkMode ? "#333" : "#eee" }]}>
              {rooms.map((room, index) => (
                <TouchableOpacity key={index} onPress={() => { setRoomForMood(room); setIsDropdownOpen(false); }}>
                  <Text style={{ padding: 10, color: isDarkMode ? '#fff' : '#000' }}>{room}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Devices List */}
          <Text style={[styles.sectionTitle, { color: isDarkMode ? '#fff' : '#000' }]}>Select devices to turn ON:</Text>
          {dummyDevices.map((device, idx) => (
            <View key={idx} style={styles.deviceRow}>
              <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>{device}</Text>
              <Switch 
                value={!!deviceConfig[device]} 
                onValueChange={() => handleDeviceToggle(device)}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}
              />
            </View>
          ))}

          <View style={styles.modalActions}>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setIsModalVisible(false)}>
              <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.addButton} onPress={handleSaveMood}>
              <Text style={{ color: '#fff' }}>Save</Text>
            </TouchableOpacity>
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
    width: Platform.OS === 'web' ? '22%' : '48%',
    borderRadius: Platform.OS === 'web' ? 40 : 30,
    padding: Platform.OS === 'web' ? 40 : 30,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    position: 'relative',
    minHeight: Platform.OS === 'web' ? 300 : 'auto',
    marginBottom: 10
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
  addNewButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: Platform.OS === 'web' ? 60 : 50,
    paddingVertical: Platform.OS === 'web' ? 25 : 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 600 : 400,
    alignSelf: 'center',
  },
  addNewButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '500',
  },
  modalContent: {
    borderRadius: 20,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 15,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#8B5CF6',
  },
  input: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  dropdownButton: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  dropdownMenuSmall: {
    borderRadius: 10,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 10,
  },
  deviceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  cancelButton: { padding: 10 },
  addButton: { backgroundColor: '#8B5CF6', padding: 10, borderRadius: 8 }
});