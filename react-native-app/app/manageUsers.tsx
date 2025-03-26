import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, Image, ActivityIndicator, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'https://backend-1-y12u.onrender.com';

export default function ManageUsersScreen({ household_id, isVisible, onClose }) {
  console.log('COMPONENT RENDERED: ManageUsersScreen');
  console.log('Props received:', { household_id, isVisible });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [householdName, setHouseholdName] = useState('');
  const [deletingUserId, setDeletingUserId] = useState(null);

  useEffect(() => {
    console.log('USE EFFECT TRIGGERED');
    console.log('isVisible:', isVisible);
    
    if (isVisible) {
      console.log('Calling fetchUsers()');
      fetchUsers();
    }
  }, [isVisible]);
    
  const fetchUsers = async () => {
    console.log('FETCH USERS FUNCTION STARTED');
    const household_id = await AsyncStorage.getItem('householdId');
    console.log('Initial household_id:', household_id);

    setLoading(true);
    setError(null);

    try {
      // Log all AsyncStorage items
      const keys = await AsyncStorage.getAllKeys();
      console.log('AsyncStorage Keys:', keys);
      
      const items = await AsyncStorage.multiGet(keys);
      console.log('AsyncStorage Items:', items);

      // Determine household ID
      let finalHouseholdId = household_id;
      if (!finalHouseholdId) {
        const h_id = await AsyncStorage.getItem('householdId');
        console.log('Household ID from AsyncStorage:', h_id);
        finalHouseholdId = h_id ? parseInt(h_id, 10) : null;
      }

      console.log('FINAL Household ID:', finalHouseholdId);

      // Validate household ID
      if (!finalHouseholdId) {
        console.error('NO HOUSEHOLD ID FOUND');
        setError('No household ID found');
        setLoading(false);
        return;
      }

      // Perform API call
      console.log('MAKING API CALL');
      const response = await axios.get(`${API_BASE_URL}/home_users`, {
        params: { household_id: finalHouseholdId }
      });

      console.log('API RESPONSE:', response.data);

      // Process response
      if (response.data.error) {
        console.error('API ERROR:', response.data.error);
        setError(response.data.error);
      } else {
        console.log('SETTING USERS:', response.data.users);
        setUsers(response.data.users || []);
        setHouseholdName(response.data.household_name || '');
      }
    } catch (err) {
      console.error('FETCH USERS ERROR:', err);
      
      // More detailed error logging
      if (err.response) {
        console.error('Error Response:', err.response.data);
        console.error('Error Status:', err.response.status);
      } else if (err.request) {
        console.error('Error Request:', err.request);
      } else {
        console.error('Error Message:', err.message);
      }

      setError('Failed to fetch household users');
    } finally {
      console.log('FETCH USERS COMPLETED');
      setLoading(false);
    }
  };
  const deleteUser = async (userId) => {
    console.log('Attempting to delete user with ID:', userId);
  
    // Validate inputs
    if (!userId) {
      Alert.alert('Error', 'Invalid user information');
      return;
    }
  
    const h_id = await AsyncStorage.getItem('householdId');
    console.log('Retrieved household ID:', h_id);
  
    // Set the deleting state to show spinner
    setDeletingUserId(userId);
  
    try {
      const requestBody = {
        user_id: userId,
        household_id: h_id
      };
  
      console.log('Delete request body:', requestBody);
  
      const response = await fetch(`${API_BASE_URL}/delete_home_user`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      console.log('API Response Status:', response.status);
  
      const result = await response.json();
      console.log('Delete API Result:', result);
  
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }
  
      if (result.error) {
        Alert.alert('Error', result.error);
      } else {
        // Remove the user from the local state
        setUsers(users.filter(user => user.id !== userId));
        Alert.alert('Success', 'User removed from household');
      }
    } catch (err) {
      console.error('Detailed Error removing user:', {
        message: err.message,
        stack: err.stack
      });
      Alert.alert('Error', 'Failed to remove user. Please try again.');
    } finally {
      setDeletingUserId(null);
    }
  };


  const confirmDeleteUser = (user) => {
    Alert.alert(
      'Remove User',
      `Are you sure you want to remove ${user.name} from this household?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => deleteUser(user.id),
        },
      ],
      { cancelable: true }
    );
  };
  const renderUser = ({ item, index }) => (
    <View style={styles.userCard}>
      <View style={styles.userCardLeft}>
        <View style={styles.numberBadge}>
          <Text style={styles.numberBadgeText}>{index + 1}</Text>
        </View>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{item.name}</Text>
          <View style={styles.userStats}>
            {/* Additional user stats can be added here */}
          </View>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDeleteUser(item)}
        disabled={deletingUserId === item.id}
      >
        {deletingUserId === item.id ? (
          <ActivityIndicator size="small" color="#EF4444" />
        ) : (
          <Ionicons name="trash-outline" size={20} color="#EF4444" />
        )}
      </TouchableOpacity>
    </View>
  );
  
  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Manage Household Users</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#111827" />
            </TouchableOpacity>
          </View>
          
          <View style={styles.householdInfo}>
            <Text style={styles.householdName}>{householdName}</Text>
            <Text style={styles.usersCount}>{users.length} User{users.length !== 1 ? 's' : ''}</Text>
          </View>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B5CF6" />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={32} color="#EF4444" />
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchUsers}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people" size={40} color="#9CA3AF" />
              <Text style={styles.emptyText}>No users found in this household</Text>
            </View>
          ) : (
            <FlatList
              data={users}
              renderItem={renderUser}
              keyExtractor={(item) => item.id.toString()}
              contentContainerStyle={styles.usersList}
              showsVerticalScrollIndicator={false}
            />
          )}
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Removing a user only removes them from this household. Their account will not be deleted.
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Styles remain the same, with timeframe-related styles removed
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    width: Platform.OS === 'web' ? '60%' : '90%',
    maxWidth: 600,
    maxHeight: '80%',
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      },
      android: {
        elevation: 5,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  // ... (rest of the styles remain the same)

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  householdInfo: {
    marginBottom: 16,
  },
  householdName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  usersCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  timeframeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    marginBottom: 16,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
    },
  timeframeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  timeframeButtonText: {
    fontWeight: '500',
    color: '#6B7280',
    fontSize: 14,
  },
  timeframeButtonTextActive: {
    color: 'white',
    },
    numberBadge: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E0E7FF', // Light blue background
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
      },
      numberBadgeText: {
        color: '#3B82F6', // Blue text color
        fontSize: 18,
        fontWeight: 'bold',
      },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorText: {
    marginTop: 12,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  usersList: {
    paddingVertical: 8,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  userCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  deleteButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#FEF2F2',
  },
  footer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});