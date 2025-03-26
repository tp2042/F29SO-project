import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation } from "@react-navigation/native";
import { BarChart, LineChart, PieChart } from "react-native-chart-kit";
import { useWindowDimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ManageUsersScreen from './manageUsers'; // Import the new component

const API_BASE_URL = 'https://backend-1-y12u.onrender.com';

export default function EnhancedEnergyTrackingScreen() {
    const router = useRouter();
    const navigation = useNavigation();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const { propertyName, household_id } = useLocalSearchParams();
    const isWeb = Platform.OS === 'web';
  
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [energyData, setEnergyData] = useState(null);
    const [selectedPeriod, setSelectedPeriod] = useState('week');
    const [downloadingReport, setDownloadingReport] = useState(false);
    const [activeTab, setActiveTab] = useState('usage'); // 'usage', 'cost', 'comparison'
    const [manageUsersVisible, setManageUsersVisible] = useState(false); // New state for manage users modal

    const chartWidth = isWeb
        ? Math.min(Math.max(windowWidth * 0.6, 500), 800)
        : windowWidth - 32;

    // Fetch energy data from the API
    useEffect(() => {
        if (!household_id) {
            // If no household_id in params, try to get it from AsyncStorage
            const getHouseholdFromStorage = async () => {
                try {
                    const storedHouseholdId = await AsyncStorage.getItem('householdId');
                    if (storedHouseholdId) {
                        fetchEnergyData(storedHouseholdId);
                    } else {
                        setError('Household ID not found');
                        setLoading(false);
                    }
                } catch (err) {
                    setError('Failed to retrieve household information');
                    setLoading(false);
                }
            };
      
            getHouseholdFromStorage();
        } else {
            // Use the household_id from params
            fetchEnergyData(household_id);
        }
    }, [selectedPeriod]);
  
    const fetchEnergyData = async (id = household_id) => {
        if (!id) {
            setError('Household ID is required');
            setLoading(false);
            return;
        }
  
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/household_energy?household_id=${id}&period=${selectedPeriod}`);
      
            if (!response.ok) {
                throw new Error(`API returned status ${response.status}`);
            }
      
            const data = await response.json();
      
            if (data.error) {
                setError(data.error);
            } else {
                // Enhance data with cost information
                const enhancedData = {
                    ...data,
                    data: data.data.map(item => ({
                        ...item,
                        // Calculate cost based on usage (example rate: AED0.12 per kWh)
                        cost: +(item.usage * 0.12).toFixed(2),
                        // Time-of-use pricing simulation
                        peakCost: +(item.usage * 0.18).toFixed(2),
                        offPeakCost: +(item.usage * 0.08).toFixed(2)
                    }))
                };
        
                // Add cost summary to the data
                enhancedData.summary = {
                    ...enhancedData.summary,
                    total_cost: +(enhancedData.summary.total_usage * 0.12).toFixed(2),
                    average_cost: +(enhancedData.summary.average_usage * 0.12).toFixed(2),
                    potential_savings: +((enhancedData.summary.total_usage * 0.12) * 0.15).toFixed(2) // 15% potential savings
                };
        
                setEnergyData(enhancedData);
            }
        } catch (err) {
            setError('Failed to fetch energy data. Please try again.');
            console.error('Error fetching energy data:', err);
        } finally {
            setLoading(false);
        }
    };

    const downloadReport = async () => {
        const household_id = await AsyncStorage.getItem('householdId');
        console.log("Download button clicked");
        console.log("household_id:", household_id);
    
        if (!household_id) {
            Alert.alert('Error', 'Household ID is required');
            return;
        }
  
        try {
            setDownloadingReport(true);
            console.log("About to make API call to:", `${API_BASE_URL}/energy_report?household_id=${household_id}`);
      
            if (isWeb) {
                console.log("Web mode detected, opening in new tab");
                window.open(`${API_BASE_URL}/energy_report?household_id=${household_id}`, '_blank');
                setDownloadingReport(false);
            } else {
                // Mobile code...
            }
        } catch (err) {
            console.error('Error in downloadReport function:', err);
            Alert.alert('Error', 'Failed to download report. Please try again.');
        } finally {
            setDownloadingReport(false);
        }
    };

    // Get period-specific labels
    const getPeriodLabel = () => {
        switch (selectedPeriod) {
            case 'day': return 'Today';
            case 'week': return 'Past 7 Days';
            case 'month': return 'Past 30 Days';
            case 'quarter': return 'Past 3 Months';
            default: return 'Weekly Overview';
        }
    };

    // Get peak day label
    const getPeakDayLabel = () => {
        if (!energyData || !energyData.summary) return 'N/A';
    
        const peakIndex = energyData.summary.peak_day;
    
        if (selectedPeriod === 'day') {
            return `${energyData.labels[peakIndex]} Hour`;
        } else if (selectedPeriod === 'week') {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            return days[peakIndex];
        } else if (selectedPeriod === 'month') {
            return `Day ${energyData.labels[peakIndex]}`;
        } else {
            return `Week ${peakIndex + 1}`;
        }
    };

    // Format usage chart data
    const getUsageChartData = () => {
        if (!energyData || !energyData.data) {
            return {
                labels: [],
                datasets: [{ data: [] }]
            };
        }

        return {
            labels: energyData.labels,
            datasets: [{
                data: energyData.data.map(item => item.usage),
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
            }]
        };
    };

    // Format cost chart data
    const getCostChartData = () => {
        if (!energyData || !energyData.data) {
            return {
                labels: [],
                datasets: [{ data: [] }]
            };
        }

        return {
            labels: energyData.labels,
            datasets: [{
                data: energyData.data.map(item => item.cost),
                color: (opacity = 1) => `rgba(49, 151, 149, ${opacity})`,
            }]
        };
    };

    // Format time-of-use comparison data
    const getTimeOfUseComparisonData = () => {
        if (!energyData || !energyData.data) {
            return {
                labels: [],
                datasets: [
                    { data: [] },
                    { data: [] }
                ]
            };
        }

        return {
            labels: energyData.labels,
            datasets: [
                {
                    data: energyData.data.map(item => item.peakCost),
                    color: (opacity = 1) => `rgba(235, 87, 87, ${opacity})`,
                    strokeWidth: 2,
                },
                {
                    data: energyData.data.map(item => item.offPeakCost),
                    color: (opacity = 1) => `rgba(47, 128, 237, ${opacity})`,
                    strokeWidth: 2,
                }
            ],
            legend: ["Peak Hours", "Off-Peak Hours"]
        };
    };

    // Get energy breakdown data for pie chart
    const getEnergyBreakdownData = () => {
        if (!energyData || !energyData.summary) {
            return [];
        }
    
        // Example distribution of energy usage
        return [
            {
                name: "Heating & Cooling",
                usage: Math.round(energyData.summary.total_usage * 0.40),
                color: "#FF6384",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            },
            {
                name: "Appliances",
                usage: Math.round(energyData.summary.total_usage * 0.25),
                color: "#36A2EB",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            },
            {
                name: "Water Heating",
                usage: Math.round(energyData.summary.total_usage * 0.15),
                color: "#FFCE56",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            },
            {
                name: "Lighting",
                usage: Math.round(energyData.summary.total_usage * 0.10),
                color: "#4BC0C0",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            },
            {
                name: "Electronics",
                usage: Math.round(energyData.summary.total_usage * 0.10),
                color: "#9966FF",
                legendFontColor: "#7F7F7F",
                legendFontSize: 12
            }
        ];
    };

    // Determine max usage value for highlighting
    const getMaxUsage = () => {
        if (!energyData || !energyData.data) return 0;
        return Math.max(...energyData.data.map(item => item.usage));
    };

    // Generate usage stats based on API data
    const getUsageStats = () => {
        if (!energyData || !energyData.summary) {
            return [];
        }

        return [
            { title: 'Total Usage', value: `${energyData.summary.total_usage} kWh`, icon: 'flash' },
            { title: 'Average Daily', value: `${energyData.summary.average_usage} kWh`, icon: 'calculator' },
            { title: 'Peak Day', value: getPeakDayLabel(), icon: 'trending-up' },
            { title: 'Carbon Footprint', value: `${energyData.summary.carbon_footprint} kg CO₂`, icon: 'leaf' },
        ];
    };

    // Generate cost stats based on enhanced data
    const getCostStats = () => {
        if (!energyData || !energyData.summary) {
            return [];
        }

        return [
            { title: 'Total Cost', value: `AED${energyData.summary.total_cost}`, icon: 'cash' },
            { title: 'Average Daily', value: `AED${energyData.summary.average_cost}`, icon: 'calculator' },
            { title: 'Cost Rate', value: `AED0.12/kWh`, icon: 'pricetag' },
            { title: 'Potential Savings', value: `AED${energyData.summary.potential_savings}`, icon: 'trending-down' },
        ];
    };

    // Mobile-specific calculations
    const mobileCardWidth = (windowWidth - 32 - 8) / 2; // 32=padding, 8=gap

    if (loading && !energyData) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading energy data...</Text>
            </View>
        );
    }

    if (error && !energyData) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Ionicons name="alert-circle" size={48} color="#EF4444" />
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchEnergyData}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
            </View>
        );
    }
    return (
        <View style={styles.safeContainer}>
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                nestedScrollEnabled={true}
            >
                <View style={styles.contentWrapper}>
                    <View style={styles.header}>
                        <View style={styles.headerLeft}>
                            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                                <Ionicons name="chevron-back" size={24} color="#000" />
                            </TouchableOpacity>
                            <View>
                                <Text style={styles.title}>{energyData?.household_name || propertyName || 'Energy Tracking'}</Text>
                                <Text style={styles.subtitle}>{getPeriodLabel()}</Text>
                            </View>
                        </View>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity
                                style={[styles.button, styles.manageUsersButton]}
                                onPress={() => setManageUsersVisible(true)}
                            >
                                <Ionicons name="people-outline" size={16} color="white" style={{ marginRight: 5 }} />
                                <Text style={styles.buttonText}>Manage Users</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.button, downloadingReport && styles.buttonDisabled]}
                                onPress={downloadReport}
                                disabled={downloadingReport}
                            >
                                {downloadingReport ? (
                                    <ActivityIndicator size="small" color="white" />
                                ) : (
                                    <>
                                        <Ionicons name="download-outline" size={16} color="white" style={{ marginRight: 5 }} />
                                        <Text style={styles.buttonText}>Download Report</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
  
                    <View style={styles.periodSelector}>
                        <TouchableOpacity
                            style={[styles.periodButton, selectedPeriod === 'day' && styles.periodButtonActive]}
                            onPress={() => setSelectedPeriod('day')}
                        >
                            <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.periodButtonTextActive]}>Day</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
                            onPress={() => setSelectedPeriod('week')}
                        >
                            <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive]}>Week</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
                            onPress={() => setSelectedPeriod('month')}
                        >
                            <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive]}>Month</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.periodButton, selectedPeriod === 'quarter' && styles.periodButtonActive]}
                            onPress={() => setSelectedPeriod('quarter')}
                        >
                            <Text style={[styles.periodButtonText, selectedPeriod === 'quarter' && styles.periodButtonTextActive]}>3 Months</Text>
                        </TouchableOpacity>
                    </View>
  
                    {/* Tabs for different views */}
                    <View style={styles.tabSelector}>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'usage' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('usage')}
                        >
                            <Ionicons
                                name="flash-outline"
                                size={18}
                                color={activeTab === 'usage' ? 'white' : '#6B7280'}
                                style={styles.tabIcon}
                            />
                            <Text style={[styles.tabButtonText, activeTab === 'usage' && styles.tabButtonTextActive]}>Usage</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'cost' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('cost')}
                        >
                            <Ionicons
                                name="cash-outline"
                                size={18}
                                color={activeTab === 'cost' ? 'white' : '#6B7280'}
                                style={styles.tabIcon}
                            />
                            <Text style={[styles.tabButtonText, activeTab === 'cost' && styles.tabButtonTextActive]}>Cost</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tabButton, activeTab === 'comparison' && styles.tabButtonActive]}
                            onPress={() => setActiveTab('comparison')}
                        >
                            <Ionicons
                                name="analytics-outline"
                                size={18}
                                color={activeTab === 'comparison' ? 'white' : '#6B7280'}
                                style={styles.tabIcon}
                            />
                            <Text style={[styles.tabButtonText, activeTab === 'comparison' && styles.tabButtonTextActive]}>Analysis</Text>
                        </TouchableOpacity>
                    </View>
  
                    <View style={styles.mainContent}>
                        {/* Usage Tab Content */}
                        {activeTab === 'usage' && (
                            <>
                                <View style={styles.chartCard}>
                                    <Text style={styles.chartTitle}>Electricity Usage</Text>
                                    <Text style={styles.chartSubtitle}>{getPeriodLabel()}</Text>
  
                                    {loading ? (
                                        <View style={styles.chartLoading}>
                                            <ActivityIndicator size="large" color="white" />
                                        </View>
                                    ) : (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.chartScrollContainer}
                                            nestedScrollEnabled={true}
                                        >
                                            <BarChart
                                                data={getUsageChartData()}
                                                width={isWeb ? chartWidth : Math.max(chartWidth, 400)}
                                                height={220}
                                                yAxisLabel=""
                                                yAxisSuffix=" kWh"
                                                fromZero
                                                showValuesOnTopOfBars
                                                segments={5}
                                                chartConfig={{
                                                    backgroundColor: "#8B5CF6",
                                                    backgroundGradientFrom: "#8B5CF6",
                                                    backgroundGradientTo: "#6D28D9",
                                                    decimalPlaces: 1,
                                                    color: (opacity = 1, index) => {
                                                        if (index === undefined) return 'rgb(255, 255, 255)';
                                                        const maxUsage = getMaxUsage();
                                                        return energyData?.data?.[index]?.usage === maxUsage
                                                            ? 'rgb(255, 215, 0)'
                                                            : 'rgb(255, 255, 255)';
                                                    },
                                                    style: {
                                                        borderRadius: 16,
                                                    },
                                                    barPercentage: 0.7,
                                                    barRadius: 6,
                                                    propsForBackgroundLines: {
                                                        strokeWidth: 1,
                                                        stroke: "rgba(255,255,255,0.2)",
                                                    },
                                                    count: 5,
                                                    formatYLabel: (value) => Math.round(Number(value)).toString(),
                                                    propsForLabels: {
                                                        fontSize: isWeb ? 14 : 12,
                                                        rotation: selectedPeriod === 'month' ? 45 : 0,
                                                        origin: selectedPeriod === 'month' ? { x: 0, y: 10 } : undefined
                                                    },
                                                }}
                                                style={{
                                                    marginVertical: 8,
                                                    borderRadius: 16,
                                                }}
                                                withHorizontalLabels={true}
                                            />
                                        </ScrollView>
                                    )}
                                </View>
  
                                <View style={styles.statsGrid}>
                                    {getUsageStats().map((stat, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.statCard,
                                                !isWeb && { width: mobileCardWidth }
                                            ]}
                                        >
                                            <View style={styles.statIcon}>
                                                <Ionicons name={stat.icon} size={20} color="#8B5CF6" />
                                            </View>
                                            <Text style={styles.statTitle}>{stat.title}</Text>
                                            <Text style={styles.statValue}>{stat.value}</Text>
                                        </View>
                                    ))}
                                </View>
  
                                {/* Energy Breakdown Pie Chart */}
                                <View style={[styles.chartCard, { backgroundColor: 'white' }]}>
                                    <Text style={[styles.chartTitle, { color: '#111827' }]}>Energy Usage Breakdown</Text>
                                    <Text style={[styles.chartSubtitle, { color: '#6B7280' }]}>By Category</Text>
  
                                    {loading ? (
                                        <View style={styles.chartLoading}>
                                            <ActivityIndicator size="large" color="#8B5CF6" />
                                        </View>
                                    ) : (
                                        <View style={styles.pieChartContainer}>
                                            <PieChart
                                                data={getEnergyBreakdownData()}
                                                width={isWeb ? chartWidth : chartWidth}
                                                height={220}
                                                chartConfig={{
                                                    backgroundColor: "#FFFFFF",
                                                    backgroundGradientFrom: "#FFFFFF",
                                                    backgroundGradientTo: "#FFFFFF",
                                                    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                                }}
                                                accessor={"usage"}
                                                backgroundColor={"transparent"}
                                                paddingLeft={isWeb ? "0" : "0"}
                                                center={[10, 0]}
                                                absolute
                                            />
                                        </View>
                                    )}
                                </View>
                            </>
                        )}
  
                        {/* Cost Tab Content */}
                        {activeTab === 'cost' && (
                            <>
                                <View style={[styles.chartCard, { backgroundColor: '#319795' }]}>
                                    <Text style={styles.chartTitle}>Electricity Cost</Text>
                                    <Text style={styles.chartSubtitle}>{getPeriodLabel()}</Text>
  
                                    {loading ? (
                                        <View style={styles.chartLoading}>
                                            <ActivityIndicator size="large" color="white" />
                                        </View>
                                    ) : (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.chartScrollContainer}
                                            nestedScrollEnabled={true}
                                        >
                                            <BarChart
                                                data={getCostChartData()}
                                                width={isWeb ? chartWidth : Math.max(chartWidth, 400)}
                                                height={220}
                                                yAxisLabel="AED"
                                                yAxisSuffix=""
                                                fromZero
                                                showValuesOnTopOfBars
                                                segments={5}
                                                chartConfig={{
                                                    backgroundColor: "#319795",
                                                    backgroundGradientFrom: "#319795",
                                                    backgroundGradientTo: "#2C7A7B",
                                                    decimalPlaces: 2,
                                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                                    style: {
                                                        borderRadius: 16,
                                                    },
                                                    barPercentage: 0.7,
                                                    barRadius: 6,
                                                    propsForBackgroundLines: {
                                                        strokeWidth: 1,
                                                        stroke: "rgba(255,255,255,0.2)",
                                                    },
                                                    count: 5,
                                                    propsForLabels: {
                                                        fontSize: isWeb ? 14 : 12,
                                                        rotation: selectedPeriod === 'month' ? 45 : 0,
                                                        origin: selectedPeriod === 'month' ? { x: 0, y: 10 } : undefined
                                                    },
                                                }}
                                                style={{
                                                    marginVertical: 8,
                                                    borderRadius: 16,
                                                }}
                                                withHorizontalLabels={true}
                                            />
                                        </ScrollView>
                                    )}
                                </View>
  
                                <View style={styles.statsGrid}>
                                    {getCostStats().map((stat, index) => (
                                        <View
                                            key={index}
                                            style={[
                                                styles.statCard,
                                                !isWeb && { width: mobileCardWidth }
                                            ]}
                                        >
                                            <View style={[styles.statIcon, { backgroundColor: 'rgba(49, 151, 149, 0.1)' }]}>
                                                <Ionicons name={stat.icon} size={20} color="#319795" />
                                            </View>
                                            <Text style={styles.statTitle}>{stat.title}</Text>
                                            <Text style={styles.statValue}>{stat.value}</Text>
                                        </View>
                                    ))}
                                </View>
  
                                {/* Cost Saving Tips Section */}
                                <View style={styles.recommendationsSection}>
                                    <Text style={styles.recommendationsTitle}>Cost Saving Opportunities</Text>
                                    <View style={styles.recommendationsList}>
                                        <View style={styles.recommendationItem}>
                                            <View style={[styles.recommendationIcon, { backgroundColor: 'rgba(49, 151, 149, 0.1)' }]}>
                                                <Ionicons name="time-outline" size={20} color="#319795" />
                                            </View>
                                            <View style={styles.recommendationText}>
                                                <Text style={styles.recommendationTitle}>Off-Peak Usage</Text>
                                                <Text style={styles.recommendationDescription}>
                                                    Shift high-consumption activities to off-peak hours (10PM-6AM) to save up to 40% on energy costs.
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.recommendationItem}>
                                            <View style={[styles.recommendationIcon, { backgroundColor: 'rgba(49, 151, 149, 0.1)' }]}>
                                                <Ionicons name="thermometer-outline" size={20} color="#319795" />
                                            </View>
                                            <View style={styles.recommendationText}>
                                                <Text style={styles.recommendationTitle}>Thermostat Adjustment</Text>
                                                <Text style={styles.recommendationDescription}>
                                                    Adjusting your thermostat by just 2 degrees could save approximately AED15 per month.
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.recommendationItem}>
                                            <View style={[styles.recommendationIcon, { backgroundColor: 'rgba(49, 151, 149, 0.1)' }]}>
                                                <Ionicons name="flash-outline" size={20} color="#319795" />
                                            </View>
                                            <View style={styles.recommendationText}>
                                                <Text style={styles.recommendationTitle}>Energy-Efficient Appliances</Text>
                                                <Text style={styles.recommendationDescription}>
                                                    Upgrading to energy-efficient appliances could reduce your annual electricity costs by up to 30%.
                                                </Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
  
                        {/* Comparison Tab Content */}
                        {activeTab === 'comparison' && (
                            <>
                                {/* Time-of-Use Cost Comparison */}
                                <View style={[styles.chartCard, { backgroundColor: '#4C51BF' }]}>
                                    <Text style={styles.chartTitle}>Peak vs. Off-Peak Pricing</Text>
                                    <Text style={styles.chartSubtitle}>Cost Comparison</Text>
  
                                    {loading ? (
                                        <View style={styles.chartLoading}>
                                            <ActivityIndicator size="large" color="white" />
                                        </View>
                                    ) : (
                                        <ScrollView
                                            horizontal
                                            showsHorizontalScrollIndicator={false}
                                            contentContainerStyle={styles.chartScrollContainer}
                                            nestedScrollEnabled={true}
                                        >
                                            <LineChart
                                                data={getTimeOfUseComparisonData()}
                                                width={isWeb ? chartWidth : Math.max(chartWidth, 400)}
                                                height={220}
                                                yAxisLabel="AED"
                                                yAxisSuffix=""
                                                fromZero
                                                segments={5}
                                                chartConfig={{
                                                    backgroundColor: "#4C51BF",
                                                    backgroundGradientFrom: "#4C51BF",
                                                    backgroundGradientTo: "#434190",
                                                    decimalPlaces: 2,
                                                    color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                                                    style: {
                                                        borderRadius: 16,
                                                    },
                                                    propsForBackgroundLines: {
                                                        strokeWidth: 1,
                                                        stroke: "rgba(255,255,255,0.2)",
                                                    },
                                                    count: 5,
                                                    propsForLabels: {
                                                        fontSize: isWeb ? 14 : 12,
                                                        rotation: selectedPeriod === 'month' ? 45 : 0,
                                                        origin: selectedPeriod === 'month' ? { x: 0, y: 10 } : undefined
                                                    },
                                                    propsForDots: {
                                                        r: "4",
                                                        strokeWidth: "2",
                                                    },
                                                    legendPosition: "topRight"
                                                }}
                                                style={{
                                                    marginVertical: 8,
                                                    borderRadius: 16,
                                                }}
                                                bezier
                                                withHorizontalLabels={true}
                                                withLegend={true}
                                            />
                                        </ScrollView>
                                    )}
                                </View>
  
                                {/* Neighborhood Comparison */}
                                <View style={styles.comparisonCard}>
                                    <Text style={styles.comparisonTitle}>Your Energy Usage vs. Neighborhood</Text>
                                    <View style={styles.comparisonContent}>
                                        <View style={styles.comparisonItem}>
                                            <Text style={styles.comparisonLabel}>Your Usage</Text>
                                            <Text style={styles.comparisonValue}>{energyData?.summary?.total_usage || 0} kWh</Text>
                                            <View style={styles.comparisonBar}>
                                                <View
                                                    style={[
                                                        styles.comparisonBarFill,
                                                        { width: '80%', backgroundColor: '#8B5CF6' }
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.comparisonItem}>
                                            <Text style={styles.comparisonLabel}>Neighborhood Avg.</Text>
                                            <Text style={styles.comparisonValue}>{Math.round(energyData?.summary?.total_usage * 1.25) || 0} kWh</Text>
                                            <View style={styles.comparisonBar}>
                                                <View
                                                    style={[
                                                        styles.comparisonBarFill,
                                                        { width: '100%', backgroundColor: '#9CA3AF' }
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                        <View style={styles.comparisonItem}>
                                            <Text style={styles.comparisonLabel}>Efficient Homes</Text>
                                            <Text style={styles.comparisonValue}>{Math.round(energyData?.summary?.total_usage * 0.85) || 0} kWh</Text>
                                            <View style={styles.comparisonBar}>
                                                <View
                                                    style={[
                                                        styles.comparisonBarFill,
                                                        { width: '65%', backgroundColor: '#10B981' }
                                                    ]}
                                                />
                                            </View>
                                        </View>
                                    </View>
                                </View>
  
                                {/* Efficiency Score */}
                                <View style={styles.scoreCard}>
                                    <Text style={styles.scoreTitle}>Energy Efficiency Score</Text>
                                    <View style={styles.scoreContainer}>
                                        <View style={styles.scoreCircle}>
                                            <Text style={styles.scoreValue}>B+</Text>
                                        </View>
                                        <View style={styles.scoreContent}>
                                            <Text style={styles.scoreDescription}>
                                                Your home is more efficient than 68% of similar homes in your area
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </ScrollView>
            {manageUsersVisible && (
                <ManageUsersScreen
                   isVisible={manageUsersVisible}
                    household_id={household_id}
                    onClose={() => setManageUsersVisible(false)}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    padding: 16,
    paddingBottom: 32,
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: Platform.OS === 'web' ? 'center' : undefined,
    width: Platform.OS === 'web' ? '100%' : undefined,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#A78BFA',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  periodButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  periodButtonText: {
    fontWeight: '500',
    color: '#6B7280',
    fontSize: 14,
  },
  periodButtonTextActive: {
    color: 'white',
  },
  tabSelector: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 16,
    padding: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
    }),
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  tabIcon: {
    marginRight: 6,
  },
  tabButtonText: {
    fontWeight: '500',
    color: '#6B7280',
    fontSize: 14,
  },
  tabButtonTextActive: {
    color: 'white',
  },
  mainContent: {
    flex: 1,
  },
  chartCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  chartSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginBottom: 12,
  },
  chartLoading: {
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chartScrollContainer: {
    paddingRight: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    width: Platform.OS === 'web' ? 'calc(25% - 12px)' : '48%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statTitle: {
    color: '#6B7280',
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: 'bold',
  },
  pieChartContainer: {
    alignItems: 'center',
  },
  recommendationsSection: {
    marginBottom: 16,
  },
  recommendationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  recommendationsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  recommendationItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  comparisonCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  comparisonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  comparisonContent: {
    gap: 12,
  },
  comparisonItem: {
    marginBottom: 16,
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  comparisonBar: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  comparisonBarFill: {
    height: 8,
    borderRadius: 4,
  },
  scoreCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
      web: {
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
      },
    }),
  },
  scoreTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#8B5CF6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  scoreContent: {
    flex: 1,
  },
  scoreDescription: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  scoreButton: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  scoreButtonText: {
    color: '#8B5CF6',
    fontWeight: '600',
    fontSize: 14,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8, // Add spacing between buttons
      },
      manageUsersButton: {
        marginRight: 8, // Add space between the buttons
        backgroundColor: '#4F46E5', // Optional: different color to make it distinct
      },
});