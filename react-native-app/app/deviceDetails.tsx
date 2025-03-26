import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch, ActivityIndicator, Modal, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "./ThemeContext";
import axios from 'axios';
// Import a web-compatible time picker
import DateTimePicker from '@react-native-community/datetimepicker';

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
        roomId = '',
        energyUsage = 0,
        unit = 'kWh',
        averageTemp,
        lightLevel,
        isOn = true,
        householdId = ''
    } = (route.params || {});

    // Other states and variables from your original code
    const [isToggleOn, setIsToggleOn] = useState(isOn);
    const [timeUsed, setTimeUsed] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [energyData, setEnergyData] = useState([]);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showStartTimePicker, setShowStartTimePicker] = useState(false);
    const [showEndTimePicker, setShowEndTimePicker] = useState(false);
    const [showDaySelectionModal, setShowDaySelectionModal] = useState(false);
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    
    // States for schedule and diagnostics
    const [schedules, setSchedules] = useState([]);
    const [isScheduleModalVisible, setIsScheduleModalVisible] = useState(false);
    const [newSchedule, setNewSchedule] = useState({ 
        start_time: '08:00',
        end_time: '17:00',
        repeat_days: 'Mon,Wed,Fri',
        is_active: true
    });
    const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Fri']);
    const [isRunningDiagnostics, setIsRunningDiagnostics] = useState(false);
    const [diagnosticsProgress, setDiagnosticsProgress] = useState(0);
    const [diagnosticsModalVisible, setDiagnosticsModalVisible] = useState(false);

    // API base URL - move to environment variable in production
    const API_BASE_URL = 'https://backend-1-y12u.onrender.com';

    // Keeping all the functions from your original code
    useEffect(() => {
        if (deviceId) {
            fetchDeviceEnergyData();
            fetchDeviceSchedules();
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
            const url = `${API_BASE_URL}/device_energy/${deviceId}`;
            
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
            
            // Set energy data from response
            setEnergyData(response.data || []);
            
            // Calculate time used based on energy data
            if (response.data && response.data.length > 0) {
                // Assuming each entry represents an hour of usage
                setTimeUsed(response.data.length);
            }
        } catch (error) {
            console.error('Error fetching device energy data:', error);
            // Set fallback data for testing/development
            setEnergyData([{
                device_type: 'light',
                energy_consumed: energyUsage
            }]);
        } finally {
            setIsLoading(false);
        }
    };
    
    // Toggle day selection
    const toggleDay = (day) => {
        if (selectedDays.includes(day)) {
            setSelectedDays(selectedDays.filter(d => d !== day));
        } else {
            setSelectedDays([...selectedDays, day]);
        }
    };
    
    // Confirm day selection for schedule
    const confirmDaySelection = () => {
        setNewSchedule({
            ...newSchedule, 
            repeat_days: selectedDays.join(',')
        });
        setShowDaySelectionModal(false);
    };
    
    // Toggle schedule active state
    const toggleScheduleActive = async (scheduleId, currentState) => {
        const scheduleIdInt = typeof scheduleId === 'string' ? parseInt(scheduleId, 10) : deviceId;
        try {
            setIsUpdating(true);
            await axios.put(`${API_BASE_URL}/update_device_schedule/${scheduleIdInt}`, {
                is_active: !currentState
            });
            await fetchDeviceSchedules(); // Refresh schedules
        } catch (error) {
            console.error('Error updating schedule:', error);
            Alert.alert('Error', 'Failed to update schedule');
        } finally {
            setIsUpdating(false);
        }
    };

    // Delete schedule
    const deleteSchedule = async (scheduleId) => {
        const scheduleIdInt = typeof scheduleId === 'string' ? parseInt(scheduleId, 10) : scheduleId;
        try {
            setIsUpdating(true);
            await axios.delete(`${API_BASE_URL}/delete_schedule/${scheduleIdInt}`);
            await fetchDeviceSchedules(); // Refresh schedules
            Alert.alert('Success', 'Schedule deleted successfully');
        } catch (error) {
            console.error('Error deleting schedule:', error);
            Alert.alert('Error', 'Failed to delete schedule');
        } finally {
            setIsUpdating(false);
        }
    };
    
    const fetchDeviceSchedules = async () => {
        try {
            if (!deviceId) return;
            
            // Parse deviceId as integer if it's a string
            const deviceIdInt = typeof deviceId === 'string' ? parseInt(deviceId, 10) : deviceId;
            
            const response = await axios.get(`${API_BASE_URL}/get_device_schedule/${deviceIdInt}`);
            setSchedules(response.data || []);
        } catch (error) {
            console.error('Error fetching device schedules:', error);
            // Set some dummy data for testing
            setSchedules([
                {
                    id: 1,
                    start_time: '08:00',
                    end_time: '17:00',
                    repeat_days: 'Mon,Wed,Fri',
                    is_active: true
                }
            ]);
        }
    };

    // Function to save a new schedule
    const saveSchedule = async () => {
        try {
            setIsUpdating(true);
            
            // Parse deviceId as integer if it's a string
            const deviceIdInt = typeof deviceId === 'string' ? parseInt(deviceId, 10) : deviceId;
            
            // Format the schedule data
            const formattedSchedule = {
                ...newSchedule,
                start_time: newSchedule.start_time.includes(':') ? 
                            newSchedule.start_time : 
                            `${newSchedule.start_time}:00`,
                end_time: newSchedule.end_time.includes(':') ? 
                         newSchedule.end_time : 
                         `${newSchedule.end_time}:00`,
            };
            
            await axios.post(`${API_BASE_URL}/create_device_schedule/${deviceIdInt}`, formattedSchedule);
            
            await fetchDeviceSchedules(); // Refresh schedules
            setIsScheduleModalVisible(false);
            Alert.alert('Success', 'Schedule created successfully');
        } catch (error) {
            console.error('Error creating schedule:', error);
            Alert.alert('Error', 'Failed to create schedule');
        } finally {
            setIsUpdating(false);
        }
    };
    
    // Handle time change for schedule
    const onStartTimeChange = (event, selectedTime) => {
        setShowStartTimePicker(false);
        if (selectedTime) {
            const timeString = selectedTime.toTimeString().slice(0, 5); // Format as HH:MM
            setNewSchedule({...newSchedule, start_time: timeString});
        }
    };

    const onEndTimeChange = (event, selectedTime) => {
        setShowEndTimePicker(false);
        if (selectedTime) {
            const timeString = selectedTime.toTimeString().slice(0, 5); // Format as HH:MM
            setNewSchedule({...newSchedule, end_time: timeString});
        }
    };
    
    // Toggle device on/off
    // Toggle device on/off
// Toggle device on/off
const toggleSwitch = async () => {
    const newState = !isToggleOn;
    
    // Immediately update UI for better user experience
    setIsToggleOn(newState);
    setIsUpdating(true);
    
    try {
        // Update device state on the server
        await axios.put(`${API_BASE_URL}/update_device/${deviceId}`, {
            is_active: newState
        });
        
        // If device is turned ON, fetch energy data
        if (newState === true) {
            await fetchDeviceEnergyData();
        } 
        // If device is turned OFF, reset energy data to 0
        else {
            setEnergyData([{
                device_type: energyData && energyData.length > 0 ? energyData[0].device_type : 'light',
                energy_consumed: 0
            }]);
            setTimeUsed(0);
        }
        
    } catch (error) {
        console.error('Error updating device state:', error);
        
        // Revert to the original state if the API call fails
        setIsToggleOn(!newState);
        Alert.alert('Error', 'Failed to update device state');
    } finally {
        setIsUpdating(false);
    }
};

    // Run diagnostics
    const runDiagnostics = () => {
        setDiagnosticsModalVisible(true);
        setIsRunningDiagnostics(true);
        setDiagnosticsProgress(0);
        
        // Simulate the diagnostics progress
        const interval = setInterval(() => {
            setDiagnosticsProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setIsRunningDiagnostics(false);
                    return 100;
                }
                return prev + 10;
            });
        }, 500);
    };

    // Get device icon based on type
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

    // Calculate energy percentage for visual representation
    const calculateEnergyPercentage = () => {
        if (energyData && energyData.length > 0) {
            const currentEnergy = energyData[0].energy_consumed;
            const maxEnergy = 10; // Example max value - adjust based on your needs
            return Math.min(100, (currentEnergy / maxEnergy) * 100);
        }
        return 0;
    };

    // Format energy value
    const getFormattedEnergyValue = () => {
        if (energyData && energyData.length > 0) {
            const value = energyData[0].energy_consumed;
            return value.toFixed(1);
        }
        return energyUsage.toFixed(1);
    };

    const energyPercentage = calculateEnergyPercentage();

    // Handle time input for web platforms
    const handleTimeInput = (type, value) => {
        if (type === 'start') {
            setNewSchedule({...newSchedule, start_time: value});
        } else {
            setNewSchedule({...newSchedule, end_time: value});
        }
    };

    // Schedule Modal Content - Modified for web compatibility
    const ScheduleModal = () => (
        <Modal
            visible={isScheduleModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsScheduleModalVisible(false)}
        >
            <View style={[styles.modalContainer, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'}]}>
                <View style={[styles.modalContent, {backgroundColor: cardBackground}]}>
                    <Text style={[styles.modalTitle, {color: textColor}]}>Set Device Schedule</Text>
                    
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, {color: secondaryTextColor}]}>Start Time</Text>
                        {Platform.OS === 'web' ? (
                            <input
                                type="time"
                                value={newSchedule.start_time}
                                onChange={(e) => handleTimeInput('start', e.target.value)}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    width: '100%',
                                    backgroundColor: isDarkMode ? '#333' : '#F0F0F0',
                                    color: textColor,
                                    border: 'none'
                                }}
                            />
                        ) : (
                            <>
                                <TouchableOpacity 
                                    style={[styles.input, {backgroundColor: isDarkMode ? '#333' : '#F0F0F0'}]}
                                    onPress={() => setShowStartTimePicker(true)}
                                >
                                    <Text style={{color: textColor}}>{newSchedule.start_time || 'Select time'}</Text>
                                </TouchableOpacity>

                                {showStartTimePicker && (
                                    <DateTimePicker
                                        value={new Date(`2023-01-01T${newSchedule.start_time || '08:00'}`)}
                                        mode="time"
                                        is24Hour={true}
                                        display="default"
                                        onChange={onStartTimeChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                    
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, {color: secondaryTextColor}]}>End Time</Text>
                        {Platform.OS === 'web' ? (
                            <input
                                type="time"
                                value={newSchedule.end_time}
                                onChange={(e) => handleTimeInput('end', e.target.value)}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    width: '100%',
                                    backgroundColor: isDarkMode ? '#333' : '#F0F0F0',
                                    color: textColor,
                                    border: 'none'
                                }}
                            />
                        ) : (
                            <>
                                <TouchableOpacity 
                                    style={[styles.input, {backgroundColor: isDarkMode ? '#333' : '#F0F0F0'}]}
                                    onPress={() => setShowEndTimePicker(true)}
                                >
                                    <Text style={{color: textColor}}>{newSchedule.end_time || 'Select time'}</Text>
                                </TouchableOpacity>

                                {showEndTimePicker && (
                                    <DateTimePicker
                                        value={new Date(`2023-01-01T${newSchedule.end_time || '17:00'}`)}
                                        mode="time"
                                        is24Hour={true}
                                        display="default"
                                        onChange={onEndTimeChange}
                                    />
                                )}
                            </>
                        )}
                    </View>
                    
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, {color: secondaryTextColor}]}>Repeat on</Text>
                        <TouchableOpacity 
                            style={[styles.input, {backgroundColor: isDarkMode ? '#333' : '#F0F0F0'}]}
                            onPress={() => setShowDaySelectionModal(true)}
                        >
                            <Text style={{color: textColor}}>{newSchedule.repeat_days || 'Select days'}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, {color: secondaryTextColor}]}>Active</Text>
                        <Switch
                            value={newSchedule.is_active}
                            onValueChange={(value) => setNewSchedule({...newSchedule, is_active: value})}
                            trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                            thumbColor={newSchedule.is_active ? '#ffffff' : "#8B5CF6"}
                        />
                    </View>
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: isDarkMode ? '#333' : '#E5E7EB'}]}
                            onPress={() => setIsScheduleModalVisible(false)}
                        >
                            <Text style={{color: textColor}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: '#8B5CF6'}]}
                            onPress={saveSchedule}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                                <Text style={{color: 'white'}}>Save</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // Diagnostics Modal Content - Fixed to prevent reappearing
    const DiagnosticsModal = () => (
        <Modal
            visible={diagnosticsModalVisible}
            transparent={true}
            animationType="slide"
            onRequestClose={() => {
                if (!isRunningDiagnostics) {
                    setDiagnosticsModalVisible(false);
                }
            }}
        >
            <View style={[styles.modalContainer, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'}]}>
                <View style={[styles.modalContent, {backgroundColor: cardBackground}]}>
                    <Text style={[styles.modalTitle, {color: textColor}]}>Running Diagnostics</Text>
                    
                    <View style={styles.diagnosticsContainer}>
                        <View style={[styles.progressBar, {backgroundColor: isDarkMode ? '#333' : '#F0F0F0'}]}>
                            <View 
                                style={[
                                    styles.progressFill, 
                                    {width: `${diagnosticsProgress}%`, backgroundColor: '#8B5CF6'}
                                ]} 
                            />
                        </View>
                        <Text style={[styles.progressText, {color: textColor}]}>{diagnosticsProgress}%</Text>
                        
                        {isRunningDiagnostics ? (
                            <View style={styles.diagnosticsInfo}>
                                <ActivityIndicator size="small" color="#8B5CF6" />
                                <Text style={[styles.diagnosticsText, {color: secondaryTextColor}]}>
                                    {diagnosticsProgress < 30 ? 'Checking power supply...' :
                                     diagnosticsProgress < 60 ? 'Analyzing performance metrics...' :
                                     'Verifying network connectivity...'}
                                </Text>
                            </View>
                        ) : (
                            <View style={styles.diagnosticsInfo}>
                                <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                                <Text style={[styles.diagnosticsText, {color: secondaryTextColor}]}>
                                    Diagnostics complete
                                </Text>
                            </View>
                        )}
                    </View>
                    
                    {!isRunningDiagnostics && (
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: '#8B5CF6', alignSelf: 'center', marginTop: 20}]}
                            onPress={() => setDiagnosticsModalVisible(false)}
                        >
                            <Text style={{color: 'white'}}>Close</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        </Modal>
    );

    // Day Selection Modal
    const DaySelectionModal = () => (
        <Modal
            visible={showDaySelectionModal}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowDaySelectionModal(false)}
        >
            <View style={[styles.modalContainer, {backgroundColor: isDarkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)'}]}>
                <View style={[styles.modalContent, {backgroundColor: cardBackground}]}>
                    <Text style={[styles.modalTitle, {color: textColor}]}>Select Days</Text>
                    
                    <View style={styles.daysContainer}>
                        {days.map(day => (
                            <TouchableOpacity 
                                key={day}
                                style={[
                                    styles.dayButton,
                                    {backgroundColor: selectedDays.includes(day) ? '#8B5CF6' : isDarkMode ? '#333' : '#F0F0F0'}
                                ]}
                                onPress={() => toggleDay(day)}
                            >
                                <Text style={{color: selectedDays.includes(day) ? 'white' : textColor}}>{day}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    
                    <View style={styles.modalButtons}>
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: isDarkMode ? '#333' : '#E5E7EB'}]}
                            onPress={() => setShowDaySelectionModal(false)}
                        >
                            <Text style={{color: textColor}}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalButton, {backgroundColor: '#8B5CF6'}]}
                            onPress={confirmDaySelection}
                        >
                            <Text style={{color: 'white'}}>Confirm</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    // IMPROVED Donut chart component
    const DonutChart = () => {
        // Convert percentage to angle for SVG arc
        const percentage = energyPercentage;
        const radius = 100;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (percentage / 100) * circumference;
        
        return (
            <View style={styles.donutWrapper}>
                <View style={styles.svgContainer}>
                    <View style={styles.svgWrapper}>
                        {/* This is a circular background */}
                        <View style={[styles.circle, {
                            width: radius * 2,
                            height: radius * 2,
                            borderRadius: radius,
                            backgroundColor: isDarkMode ? "#333" : "#f0f0f0"
                        }]} />
                        
                        {/* This is the actual progress circle */}
                        <View style={[styles.progressRing, {
                            width: radius * 2,
                            height: radius * 2,
                            borderRadius: radius,
                            borderWidth: 20,
                            borderColor: '#8B5CF6',
                            transform: [
                                {rotate: `${-90 + (percentage * 3.6)}deg`}
                            ],
                            borderTopColor: isDarkMode ? "#333" : "#f0f0f0",
                            borderRightColor: percentage <= 25 ? (isDarkMode ? "#333" : "#f0f0f0") : '#8B5CF6',
                            borderBottomColor: percentage <= 75 ? (isDarkMode ? "#333" : "#f0f0f0") : '#8B5CF6',
                            borderLeftColor: percentage <= 50 ? (isDarkMode ? "#333" : "#f0f0f0") : '#8B5CF6',
                        }]} />
                    </View>
                    
                    <View style={styles.donutCenter}>
                        <Text style={[styles.donutLabel, {color: textColor}]}>
                            {getFormattedEnergyValue()}
                        </Text>
                        <Text style={[styles.donutUnit, {color: secondaryTextColor}]}>
                            {unit}
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    // Render main component
    return (
        <View style={[styles.container, {backgroundColor}]}>
            <ScrollView 
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={styles.backButton} 
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="arrow-back" size={24} color={textColor} />
                    </TouchableOpacity>
                    <Text style={[styles.headerTitle, {color: textColor}]}>{deviceName}</Text>
                </View>
                
                {/* Device Status */}
                <View style={[styles.deviceStatusCard, {backgroundColor: cardBackground}]}>
                    <View style={styles.iconContainer}>
                        <Ionicons name={getDeviceIcon()} size={38} color="#8B5CF6" />
                        {isToggleOn && (
                            <View style={styles.activeIndicator} />
                        )}
                    </View>
                    
                    <View style={styles.deviceInfo}>
                        <Text style={[styles.deviceName, {color: textColor}]}>{deviceName}</Text>
                        <Text style={[styles.roomName, {color: secondaryTextColor}]}>{roomName}</Text>
                    </View>
                    
                    <View style={styles.switchContainer}>
                        {isUpdating ? (
                            <ActivityIndicator size="small" color="#8B5CF6" />
                        ) : (
                            <Switch
                                value={isToggleOn}
                                onValueChange={toggleSwitch}
                                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                                thumbColor={isToggleOn ? '#ffffff' : "#8B5CF6"}
                            />
                        )}
                    </View>
                </View>
                
                {/* Device Energy Usage */}
                <View style={[styles.cardContainer, {backgroundColor: cardBackground}]}>
                    <Text style={[styles.cardTitle, {color: textColor}]}>Energy Consumption</Text>
                    
                    {isLoading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#8B5CF6" />
                        </View>
                    ) : (
                        <View style={styles.energyContainer}>
                            <DonutChart />
                            <View style={styles.energyDetailsContainer}>
                                <View style={styles.energyDetail}>
                                    <Text style={[styles.detailValue, {color: textColor}]}>{timeUsed}</Text>
                                    <Text style={[styles.detailLabel, {color: secondaryTextColor}]}>Hours Used</Text>
                                </View>
                                <View style={styles.divider} />
                                <View style={styles.energyDetail}>
                                    <Text style={[styles.detailValue, {color: textColor}]}>
                                        {averageTemp ? `${averageTemp}°C` : 'N/A'}
                                    </Text>
                                    <Text style={[styles.detailLabel, {color: secondaryTextColor}]}>Avg. Temp</Text>
                                </View>
                            </View>
                        </View>
                    )}
                </View>
                
                {/* Device Schedules */}
                <View style={[styles.cardContainer, {backgroundColor: cardBackground}]}>
                    <View style={styles.sectionHeader}>
                        <Text style={[styles.cardTitle, {color: textColor}]}>Device Schedule</Text>
                        <TouchableOpacity 
                            style={styles.addButton}
                            onPress={() => {
                                setNewSchedule({
                                    start_time: '08:00',
                                    end_time: '17:00',
                                    repeat_days: 'Mon,Wed,Fri',
                                    is_active: true
                                });
                                setSelectedDays(['Mon', 'Wed', 'Fri']);
                                setIsScheduleModalVisible(true);
                            }}
                        >
                            <Ionicons name="add-circle-outline" size={24} color="#8B5CF6" />
                        </TouchableOpacity>
                    </View>
                    
                    {schedules.length === 0 ? (
                        <View style={styles.emptySchedule}>
                            <Text style={{color: secondaryTextColor}}>No schedules set</Text>
                        </View>
                    ) : (
                        schedules.map((schedule, index) => (
                            <View key={index} style={styles.scheduleItem}>
                                <View style={styles.scheduleInfo}>
                                    <Text style={[styles.scheduleTime, {color: textColor}]}>
                                        {schedule.start_time} - {schedule.end_time}
                                    </Text>
                                    <Text style={[styles.scheduleDays, {color: secondaryTextColor}]}>
                                        {schedule.repeat_days}
                                    </Text>
                                </View>
                                
                                <View style={styles.scheduleActions}>
                                    <TouchableOpacity
                                        onPress={() => deleteSchedule(schedule.id)}
                                        style={styles.actionButton}
                                    >
                                        <Ionicons name="trash-outline" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                    
                                    <Switch
                                        value={schedule.is_active}
                                        onValueChange={() => toggleScheduleActive(schedule.id, schedule.is_active)}
                                        trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                                        thumbColor={schedule.is_active ? '#ffffff' : "#8B5CF6"}
                                        style={{transform: [{scaleX: 0.8}, {scaleY: 0.8}]}}
                                    />
                                </View>
                            </View>
                        ))
                    )}
                </View>
                
                {/* Device Controls */}
                <View style={[styles.cardContainer, {backgroundColor: cardBackground, marginBottom: 20}]}>
                    <Text style={[styles.cardTitle, {color: textColor}]}>Device Controls</Text>
                    
                    <TouchableOpacity 
                        style={styles.controlButton}
                        onPress={runDiagnostics}
                    >
                        <Ionicons name="pulse-outline" size={24} color="#8B5CF6" />
                        <Text style={[styles.controlText, {color: textColor}]}>Run Diagnostics</Text>
                        <Ionicons name="chevron-forward" size={20} color={secondaryTextColor} />
                    </TouchableOpacity>
                </View>
            </ScrollView>
            
            {/* Modals */}
            <ScheduleModal />
            <DiagnosticsModal />
            <DaySelectionModal />
        </View>
    );
}

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginLeft: 8,
    },
    deviceStatusCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    iconContainer: {
        position: 'relative',
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 30,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    activeIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#22C55E',
        borderWidth: 2,
        borderColor: 'white',
    },
    deviceInfo: {
        flex: 1,
        marginLeft: 16,
    },
    deviceName: {
        fontSize: 18,
        fontWeight: '600',
    },
    roomName: {
        fontSize: 14,
        marginTop: 4,
    },
    switchContainer: {
        marginLeft: 16,
    },
    cardContainer: {
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
    },
    loadingContainer: {
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    energyContainer: {
        alignItems: 'center',
    },
    donutWrapper: {
        marginVertical: 16,
        alignItems: 'center',
    },
    svgContainer: {
        position: 'relative',
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    svgWrapper: {
        position: 'relative',
        width: 200,
        height: 200,
        justifyContent: 'center',
        alignItems: 'center',
    },
    circle: {
        position: 'absolute',
    },
    progressRing: {
        position: 'absolute',
        borderStyle: 'solid',
    },
    donutCenter: {
        position: 'absolute',
        alignItems: 'center',
    },
    donutLabel: {
        fontSize: 32,
        fontWeight: 'bold',
    },
    donutUnit: {
        fontSize: 16,
    },
    energyDetailsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        marginTop: 16,
        paddingHorizontal: 16,
    },
    energyDetail: {
        alignItems: 'center',
        padding: 8,
    },
    detailValue: {
        fontSize: 18,
        fontWeight: '600',
    },
    detailLabel: {
        fontSize: 14,
        marginTop: 4,
    },
    divider: {
        width: 1,
        backgroundColor: '#E5E7EB',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    addButton: {
        padding: 8,
    },
    emptySchedule: {
        padding: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scheduleItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    scheduleInfo: {
        flex: 1,
    },
    scheduleTime: {
        fontSize: 16,
        fontWeight: '500',
    },
    scheduleDays: {
        fontSize: 14,
        marginTop: 4,
    },
    scheduleActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        padding: 8,
        marginRight: 8,
    },
    controlButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    controlText: {
        flex: 1,
        fontSize: 16,
        marginLeft: 12,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 12,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: '600',
        marginBottom: 20,
        textAlign: 'center',
    },
    formGroup: {
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        marginBottom: 8,
    },
    input: {
        padding: 12,
        borderRadius: 8,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 20,
    },
    modalButton: {
        flex: 1,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    daysContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    dayButton: {
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        margin: 6,
        minWidth: 45,
        alignItems: 'center',
    },
    diagnosticsContainer: {
        alignItems: 'center',
        marginVertical: 20,
    },
    progressBar: {
        width: '100%',
        height: 12,
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
    },
    progressText: {
        marginTop: 8,
        fontSize: 16,
        fontWeight: '600',
    },
    diagnosticsInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 16,
    },
    diagnosticsText: {
        fontSize: 14,
        marginLeft: 8,
    },
});