import { useFocusEffect, useRoute } from '@react-navigation/native';
import { useState, useEffect, useCallback } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView,  StyleSheet, Modal, TextInput, ActivityIndicator, FlatList, Platform } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import Constants from "expo-constants";

// Database of compatible devices
const compatibleDevices = [
 { id: 'smart-bulb-1', name: 'Smart Bulb - Philips Hue', type: 'light', manufacturer: 'Philips' },
 { id: 'smart-bulb-2', name: 'Smart Bulb - LIFX', type: 'light', manufacturer: 'LIFX' },
 { id: 'smart-bulb-3', name: 'Smart Bulb - TP-Link Kasa', type: 'light', manufacturer: 'TP-Link' },
 { id: 'smart-plug-1', name: 'Smart Plug - Amazon', type: 'power', manufacturer: 'Amazon' },
 { id: 'smart-plug-2', name: 'Smart Plug - Wemo', type: 'power', manufacturer: 'Belkin' },
 { id: 'smart-plug-3', name: 'Smart Plug - TP-Link', type: 'power', manufacturer: 'TP-Link' },
 { id: 'thermostat-1', name: 'Smart Thermostat - Nest', type: 'climate', manufacturer: 'Google' },
 { id: 'thermostat-2', name: 'Smart Thermostat - Ecobee', type: 'climate', manufacturer: 'Ecobee' },
 { id: 'sensor-1', name: 'Motion Sensor - Philips Hue', type: 'security', manufacturer: 'Philips' },
 { id: 'sensor-2', name: 'Door Sensor - Samsung', type: 'security', manufacturer: 'Samsung' },
 { id: 'lock-1', name: 'Smart Lock - August', type: 'security', manufacturer: 'August' },
 { id: 'lock-2', name: 'Smart Lock - Yale', type: 'security', manufacturer: 'Yale' },
 { id: 'camera-1', name: 'Security Camera - Ring', type: 'security', manufacturer: 'Amazon' },
 { id: 'blinds-1', name: 'Smart Blinds - IKEA', type: 'other', manufacturer: 'IKEA' },
 { id: 'speaker-1', name: 'Smart Speaker - Sonos', type: 'entertainment', manufacturer: 'Sonos' },
 { id: 'speaker-2', name: 'Smart Speaker - Amazon Echo', type: 'entertainment', manufacturer: 'Amazon' },
 { id: 'tv-1', name: 'Smart TV - Samsung', type: 'entertainment', manufacturer: 'Samsung' },
 { id: 'vacuum-1', name: 'Robot Vacuum - Roomba', type: 'appliance', manufacturer: 'iRobot' },
 { id: 'humidifier-1', name: 'Smart Humidifier - Dyson', type: 'climate', manufacturer: 'Dyson' },
 { id: 'fan-1', name: 'Smart Fan - Dyson', type: 'climate', manufacturer: 'Dyson' }
];
export default function RoomsDetails() {
    const route = useRoute();
    const [scanning, setScanning] = useState(false);
    const { roomName, roomId } = route.params;
    const [deviceEnergyData, setDeviceEnergyData] = useState([]);
    const [totalEnergyUsage, setTotalEnergyUsage] = useState(0);
    const [isRefreshingEnergy, setIsRefreshingEnergy] = useState(false);
    const navigation = useNavigation();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isScanningModal, setIsScanningModal] = useState(false);
    const [isManualAddModal, setIsManualAddModal] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');
    const [newDeviceType, setNewDeviceType] = useState('');
    const [scanningProgress, setScanningProgress] = useState(0);
    const [discoveredDevices, setDiscoveredDevices] = useState([]);
    const [selectedDeviceId, setSelectedDeviceId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [householdId, setHouseholdId] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [filteredDevices, setFilteredDevices] = useState([]);
    const [addDeviceMethod, setAddDeviceMethod] = useState(null); // 'scan' or 'manual' or 'catalog'
    const REFRESH_INTERVAL = 30000;
    const { isDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const API_URL = "https://backend-1-y12u.onrender.com";
    const [devices, setDevices] = useState([]);
    const [allDevicesOn, setAllDevicesOn] = useState(false); // Added missing state definition
    
    
    
    // Fetch household ID and load devices
    useEffect(() => {
        const getHouseholdId = async () => {
            try {
                if (!roomId) {
                    setErrorMessage("No room ID provided.");
                    setIsLoading(false);
                    return;
                }
            
                const id = await AsyncStorage.getItem('householdId');
                if (id) {
                    setHouseholdId(id);
                    fetchDevices(id, roomId);
                } else {
                    setIsLoading(false);
                    setErrorMessage("No household ID found. Please log in again.");
                }
            } catch (error) {
                console.error("Error retrieving household ID:", error);
                setIsLoading(false);
                setErrorMessage("Failed to retrieve household data.");
            }
        };
        getHouseholdId();
    }, [roomId]);

    // Check and update allDevicesOn state whenever devices change
    useEffect(() => {
        const areAllDevicesOn = devices.length > 0 && devices.every(device => device.isOn);
        setAllDevicesOn(areAllDevicesOn);
      }, [devices]);
    
      // Filter compatible devices when search text changes
      useEffect(() => {
        if (searchText) {
          const filtered = compatibleDevices.filter(device =>
            device.name.toLowerCase().includes(searchText.toLowerCase()) ||
            device.manufacturer.toLowerCase().includes(searchText.toLowerCase()) ||
            device.type.toLowerCase().includes(searchText.toLowerCase())
          );
          setFilteredDevices(filtered);
        } else {
          setFilteredDevices(compatibleDevices);
        }
      }, [searchText]);
    
      // Fetch devices when household and room IDs are available
      useEffect(() => {
        if (householdId && roomId) {
          fetchDevices(householdId, roomId);
        }
      }, [householdId, roomId]);
    
      // Set up energy data fetching when devices change
      useEffect(() => {
        // Only proceed if we have devices and at least one is active
        if (devices.length === 0 || !devices.some(d => d.isOn)) {
          setTotalEnergyUsage(0);
          setDeviceEnergyData([]);
          return;
        }
    
        const fetchAllDeviceEnergy = async () => {
          setIsRefreshingEnergy(true);
          try {
            // Get active devices
            const activeDevices = devices.filter(d => d.isOn);
            
            // Create promises for fetching energy data for each active device
            const energyPromises = activeDevices.map(device =>
              fetchDeviceEnergyData(device.id)
            );
            
            // Wait for all promises to resolve
            const energyResults = await Promise.all(energyPromises);
            
            // Update state with the fetched data
            setDeviceEnergyData(energyResults);
            
            // Calculate total energy usage
            const total = energyResults.reduce((sum, data) => sum + data.energy_consumed, 0);
            setTotalEnergyUsage(Math.round(total * 10) / 10); // Round to 1 decimal place
          } catch (error) {
            console.error("Error updating energy data:", error);
            // Fall back to estimated calculation
            const estimated = calculateEnergyUsage();
            setTotalEnergyUsage(estimated);
          } finally {
            setIsRefreshingEnergy(false);
          }
        };
    
        // Fetch immediately on component mount or when devices change
        fetchAllDeviceEnergy();
        
        // Set up interval for periodic updates
        const energyInterval = setInterval(fetchAllDeviceEnergy, REFRESH_INTERVAL);
        
        // Clean up interval on unmount or when devices change
        return () => clearInterval(energyInterval);
      }, [devices]);
    
      // Fetch devices for the specified household and room
      const fetchDevices = async (householdId, roomId) => {
        setIsLoading(true);
        setErrorMessage('');
        
        try {
          console.log(`Fetching devices for room ${roomId} in household ${householdId}`);
          
          const url = `${API_URL}/devices?roomId=${roomId}&householdId=${householdId}`;
          console.log(`API URL: ${url}`);
          
          const response = await axios.get(url);
          console.log("API Response:", response.data);
          
          if (response.data && Array.isArray(response.data)) {
            // Transform data to match our component's expected format
            const formattedDevices = response.data.map(device => ({
              id: device.device_id,
              name: device.device_name,
              isOn: device.is_active || false,
              type: device.device_type,
              category: inferDeviceCategory(device.device_type, device.device_id)
            }));
            
            console.log("Formatted devices:", formattedDevices);
            setDevices(formattedDevices);
          } else {
            console.error("Invalid response format:", response.data);
            setErrorMessage("Invalid response from server. Using demo devices.");
            
          }
        } catch (error) {
          console.error("Error fetching devices:", error);
          console.error("Error details:", error.response || error.message);
         
          setErrorMessage("Could not find any devices. Add one!");
        } finally {
          setIsLoading(false);
        }
      };
      
      // Helper function to set demo devices
      
    
      // Fetch energy data for a single device
    const fetchDeviceEnergyData = async (deviceId) => {
          console.log('dev', deviceId)
        try {
          const response = await axios.get(`${API_URL}/device_energy/${deviceId}`, {
            timeout: 50000 // Add timeout to prevent hanging requests
          });
          
          // Return the first item if it's an array, or the entire response if it's not
          return Array.isArray(response.data) ? response.data[0] : response.data;
        } catch (error) {
          console.error(`Error fetching energy data for device ${deviceId}:`, error);
          
          // Find the device to get its name
          const device = devices.find(d => d.id === deviceId);
          const deviceName = device ? device.name : `Device ${deviceId}`;
          
          // Return a fallback object with estimated energy
          return {
            device_id: deviceId,
            device_name: deviceName,
            energy_consumed: calculateEstimatedEnergy(deviceId),
            recorded_at: new Date().toISOString()
          };
        }
      };
    
      // Calculate estimated energy usage for a device
      const calculateEstimatedEnergy = (deviceId) => {
        const device = devices.find(d => d.id === deviceId);
        if (!device || !device.isOn) return 0;
        
        // Use the device's category if available
        const deviceCategory = device.category || inferDeviceCategory(device.type, deviceId);
        
        // Estimate based on device category
        switch (deviceCategory) {
          case 'light': return Math.random() * (15 - 5) + 5; // 5-15W
          case 'climate': return Math.random() * (1500 - 500) + 500; // 500-1500W
          case 'entertainment': return Math.random() * (200 - 50) + 50; // 50-200W
          case 'power': return Math.random() * (50 - 10) + 10; // 10-50W
          case 'security': return Math.random() * (10 - 1) + 1; // 1-10W
          default: return Math.random() * (20 - 5) + 5; // 5-20W
        }
      };
    
      // Helper function to infer device category
      const inferDeviceCategory = (deviceType, deviceId) => {
        // First try to infer from device type
        if (deviceType) {
          if (deviceType.includes('light')) return 'light';
          if (deviceType.includes('heat') || deviceType.includes('ac') ||
              deviceType.includes('air') || deviceType.includes('therm')) return 'climate';
          if (deviceType.includes('tv') || deviceType.includes('speaker') ||
              deviceType.includes('media')) return 'entertainment';
          if (deviceType.includes('plug') || deviceType.includes('outlet') ||
              deviceType.includes('power')) return 'power';
          if (deviceType.includes('camera') || deviceType.includes('sensor') ||
              deviceType.includes('alarm')) return 'security';
        }
    
        // Fall back to hash-based assignment if type doesn't match any category
        const id = parseInt(deviceId) || deviceId.toString().charCodeAt(0);
        const categories = ['light', 'climate', 'entertainment', 'power', 'security'];
        return categories[id % categories.length];
      };
      
    
      // Calculate total energy usage from all active devices
      const calculateEnergyUsage = () => {
        // Early return if no active devices
        const activeDevices = devices.filter(d => d.isOn);
        if (activeDevices.length === 0) return 0;
        
        let totalEnergy = 0;
        
        // Use device energy data if available
        if (deviceEnergyData.length > 0) {
          activeDevices.forEach(device => {
            const energyInfo = deviceEnergyData.find(d => d.device_id === device.id);
            if (energyInfo) {
              totalEnergy += parseFloat(energyInfo.energy_consumed);
            } else {
              totalEnergy += calculateEstimatedEnergy(device.id);
            }
          });
        } else {
          // Fall back to estimates
          activeDevices.forEach(device => {
            totalEnergy += calculateEstimatedEnergy(device.id);
          });
        }
        
        return Math.round(totalEnergy * 10) / 10; // Round to 1 decimal place
      };
    
      // Toggle all devices on or off
      const toggleAllDevices = () => {
        const newState = !allDevicesOn;
        const updatedDevices = devices.map(device => ({
          ...device,
          isOn: newState
        }));
        setDevices(updatedDevices);
        
        // Update device statuses on the server
        updatedDevices.forEach(device => {
          axios.put(`${API_URL}/update_device/${device.id}`, {
            is_active: newState
          }).catch(error => {
            console.error(`Error updating device ${device.id}:`, error);
          });
        });
      };
    
      // Toggle a single device on or off
      const toggleDevice = async (id, event) => {
        if (event) {
          event.preventDefault();
        }
        
        const deviceIndex = devices.findIndex(device => device.id === id);
        if (deviceIndex === -1) return;
        
        const updatedDevices = [...devices];
        updatedDevices[deviceIndex].isOn = !updatedDevices[deviceIndex].isOn;
        
        setDevices(updatedDevices);
        
        try {
          await axios.put(`${API_URL}/update_device/${id}`, {
            is_active: updatedDevices[deviceIndex].isOn
          });
        } catch (error) {
          console.error(`Error updating device ${id}:`, error);
          
          // Revert the change if the API call fails
          setDevices(devices);
          setErrorMessage("Failed to update device status. Please try again.");
        }
      };
    
      // Navigate to device details
      const navigateToDeviceDetails = (device) => {
        // Find energy data for this device
        const energyData = deviceEnergyData.find(d => d.device_id === device.id);
        const energyValue = device.isOn ?
          (energyData ? energyData.energy_consumed : calculateEstimatedEnergy(device.id)) : 0;
    
        navigation.navigate('DeviceDetails', {
          deviceId: device.id,
          deviceName: device.name,
          roomName: roomName,
          isOn: device.isOn,
          energyUsage: energyValue,
          unit: 'W',
          deviceType: device.type,
          averageTemp: device.type === 'climate' ? 22 : undefined,
          lightLevel: device.type === 'light' ? 75 : undefined,
        });
      };
    
      // Show add device method selection
      const showAddDeviceOptions = () => {
        setAddDeviceMethod(null);
        setIsModalVisible(true);
      };
    
      // Use API to discover Bluetooth devices
      const startDeviceScanning = async () => {
        setIsModalVisible(false);
        setIsScanningModal(true);
        setScanningProgress(0);
        setDiscoveredDevices([]);
        setScanning(true);
        
        try {
          // Start a progress indicator
          const progressInterval = setInterval(() => {
            setScanningProgress(prev => {
              const newProgress = prev + 10;
              return newProgress > 90 ? 90 : newProgress; // Cap at 90% until API responds
            });
          }, 500);
          
          // Make the API call to discover devices
          const response = await axios.get(`${API_URL}/discover_devices`);
          
          clearInterval(progressInterval);
          setScanningProgress(100);
          setScanning(false);
          
          if (response.data && Array.isArray(response.data)) {
            setDiscoveredDevices(response.data.map(device => ({
              id: device.device_id,
              name: device.device_name,
              type: device.device_type
            })));
          }
        } catch (error) {
          console.error("Error discovering devices:", error);
          setScanningProgress(100);
          setScanning(false);
          
          // For demo purposes, still show some devices if API fails
          setDiscoveredDevices([
            { id: 'bt1', name: 'Smart Bulb XC-100', type: 'light' },
            { id: 'bt2', name: 'Thermostat T-200', type: 'climate' },
            { id: 'bt3', name: 'Smart Plug PS-30', type: 'power' },
            { id: 'bt4', name: 'Motion Sensor MS-10', type: 'security' },
            { id: 'bt5', name: 'Smart Lock SL-500', type: 'security' },
            { id: 'bt6', name: 'Air Quality Monitor AQ-200', type: 'climate' }
          ]);
        }
      };
    
      // Open manual add device modal
      const openManualAddDevice = () => {
        setIsModalVisible(false);
        setNewDeviceName('');
        setNewDeviceType('light');
        setIsManualAddModal(true);
      };
    
      // Open device catalog
      const openDeviceCatalog = () => {
        setIsModalVisible(false);
        setSearchText('');
        setFilteredDevices(compatibleDevices);
        setSelectedDeviceId(null);
        setAddDeviceMethod('catalog');
      };
    
      // Select a discovered device
      const selectDevice = (deviceId) => {
        setSelectedDeviceId(deviceId);
        
        // Get the selected device name and type
        let selectedDevice;
        
        if (addDeviceMethod === 'scan') {
          selectedDevice = discoveredDevices.find(d => d.id === deviceId);
        } else if (addDeviceMethod === 'catalog') {
          selectedDevice = compatibleDevices.find(d => d.id === deviceId);
        }
        
        if (selectedDevice) {
          setNewDeviceName(selectedDevice.name);
          setNewDeviceType(selectedDevice.type);
        }
      };
    
      // Add a device after scanning or selecting from catalog
      const confirmDeviceSelection = () => {
        if (selectedDeviceId) {
          if (addDeviceMethod === 'scan') {
            setIsScanningModal(false);
            // Prefill the device name modal with the selected device name
            const selectedDevice = discoveredDevices.find(d => d.id === selectedDeviceId);
            setNewDeviceName(selectedDevice ? selectedDevice.name : '');
            setNewDeviceType(selectedDevice ? selectedDevice.type : 'light');
            setTimeout(() => {
              setIsManualAddModal(true);
            }, 300);
          } else if (addDeviceMethod === 'catalog') {
            // Prefill the device name modal with the selected device name
            const selectedDevice = compatibleDevices.find(d => d.id === selectedDeviceId);
            setNewDeviceName(selectedDevice ? selectedDevice.name : '');
            setNewDeviceType(selectedDevice ? selectedDevice.type : 'light');
            setAddDeviceMethod(null);
            setIsManualAddModal(true);
          }
        }
      };
    
      // Check if device already exists
      const deviceExists = (deviceName) => {
        return devices.some(device =>
          device.name.toLowerCase() === deviceName.toLowerCase()
        );
      };
    
      // Add a new device
      const handleAddDevice = async () => {
        if (!householdId || !roomId) {
          setErrorMessage("Missing household or room information.");
          return;
        }
    
        const deviceName = newDeviceName.trim() !== '' ? newDeviceName : `New Device ${devices.length + 1}`;
        
        // Check if device already exists
        if (deviceExists(deviceName)) {
          setErrorMessage("A device with this name already exists.");
          return;
        }
        
        const deviceId = Math.floor(Date.now() / 1000);
        const deviceType = newDeviceType || "other";
        
        try {
          const response = await axios.post(`${API_URL}/add_device`, {
            device_id: deviceId,
            room_id: roomId,
            household_id: householdId,
            device_name: deviceName,
            device_type: deviceType,
            is_active: false
          });
          
          if (response.data && response.data["Device Addition"] === "Successful") {
            const newDevice = {
              id: deviceId,
              name: deviceName,
              isOn: false,
              type: deviceType
            };
            
            setDevices([...devices, newDevice]);
            setNewDeviceName('');
            setNewDeviceType('');
            setIsManualAddModal(false);
            setErrorMessage('');
          } else {
            setErrorMessage("Failed to add device. Please try again.");
          }
        } catch (error) {
          console.error("Error adding device:", error);
          
          // For demo purposes, add device anyway if API fails
          const newDevice = {
            id: Math.floor(Math.random() * 10000),
            name: deviceName,
            isOn: false,
            type: deviceType
          };
          
          setDevices([...devices, newDevice]);
          setNewDeviceName('');
          setNewDeviceType('');
          setIsManualAddModal(false);
          setErrorMessage("Added device locally. Could not sync with server.");
        }
      };
    
      // Delete a device
      const deleteDevice = async (id, event) => {
        if (event) {
          event.preventDefault(); // Use preventDefault instead of stopPropagation
        }
        
        try {
          const response = await axios.delete(`${API_URL}/delete_device/${id}`);
          
          if (response.data && response.data["Device Deletion"] === "Successful") {
            setDevices(devices.filter(device => device.id !== id));
          } else {
            setErrorMessage("Failed to delete device. Please try again.");
          }
        } catch (error) {
          console.error("Error deleting device:", error);
          
          // For demo purposes, delete from local state anyway
          setDevices(devices.filter(device => device.id !== id));
          setErrorMessage("Removed device locally. Could not sync with server.");
        }
      };
    
      // Cancel device scanning
      const cancelScanning = () => {
        setIsScanningModal(false);
        setSelectedDeviceId(null);
      };
    
      // Get icon for device type
      const getDeviceTypeIcon = (type) => {
        switch (type) {
          case 'light':
            return 'bulb-outline';
          case 'climate':
            return 'thermometer-outline';
          case 'security':
            return 'shield-outline';
          case 'power':
            return 'power-outline';
          case 'entertainment':
            return 'musical-note-outline';
          case 'appliance':
            return 'home-outline';
          default:
            return 'hardware-chip-outline';
        }
      };
    
      // Reset all modals
      const resetModals = () => {
        setIsModalVisible(false);
        setIsScanningModal(false);
        setIsManualAddModal(false);
        setAddDeviceMethod(null);
      };
    
      return (
        <ScrollView style={{ backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }} contentContainerStyle={styles.container}>
          <View style={{ padding: 10 }}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back-outline" size={27} color={textColor} />
            </TouchableOpacity>
          </View>
            
          {/* Room Header */}
          <View style={styles.roomCard}>
            <Text style={styles.roomTitle}>{roomName}</Text>
            <Text style={{ color: 'white' }}>
              Devices On: {devices.filter((d) => d.isOn).length} / {devices.length}
            </Text>
            
            <View style={styles.energyContainer}>
              <Text style={{ color: 'white' }}>Energy Usage: </Text>
              {isRefreshingEnergy ? (
                <ActivityIndicator size="small" color="white" style={{ marginLeft: 5 }} />
              ) : (
                <Text style={{ color: 'white', fontWeight: 'bold' }}>
                  {totalEnergyUsage} W
                </Text>
              )}
            </View>
            
            {/* Energy usage bar */}
            <View style={styles.energyBarContainer}>
              <View
                style={[
                  styles.energyBar,
                  {
                    width: `${Math.min(totalEnergyUsage / 10, 100)}%`,
                    backgroundColor: totalEnergyUsage > 1000 ? '#FF4D4D' :
                      totalEnergyUsage > 500 ? '#FFA500' : '#4CAF50'
                  }
                ]}
              />
            </View>
            
            <Switch
              value={allDevicesOn}
              onValueChange={toggleAllDevices}
              style={{ position: 'absolute', right: 16, top: 20 }}
            />
          </View>
    
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          ) : null}
            
          {/* Devices Grid */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={{ color: textColor, marginTop: 10 }}>Loading devices...</Text>
            </View>
          ) : (
            <View style={styles.devicesGrid}>
              {devices.map((device) => (
                <TouchableOpacity
                  key={device.id}
                  style={[styles.deviceCard, { backgroundColor: backgroundColor }]}
                  onPress={() => navigateToDeviceDetails(device)}
                >
                  <Text style={[styles.deviceName, { color: textColor }]}>{device.name}</Text>
                  <View style={styles.deviceRow}>
                    <Text style={{ color: textColor }}>{device.isOn ? "On" : "Off"}</Text>
                    <TouchableOpacity
                      onPress={(e) => toggleDevice(device.id, e)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Switch
                        value={device.isOn}
                        onValueChange={() => { }}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => deleteDevice(device.id, e)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash" size={18} color="red" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
    
              {/* Add Device Card */}
              <TouchableOpacity
                onPress={showAddDeviceOptions}
                style={[styles.addDeviceCard, { backgroundColor: isDarkMode ? "#A9A9A9" : "#e5e7eb" }]}
              >
                <Ionicons name="add" size={32} color="#555" />
                <Text style={[styles.addText, { color: textColor }]}>Add Device</Text>
              </TouchableOpacity>
            </View>
          )}
    
          {/* Add Device Method Selection Modal */}
          <Modal
            visible={isModalVisible && !addDeviceMethod}
            transparent
            animationType="slide"
          >
            <View style={styles.modalOverlay}>
              <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: textColor }}>
                  Add Device
                </Text>
                
                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={() => {
                    setAddDeviceMethod('scan');
                    startDeviceScanning();
                  }}
                >
                  <Ionicons name="bluetooth" size={24} color="#8B5CF6" />
                  <Text style={{ marginLeft: 10, color: textColor, fontSize: 16 }}>
                    Scan for Bluetooth Devices
                  </Text>
                </TouchableOpacity>
    
                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={() => {
                    setAddDeviceMethod('catalog');
                    openDeviceCatalog();
                  }}
                >
                  <Ionicons name="list" size={24} color="#8B5CF6" />
                  <Text style={{ marginLeft: 10, color: textColor, fontSize: 16 }}>
                    Choose from Catalog
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.methodButton}
                  onPress={openManualAddDevice}
                >
                  <Ionicons name="create" size={24} color="#8B5CF6" />
                  <Text style={{ marginLeft: 10, color: textColor, fontSize: 16 }}>
                    Add Device Manually
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.methodButton, { backgroundColor: 'transparent' }]}
                  onPress={() => setIsModalVisible(false)}
                >
                  <Text style={{ color: '#8B5CF6', fontSize: 16 }}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
    

                {/* Device Catalog Modal */}
                <Modal
                    visible={addDeviceMethod === 'catalog'}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.catalogModalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: textColor }}>
                                Compatible Devices
                            </Text>
                        
                            <TextInput
                                placeholder="Search devices..."
                                placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                                value={searchText}
                                onChangeText={setSearchText}
                                style={[styles.searchInput, { color: textColor, borderColor: isDarkMode ? "#555" : "#ccc" }]}
                            />
                        
                            <FlatList
                                data={filteredDevices}
                                keyExtractor={(item) => item.id}
                                style={{ maxHeight: 350, width: '100%' }}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.catalogDeviceItem,
                                            selectedDeviceId === item.id && styles.selectedCatalogDevice
                                        ]}
                                        onPress={() => selectDevice(item.id)}
                                    >
                                        <Ionicons
                                            name={getDeviceTypeIcon(item.type)}
                                            size={24}
                                            color="#8B5CF6"
                                        />
                                        <View style={{ marginLeft: 10, flex: 1 }}>
                                            <Text style={{ color: textColor, fontSize: 16 }}>{item.name}</Text>
                                            <Text style={{ color: isDarkMode ? "#aaa" : "#666", fontSize: 14 }}>
                                                {item.manufacturer} • {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
                                            </Text>
                                        </View>
                                        {selectedDeviceId === item.id && (
                                            <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                                        )}
                                    </TouchableOpacity>
                                )}
                                ListEmptyComponent={() => (
                                    <Text style={{ color: textColor, textAlign: 'center', padding: 20 }}>
                                        No devices found matching your search.
                                    </Text>
                                )}
                            />
                        
                            <View style={styles.scanButtonsContainer}>
                                <TouchableOpacity
                                    onPress={() => setAddDeviceMethod(null)}
                                    style={styles.cancelScanButton}
                                >
                                    <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
                                </TouchableOpacity>
                            
                                <TouchableOpacity
                                    onPress={confirmDeviceSelection}
                                    style={[
                                        styles.addScanButton,
                                        !selectedDeviceId && styles.disabledButton
                                    ]}
                                    disabled={!selectedDeviceId}
                                >
                                    <Text style={{ color: '#fff' }}>
                                        Add Selected
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Bluetooth Scanning Modal */}
                <Modal
                    visible={isScanningModal}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.scanModalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 15, color: textColor }}>
                                Scanning for Devices
                            </Text>
                        
                            <View style={styles.progressBarContainer}>
                                <View
                                    style={[
                                        styles.progressBar,
                                        { width: `${scanningProgress}%`, backgroundColor: '#8B5CF6' }
                                    ]}
                                />
                            </View>
                        
                            <Text style={{ color: textColor, marginBottom: 20 }}>
                                {scanningProgress < 100
                                    ? `Scanning Bluetooth devices... ${scanningProgress}%`
                                    : "Scan complete!"}
                            </Text>
                        
                            <ScrollView style={styles.devicesListContainer}>
                                {discoveredDevices.length === 0 && scanningProgress < 50 ? (
                                    <Text style={{ color: textColor, fontStyle: 'italic' }}>
                                        Searching for nearby devices...
                                    </Text>
                                ) : (
                                    <>
                                        <Text style={{ color: textColor, fontWeight: 'bold', marginBottom: 10 }}>
                                            Available Devices:
                                        </Text>
                                    
                                        {discoveredDevices.map(device => (
                                            <TouchableOpacity
                                                key={device.id}
                                                style={[
                                                    styles.discoveredDevice,
                                                    selectedDeviceId === device.id && styles.selectedDevice
                                                ]}
                                                onPress={() => selectDevice(device.id)}
                                            >
                                                <Ionicons
                                                    name={getDeviceTypeIcon(device.type)}
                                                    size={24}
                                                    color="#8B5CF6"
                                                />
                                                <Text style={{ color: textColor, marginLeft: 10, flex: 1 }}>
                                                    {device.name}
                                                </Text>
                                                {selectedDeviceId === device.id && (
                                                    <Ionicons name="checkmark-circle" size={24} color="#8B5CF6" />
                                                )}
                                            </TouchableOpacity>
                                        ))}
                                    </>
                                )}
                            </ScrollView>
                        
                            <View style={styles.scanButtonsContainer}>
                                <TouchableOpacity onPress={cancelScanning} style={styles.cancelScanButton}>
                                    <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
                                </TouchableOpacity>
    
                                <TouchableOpacity
                                    onPress={confirmDeviceSelection}
                                    style={[
                                        styles.addScanButton,
                                        !selectedDeviceId && styles.disabledButton
                                    ]}
                                    disabled={!selectedDeviceId}
                                >
                                    <Text style={{ color: '#fff' }}>
                                        {scanning ? 'Scanning...' : 'Add Selected'}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Manual Device Entry Modal */}
                <Modal
                    visible={isManualAddModal}
                    transparent
                    animationType="slide"
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
                            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: textColor }}>
                                Add Device Manually
                            </Text>
                        
                            <Text style={{ color: textColor, marginBottom: 5 }}>Device Name</Text>
                            <TextInput
                                placeholder="Enter device name"
                                placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                                value={newDeviceName}
                                onChangeText={setNewDeviceName}
                                style={[styles.input, { color: textColor, borderColor: isDarkMode ? "#555" : "#ccc" }]}
                            />
                        
                            <Text style={{ color: textColor, marginBottom: 5, marginTop: 15 }}>Device Type</Text>
                            <View style={styles.deviceTypeContainer}>
                                {['light', 'climate', 'security', 'power', 'entertainment', 'other'].map(type => (
                                    <TouchableOpacity
                                        key={type}
                                        style={[
                                            styles.deviceTypeButton,
                                            newDeviceType === type && styles.selectedDeviceType
                                        ]}
                                        onPress={() => setNewDeviceType(type)}
                                    >
                                        <Ionicons
                                            name={getDeviceTypeIcon(type)}
                                            size={20}
                                            color={newDeviceType === type ? '#fff' : '#8B5CF6'}
                                        />
                                        <Text
                                            style={{
                                                color: newDeviceType === type ? '#fff' : textColor,
                                                fontSize: 12,
                                                marginTop: 5
                                            }}
                                        >
                                            {type.charAt(0).toUpperCase() + type.slice(1)}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        
                            <View style={styles.modalButtonsContainer}>
                                <TouchableOpacity
                                    onPress={() => setIsManualAddModal(false)}
                                    style={styles.cancelButton}
                                >
                                    <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
                                </TouchableOpacity>
                            
                                <TouchableOpacity
                                    onPress={handleAddDevice}
                                    style={styles.addButton}
                                >
                                    <Text style={{ color: '#fff' }}>Add Device</Text>
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
        flexGrow: 1,
        padding: 16
    },
    roomCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 15,
        padding: 20,
        marginBottom: 16,
        position: 'relative',
    },
    roomTitle: {
        fontSize: 60,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 10,
    },
    devicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap:12
    },
    deviceCard: {
        width: Platform.OS==="web" ? '49.5%' : '48%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        position: 'relative',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    deviceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    addDeviceCard: {
        width: Platform.OS==="web" ? '49.5%' : '48%',
        padding: 15,
        borderRadius: 10,
        marginBottom: 15,
        alignItems: 'center',
        justifyContent: 'center',
        height: 120,
    },
    addText: {
        marginTop: 10,
        fontSize: 16,
        fontWeight: 'bold',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorContainer: {
        backgroundColor: '#FFCCCB',
        padding: 10,
        borderRadius: 5,
        margin: 10,
    },
    errorText: {
        color: '#D8000C',
    },
    deleteButton: {
        position: 'absolute',
        top: 15,
        right: 15,
        zIndex: 10,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
    },
    catalogModalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        maxHeight: '80%',
    },
    scanModalContent: {
        width: '90%',
        padding: 20,
        borderRadius: 10,
        alignItems: 'center',
        maxHeight: '80%',
    },
    input: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 10,
    },
    methodButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        marginBottom: 10,
        width: '100%',
    },
    progressBarContainer: {
        width: '100%',
        height: 10,
        backgroundColor: '#e0e0e0',
        borderRadius: 5,
        overflow: 'hidden',
        marginBottom: 10,
    },
    progressBar: {
        height: '100%',
    },
    devicesListContainer: {
        width: '100%',
        maxHeight: 300,
        marginBottom: 20,
    },
    discoveredDevice: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedDevice: {
        backgroundColor: '#EDE9FE',
        borderColor: '#8B5CF6',
        borderWidth: 1,
    },
    scanButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: 10,
    },
    addScanButton: {
        backgroundColor: '#8B5CF6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    cancelScanButton: {
        backgroundColor: 'transparent',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    disabledButton: {
        opacity: 0.5,
    },
    searchInput: {
        width: '100%',
        padding: 10,
        borderWidth: 1,
        borderRadius: 5,
        marginBottom: 15,
    },
    catalogDeviceItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        marginBottom: 8,
    },
    selectedCatalogDevice: {
        backgroundColor: '#EDE9FE',
        borderColor: '#8B5CF6',
        borderWidth: 1,
    },
    deviceTypeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        width: '100%',
        marginBottom: 20,
    },
    deviceTypeButton: {
        width: '30%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        marginBottom: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    selectedDeviceType: {
        backgroundColor: '#8B5CF6',
    },
    modalButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    cancelButton: {
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
        borderWidth: 1,
        borderColor: '#8B5CF6',
    },
    addButton: {
        backgroundColor: '#8B5CF6',
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        width: '48%',
    },
    // Add these to your styles object
    energyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
},
energyBarContainer: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
},
energyBar: {
    height: '100%',
    borderRadius: 3,
},
activeDeviceCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#8B5CF6',
},
energyInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
},
energyText: {
    marginLeft: 5,
    fontSize: 12,
    fontWeight: 'bold',
}
});

