import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from "./ThemeContext";
import { useNavigation } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { useWindowDimensions } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';
const API_BASE_URL = 'https://backend-1-y12u.onrender.com'; // Replace with your actual API base URL

export default function EnergyTrackingScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const backgroundColor = isDarkMode ? "black" : "#fff";
  const textColor = isDarkMode ? "#fff" : "#000";
  const navigation = useNavigation();
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { propertyName, household_id } = useLocalSearchParams();
  const isWeb = Platform.OS === 'web';
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [energyData, setEnergyData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [downloadingReport, setDownloadingReport] = useState(false);

  const chartWidth = isWeb 
    ? Math.min(Math.max(windowWidth * 0.6, 500), 800)
    : windowWidth - 32;

    useEffect(() => {
      navigation.setOptions({ headerShown: false });
    }, [navigation]);
  
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
        setEnergyData(data);
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
    if (!household_id) {
      Alert.alert('Error', 'Household ID is required');
      return;
    }

    try {
      setDownloadingReport(true);
      
      if (isWeb) {
        // For web, open the PDF in a new tab
        window.open(`${API_BASE_URL}/daily_energy_summary?household_id=${household_id}`, '_blank');
        setDownloadingReport(false);
      } else {
        // For mobile, download and share the PDF
        const fileUri = `${FileSystem.documentDirectory}energy_report_${Date.now()}.pdf`;
        
        // Show download progress
        const downloadResumable = FileSystem.createDownloadResumable(
          `${API_BASE_URL}/energy_report?household_id=${household_id}`,
          fileUri,
          {},
          (downloadProgress) => {
            const progress = downloadProgress.totalBytesWritten / downloadProgress.totalBytesExpectedToWrite;
            console.log(`Download progress: ${progress * 100}%`);
          }
        );
        
        try {
          const downloadResult = await downloadResumable.downloadAsync();
          
          if (downloadResult.status === 200) {
            const isAvailable = await Sharing.isAvailableAsync();
            
            if (isAvailable) {
              await Sharing.shareAsync(fileUri, {
                mimeType: 'application/pdf',
                dialogTitle: 'Energy Report',
                UTI: 'com.adobe.pdf'
              });
            } else {
              Alert.alert('Error', 'Sharing is not available on this device');
            }
          } else {
            Alert.alert('Error', `Failed to download report: ${downloadResult.status}`);
          }
        } catch (e) {
          console.error('Download error:', e);
          Alert.alert('Error', 'Failed to download report. Check your network connection.');
        }
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to download report. Please try again.');
      console.error('Error downloading report:', err);
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

  // Format chart data
  const getChartData = () => {
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
        color: (opacity = 1) => `rgb(255, 255, 255)`,
      }]
    };
  };

  // Determine max usage value for highlighting
  const getMaxUsage = () => {
    if (!energyData || !energyData.data) return 0;
    return Math.max(...energyData.data.map(item => item.usage));
  };

  // Generate stats based on API data
  const getStats = () => {
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
        style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
        nestedScrollEnabled={true}
      >
        <View style={styles.contentWrapper}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View>
                <Text style={[styles.title, {color: textColor}]}>{energyData?.household_name || propertyName || 'Energy Tracking'}</Text>
                <Text style={styles.subtitle}>{getPeriodLabel()}</Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.button, downloadingReport && styles.buttonDisabled]}
              onPress={downloadReport}
              disabled={downloadingReport}
            >
              {downloadingReport ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Ionicons name="download-outline" size={16} color="white" style={{marginRight: 5}} />
                  <Text style={styles.buttonText}>Download Report</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={[styles.periodSelector, {backgroundColor: backgroundColor}]}>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'day' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('day')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'day' && styles.periodButtonTextActive, {color: textColor}]}>Day</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'week' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('week')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'week' && styles.periodButtonTextActive, {color: textColor}]}>Week</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'month' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('month')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'month' && styles.periodButtonTextActive, {color: textColor}]}>Month</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.periodButton, selectedPeriod === 'quarter' && styles.periodButtonActive]}
              onPress={() => setSelectedPeriod('quarter')}
            >
              <Text style={[styles.periodButtonText, selectedPeriod === 'quarter' && styles.periodButtonTextActive, {color: textColor}]}>3 Months</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mainContent}>
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
                  contentContainerStyle={[styles.chartScrollContainer, {alignItems: 'center', flexGrow: 1}]}
                  nestedScrollEnabled={true}
                  >
                    <View style={[{flex: 1}, {alignItems: 'center'}]}>
                      <BarChart
                        data={getChartData()}
                        width={isWeb ? chartWidth : windowWidth - 64} // Adjust width to nearly full container
                        height={280} // Slightly increased height
                        yAxisLabel=""
                        yAxisSuffix=" kWh"
                        fromZero
                        showValuesOnTopOfBars
                        segments={5}
                        chartConfig={{
                          backgroundColor: "#8B5CF6",
                          backgroundGradientFrom: "#8B5CF6",
                          backgroundGradientTo: "#8B5CF6",
                          decimalPlaces: 1,
                          color: (opacity = 1, index) => {
                            // More dynamic color logic
                            if (index === undefined) return 'rgba(255,255,255,0.7)';
                            
                            const maxUsage = getMaxUsage();
                            const currentUsage = energyData?.data?.[index]?.usage || 0;
                            
                            // Create a gradient based on usage relative to max
                            const normalizedUsage = currentUsage / maxUsage;
                            
                            if (currentUsage === maxUsage) {
                              return 'rgba(255, 215, 0, 1)';  // Bright gold for peak
                            } else if (normalizedUsage > 0.7) {
                              return `rgba(255, 165, 0, ${0.7 + normalizedUsage * 0.3})`;  // Orange gradient
                            } else if (normalizedUsage > 0.4) {
                              return `rgba(255, 255, 255, ${0.6 + normalizedUsage * 0.4})`;  // White to light gradient
                            } else {
                              return `rgba(255, 255, 255, ${0.4 + normalizedUsage * 0.6})`;  // Lighter whites
                            }
                          },
                          barPercentage: 0.8, // Increase bar width slightly
                          barRadius: 8,  // More rounded corners
                          propsForBackgroundLines: {
                            strokeWidth: 1,
                            stroke: "rgba(255,255,255,0.2)",
                          },
                          formatYLabel: (value) => `${Math.round(Number(value))}`,
                          propsForLabels: {
                            fontSize: 10,
                            fontWeight: 'bold',
                            color: 'rgba(255,255,255,0.8)'
                          },
                          labelOffset: { x: 0, y: 5 }, // Adjust label positioning
                        }}
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                          elevation: 3,
                          shadowColor: '#00',
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.1,
                          shadowRadius: 4,
                        }}
                      />
                      </View>
                </ScrollView>
              )}
            </View>

            <View style={styles.statsGrid}>
              {getStats().map((stat, index) => (
                <View 
                  key={index} 
                  style={[
                    styles.statCard,
                    {backgroundColor: isDarkMode ? "#000" : "#fff"},
                    !isWeb && { width: mobileCardWidth }
                  ]}
                >
                  <View style={styles.statIcon}>
                    <Ionicons name={stat.icon} size={20} color="#8B5CF6" />
                  </View>
                  <Text style={[styles.statTitle, {color: textColor}]}>{stat.title}</Text>
                  <Text style={[styles.statValue, {color: isDarkMode ? "#A9A9A9" : "#111827"}]}>{stat.value}</Text>
                </View>
              ))}
            </View>

            <View style={[styles.recommendationsSection, {backgroundColor: backgroundColor}]}>
              <Text style={[styles.recommendationsTitle, {color: textColor}]}>Recommendations</Text>
              <View style={styles.recommendationsList}>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons name="bulb" size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.recommendationText}>
                    <Text style={[styles.recommendationTitle, {color: textColor}]}>High Usage Alert</Text>
                    <Text style={styles.recommendationDescription}>
                      {getPeakDayLabel()}'s usage was significantly higher. Consider reviewing activities during peak hours.
                    </Text>
                  </View>
                </View>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons name="time" size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.recommendationText}>
                    <Text style={[styles.recommendationTitle, {color: textColor}]}>Optimal Usage Time</Text>
                    <Text style={styles.recommendationDescription}>
                      Schedule high-energy activities between 10 PM and 6 AM for better rates.
                    </Text>
                  </View>
                </View>
                <View style={styles.recommendationItem}>
                  <View style={styles.recommendationIcon}>
                    <Ionicons name="hardware-chip" size={20} color="#8B5CF6" />
                  </View>
                  <View style={styles.recommendationText}>
                    <Text style={[styles.recommendationTitle, {color: textColor}]}>Smart Device Integration</Text>
                    <Text style={styles.recommendationDescription}>
                      Consider investing in smart plugs to monitor and control energy usage of individual appliances.
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
  },
  contentWrapper: {
    padding: Platform.OS === 'web' ? '2% 10%' : 16,
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    marginTop: Platform.OS === 'web' ? 40 : 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Platform.OS === 'web' ? 30 : 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: Platform.OS === 'web' ? 48 : 24,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: Platform.OS === 'web' ? 24 : 14,
    color: '#6B7280',
    marginTop: 4,
  },
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
    padding: 4,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 12,
  },
  periodButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  periodButtonTextActive: {
    color: '#FFFFFF',
  },
  mainContent: {
    gap: Platform.OS === 'web' ? 40 : 16,
    paddingBottom: 40, // Add padding at the bottom to ensure content is scrollable
  },
  chartCard: {
    backgroundColor: '#8B5CF6',
    borderRadius: Platform.OS === 'web' ? 30 : 16,
    padding: Platform.OS === 'web' ? 40 : 16,
  },
  chartScrollContainer: {
    paddingRight: Platform.OS === 'web' ? 0 : 16,
  },
  chartTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '600',
    color: 'white',
  },
  chartSubtitle: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: Platform.OS === 'web' ? 20 : 12,
  },
  chartLoading: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 24 : 8,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 24 : 12,
    padding: Platform.OS === 'web' ? 24 : 12,
    width: Platform.OS === 'web' ? 'calc(25% - 18px)' : '48%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statIcon: {
    width: Platform.OS === 'web' ? 48 : 36,
    height: Platform.OS === 'web' ? 48 : 36,
    borderRadius: Platform.OS === 'web' ? 24 : 18,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  statValue: {
    fontSize: Platform.OS === 'web' ? 24 : 16,
    fontWeight: '600',
    color: '#111827',
  },
  recommendationsSection: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 24 : 16,
    padding: Platform.OS === 'web' ? 32 : 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  recommendationsTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '600',
    marginBottom: Platform.OS === 'web' ? 24 : 16,
  },
  recommendationsList: {
    gap: Platform.OS === 'web' ? 20 : 16,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  recommendationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  recommendationDescription: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    color: '#6B7280',
    lineHeight: Platform.OS === 'web' ? 24 : 18,
  },
  button: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 14,
  },
  buttonDisabled: {
    backgroundColor: '#c4b5e9',
    opacity: 0.8,
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 16,
  },
});