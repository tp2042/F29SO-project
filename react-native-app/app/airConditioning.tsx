import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withTiming, useSharedValue } from 'react-native-reanimated';

export default function AirConditioningScreen() {
  const router = useRouter();
  const [isToggleOn, setIsToggleOn] = useState(true);
  const progress = useSharedValue(0);
  const currentValue = 720; // Static value
  
  useEffect(() => {
    progress.value = withTiming(1, { duration: 1500 });
  }, []);

  const generateGradientSegments = () => {
    const totalSegments = 60;
    const segments = [];
    
    for (let i = 0; i < totalSegments; i++) {
      const hue = (i * (360 / totalSegments)) % 360;
      const progress = currentValue / 1000;
      const opacity = i / totalSegments <= progress ? 1 : 0.2;
      
      segments.push(
        <View 
          key={i} 
          style={[
            styles.segment,
            {
              transform: [{ rotate: `${i * (360 / totalSegments)}deg` }],
              backgroundColor: `hsla(${hue}, 70%, 50%, ${opacity})`,
            }
          ]} 
        />
      );
    }
    return segments;
  };

  const toggleSwitch = () => {
    setIsToggleOn(!isToggleOn);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: progress.value }],
      opacity: progress.value,
    };
  });

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
          <Animated.View style={[styles.progressContainer, animatedStyle]}>
            <View style={styles.progressBackground}>
              {generateGradientSegments()}
            </View>
            <View style={styles.centerCircle} />
            <View style={styles.controlsOverlay}>
              <View style={styles.valueContainer}>
                <Text style={styles.valueText}>720</Text>
                <Text style={styles.unitText}>kWh</Text>
              </View>
            </View>
          </Animated.View>
          
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
  progressContainer: {
    width: Platform.OS === 'web' ? 400 : 300,
    height: Platform.OS === 'web' ? 400 : 300,
    position: 'relative',
    marginVertical: 30,
  },
  progressBackground: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    borderRadius: Platform.OS === 'web' ? 200 : 150,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  centerCircle: {
    position: 'absolute',
    width: '70%',
    height: '70%',
    borderRadius: 1000,
    backgroundColor: 'white',
    top: '15%',
    left: '15%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1,
  },
  segment: {
    position: 'absolute',
    width: 6,
    height: '50%',
    left: '50%',
    top: 0,
    transformOrigin: 'bottom center',
  },
  controlsOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  valueContainer: {
    alignItems: 'center',
  },
  valueText: {
    fontSize: Platform.OS === 'web' ? 64 : 48,
    fontWeight: '700',
    color: '#1F2937',
  },
  unitText: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    color: '#6B7280',
    marginTop: 5,
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