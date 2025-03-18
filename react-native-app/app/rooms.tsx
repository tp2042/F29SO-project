import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

const iconOptions = [
    'home-outline', 'bed-outline', 'tv-outline', 'restaurant-outline', 'book-outline', 'game-controller-outline'
];

export default function RoomsScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const {isDarkMode} = useTheme();

    const [rooms, setRooms] = useState([
        { id: 1, name: 'Master Bedroom', icon: 'bed-outline' },
        { id: 2, name: 'Living Room', icon: 'tv-outline' },
        { id: 3, name: 'Kitchen', icon: 'restaurant-outline' }
    ])
    const [modalVisible, setModalVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('home-outline');

    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        }, [navigation]);

    const handleAddRoom = () => {
        const name = newRoomName.trim() !== '' ? newRoomName : `New Room ${rooms.length + 1}`;
        const newRoom = { id: Date.now(), name: name, icon: selectedIcon };
        setRooms([...rooms, newRoom]);
        setNewRoomName('');
        setSelectedIcon('home-outline');
        setModalVisible(false);
    };

    const deleteRoom = (roomId) => {
    setRooms(rooms.filter(room => room.id !== roomId));
    };

    return (
    <ScrollView style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]}>
        <Text style={[styles.header, {color: textColor}]}>Rooms</Text>
        <View style={styles.roomsGrid}>
        {rooms.map((room) => (
            <TouchableOpacity 
            key={room.id} 
            style={styles.roomCard} 
            onPress={() => navigation.navigate('RoomsDetails', { roomName: room.name})}
            >
            <Ionicons name={room.icon} size={40} color="#8B5CF6" />
            <Text style={styles.roomName}>{room.name}</Text>
            <TouchableOpacity onPress={() => deleteRoom(room.id)} style={styles.deleteButton}>
                <Ionicons name="trash" size={20} color="red" />
            </TouchableOpacity>
            </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.addRoomCard} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={42} color="#8B5CF6" />
            <Text style={styles.roomName}>Add Room</Text>
        </TouchableOpacity>
        </View>

        {/* addRoom popup*/}
        <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
                        <Text style={[styles.modalTitle, { color: textColor }]}>Add New Room</Text>
                        <TextInput
                            style={[styles.input, { color: textColor, borderColor: isDarkMode ? '#555' : '#ccc' }]}
                            placeholder="Enter room name"
                            placeholderTextColor={isDarkMode ? '#888' : '#aaa'}
                            value={newRoomName}
                            onChangeText={setNewRoomName}
                        />
                        <Text style={[styles.selectIconText, { color: textColor }]}>Select Icon:</Text>
                        <View style={styles.iconOptions}>
                            {iconOptions.map((icon) => (
                                <TouchableOpacity 
                                    key={icon} 
                                    onPress={() => setSelectedIcon(icon)} 
                                    style={[
                                        styles.iconWrapper, 
                                        selectedIcon === icon && { backgroundColor: '#8B5CF6' }
                                    ]}
                                >
                                    <Ionicons 
                                        name={icon} 
                                        size={28} 
                                        color={selectedIcon === icon ? '#fff' : '#8B5CF6'} 
                                    />
                                </TouchableOpacity>
                            ))}
                        </View>
                        <View style={styles.modalButtons}>
                            <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                                <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.addButton} onPress={handleAddRoom}>
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
    container: { flex: 1, backgroundColor: '#f5f5f5', padding: 20 },
    header: { fontSize: 28, fontWeight: 'bold', marginBottom: 20 },
    roomsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    roomCard: { 
        width: '48%', 
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 20, 
        alignItems: 'center', 
        marginBottom: 15, 
        position: 'relative'
    },
    roomName: { fontSize: 18, fontWeight: '500', marginTop: 10 },
    deleteButton: { position: 'absolute', top: 10, right: 10 },
    addRoomCard: { 
        width: '48%', 
        backgroundColor: '#E5E7EB', 
        borderRadius: 15, 
        padding: 20, 
        alignItems: 'center', 
        justifyContent: 'center'
    },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { width: '85%', borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 22, fontWeight: '600', marginBottom: 15 },
    input: { borderWidth: 1, borderRadius: 8, padding: 10, marginBottom: 15 },
    selectIconText: { fontWeight: '500', marginBottom: 10 },
    iconOptions: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 15 },
    iconWrapper: { padding: 10, borderRadius: 8, marginBottom: 10 },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelButton: { padding: 10 },
    addButton: { backgroundColor: '#8B5CF6', padding: 10, borderRadius: 8 }
}); 