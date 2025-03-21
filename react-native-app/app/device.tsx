import React, { useState } from 'react';
import { View, Text, Switch, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type IconName = 'bed' | 'snow' | 'bulb' | 'leaf' | 'tv';

const initialDevices: { id: number; name: string; icon: IconName; isOn: boolean }[] = [
  { id: 1, name: 'Smart Curtain', icon: 'bed', isOn: false },
  { id: 2, name: 'Air Conditioner', icon: 'snow', isOn: false },
  { id: 3, name: 'Light', icon: 'bulb', isOn: false },
  { id: 4, name: 'Air Purifier', icon: 'leaf', isOn: false },
  { id: 5, name: 'Light', icon: 'bulb', isOn: false },
  { id: 6, name: 'TV', icon: 'tv', isOn: false },
];

export default function DeviceScreen() {
  const router = useRouter();
  const [deviceStates, setDeviceStates] = useState(initialDevices);
  const [globalSwitch, setGlobalSwitch] = useState(false);

  const toggleSwitch = (id: number) => {
    setDeviceStates((prevDevices) =>
      prevDevices.map((device) =>
        device.id === id ? { ...device, isOn: !device.isOn } : device
      )
    );
  };

  const toggleGlobalSwitch = (value : boolean) =>{
    setGlobalSwitch(value);
    setDeviceStates((prevDevices) =>
      prevDevices.map((device) => ({ ...device, isOn: value }))
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={30} />
        </TouchableOpacity>
        <Text style={styles.title}>Master Bedroom</Text>
        <Switch value={globalSwitch} onValueChange={toggleGlobalSwitch} />
      </View>

      <View style={styles.energyCard}>
        <Text style={styles.energyTitle}>Energy Saving</Text>
        <Text style={styles.energyDate}>February 24, 2025</Text>
        <Text style={styles.energyPercent}>45%</Text>
        <TouchableOpacity style={styles.detailsButton}>
          <Text>View Details</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.deviceGrid}>
        {deviceStates.map((device) => (
          <View
          style={[
            styles.device,
            { backgroundColor: device.isOn ? '#E0E0E0' : '#FFF' },
          ]}
        >
            <Ionicons name={device.icon} size={40} color={device.isOn ? '#6A5AE0' : '#bbb'} />
            <Text>{device.name}</Text>
            <Switch value={device.isOn} onValueChange={() => toggleSwitch(device.id)} />
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eeeeee', padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  energyCard: { backgroundColor: '#6A5AE0', borderRadius: 15, padding: 20, alignItems: 'center', marginBottom: 20 },
  energyTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold',}, 
  energyDate: { color: '#FFF', fontSize: 14, marginBottom: 10 },
  energyPercent: { fontSize: 48, color: '#FFF', fontWeight: 'bold' },
  detailsButton: { backgroundColor: '#FFF', padding: 10, borderRadius: 10, marginTop: 10 },
  deviceGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  device: { width: 150, alignItems: 'center', margin: 10, padding: 10, borderRadius: 10 },
});
