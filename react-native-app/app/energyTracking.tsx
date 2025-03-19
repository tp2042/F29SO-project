import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useNavigation, useRoute } from "@react-navigation/native";
import { BarChart } from "react-native-chart-kit";
import { useWindowDimensions } from 'react-native';

export default function EnergyTrackingScreen() {
const route = useRoute()
  const navigation = useNavigation();
  const { width: windowWidth } = useWindowDimensions();
  const { propertyName } = route.params || {};
  const isWeb = Platform.OS === 'web';
  
  const chartWidth = isWeb 
    ? Math.min(Math.max(windowWidth * 0.6, 500), 800)
    : windowWidth - 32;

  const data = [
    { day: "Sun", usage: 20 },
    { day: "Mon", usage: 35 },
    { day: "Tue", usage: 30 },
    { day: "Wed", usage: 200 },
    { day: "Thu", usage: 28 },
    { day: "Fri", usage: 25 },
    { day: "Sat", usage: 38 },
  ];

  const maxUsage = Math.max(...data.map((item) => item.usage));
  const totalUsage = data.reduce((sum, item) => sum + item.usage, 0);
  const averageUsage = totalUsage / data.length;

  const stats = [
    { title: 'Total Usage', value: `${totalUsage} kWh`, icon: 'flash' },
    { title: 'Average Daily', value: `${averageUsage.toFixed(1)} kWh`, icon: 'calculator' },
    { title: 'Peak Day', value: 'Wednesday', icon: 'trending-up' },
    { title: 'Carbon Footprint', value: '45.2 kg CO₂', icon: 'leaf' },
  ];

  // Mobile-specific calculations
  const mobileCardWidth = (windowWidth - 32 - 8) / 2; // 32=padding, 8=gap

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}  contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.contentWrapper}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>{propertyName || 'Energy Tracking'}</Text>
              <Text style={styles.subtitle}>Weekly Overview</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.button}><Text style={styles.buttonText}>Download Report</Text></TouchableOpacity>
        </View>

        <View style={styles.mainContent}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Electricity Usage</Text>
            <Text style={styles.chartSubtitle}>Past 7 Days</Text>

            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chartScrollContainer}
            >
              <BarChart
                data={{
                  labels: data.map((item) => item.day),
                  datasets: [{ 
                    data: data.map((item) => item.usage),
                    color: (opacity = 1) => `rgb(255, 255, 255)`,
                  }],
                }}
                width={isWeb ? chartWidth : Math.max(chartWidth, 400)}
                height={200}
                yAxisLabel=""
                yAxisSuffix=" kWh"
                fromZero
                showValuesOnTopOfBars
                segments={5}
                chartConfig={{
                  backgroundColor: "#8B5CF6",
                  backgroundGradientFrom: "#8B5CF6",
                  backgroundGradientTo: "#8B5CF6",
                  decimalPlaces: 0,
                  color: (opacity = 1, index) => {
                    if (index === undefined) return 'rgb(255, 255, 255)';
                    return data[index]?.usage === maxUsage 
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
                  },
                }}
                style={{
                  marginVertical: 8,
                  borderRadius: 16,
                }}
              />
            </ScrollView>
          </View>

          <View style={styles.statsGrid}>
            {stats.map((stat, index) => (
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

          <View style={styles.recommendationsSection}>
            <Text style={styles.recommendationsTitle}>Recommendations</Text>
            <View style={styles.recommendationsList}>
              <View style={styles.recommendationItem}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="bulb" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.recommendationText}>
                  <Text style={styles.recommendationTitle}>High Usage Alert</Text>
                  <Text style={styles.recommendationDescription}>
                    Wednesday's usage was significantly higher. Consider reviewing activities during peak hours.
                  </Text>
                </View>
              </View>
              <View style={styles.recommendationItem}>
                <View style={styles.recommendationIcon}>
                  <Ionicons name="time" size={20} color="#8B5CF6" />
                </View>
                <View style={styles.recommendationText}>
                  <Text style={styles.recommendationTitle}>Optimal Usage Time</Text>
                  <Text style={styles.recommendationDescription}>
                    Schedule high-energy activities between 10 PM and 6 AM for better rates.
                  </Text>
                </View>
              </View>
            </View>
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
  mainContent: {
    gap: Platform.OS === 'web' ? 40 : 16,
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
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Platform.OS === 'web' ? 12 : 8,
  },
  statTitle: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    color: '#6B7280',
    marginBottom: 2,
    textAlign: 'center',
  },
  statValue: {
    fontSize: Platform.OS === 'web' ? 24 : 16,
    fontWeight: '600',
    color: '#1F2937',
    textAlign: 'center',
  },
  recommendationsSection: {
    backgroundColor: 'white',
    borderRadius: Platform.OS === 'web' ? 30 : 16,
    padding: Platform.OS === 'web' ? 40 : 16,
  },
  recommendationsTitle: {
    fontSize: Platform.OS === 'web' ? 24 : 18,
    fontWeight: '600',
    marginBottom: Platform.OS === 'web' ? 24 : 12,
  },
  recommendationsList: {
    gap: Platform.OS === 'web' ? 16 : 12,
  },
  recommendationItem: {
    flexDirection: 'row',
    gap: Platform.OS === 'web' ? 16 : 12,
    alignItems: 'flex-start',
    paddingBottom: Platform.OS === 'web' ? 16 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  recommendationIcon: {
    width: Platform.OS === 'web' ? 40 : 32,
    height: Platform.OS === 'web' ? 40 : 32,
    borderRadius: Platform.OS === 'web' ? 20 : 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendationText: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: Platform.OS === 'web' ? 18 : 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  recommendationDescription: {
    fontSize: Platform.OS === 'web' ? 16 : 12,
    color: '#6B7280',
    lineHeight: Platform.OS === 'web' ? 24 : 18,
  },
  button: { backgroundColor: "#8B5CF6", padding: 15, borderRadius: 25, width: "15%", alignItems: "center", marginVertical: 5, right: 25},
  buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
});