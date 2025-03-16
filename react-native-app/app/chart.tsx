import React from "react";
import { View, Text, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-chart-kit";

const ElectricityUsageChart = () => {
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = Math.max(windowWidth * 0.8, 300); 

  const data = [
    { day: "Sun", usage: 20 },
    { day: "Mon", usage: 35 },
    { day: "Tue", usage: 30 },
    { day: "Wed", usage: 200 }, // Highest value should be yellow
    { day: "Thu", usage: 28 },
    { day: "Fri", usage: 25 },
    { day: "Sat", usage: 38 },
  ];

  const maxUsage = Math.max(...data.map((item) => item.usage)); // Get highest value

  return (
    <View style={{ 
      backgroundColor: "#7E57C2", 
      borderRadius: 20, 
      padding: 30, 
      width: '90%',
      alignItems: 'center',
      alignSelf: 'center'
    }}>
      <Text style={{ 
        fontSize: 20, 
        color: "#fff", 
        fontWeight: "bold", 
        textAlign: "left",
        marginBottom: 10,
        width: '100%'
      }}>
        Electricity Usage
      </Text>

      <BarChart
        data={{
          labels: data.map((item) => item.day),
          datasets: [{ 
            data: data.map((item) => item.usage),
            color: (opacity = 1) => `rgb(255, 255, 255)`,
          }],
        }}
        width={chartWidth}
        height={220}
        yAxisLabel=""
        yAxisSuffix=" kWh"
        fromZero
        showValuesOnTopOfBars
        segments={5}  // Changed to 5 segments for 0,10,20,30,40,50
        chartConfig={{
          backgroundColor: "#7E57C2",
          backgroundGradientFrom: "#7E57C2",
          backgroundGradientTo: "#7E57C2",
          decimalPlaces: 1,
          color: (opacity = 1, index) => {
            if (index === undefined) return 'rgb(255, 255, 255)';
            return data[index]?.usage === maxUsage 
              ? 'rgb(255, 215, 0)'  // Solid yellow for max value
              : 'rgb(255, 255, 255)'; // Solid white for others
          },
          style: {
            borderRadius: 16,
          },
          barPercentage: 0.8,
          barRadius: 8,
          propsForBackgroundLines: {
            strokeWidth: 1,
            stroke: "rgba(255,255,255,0.2)", // Reduced grid line opacity
          },
          count: 6, 
          formatYLabel: (value) => Math.round(Number(value)).toString(),  // Remove decimals from Y-axis
        }}
        style={{
          marginVertical: 8,
          borderRadius: 16,
        }}
      />
    </View>
  );
};

export default ElectricityUsageChart;
