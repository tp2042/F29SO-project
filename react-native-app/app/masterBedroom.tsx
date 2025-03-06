import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MasterBedroomScreen() {
  const router = useRouter();
  
  // State for main room toggle
  const [roomActive, setRoomActive] = useState(true);
  
  // State for individual device toggles
  const [devices, setDevices] = useState([
    { id: 'curtain', name: 'Smart Curtain', icon: 'grid-outline', active: false },
    { id: 'ac', name: 'Air Conditioner', icon: 'snow-outline', active: true },
    { id: 'light1', name: 'Light', icon: 'bulb-outline', active: false },
    { id: 'purifier', name: 'Air Purifier', icon: 'leaf-outline', active: true },
    { id: 'light2', name: 'Light', icon: 'bulb-outline', active: false },
    { id: 'tv', name: 'TV', icon: 'tv-outline', active: false }
  ]);
  
  // Toggle individual device
  const toggleDevice = (deviceId) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, active: !device.active } 
        : device
    ));
  };
  
  // Toggle all devices in the room
  const toggleRoom = () => {
    const newRoomState = !roomActive;
    setRoomActive(newRoomState);
    
    // If turning room on/off, set all devices to the same state
    if (newRoomState) {
      // When turning room on, restore previous device states
      // For simplicity, we'll just turn on a few devices
      setDevices(devices.map(device => 
        device.id === 'ac' || device.id === 'purifier'
          ? { ...device, active: true }
          : device
      ));
    } else {
      // When turning room off, turn off all devices
      setDevices(devices.map(device => ({ ...device, active: false })));
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={30} color="#000" />
          </TouchableOpacity>
          <View>
            <Text style={styles.title}>Master Bedroom</Text>
            <Text style={styles.deviceCount}>10 Devices</Text>
          </View>
        </View>
        <TouchableOpacity 
          style={[styles.toggleSwitch, roomActive ? styles.toggleSwitchActive : {}]} 
          onPress={toggleRoom}
        >
          <View style={[styles.toggleSwitchCircle, roomActive ? styles.toggleSwitchCircleActive : {}]} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.energySavingCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Energy Saving</Text>
          <Text style={styles.cardDate}>November 7, 2024</Text>
        </View>
        
        <Text style={styles.percentage}>45%</Text>
        
        <TouchableOpacity style={styles.viewDetailsButton}>
          <Text style={styles.viewDetailsButtonText}>View Details</Text>
        </TouchableOpacity>
        
        <View style={styles.boltIcons}>
          <Ionicons name="flash" size={32} color="#FBBF24" />
          <Ionicons name="flash" size={24} color="#FBBF24" style={{ transform: [{ rotate: '20deg' }] }} />
          <Ionicons name="flash" size={32} color="#FBBF24" />
          <Ionicons name="flash" size={24} color="#FBBF24" style={{ transform: [{ rotate: '20deg' }] }} />
        </View>
      </View>
      
      <View style={styles.devicesGrid}>
        {devices.map((device) => (
          <View key={device.id} style={styles.deviceCard}>
            <View style={styles.deviceIconContainer}>
              <Ionicons name={device.icon} size={24} color="#3B82F6" />
            </View>
            <Text style={styles.deviceName}>
              {device.name}
            </Text>
            <View style={styles.deviceControls}>
              <TouchableOpacity 
                style={[styles.deviceToggle, device.active ? styles.deviceToggleActive : {}]} 
                onPress={() => toggleDevice(device.id)}
              >
                <View style={[styles.deviceToggleCircle, device.active ? styles.deviceToggleCircleActive : {}]} />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.moreButton}
                onPress={() => {
                  if (device.id === 'ac') {
                    router.push('/airConditioning');
                  }
                }}
              >
                <Text style={styles.moreButtonText}>more</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginLeft: 15,
  },
  deviceCount: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 5,
    marginLeft: 15,
  },
  toggleSwitch: {
    width: 60,
    height: 30,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    position: 'relative',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#3B82F6',
  },
  toggleSwitchCircle: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 13,
    position: 'absolute',
    left: 2,
  },
  toggleSwitchCircleActive: {
    left: 'auto',
    right: 2,
  },
  energySavingCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  cardHeader: {
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
  },
  cardDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  percentage: {
    fontSize: 72,
    fontWeight: '700',
    color: 'white',
    marginVertical: 10,
  },
  viewDetailsButton: {
    backgroundColor: 'white',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    position: 'absolute',
    bottom: 20,
    right: 20,
    zIndex: 2,
  },
  viewDetailsButtonText: {
    color: '#1F2937',
    fontSize: 16,
    fontWeight: '500',
  },
  boltIcons: {
    position: 'absolute',
    top: 20,
    right: 20,
    gap: 10,
    zIndex: 1,
  },
  devicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  deviceCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  deviceIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  deviceName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 15,
  },
  deviceControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  deviceToggle: {
    width: 50,
    height: 24,
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    position: 'relative',
    justifyContent: 'center',
    padding: 2,
  },
  deviceToggleActive: {
    backgroundColor: '#3B82F6',
  },
  deviceToggleCircle: {
    width: 20,
    height: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    position: 'absolute',
    left: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  deviceToggleCircleActive: {
    left: 'auto',
    right: 2,
  },
  moreButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 15,
    paddingVertical: 5,
    paddingHorizontal: 15,
  },
  moreButtonText: {
    color: 'white',
    fontSize: 14,
  },
});