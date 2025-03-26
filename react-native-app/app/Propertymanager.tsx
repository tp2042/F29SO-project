import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Pressable, Dimensions, Modal, TextInput, Alert} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
//import Clipboard from '@react-native-clipboard/clipboard';
const API_URL = 'https://backend-1-y12u.onrender.com'; // Replace with your actual API URL
const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const CARD_GAP = Platform.OS === 'web' ? 16 : 8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PropertyManagerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentHouseCode, setCurrentHouseCode] = useState('');
  const [currentHouseName, setCurrentHouseName] = useState('');
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState([]);
  const [userName, setUserName] = useState('User');
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // For creating a new house
  const [newHouse, setNewHouse] = useState({
    houseName: '',
    houseMeter: '',
  });
  
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUserHouses();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const storedName = await AsyncStorage.getItem('name');
      if (storedName) {
        setUserName(storedName);
      }
    } catch (error) {
      console.error('Error fetching user info:', error);
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
      
      console.log('Fetching houses for user ID:', userId);
      const response = await axios.get(`${API_URL}/get_managed_houses?user_id=${userId}`);
      console.log('API Response:', response.data);
      
      if (response.data.houses && Array.isArray(response.data.houses)) {
        // Transform API response to match UI expectations
        const formattedHouses = response.data.houses.map(house => ({
          id: house.house_id ? String(house.house_id) : 'unknown_id', // Converting to string to be safe
          hid: house.h_id , // Use h_id if available, otherwise fall back to household_id
          name: house.house_name,
          icon: 'checkmark-circle', // Default for houses the user manages
          color: '#8B5CF6', // Default color
          is_owner: true // Since they are the manager
        }));
        console.log('Formatted houses:', formattedHouses);
        setProperties(formattedHouses);
      } else {
        console.error('No houses array in response:', response.data);
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching houses:', error);
      Alert.alert('Error', 'Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCreateHouse = async () => {
    if (!newHouse.houseName.trim()) {
      setError('House name is required');
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
        manager_id: userId,
        house_name: newHouse.houseName.trim()
      });
      
      console.log('Create house response:', response.data);
      
      if (response.data.success) {
        setShowCreateModal(false);
        
        // Important: Make sure we extract the h_id correctly
        const houseId = response.data.house_id || ''; 
        const houseName = response.data.house_name || newHouse.houseName.trim();
        
        console.log('Setting house data for sharing:', { houseId, houseName });
        
        // Set data for sharing modal
        setCurrentHouseCode(houseId);
        setCurrentHouseName(houseName);
        
        // Clear the form
        setNewHouse({ houseName: '' });
        
        // Show the share modal
        setShowShareModal(true);
        
        // Refresh houses list
        fetchUserHouses();
      } else {
        setError(response.data.error || 'Failed to create house');
      }
    } catch (error) {
      console.error('Error creating house:', error);
      setError('Error creating house. Please try again.');
    }
  };

  const handleDeleteHouse = async () => {
    if (!selectedProperty) {
      Alert.alert('Error', 'No property selected');
      return;
    }
    
    try {
      setDeleteLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      if (!userId) {
        Alert.alert('Error', 'User not found. Please log in again.');
        return;
      }
      
      const property = properties.find(p => p.id === selectedProperty);
      if (!property) {
        Alert.alert('Error', 'Property not found');
        return;
      }
      
      console.log('Attempting to delete property:', property.id);
      
      // Call the delete house API - Fixed implementation
      const response = await axios.delete(`${API_URL}/delete_house`, {
        data: {  // Use 'data' property to send body with DELETE request
          manager_id: userId,
          house_id: parseInt(property.id, 10)
        }
      });
      
      console.log('Delete house response:', response.data);
      
      if (response.data.success) {
        // Close the delete modal
        setShowDeleteModal(false);
        
        // Reset selected property
        setSelectedProperty(null);
        
        // Clear current house from AsyncStorage if it was the deleted one
        const currentHouseId = await AsyncStorage.getItem('current_house_id');
        if (currentHouseId === property.id) {
          await AsyncStorage.removeItem('householdId');
          await AsyncStorage.removeItem('name');
          await AsyncStorage.removeItem('hid');
        }
        
        // Show success message
        Alert.alert('Success', `${property.name} has been deleted successfully`);
        
        // Refresh houses list
        fetchUserHouses();
      } else {
        Alert.alert('Error', response.data.error || 'Failed to delete house');
      }
    } catch (error) {
      console.error('Error deleting house:', error);
      Alert.alert('Error', 'Error deleting house. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };
    
  const handleSelectProperty = async (property) => {
    try {
      setSelectedProperty(property.id);
      
      // Save selected house to AsyncStorage
      await AsyncStorage.setItem('householdId', property.id);
      await AsyncStorage.setItem('property_name', property.name);
      await AsyncStorage.setItem('hid', property.hid || property.id);
    } catch (error) {
      console.error('Error saving property selection:', error);
      Alert.alert('Error', 'Could not select property');
    }
  };

  const handleManageProperty = () => {
    if (selectedProperty) {
      const property = properties.find(p => p.id === selectedProperty);
      if (property) {
        router.push({
          pathname: '/energyManager',
          params: { 
            propertyName: property.name,
            propertyId: property.id,
            propertyHid: property.hid || property.id
          }
        });
      }
    }
  };

  const copyToClipboard = () => {
    if (currentHouseCode) {
      Clipboard.setString(currentHouseCode);
      Alert.alert('Copied', 'House code copied to clipboard');
    }
  };

  const PropertyCard = ({ property }) => {
    const isSelected = selectedProperty === property.id;
    
    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: withSpring(isSelected ? 1.02 : 1) }],
    }));

    return (
      <AnimatedPressable
        style={[
          styles.propertyCard,
          property.isLarge && styles.largeCard,
          { backgroundColor: property.color },
          isSelected && styles.selectedCard,
          animatedStyle,
        ]}
        onPress={() => handleSelectProperty(property)}
      >
        <View style={styles.propertyContent}>
          <Ionicons 
            name={property.icon} 
            size={24} 
            color="white"
          />
          
          <View style={styles.propertyInfoContainer}>
            <Text style={styles.propertyName}>
              {property.name || "Unnamed House"}
            </Text>
            <Text style={styles.propertyId}>
              ID: {property.hid || "N/A"}
            </Text>
          </View>
        </View>
        
        {isSelected && (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity 
              style={styles.manageButton}
              onPress={handleManageProperty}
            >
              <Text style={styles.manageButtonText}>Manage</Text>
              <Ionicons name="arrow-forward" size={14} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => setShowDeleteModal(true)}
            >
              <Ionicons name="trash-outline" size={14} color="white" />
            </TouchableOpacity>
          </View>
        )}
      </AnimatedPressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>
              Hey, <Text style={styles.name}>{userName}</Text>
              <Text style={styles.wave}> 👋</Text>
            </Text>
            <Text style={styles.subtitle}>
              Select <Text style={styles.highlight}>property</Text> to manage
            </Text>
          </View>
          
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('managerSettings')}>
               <View style={styles.profileIcon}>
                                      <Text style={styles.profileText}>
                                          {userName ? userName.charAt(0).toUpperCase() : "U"}
                                      </Text>
                                  </View>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          {loading ? (
            <Text style={styles.loadingText}>Loading your properties...</Text>
          ) : properties.length > 0 ? (
            <View style={styles.grid}>
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>You don't have any properties yet.</Text>
              <Text style={styles.emptyStateSubText}>Create a new property to get started.</Text>
            </View>
          )}

          {/* Floating action button */}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Create House Modal */}
      <Modal
        visible={showCreateModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create New House</Text>
              <TouchableOpacity 
                onPress={() => setShowCreateModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>House Name</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={newHouse.houseName}
                onChangeText={(text) => {
                  setNewHouse(prev => ({ ...prev, houseName: text, houseMeter: '' }));
                  setError('');
                }}
                placeholder="Enter house name"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}

              <Text style={styles.label}>House Electricity Meter code</Text>
              <TextInput
                style={[styles.input, error && styles.inputError]}
                value={newHouse.houseMeter}
                onChangeText={(text) => {
                  setNewHouse(prev => ({ ...prev, houseMeter: text }));
                  setError('');
                }}
                placeholder="Enter house meter code"
              />
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            <Text style={styles.infoText}>
              You'll be assigned as the Home Manager for this house. You can add rooms and invite others to join.
            </Text>

            <TouchableOpacity
              style={styles.actionConfirmButton}
              onPress={handleCreateHouse}
            >
              <Text style={styles.actionConfirmButtonText}>Create House</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Share House ID Modal */}
      <Modal
        visible={showShareModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowShareModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>House Created!</Text>
              <TouchableOpacity 
                onPress={() => setShowShareModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <Text style={styles.shareText}>
              Your new house "<Text style={styles.shareBold}>{currentHouseName || "New House"}</Text>" has been created successfully!
            </Text>
            
            <View style={styles.shareCodeContainer}>
              <Text style={styles.shareLabel}>Share this code with others to join:</Text>
              <View style={styles.codeContainer}>
                <Text style={styles.codeText}>{currentHouseCode || "Code not available"}</Text>
                <TouchableOpacity 
                  onPress={copyToClipboard} 
                  style={styles.copyButton}
                  disabled={!currentHouseCode}
                >
                  <Ionicons name="copy-outline" size={20} color={currentHouseCode ? "#8B5CF6" : "#D1D5DB"} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.actionConfirmButton}
              onPress={() => setShowShareModal(false)}
            >
              <Text style={styles.actionConfirmButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Delete House Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDeleteModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Delete House</Text>
              <TouchableOpacity 
                onPress={() => setShowDeleteModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            {selectedProperty && (
              <Text style={styles.deleteWarningText}>
                Are you sure you want to delete "
                <Text style={styles.deleteBold}>
                  {properties.find(p => p.id === selectedProperty)?.name || "this house"}
                </Text>
                "? This action cannot be undone.
              </Text>
            )}
            
            <Text style={styles.deleteInfoText}>
              All rooms, devices, and user associations will be permanently removed.
            </Text>

            <View style={styles.deleteButtonGroup}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.deleteConfirmButton}
                onPress={handleDeleteHouse}
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <Text style={styles.deleteConfirmButtonText}>Deleting...</Text>
                ) : (
                  <View style={styles.deleteConfirmButtonContent}>
                    <Ionicons name="trash-outline" size={16} color="white" />
                    <Text style={styles.deleteConfirmButtonText}>Delete House</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  innerContainer: {
    flex: 1,
    padding: Platform.OS === 'web' ? 40 : 16,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: Platform.OS === 'web' ? 20 : 40,
    marginBottom: Platform.OS === 'web' ? 40 : 24,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: Platform.OS === 'web' ? 32 : (isSmallDevice ? 20 : 22),
    marginBottom: Platform.OS === 'web' ? 12 : 6,
    fontWeight: Platform.select({ android: '400' }),
  },
  name: {
    fontWeight: '600',
  },
  wave: {
    fontSize: Platform.OS === 'web' ? 32 : (isSmallDevice ? 20 : 22),
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 20 : (isSmallDevice ? 14 : 16),
    color: '#6B7280',
  },
  highlight: {
    color: '#111827',
    fontWeight: '500',
  },
  profileContainer: {
    width: Platform.OS === 'web' ? 48 : 40,
    height: Platform.OS === 'web' ? 48 : 40,
    borderRadius: Platform.OS === 'web' ? 24 : 20,
    overflow: 'hidden',
    backgroundColor: '#F3F4F6',
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#ddd",
  },
  content: {
    flex: 1,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 24,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 18,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CARD_GAP,
    justifyContent: Platform.OS === 'web' ? 'flex-start' : 'space-between',
  },
  propertyCard: {
    width: Platform.OS === 'web' ? 'calc(20% - 16px)' : '48%',
    aspectRatio: 1,
    borderRadius: Platform.OS === 'web' ? 12 : 16,
    padding: Platform.OS === 'web' ? 16 : 12,
    justifyContent: 'space-between',
    marginBottom: CARD_GAP,
  },
  selectedCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  propertyContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', 
    paddingVertical: 10,
  },
  propertyInfoContainer: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
  },
  squarePropertyContent: {
    aspectRatio: 1,
  },
  largePropertyContent: {
    flexDirection: 'row',
    gap: 8,
  },
  largeCard: {
    width: Platform.OS === 'web' ? 'calc(40% - 16px)' : '100%',
    aspectRatio: Platform.OS === 'web' ? 2 : 1.5,
  },
  propertyName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  propertyId: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  mainPropertyName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 8 : 12,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: Platform.OS === 'web' ? 12 : 16,
    gap: 6,
    flex: 1,
    marginRight: 6,
  },
  deleteButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.8)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: Platform.OS === 'web' ? 12 : 16,
  },
  manageButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  addButton: {
    position: 'absolute',
    bottom: Platform.OS === 'web' ? 40 : 24,
    right: Platform.OS === 'web' ? 40 : 24,
    width: Platform.OS === 'web' ? 48 : 56,
    height: Platform.OS === 'web' ? 48 : 56,
    borderRadius: Platform.OS === 'web' ? 24 : 28,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 40 : 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 500 : '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    padding: 8,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 12 : 10,
    fontSize: 16,
    color: '#1F2937',
    marginBottom: 15
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  actionConfirmButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 16 : 14,
    alignItems: 'center',
    marginTop: 12,
  },
  actionConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Styles for the share modal
  shareText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  shareBold: {
    fontWeight: '600',
  },
  shareCodeContainer: {
    marginBottom: 24,
  },
  shareLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  codeText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151',
    flex: 1,
  },
  copyButton: {
    padding: 8,
  },
  // Delete modal styles
  deleteWarningText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  deleteBold: {
    fontWeight: '600',
    color: '#111827',
  },
  deleteInfoText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 24,
    textAlign: 'center',
  },
  deleteButtonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 16 : 14,
    alignItems: 'center',
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4B5563',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteConfirmButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 16 : 14,
    alignItems: 'center',
    marginLeft: 8,
  },
  deleteConfirmButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteConfirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  profileIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#6200ea", // Change color as needed
    justifyContent: "center",
    alignItems: "center",
},
profileText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "bold",
}
});