import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Image, Pressable, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const isSmallDevice = width < 375;
const CARD_GAP = Platform.OS === 'web' ? 16 : 8;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export default function HomeScreen() {
  const router = useRouter();
  const [selectedProperty, setSelectedProperty] = useState<string | null>(null);

  const properties = [
    { id: 'home', name: 'My Home', icon: 'checkmark-circle', color: '#8B5CF6', isMain: true },
    { id: 'ss-bay', name: 'SS-BAY-12', icon: 'business', color: '#60A5FA' },
    { id: 'b-nov', name: 'B-NOV-1829', icon: 'home', color: '#60A5FA' },
    { id: 'cs', name: 'CS-849', icon: 'home', color: '#60A5FA' },
    { id: 'tu', name: 'TU-299-I', icon: 'business', color: '#60A5FA', isLarge: true },
  ];

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
            onPress={() => router.push('/device')}
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
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop' }}
              style={styles.profileImage}
            />
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.grid}>
            {properties.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </View>

          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add" size={24} color="#1F2937" />
          </TouchableOpacity>
        </View>
      </View>
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
    width: '100%',
    height: '100%',
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
});