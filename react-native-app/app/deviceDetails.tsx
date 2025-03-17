import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from "./ThemeContext";

export default function DeviceDetailScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { isDarkMode } = useTheme();
    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    const {
        deviceName = 'Device',
        roomName = 'Room',
        energyUsage = 0,
        unit = 'kWh',
        averageTemp,
        lightLevel,
        isOn = true,
    } = (route.params as {
        deviceName?: string;
        roomName?: string;
        energyUsage?: number;
        unit?: string;
        averageTemp?: number;
        lightLevel?: number;
        isOn?: boolean;
    }) || {};
    const timeUsed = 9;

    const [isToggleOn, setIsToggleOn] = useState(isOn);

    const toggleSwitch = () => setIsToggleOn(!isToggleOn);

    return (
    <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
        <View style={styles.wrapper}>
        {/* Header */}
        <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={30} color={textColor} />
            </TouchableOpacity>
            <Switch
                value={isToggleOn}
                onValueChange={toggleSwitch}
                trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
                thumbColor={ isToggleOn ? '#ffffff': "#8B5CF6"}
            />
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
            <Text style={[styles.title, {color: textColor}]}>{deviceName}</Text>
            <Text style={[styles.subtitle, {color: textColor}]}>{roomName}</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Circle */}
            <View style={styles.progressContainer}>
            <View style={[styles.progressBackground, { backgroundColor: isDarkMode ? "#A9A9A9" : "#f5f5f5" }]} />
            <View style={[styles.centerCircle, {backgroundColor: backgroundColor}]}>
                <Text style={[styles.valueText, {color: textColor}]}>{energyUsage}</Text>
                <Text style={[styles.unitText, {color: textColor}]}>{unit}</Text>
            </View>
            </View>

          {/* Stats */}
            <View style={styles.statsSection}>
            <Text style={[styles.statsTitle, {color: textColor}]}>Device statistics</Text>
            <View style={styles.statsGrid}>
                {averageTemp !== undefined && (
                <View style={[styles.statCard, {backgroundColor: backgroundColor}]}>
                    <Ionicons name="thermometer-outline" size={30} color="#8B5CF6" />
                    <Text style={[styles.statLabel, {color: textColor}]}>Temperature</Text>
                    <Text style={[styles.statValue, {color: textColor}]}>{averageTemp}°C</Text>
                </View>
                )}
                {lightLevel !== undefined && (
                <View style={[styles.statCard, {backgroundColor: backgroundColor}]}>
                    <Ionicons name="sunny-outline" size={30} color="#8B5CF6" />
                    <Text style={[styles.statLabel, {color: textColor}]}>Light Level</Text>
                    <Text style={[styles.statValue, {color: textColor}]}>{lightLevel}%</Text>
                </View>
                )}
                <View style={[styles.statCard, {backgroundColor: backgroundColor}]}>
                    <Ionicons name="time-outline" size={30} color="#8B5CF6" />
                    <Text style={[styles.statLabel, {color: textColor}]}>Time Used</Text>
                    <Text style={[styles.statValue, {color: textColor}]}>{timeUsed} Hours</Text>
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
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    wrapper: {
    padding: 20,
    maxWidth: 900,
    alignSelf: 'center',
    width: '100%',
    },
    header: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    },
    backButton: { padding: 5 },
    titleContainer: { marginTop: 20 },
    title: { fontSize: 36, fontWeight: '600' },
    subtitle: { fontSize: 18, color: '#6B7280', marginTop: 5 },
    mainContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 30,
    },
    progressContainer: {
    width: 300,
    height: 300,
    position: 'relative',
    marginBottom: 30,
    },
    progressBackground: {
    width: '100%',
    height: '100%',
    borderRadius: 150,
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
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    },
    valueText: { fontSize: 48, fontWeight: '700', color: '#1F2937' },
    unitText: { fontSize: 18, color: '#6B7280', marginTop: 5 },
    statsSection: { width: '48%' },
    statsTitle: { fontSize: 24, fontWeight: '600', marginBottom: 20 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 30 },
    statCard: {
    width: '48%',
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
    marginBottom: 15,
    },
    statLabel: { fontSize: 14, color: '#6B7280', marginBottom: 5, textAlign: 'center' },
    statValue: { fontSize: 20, fontWeight: '600', textAlign: 'center' },
    viewReportButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 50,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: 'center',
    marginBottom: 30,
    },
    viewReportButtonText: { color: 'white', fontSize: 18, fontWeight: '500' },
});
