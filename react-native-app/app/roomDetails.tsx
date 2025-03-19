import { useRoute } from '@react-navigation/native';
import { useState } from "react";
import { View, Text, TouchableOpacity, Switch, ScrollView, StyleSheet, Modal, TextInput } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import { RootStackParamList } from '.';
import { StackNavigationProp } from '@react-navigation/stack';

export default function RoomsDetails() {
    const route = useRoute();
    const { roomName } = route.params as { roomName: string };
    const navigation = useNavigation<RoomDetailsNavigationProp>();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newDeviceName, setNewDeviceName] = useState('');

    const { isDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    type RoomDetailsNavigationProp = StackNavigationProp<RootStackParamList, 'RoomDetails'>;

    const [devices, setDevices] = useState([
    { id: 1, name: "Ceiling Light", isOn: true },
    { id: 2, name: "Heater", isOn: false },
    { id: 3, name: "Air Conditioner", isOn: true },
    ]);

    const allDevicesOn = devices.every((d) => d.isOn);
    const energyUsage = devices.filter((d) => d.isOn).length * 50;

    const toggleAllDevices = () => {
    const updatedDevices = devices.map((device) => ({
        ...device,
        isOn: !allDevicesOn,
    }));
    setDevices(updatedDevices);
    };

    const toggleDevice = (id: number) => {
    const updatedDevices = devices.map((device) =>
        device.id === id ? { ...device, isOn: !device.isOn } : device
    );
    setDevices(updatedDevices);
    };

    const handleAddDevice = () => {
        const newId = devices.length + 1;
        setDevices([...devices, { id: newId, name: newDeviceName || `New Device ${newId}`, isOn: false }]);
        setNewDeviceName('');
        setIsModalVisible(false);
};


    const deleteDevice = (id: number) => {
    setDevices(devices.filter((device) => device.id !== id));
    };

    return (
    <ScrollView style={{backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}} contentContainerStyle={styles.container}>
        <View style={{padding: 10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back-outline" size={27} color={textColor} />
        </TouchableOpacity>
        </View>
      {/* Room Header */}
        <View style={styles.roomCard}>
        <Text style={styles.roomTitle}>{roomName}</Text>
        <Text style={{color: 'white'}}>Devices On: {devices.filter((d) => d.isOn).length} / {devices.length}</Text>
        <Text style={{color: 'white'}}>Energy Usage: {energyUsage} W</Text>
        <Switch value={allDevicesOn} onValueChange={() => toggleAllDevices()} style={{ position: 'absolute', right: 16, top: 20 }}/>
        </View>

      {/* Devices Grid */}
        <View style={styles.devicesGrid}>
        {devices.map((device) => (
            <TouchableOpacity key={device.id} style={[styles.deviceCard, {backgroundColor: backgroundColor}]}
            onPress={() =>
                navigation.navigate('DeviceDetails', {
                    deviceName: device.name,
                    roomName: roomName,
                    isOn: device.isOn, 
                    energyUsage: energyUsage,
                    unit: 'kWh',
                    averageTemp: device.name === 'Heater' ? 24 : undefined,
                    lightLevel: device.name === 'Ceiling Light' ? 75 : undefined,
                })
            }>
            <Text style={[styles.deviceName, {color: textColor}]}>{device.name}</Text>
            <View style={styles.deviceRow}>
                <Text style={{color: textColor}}>{device.isOn ? "On" : "Off"}</Text>
                <TouchableOpacity>
                <Switch
                value={device.isOn}
                onValueChange={() => toggleDevice(device.id)}
                />
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={() => deleteDevice(device.id)} style={styles.deleteButton}>
                <Ionicons name="trash" size={18} color="red" />
            </TouchableOpacity>
            </TouchableOpacity>
        ))}

        {/* Add Device Card */}
        <TouchableOpacity onPress={() => setIsModalVisible(true)} style={[styles.addDeviceCard, {backgroundColor: isDarkMode ? "#A9A9A9" : "#e5e7eb"}]}>
            <Ionicons name="add" size={32} color="#555" />
            <Text style={[styles.addText, {color: textColor}]}>Add Device</Text>
        </TouchableOpacity>
        </View>
        \{/* Add new Device popup*/}
        <Modal
    visible={isModalVisible}
    transparent
    animationType="slide"
>
    <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? '#333' : '#fff' }]}>
            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: textColor }}>Add New Device</Text>
            <TextInput
                placeholder="Device Name"
                placeholderTextColor={isDarkMode ? "#aaa" : "#555"}
                value={newDeviceName}
                onChangeText={setNewDeviceName}
                style={[styles.input, { borderColor: isDarkMode ? "#555" : "#ccc", color: textColor }]}
            />
            <View style={styles.modalButtons}>
                <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.cancelButton}>
                    <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleAddDevice} style={styles.addButton}>
                    <Text style={{ color: '#fff' }}>Add</Text>
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
    padding: 16,
    },
    roomCard: {
    backgroundColor: "#8B5CF6",
    borderRadius: 15,
    padding: 16,
    marginBottom: 16,
    },
    roomTitle: {
    color: 'white',
    fontSize: 30,
    fontWeight: "600",
    marginBottom: 8,
    },
    toggleAllButton: {
    marginTop: 12,
    backgroundColor: "#1e40af",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    },
    buttonText: {
    color: "white",
    fontWeight: "bold",
    },
    devicesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    },
    deviceCard: {
    width: "48%",
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    padding: 12,
    marginBottom: 12,
    position: "relative",
    },
    deviceName: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
    },
    deviceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    },
    deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 8,
    },
    addDeviceCard: {
    width: "48%",
    height: 100,
    backgroundColor: "#e5e7eb",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    },
    addText: {
    marginTop: 8,
    color: "#555",
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '80%',
        padding: 20,
        borderRadius: 10,
    },
    input: {
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        marginBottom: 16,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    cancelButton: {
        padding: 10,
    },
    addButton: {
        padding: 10,
        borderRadius: 8,
        backgroundColor: '#8B5CF6',
    },    
});
