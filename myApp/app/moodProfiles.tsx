import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MoodProfilesScreen() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('Select room');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  // List of rooms
  const rooms = [
    'Master Bedroom',
    'Living Room',
    'Kitchen',
    'Bathroom',
    'Guest Room',
    'Office',
    'Dining Room',
    'Kids Room',
    'Garage',
    'Basement'
  ];
  
  // List of moods with their colors
  const moods = [
    { id: 'work', name: 'Work', color: '#B6C1E2' },
    { id: 'party', name: 'Party', color: '#E5C1C5' },
    { id: 'relaxed', name: 'Relaxed', color: '#C5CEB5' },
    { id: 'sleep', name: 'Sleep', color: '#E5D0B1' }
  ];
  
  const handleRoomSelect = (room: string) => {
    setSelectedRoom(room);
    setIsDropdownOpen(false);
  };
  
  const handleMoodSelect = (moodId: string) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>
          Hey, Maria
          <Text style={styles.waveEmoji}> 👋</Text>
        </Text>
        <Text style={styles.subTitle}>Mood Profiles</Text>
      </View>
      
      <View style={styles.profilePic}>
        <Image 
          source={{ uri: "https://randomuser.me/api/portraits/women/44.jpg" }} 
          style={styles.profileImg} 
        />
      </View>
      
      <View style={styles.roomSelectorWrapper}>
        <TouchableOpacity 
          style={styles.roomSelector} 
          onPress={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Text style={styles.roomText}>{selectedRoom}</Text>
          <Text style={[styles.chevronDown, isDropdownOpen && styles.chevronUp]}>▼</Text>
        </TouchableOpacity>
        
        {isDropdownOpen && (
          <View style={styles.dropdownMenu}>
            <ScrollView>
              {rooms.map((room, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={styles.dropdownItem}
                  onPress={() => handleRoomSelect(room)}
                >
                  <Text style={styles.dropdownItemText}>{room}</Text>
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
        {moods.map((mood) => (
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
      
      <TouchableOpacity style={styles.addNewButton}>
        <Text style={styles.addNewButtonText}>Add New</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 40,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '600',
    marginBottom: 5,
  },
  waveEmoji: {
    marginLeft: 10,
  },
  subTitle: {
    fontSize: 28,
    color: '#6B7280',
    fontWeight: '500',
    marginBottom: 20,
  },
  profilePic: {
    position: 'absolute',
    top: 40,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E5E7EB',
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#D1D5DB',
  },
  profileImg: {
    width: '100%',
    height: '100%',
  },
  roomSelectorWrapper: {
    position: 'relative',
    marginBottom: 30,
    zIndex: 10,
  },
  roomSelector: {
    backgroundColor: 'white',
    borderRadius: 50,
    padding: 20,
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
    fontSize: 24,
    fontWeight: '500',
  },
  chevronDown: {
    fontSize: 24,
  },
  chevronUp: {
    transform: [{ rotate: '180deg' }],
  },
  dropdownMenu: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    maxHeight: 300,
    zIndex: 20,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: 18,
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
    marginBottom: 30,
  },
  profileCard: {
    width: '48%',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    marginBottom: 15,
    position: 'relative',
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
    top: 15,
    right: 15,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicatorText: {
    color: 'white',
    fontSize: 14,
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 15,
    backgroundColor: '#ccc',
  },
  profileName: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
  },
  addNewButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 50,
    paddingVertical: 15,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  addNewButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: '500',
  },
});