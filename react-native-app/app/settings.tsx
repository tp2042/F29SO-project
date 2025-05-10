import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity 
          style={styles.switchUserButton}
          onPress={() => router.push('/Propertymanager')}
        >
          <View style={styles.switchUserContent}>
            <Ionicons name="swap-horizontal" size={24} color="white" />
            <Text style={styles.switchUserText}>Switch User Type</Text>
          </View>
          <Ionicons name="chevron-forward" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: Platform.OS === 'web' ? '2% 5%' : 20,
    maxWidth: Platform.OS === 'web' ? 800 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  switchUserButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: Platform.OS === 'web' ? 20 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  switchUserContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  switchUserText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '600',
  },
});