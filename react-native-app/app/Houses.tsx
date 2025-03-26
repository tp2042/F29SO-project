import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = 'https://backend-1-y12u.onrender.com'; // Replace with your actual API URL

export default function HousesScreen() {
    const navigation = useNavigation();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [houseCode, setHouseCode] = useState('');
    const [houseName, setHouseName] = useState('');
    const [error, setError] = useState('');
    const [houses, setHouses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [userRole, setUserRole] = useState('');

    useEffect(() => {
        fetchUserInfo();
        fetchUserHouses();
    }, []);

    const fetchUserInfo = async () => {
        try {
            const role = await AsyncStorage.getItem('role');
            if (role) {
                setUserRole(role);
            }
        } catch (error) {
            console.error('Error fetching user role:', error);
        }
    };

    const fetchUserHouses = async () => {
        try {
            setLoading(true);
            const userId = await AsyncStorage.getItem('userId');
            
            if (!userId) {
                console.error('User ID not found');
                setLoading(false);
                return;
            }
            
            const response = await axios.get(`${API_URL}/get_user_houses?user_id=${userId}`);
            console.log('housesusers', response.data.houses)
            if (response.data.houses) {
                // Transform API response to match UI expectations
                const formattedHouses = response.data.houses.map(house => ({
                    id: house.house_id,
                    household_id: house.household_id,
                    name: house.house_name,
                    icon: house.is_owner ? 'home-outline' : 'home',
                    color: getRandomColor(house.house_id),
                    isOwner: house.is_owner
                }));
                setHouses(formattedHouses);
            }
        } catch (error) {
            console.error('Error fetching houses:', error);
            Alert.alert('Error', 'Failed to load your houses');
        } finally {
            setLoading(false);
        }
    };

    const getRandomColor = () => '#8B5CF6';
    
    const getAllKeys = async () => {
        try {
          const keys = await AsyncStorage.getAllKeys();
          console.log('Stored Keys:', keys);
        } catch (error) {
          console.error('Error retrieving keys:', error);
        }
      };
      
      // Call this function to see all stored keys
      getAllKeys();

  
  // Call this function where needed
  const handleSelectHouse = async (house) => {
    try {
        // Convert house ID to string if it's not already
        const houseId = house.id;
        const householdId = house.household_id;
        
        // Save selected house to AsyncStorage
        await AsyncStorage.setItem('houseId', houseId);
        await AsyncStorage.setItem('householdId', houseId);
        await AsyncStorage.setItem('house_name', house.name);
        
        
        console.log('Saved house data:', {
            id: houseId,
            name: house.name,
            household_id: householdId
        });
        
        // Navigate to the house tabs
        navigation.navigate('IndexTabs', { house });
    } catch (error) {
        console.error('Error saving house selection:', error);
        Alert.alert('Error', 'Could not select house');
    }
};

    const handleJoinHouse = async () => {
        if (!houseCode.trim()) {
            setError('Please enter a valid house code');
            return;
        }
        
        try {
            setError('');
            const userId = await AsyncStorage.getItem('userId');
            
            if (!userId) {
                setError('User not found. Please log in again.');
                return;
            }
            
            const response = await axios.post(`${API_URL}/join_house`, {
                user_id: userId,
                house_id: houseCode.trim()
            });
            
            if (response.data.success) {
                setShowJoinModal(false);
                setHouseCode('');
                
                // Refresh houses list
                fetchUserHouses();
                
                // Show success alert
                Alert.alert(
                    'Success',
                    `You've joined ${response.data.house_name}`,
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                // Optionally navigate directly to the joined house
                                const newHouse = {
                                    id: response.data.house_id,
                                    name: response.data.house_name,
                                    icon: 'home',
                                    color: getRandomColor(response.data.house_id)
                                };
                                handleSelectHouse(newHouse);
                            }
                        }
                    ]
                );
            } else {
                setError(response.data.error || 'Failed to join house');
            }
        } catch (error) {
            console.error('Error joining house:', error);
            setError('Invalid house code or network error');
        }
    };

    const handleCreateHouse = async () => {
        if (!houseName.trim()) {
            setError('Please enter a house name');
            return;
        }
        
        try {
            setError('');
            const userId = await AsyncStorage.getItem('userId');
            
            if (!userId) {
                setError('User not found. Please log in again.');
                return;
            }
            
            const response = await axios.post(`${API_URL}/create_house`, {
                user_id: userId,
                house_name: houseName.trim()
            });
            
            if (response.data.success) {
                setShowCreateModal(false);
                setHouseName('');
                
                // Refresh houses list
                fetchUserHouses();
                
                Alert.alert(
                    'Success',
                    `You've created ${response.data.house_name}`,
                    [
                        { 
                            text: 'OK', 
                            onPress: () => {
                                const newHouse = {
                                    id: response.data.house_id,
                                    name: response.data.house_name,
                                    icon: 'home-outline',
                                    color: getRandomColor(response.data.house_id),
                                    isOwner: true
                                };
                                handleSelectHouse(newHouse);
                            }
                        }
                    ]
                );
            } else {
                setError(response.data.error || 'Failed to create house');
            }
        } catch (error) {
            console.error('Error creating house:', error);
            setError('Failed to create house due to network error');
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.headerTitle}>My Houses</Text>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Loading your houses...</Text>
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.row}>
                    {houses.map((house) => (
                        <TouchableOpacity
                            key={house.id}
                            style={[styles.card, { backgroundColor: house.color }]}
                            onPress={() => handleSelectHouse(house)}
                        >
                            <Ionicons name={house.icon} size={28} color="white" />
                            <Text style={styles.cardTitle}>{house.name}</Text>
                            {house.isOwner && (
                                <View style={styles.ownerBadge}>
                                    <Ionicons name="shield-checkmark" size={14} color="white" />
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                    
                    {/* Add Card */}
                    <TouchableOpacity
                        style={[styles.card, styles.addCard]}
                        onPress={() => setShowJoinModal(true)}
                    >
                        <Ionicons name="add" size={32} color="#1F2937" />
                        <Text style={styles.addText}>Join House</Text>
                    </TouchableOpacity>

                    {/* Create House Card - only visible for Home Managers */}
                    {userRole === 'Home Manager' && (
                        <TouchableOpacity
                            style={[styles.card, styles.createCard]}
                            onPress={() => setShowCreateModal(true)}
                        >
                            <Ionicons name="add-circle" size={32} color="#1F2937" />
                            <Text style={styles.addText}>Create House</Text>
                        </TouchableOpacity>
                    )}
                </ScrollView>
            )}

            {/* Join House Modal */}
            <Modal
                visible={showJoinModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowJoinModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Enter House Code</Text>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            placeholder="House code"
                            value={houseCode}
                            onChangeText={(text) => {
                                setHouseCode(text);
                                setError('');
                            }}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={() => {
                                    setShowJoinModal(false);
                                    setHouseCode('');
                                    setError('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.confirmButton} 
                                onPress={handleJoinHouse}
                            >
                                <Text style={styles.confirmButtonText}>Join</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Create House Modal */}
            <Modal
                visible={showCreateModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCreateModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Create New House</Text>
                        <TextInput
                            style={[styles.input, error && styles.inputError]}
                            placeholder="House name"
                            value={houseName}
                            onChangeText={(text) => {
                                setHouseName(text);
                                setError('');
                            }}
                        />
                        {error ? <Text style={styles.errorText}>{error}</Text> : null}
                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={() => {
                                    setShowCreateModal(false);
                                    setHouseName('');
                                    setError('');
                                }}
                            >
                                <Text style={styles.cancelButtonText}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={styles.confirmButton} 
                                onPress={handleCreateHouse}
                            >
                                <Text style={styles.confirmButtonText}>Create</Text>
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
        padding: 16,
    },
    headerTitle: {
        fontSize: 54,
        fontWeight: '700',
        color: '#111827',
        marginBottom: 90,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
        display: 'flex'
    },
    card: {
        borderRadius: 12, // Reduced from 16
        padding: 12, // Reduced from 16
        justifyContent: 'center',
        alignItems: 'center',
        width: '30%', // Reduced from 45%
        minWidth: 120, // Reduced from 150
        aspectRatio: 1.2, // Changed from 1 (slightly less square)
        marginBottom: 12, // Reduced from 15
        position: 'relative',
    },
    cardTitle: {
        marginTop: 8,
        color: 'white',
        fontWeight: '500',
        fontSize: 16,
        textAlign: 'center',
    },
    addCard: {
        backgroundColor: '#E5E7EB',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    createCard: {
        backgroundColor: '#EDE9FE',
        borderWidth: 1,
        borderColor: '#C4B5FD',
    },
    addText: {
        marginTop: 8,
        color: '#1F2937',
        fontWeight: '500',
        fontSize: 16,
        textAlign: 'center',
    },
    ownerBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        borderRadius: 12,
        padding: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
    },
    loadingText: {
        color: '#4B5563',
        fontSize: 16,
        fontWeight: '500',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 16,
        color: '#111827',
    },
    input: {
        backgroundColor: '#F3F4F6',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        marginBottom: 12,
    },
    inputError: {
        borderColor: '#EF4444',
        borderWidth: 1,
    },
    errorText: {
        color: '#EF4444',
        fontSize: 14,
        marginBottom: 12,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 8,
        marginTop: 8,
    },
    cancelButton: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    cancelButtonText: {
        color: '#4B5563',
        fontWeight: '500',
        fontSize: 14,
    },
    confirmButton: {
        backgroundColor: '#8B5CF6',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    confirmButtonText: {
        color: 'white',
        fontWeight: '500',
        fontSize: 14,
    },
});