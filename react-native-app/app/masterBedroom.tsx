import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function MasterBedroomScreen() {
  const router = useRouter();
  const [roomActive, setRoomActive] = useState(true);
  const [devices, setDevices] = useState([
    { id: 'curtain', name: 'Smart Curtain', icon: 'grid-outline', active: false },
    { id: 'ac', name: 'Air Conditioner', icon: 'snow-outline', active: true },
    { id: 'light1', name: 'Light', icon: 'bulb-outline', active: false },
    { id: 'purifier', name: 'Air Purifier', icon: 'leaf-outline', active: true },
    { id: 'light2', name: 'Light', icon: 'bulb-outline', active: false },
    { id: 'tv', name: 'TV', icon: 'tv-outline', active: false }
  ]);
  
  const toggleDevice = (deviceId) => {
    setDevices(devices.map(device => 
      device.id === deviceId 
        ? { ...device, active: !device.active } 
        : device
    ));
  };
  
  const toggleRoom = () => {
    const newRoomState = !roomActive;
    setRoomActive(newRoomState);
    setDevices(devices.map(device => ({
      ...device,
      active: newRoomState ? (device.id === 'ac' || device.id === 'purifier') : false
    })));
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
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
        
        <View style={styles.mainContent}>
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
                  <Ionicons name={device.icon} size={Platform.OS === 'web' ? 32 : 24} color="#3B82F6" />
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
  contentWrapper: {
    padding: Platform.OS === 'web' ? '2% 10%' : 20,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginTop: Platform.OS === 'web' ? 40 : 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'web' ? 30 : 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 32,
    fontWeight: '600',
    marginLeft: 15,
  },
  deviceCount: {
    fontSize: Platform.OS === 'web' ? 20 : 16,
    color: '#6B7280',
    marginTop: 5,
    marginLeft: 15,
  },
  toggleSwitch: {
    width: Platform.OS === 'web' ? 80 : 60,
    height: Platform.OS === 'web' ? 40 : 30,
    backgroundColor: '#E5E7EB',
    borderRadius: Platform.OS === 'web' ? 20 : 15,
    position: 'relative',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#3B82F6',
  },
  toggleSwitchCircle: {
    width: Platform.OS === 'web' ? 36 : 26,
    height: Platform.OS === 'web' ? 36 : 26,
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 18 : 13,
    position: 'absolute',
    left: 2,
  },
  toggleSwitchCircleActive: {
    left: 'auto',
    right: 2,
  },
  mainContent: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    gap: Platform.OS === 'web' ? 40 : 20,
    marginTop: Platform.OS === 'web' ? 40 : 20,
  },
  energySavingCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: Platform.OS === 'web' ? 30 : 20,
    padding: Platform.OS === 'web' ? 50 : 20,
    flex: Platform.OS === 'web' ? 1 : undefined,
    position: 'relative',
    overflow: 'hidden',
    minHeight: Platform.OS === 'web' ? 400 : 'auto',
  },
  cardHeader: {
    marginBottom: Platform.OS === 'web' ? 30 : 10,
  },
  cardTitle: {
    fontSize: Platform.OS === 'web' ? 36 : 24,
    fontWeight: '600',
    color: 'white',
  },
  cardDate: {
    fontSize: Platform.OS === 'web' ? 18 : 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  percentage: {
    fontSize: Platform.OS === 'web' ? 120 : 72,
    fontWeight: '700',
    color: 'white',
    marginVertical: Platform.OS === 'web' ? 40 : 10,
  },
  viewDetailsButton: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 25 : 20,
    paddingVertical: Platform.OS === 'web' ? 15 : 10,
    paddingHorizontal: Platform.OS === 'web' ? 30 : 20,
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 50 : 20,
    right: Platform.OS === 'web' ? 50 : 20,
    zIndex: 2,
  },
  viewDetailsButtonText: {
    color: '#1F2937',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '500',
  },
  boltIcons: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 50 : 20,
    right: Platform.OS === 'web' ? 50 : 20,
    gap: 10,
    zIndex: 1,
  },
  devicesGrid: {
    flex: Platform.OS === 'web' ? 2 : undefined,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 30 : 15,
  },
  deviceCard: {
    width: Platform.OS === 'web' ? 'calc(33.33% - 20px)' : '48%',
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 25 : 15,
    padding: Platform.OS === 'web' ? 30 : 20,
    minHeight: Platform.OS === 'web' ? 200 : 'auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  deviceIconContainer: {
    width: Platform.OS === 'web' ? 80 : 60,
    height: Platform.OS === 'web' ? 80 : 60,
    borderRadius: Platform.OS === 'web' ? 40 : 30,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'web' ? 20 : 15,
  },
  deviceName: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '500',
    marginBottom: Platform.OS === 'web' ? 20 : 15,
  },
  deviceControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
  },
  deviceToggle: {
    width: Platform.OS === 'web' ? 60 : 50,
    height: Platform.OS === 'web' ? 30 : 24,
    backgroundColor: '#E5E7EB',
    borderRadius: Platform.OS === 'web' ? 15 : 12,
    position: 'relative',
    justifyContent: 'center',
    padding: 2,
  },
  deviceToggleActive: {
    backgroundColor: '#3B82F6',
  },
  deviceToggleCircle: {
    width: Platform.OS === 'web' ? 26 : 20,
    height: Platform.OS === 'web' ? 26 : 20,
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 13 : 10,
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
    borderRadius: Platform.OS === 'web' ? 20 : 15,
    paddingVertical: Platform.OS === 'web' ? 10 : 5,
    paddingHorizontal: Platform.OS === 'web' ? 25 : 15,
  },
  moreButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 16 : 14,
  },
});