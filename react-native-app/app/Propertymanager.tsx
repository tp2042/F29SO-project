import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Pressable, Dimensions, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { useNavigation } from "@react-navigation/native";
import ProfileSettings from './ProfileSettings';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const CARD_GAP = Platform.OS === 'web' ? 16 : 8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function PropertyManagerScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProperty, setNewProperty] = useState({
    houseId: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({
    houseId: '',
    email: '',
    password: '',
  });

  const properties = [
    { id: 'home', name: 'My Home', icon: 'checkmark-circle', color: '#8B5CF6', isMain: true },
    { id: 'ss-bay', name: 'SS-BAY-12', icon: 'business', color: '#60A5FA' },
    { id: 'b-nov', name: 'B-NOV-1829', icon: 'home', color: '#60A5FA' },
    { id: 'cs', name: 'CS-849', icon: 'home', color: '#60A5FA' },
    { id: 'tu', name: 'TU-299-I', icon: 'business', color: '#60A5FA', isLarge: true },
  ];

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      houseId: '',
      email: '',
      password: '',
    };
    let isValid = true;

    if (!newProperty.houseId.trim()) {
      newErrors.houseId = 'House name/ID is required';
      isValid = false;
    }

    if (!newProperty.email.trim()) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!validateEmail(newProperty.email)) {
      newErrors.email = 'Please enter a valid email';
      isValid = false;
    }

    if (!newProperty.password.trim()) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (newProperty.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleAddProperty = () => {
    if (validateForm()) {
      setShowAddModal(false);
      setNewProperty({
        houseId: '',
        email: '',
        password: '',
      });
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
        onPress={() => setSelectedProperty(property.id)}
      >
        <View style={[
          styles.propertyContent,
          property.isLarge ? styles.largePropertyContent : styles.squarePropertyContent
        ]}>
          <Ionicons 
            name={property.icon} 
            size={property.isMain ? (Platform.OS === 'web' ? 24 : 28) : (Platform.OS === 'web' ? 20 : 22)} 
            color="white"
          />
          <Text style={[
            styles.propertyName,
            property.isMain && styles.mainPropertyName
          ]}>
            {property.name}
          </Text>
        </View>
        {isSelected && (
          <TouchableOpacity 
            style={styles.manageButton}
            onPress={() => router.push({
              pathname: '/energyTracking',
              params: { propertyName: property.name }
            })}
          >
            <Text style={styles.manageButtonText}>Manage</Text>
            <Ionicons name="arrow-forward" size={14} color="white" />
          </TouchableOpacity>
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
              Hey, <Text style={styles.name}>Maria</Text>
              <Text style={styles.wave}> 👋</Text>
            </Text>
            <Text style={styles.subtitle}>
              Select <Text style={styles.highlight}>property</Text> to manage
            </Text>
          </View>
          
          <View style={styles.profileContainer}>
            <TouchableOpacity onPress={() => navigation.navigate('managerSettings')}>
              <Image source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} style={styles.profileImage} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.grid}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </View>

          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={showAddModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Property</Text>
              <TouchableOpacity 
                onPress={() => setShowAddModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>House Name/ID</Text>
              <TextInput
                style={[styles.input, errors.houseId && styles.inputError]}
                value={newProperty.houseId}
                onChangeText={(text) => {
                  setNewProperty(prev => ({ ...prev, houseId: text }));
                  setErrors(prev => ({ ...prev, houseId: '' }));
                }}
                placeholder="Enter house name or ID"
              />
              {errors.houseId ? <Text style={styles.errorText}>{errors.houseId}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email && styles.inputError]}
                value={newProperty.email}
                onChangeText={(text) => {
                  setNewProperty(prev => ({ ...prev, email: text }));
                  setErrors(prev => ({ ...prev, email: '' }));
                }}
                placeholder="Enter email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={[styles.input, errors.password && styles.inputError]}
                value={newProperty.password}
                onChangeText={(text) => {
                  setNewProperty(prev => ({ ...prev, password: text }));
                  setErrors(prev => ({ ...prev, password: '' }));
                }}
                placeholder="Enter password"
                secureTextEntry
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <TouchableOpacity
              style={styles.addPropertyButton}
              onPress={handleAddProperty}
            >
              <Text style={styles.addPropertyButtonText}>Add Property</Text>
            </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
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
    fontSize: Platform.OS === 'web' ? 14 : (isSmallDevice ? 13 : 14),
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
  },
  mainPropertyName: {
    fontSize: Platform.OS === 'web' ? 16 : (isSmallDevice ? 16 : 18),
    fontWeight: '600',
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: Platform.OS === 'web' ? 12 : 16,
    gap: 6,
    marginTop: Platform.OS === 'web' ? 8 : 12,
  },
  manageButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 12 : 12,
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
  addPropertyButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    padding: Platform.OS === 'web' ? 16 : 14,
    alignItems: 'center',
    marginTop: 12,
  },
  addPropertyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});