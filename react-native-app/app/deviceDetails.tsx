import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "./ThemeContext";
import axios from 'axios';

export default function DeviceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const secondaryTextColor = isDarkMode ? "#DDD" : "#6B7280";
    const cardBackground = isDarkMode ? "#222" : "#fff";

    const {
        deviceId,
        deviceName = 'Device',
        roomName = 'Room',
        roomId = '', // Fixed: Properly extract roomId with default value
        energyUsage = 0,
        unit = 'kWh',
        averageTemp,
        lightLevel,
        isOn = true,
        householdId = ''
    } = (route.params as {
        deviceId: string;
        deviceName?: string;
        roomName?: string;
        roomId?: string;
        energyUsage?: number;
        unit?: string;
        averageTemp?: number;
        lightLevel?: number;
        isOn?: boolean;
        householdId?: string;
    }) || {};

    const [isToggleOn, setIsToggleOn] = useState(isOn);
    const [timeUsed, setTimeUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [energyData, setEnergyData] = useState(null);
    const [isUpdating, setIsUpdating] = useState(false); // Added to track toggle updates

    // Fetch energy data for the device
    useEffect(() => {
        if (deviceId) {
            fetchDeviceEnergyData();
        } else {
            setIsLoading(false);
        }
    }, [deviceId]);

    const fetchDeviceEnergyData = async () => {
        setIsLoading(true);
        try {
            // Get current date for the API request
            const today = new Date();
            const startDate = new Date(today);
            startDate.setDate(today.getDate() - 7); // Get data for the last week

            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = today.toISOString().split('T')[0];

            // Construct the API URL
            const url = `http://localhost:5003/device_energy/${deviceId}`;
            
            // Make API request using axios
            const response = await axios.get(url, {
                params: {
                    household_id: householdId,
                    start_date: startDateStr,
                    end_date: endDateStr,
                    limit: 7
                },
                timeout: 10000 
            });
            
            // axios automatically parses JSON and puts data in response.data
            const data = response.data;
            setEnergyData(data);
            
            // Calculate time used based on energy data
            if (data && data.length > 0) {
                // Assuming each entry represents an hour of usage
                setTimeUsed(data.length);
            }
        } catch (error) {
            console.error('Error fetching device energy data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const toggleSwitch = async () => {
        const newState = !isToggleOn;
        
        // Immediately update UI for better user experience
        setIsToggleOn(newState);
        setIsUpdating(true);
        
        try {
            await axios.put(`http://localhost:5003/update_device/${deviceId}`, {
                is_active: newState  // Note: the key is 'is_active', not 'isOn'
            });
            
            // If successful, the UI is already updated
        } catch (error) {
            console.error('Error updating device state:', error);
            
            // Revert to the original state if the API call fails
            setIsToggleOn(!newState);
            
            // You could also add an error message here
            // setErrorMessage("Failed to update device status. Please try again.");
        } finally {
            setIsUpdating(false);
        }
    };

    // Get the icon based on device energy usage
    const getDeviceIcon = () => {
        if (energyData && energyData.length > 0) {
            const deviceType = energyData[0].device_type;
            
            switch(deviceType) {
                case 'light': return 'bulb-outline';
                case 'climate': return 'thermometer-outline';
                case 'entertainment': return 'tv-outline';
                case 'power': return 'flash-outline';
                case 'security': return 'shield-outline';
                default: return 'hardware-chip-outline';
            }
        }
        return 'hardware-chip-outline';
    };

    // Calculate energy percentage for the donut chart
    const calculateEnergyPercentage = () => {
        if (energyData && energyData.length > 0) {
            // This is just an example - adjust based on your actual data
            const currentEnergy = energyData[0].energy_consumed;
            const maxEnergy = 10; // Example max value - adjust based on your needs
            return Math.min(100, (currentEnergy / maxEnergy) * 100);
        }
        return 0;
    };

    const energyPercentage = calculateEnergyPercentage();

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#1A1A1A" : "#f5f5f5" }]}>
            <View style={styles.wrapper}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Ionicons name="chevron-back" size={30} color={textColor} />
                    </TouchableOpacity>
                    {isUpdating ? (
                        <ActivityIndicator size="small" color="#8B5CF6" />
                    ) : (
                        <Switch
                            value={isToggleOn}
                            onValueChange={toggleSwitch}
                            trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                            thumbColor={isToggleOn ? '#ffffff': "#8B5CF6"}
                            disabled={isLoading || isUpdating}
                        />
                    )}
                </View>

                {/* Title */}
                <View style={styles.titleContainer}>
                    <Text style={[styles.title, {color: textColor}]}>{deviceName}</Text>
                    <Text style={[styles.subtitle, {color: secondaryTextColor}]}>{roomName}</Text>
                </View>

                {/* Main Content */}
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={[styles.loadingText, {color: textColor}]}>Loading device data...</Text>
                    </View>
                ) : (
                    <View style={styles.mainContent}>
                        {/* Energy Consumption Circle */}
                        <View style={[styles.energySection, {flex: 1}]}>
                            <View style={styles.progressContainer}>
                                <View style={[styles.progressBackground, { backgroundColor: isDarkMode ? "#333" : "#f0f0f0" }]} />
                                
                                {/* Added progress indicator (donut chart) */}
                                <View style={[
                                    styles.progressIndicator, 
                                    { 
                                        backgroundColor: '#8B5CF6',
                                        width: `${energyPercentage}%`,
                                        opacity: 0.7
                                    }
                                ]} />
                                
                                <View style={[styles.centerCircle, {backgroundColor: cardBackground}]}>
                                    <Ionicons name={getDeviceIcon()} size={36} color="#8B5CF6" style={styles.deviceIcon} />
                                    <Text style={[styles.valueText, {color: textColor}]}>
                                        {energyData && energyData.length > 0 
                                            ? energyData[0].energy_consumed 
                                            : energyUsage}
                                    </Text>
                                    <Text style={[styles.unitText, {color: secondaryTextColor}]}>{unit}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Stats */}
                        <View style={[styles.statsSection, {flex: 1}]}>
                            <Text style={[styles.statsTitle, {color: textColor}]}>Device statistics</Text>
                            <View style={styles.statsGrid}>
                                {averageTemp !== undefined && (
                                    <View style={[styles.statCard, {backgroundColor: cardBackground}]}>
                                        <Ionicons name="thermometer-outline" size={30} color="#8B5CF6" />
                                        <Text style={[styles.statLabel, {color: secondaryTextColor}]}>Temperature</Text>
                                        <Text style={[styles.statValue, {color: textColor}]}>{averageTemp}°C</Text>
                                    </View>
                                )}
                                {lightLevel !== undefined && (
                                    <View style={[styles.statCard, {backgroundColor: cardBackground}]}>
                                        <Ionicons name="sunny-outline" size={30} color="#8B5CF6" />
                                        <Text style={[styles.statLabel, {color: secondaryTextColor}]}>Light Level</Text>
                                        <Text style={[styles.statValue, {color: textColor}]}>{lightLevel}%</Text>
                                    </View>
                                )}
                                <View style={[styles.statCard, {backgroundColor: cardBackground}]}>
                                    <Ionicons name="time-outline" size={30} color="#8B5CF6" />
                                    <Text style={[styles.statLabel, {color: secondaryTextColor}]}>Time Used</Text>
                                    <Text style={[styles.statValue, {color: textColor}]}>{timeUsed} Hours</Text>
                                </View>
                                <View style={[styles.statCard, {backgroundColor: cardBackground}]}>
                                    <Ionicons name="power-outline" size={30} color="#8B5CF6" />
                                    <Text style={[styles.statLabel, {color: secondaryTextColor}]}>Status</Text>
                                    <Text style={[styles.statValue, {color: textColor}]}>{isToggleOn ? 'Active' : 'Inactive'}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { 
        flex: 1
    },
    wrapper: {
        padding: 20,
        maxWidth: 1200,
        alignSelf: 'center',
        width: '100%',
    },
    header: {
        marginTop: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    backButton: { 
        padding: 5 
    },
    titleContainer: { 
        marginTop: 20 
    },
    title: { 
        fontSize: 36, 
        fontWeight: '600' 
    },
    subtitle: { 
        fontSize: 18, 
        marginTop: 5 
    },
    loadingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 50,
        marginBottom: 50,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    mainContent: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: 30,
    },
    energySection: {
        alignItems: 'center',
        minWidth: 300,
    },
    progressContainer: {
        width: 280,
        height: 280,
        position: 'relative',
        marginBottom: 30,
        borderRadius: 140,
        overflow: 'hidden',
    },
    progressBackground: {
        width: '100%',
        height: '100%',
        borderRadius: 140,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    // Added new progress indicator style
    progressIndicator: {
        position: 'absolute',
        height: '100%',
        left: 0,
        borderRadius: 140,
    },
    centerCircle: {
        position: 'absolute',
        width: '70%',
        height: '70%',
        borderRadius: 1000,
        top: '15%',
        left: '15%',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    deviceIcon: {
        marginBottom: 10,
    },
    valueText: { 
        fontSize: 42, 
        fontWeight: '700',
    },
    unitText: { 
        fontSize: 18, 
        marginTop: 5 
    },
    statsSection: { 
        minWidth: 300,
        paddingLeft: 20,
    },
    statsTitle: { 
        fontSize: 24, 
        fontWeight: '600', 
        marginBottom: 20 
    },
    statsGrid: { 
        flexDirection: 'row', 
        flexWrap: 'wrap', 
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%',
        borderRadius: 15,
        padding: 15,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
        marginBottom: 15,
        minHeight: 120,
    },
    statLabel: { 
        fontSize: 14,
        marginTop: 8,
        marginBottom: 5, 
        textAlign: 'center' 
    },
    statValue: { 
        fontSize: 20, 
        fontWeight: '600', 
        textAlign: 'center' 
    },
});