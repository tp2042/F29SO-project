import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MoodProfilesScreen() {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('Select room');
  const [selectedMood, setSelectedMood] = useState(null);
  
  const rooms = [
    'Master Bedroom', 'Living Room', 'Kitchen', 'Bathroom',
    'Guest Room', 'Office', 'Dining Room', 'Kids Room',
    'Garage', 'Basement'
  ];
  
  const moods = [
    { id: 'work', name: 'Work', color: '#B6C1E2' },
    { id: 'party', name: 'Party', color: '#E5C1C5' },
    { id: 'relaxed', name: 'Relaxed', color: '#C5CEB5' },
    { id: 'sleep', name: 'Sleep', color: '#E5D0B1' }
  ];
  
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setIsDropdownOpen(false);
  };
  
  const handleMoodSelect = (moodId) => {
    setSelectedMood(moodId === selectedMood ? null : moodId);
  };
  
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
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
        </View>
        
        <View style={styles.mainContent}>
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
                <ScrollView style={styles.dropdownScroll}>
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
      </View>
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
    fontWeight: '600',
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
  addNewButton: {
    backgroundColor: '#3B82F6',
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
});