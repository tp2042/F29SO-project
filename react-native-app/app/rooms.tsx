import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

const initialRooms = [
    { id: 1, name: 'Master Bedroom', icon: 'bed-outline' },
    { id: 2, name: 'Living Room', icon: 'tv-outline' },
    { id: 3, name: 'Kitchen', icon: 'restaurant-outline' }
];

export default function RoomsScreen() {
    const navigation = useNavigation();
    const router = useRouter();
    const [rooms, setRooms] = useState(initialRooms);
    const {isDarkMode} = useTheme();

    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    useEffect(() => {
        navigation.setOptions({ headerShown: false });
        }, [navigation]);

    const addRoom = () => {
    const newRoom = { id: Date.now(), name: `Room ${rooms.length + 1}`, icon: 'home-outline' };
    setRooms([...rooms, newRoom]);
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
        <TouchableOpacity style={styles.addRoomCard} onPress={addRoom}>
            <Ionicons name="add-circle-outline" size={42} color="#8B5CF6" />
            <Text style={styles.roomName}>Add Room</Text>
        </TouchableOpacity>
        </View>
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
    }
}); 