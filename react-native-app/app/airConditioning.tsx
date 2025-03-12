import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AirConditioningScreen() {
  const router = useRouter();
  const [isToggleOn, setIsToggleOn] = useState(true);
  
  const generateSegments = () => {
    const colors = [
      '#FCD34D', '#FBBF24', '#F59E0B', '#F97316', 
      '#EF4444', '#E11D48', '#BE185D', '#DB2777',
      '#C026D3', '#A855F7', '#8B5CF6', '#6366F1',
      '#3B82F6', '#2563EB', '#1D4ED8', '#0EA5E9',
      '#06B6D4', '#0D9488', '#10B981', '#34D399'
    ];
    
    return colors.map((color, index) => {
      const rotate = index * (360 / colors.length);
      return (
        <View 
          key={index} 
          style={[
            styles.coloredSegment, 
            { 
              transform: [{ rotate: `${rotate}deg` }],
              backgroundColor: color 
            }
          ]} 
        />
      );
    });
  };

  const toggleSwitch = () => {
    setIsToggleOn(!isToggleOn);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color="#000" />
          </TouchableOpacity>
          <View style={styles.headerRight}>
            <TouchableOpacity 
              style={[styles.toggleSwitch, isToggleOn ? styles.toggleSwitchActive : {}]} 
              onPress={toggleSwitch}
            >
              <View style={[styles.toggleSwitchCircle, isToggleOn ? styles.toggleSwitchCircleActive : {}]} />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Air Conditioning</Text>
          <Text style={styles.subtitle}>Master bedroom</Text>
        </View>
        
        <View style={styles.mainContent}>
          <View style={styles.usageCircle}>
            <View style={styles.circleBackground}>
              {generateSegments()}
            </View>
            <View style={styles.usageValueContainer}>
              <Text style={styles.usageValue}>331</Text>
              <Text style={styles.usageUnit}>kWh</Text>
            </View>
            <Text style={styles.usageLabel}>this month</Text>
          </View>
          
          <View style={styles.statsSection}>
            <Text style={styles.statsTitle}>Room statistics</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="thermometer-outline" size={30} color="#3B82F6" />
                </View>
                <Text style={styles.statLabel}>Average Temp</Text>
                <Text style={styles.statValue}>21°C</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="time-outline" size={30} color="#3B82F6" />
                </View>
                <Text style={styles.statLabel}>Time Used</Text>
                <Text style={styles.statValue}>79 Hours</Text>
              </View>
              
              <View style={styles.statCard}>
                <View style={styles.statIcon}>
                  <Ionicons name="analytics-outline" size={30} color="#3B82F6" />
                </View>
                <Text style={styles.statLabel}>Daily Average</Text>
                <Text style={styles.statValue}>11 kWh</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.viewReportButton}>
              <Text style={styles.viewReportButtonText}>View Report</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentWrapper: {
    padding: Platform.OS === 'web' ? '2% 15%' : 20,
    maxWidth: 1200,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  backButton: {
    padding: 5,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleSwitch: {
    width: 60,
    height: 30,
    backgroundColor: '#E5E7EB',
    borderRadius: 15,
    position: 'relative',
    justifyContent: 'center',
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: '#3B82F6',
  },
  toggleSwitchCircle: {
    width: 26,
    height: 26,
    backgroundColor: 'white',
    borderRadius: 13,
    position: 'absolute',
    left: 2,
  },
  toggleSwitchCircleActive: {
    left: 'auto',
    right: 2,
  },
  titleContainer: {
    marginTop: 20,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    color: '#6B7280',
    marginTop: 5,
  },
  mainContent: {
    flexDirection: Platform.OS === 'web' ? 'row' : 'column',
    justifyContent: 'space-between',
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
    marginTop: 30,
  },
  usageCircle: {
    width: Platform.OS === 'web' ? 400 : 300,
    height: Platform.OS === 'web' ? 400 : 300,
    borderRadius: Platform.OS === 'web' ? 200 : 150,
    backgroundColor: 'white',
    marginVertical: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  circleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: Platform.OS === 'web' ? 200 : 150,
    overflow: 'hidden',
  },
  coloredSegment: {
    position: 'absolute',
    top: 0,
    left: '50%',
    width: 10,
    height: '50%',
    transformOrigin: 'bottom center',
  },
  usageValueContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    zIndex: 1,
  },
  usageValue: {
    fontSize: Platform.OS === 'web' ? 64 : 48,
    fontWeight: '700',
  },
  usageUnit: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '500',
    marginLeft: 5,
    marginBottom: 8,
  },
  usageLabel: {
    fontSize: Platform.OS === 'web' ? 20 : 16,
    color: '#6B7280',
    marginTop: 5,
    zIndex: 1,
  },
  statsSection: {
    flex: Platform.OS === 'web' ? 1 : undefined,
    marginLeft: Platform.OS === 'web' ? 40 : 0,
    width: Platform.OS === 'web' ? '50%' : '100%',
  },
  statsTitle: {
    fontSize: Platform.OS === 'web' ? 32 : 24,
    fontWeight: '600',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  statCard: {
    width: Platform.OS === 'web' ? '30%' : '30%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  statIcon: {
    width: 50,
    height: 50,
    marginBottom: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: Platform.OS === 'web' ? 16 : 14,
    color: '#6B7280',
    marginBottom: 5,
    textAlign: 'center',
  },
  statValue: {
    fontSize: Platform.OS === 'web' ? 24 : 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  viewReportButton: {
    backgroundColor: '#3B82F6',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: Platform.OS === 'web' ? 'flex-start' : 'center',
    marginBottom: 30,
  },
  viewReportButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '500',
  },
});