import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
// Add this near the top of your file, after the axios import
axios.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';

const iconOptions = [
    'home-outline', 'bed-outline', 'tv-outline', 'restaurant-outline', 'book-outline', 'game-controller-outline'
];

export default function RoomsScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const {isDarkMode} = useTheme();

    const [rooms, setRooms] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [newRoomName, setNewRoomName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('home-outline');
    const [isLoading, setIsLoading] = useState(true);
    const [householdId, setHouseholdId] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    const API_URL = "https://backend-1-y12u.onrender.com"; 

    // Fetch household ID 
    useEffect(() => {
        const getHouseholdId = async () => {
            try {
                const id = await AsyncStorage.getItem('householdId');
                console.log("Retrieved householdId:", id); // More explicit logging
                
                if (id) {
                    setHouseholdId(id);
                
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
        navigation.setOptions({
            headerShown: false,  
        });
        console.log("Component mounted or updated");
    console.log("Current state:", { 
        householdId, 
        rooms: rooms.length, 
        isLoading, 
        errorMessage 
    });
}, [householdId, rooms, isLoading, errorMessage]);

useEffect(() => {
    if (householdId) {
        fetchRooms(householdId);
    }
}, [householdId]); 
    
    // Fetch rooms
    const fetchRooms = async (householdId) => {
        console.log("Starting fetchRooms with householdId:", householdId);
        setIsLoading(true);
        setErrorMessage('');
        
        try {
            const response = await axios.get(`${API_URL}/rooms/${householdId}`, {
                headers: {
                    'ngrok-skip-browser-warning': 'true'
                }
            });
            
            console.log("API Response:", response.data);
            
            if (response.data && response.data.rooms) {
                const roomsData = response.data.rooms;
                console.log("Rooms Found:", roomsData);
                
                const formattedRooms = roomsData.map((room, index) => ({
                    id: room.id,
                    name: room.name,
                    icon: iconOptions[index % iconOptions.length]
                }));
                
                console.log("Setting rooms with:", formattedRooms);
                setRooms(formattedRooms);
            } else {
                console.warn("No rooms found in response!");
                setRooms([]);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error.response?.data || error.message);
            setErrorMessage(`Failed to fetch rooms: ${error.message}`);
            setRooms([]);
        } finally {
            console.log("Setting isLoading to false");
            setIsLoading(false);
        }
    };
    
    // Add a new room
    const handleAddRoom = async () => {
        if (!householdId) {
            setErrorMessage("No household ID found.");
            return;
        }

        const name = newRoomName.trim() !== '' ? newRoomName : `New Room ${rooms.length + 1}`;
        const roomId = Math.floor(Date.now() / 1000);
        
        try {
            const response = await axios.post(`${API_URL}/add_room`, {
                household_id: householdId,
                room_id: roomId,
                room_name: name
            });
            
            if (response.data && response.data["Room Data"] === "Addition Successful") {
                
                const newRoom = { id: roomId, name: name, icon: selectedIcon };
                setRooms([...rooms, newRoom]);
                
              
                setNewRoomName('');
                setSelectedIcon('home-outline');
                setModalVisible(false);
            } else {
                setErrorMessage("Failed to add room. Please try again.");
            }
        } catch (error) {
            console.error("Error adding room:", error);
            setErrorMessage("Failed to add room. Please try again.");
        }
    };

    // Delete a room
    const deleteRoom = async (roomId) => {
        try {
            const response = await axios.delete(`${API_URL}/delete_room/${roomId}`);
            
            if (response.data && response.data["Room Deletion"] === "Successful") {
                
                setRooms(rooms.filter(room => room.id !== roomId));
            } else {
                setErrorMessage("Failed to delete room. Please try again.");
            }
        } catch (error) {
            console.error("Error deleting room:", error);
            setErrorMessage("Failed to delete room. Please try again.");
        }
    };

   
    const refreshRooms = () => {
        if (householdId) {
            console.log("Calling fetchRooms with householdId:", householdId);
            fetchRooms(householdId);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
            <View style={{padding:10}}/>
            <Text style={[styles.header, {color: textColor}]}>Rooms</Text>
            
            {errorMessage ? (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{errorMessage}</Text>
                </View>
            ) : null}
            
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <Text style={{color: textColor, textAlign: 'center'}}>Loading rooms...</Text>
                </View>
            ) : rooms.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={{color: textColor, textAlign: 'center'}}>
                        No rooms found. Add a room to get started.
                    </Text>
                </View>
            ) : (
                <View style={styles.roomsGrid}>
                    {rooms.map((room) => (
                        <TouchableOpacity 
                            key={room.id} 
                            style={[styles.roomCard, {backgroundColor: isDarkMode ? "#444" : "white"}]} 
                            onPress={() => navigation.navigate('RoomsDetails', { roomName: room.name, roomId: room.id})}
                        >
                            <Ionicons name={room.icon} size={40} color="#8B5CF6" />
                            <Text style={[styles.roomName, {color: textColor}]}>{room.name}</Text>
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
            )}
            


            {/* Manual refresh button 
            <TouchableOpacity style={styles.refreshButton} onPress={refreshRooms}>
                <Ionicons name="refresh" size={24} color="#8B5CF6" />
                <Text style={styles.refreshText}>Refresh Rooms</Text>
            </TouchableOpacity> */}

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
    container: { 
        flex: 1, 
        backgroundColor: '#f5f5f5', 
        padding: 20 
    },
    header: { 
        fontSize: 30, 
        fontWeight: 'bold', 
        marginBottom: 20 
    },
    roomsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between' 
    },
    roomCard: { 
        width: '48%', 
        backgroundColor: 'white', 
        borderRadius: 15, 
        padding: 24, 
        alignItems: 'center', 
        marginBottom: 15, 
        position: 'relative'
    },
    roomName: { 
        fontSize: 20, 
        fontWeight: '500', 
        marginTop: 10 
    },
    deleteButton: { 
        position: 'absolute', 
        top: 10, 
        right: 10 
    },
    addRoomCard: { 
        width: '48%', 
        backgroundColor: '#E5E7EB', 
        borderRadius: 15, 
        padding: 20, 
        alignItems: 'center', 
        justifyContent: 'center',
    },
    modalContainer: { 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundColor: 'rgba(0,0,0,0.4)' 
    },
    modalContent: { 
        width: '85%', 
        borderRadius: 15, 
        padding: 20 
    },
    modalTitle: { 
        fontSize: 22, 
        fontWeight: '600', 
        marginBottom: 15 
    },
    input: { 
        borderWidth: 1, 
        borderRadius: 8, 
        padding: 10, 
        marginBottom: 15 
    },
    selectIconText: { 
        fontWeight: '500', 
        marginBottom: 10 
    },
    iconOptions: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between', 
        marginBottom: 15 
    },
    iconWrapper: { 
        padding: 10, 
        borderRadius: 8, 
        marginBottom: 10 
    },
    modalButtons: { 
        flexDirection: 'row', 
        justifyContent: 'space-between' 
    },
    cancelButton: { 
        padding: 10 
    },
    addButton: { 
        backgroundColor: '#8B5CF6', 
        padding: 10, 
        borderRadius: 8 
    },
    loadingContainer: {
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center'
    },
    emptyContainer: {
        padding: 30,
        alignItems: 'center',
        justifyContent: 'center'
    },
    errorContainer: {
        backgroundColor: '#FFEBEE',
        padding: 10,
        borderRadius: 8,
        marginBottom: 15
    },
    errorText: {
        color: '#D32F2F',
        textAlign: 'center'
    },
    refreshButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 10,
        backgroundColor: '#EDE9FE',
        borderRadius: 8,
        marginTop: 15,
        marginBottom: 20
    },
    refreshText: {
        color: '#8B5CF6',
        marginLeft: 8,
        fontWeight: '500'
    }
});