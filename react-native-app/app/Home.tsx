import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { BarChart } from "react-native-chart-kit";
import { useTheme } from "./ThemeContext";
import ProfileSettings from "./ProfileSettings";
import EnergyTrackingScreen from "./energyTracking";


const screenWidth = Dimensions.get("window").width;


export default function HomeScreen() {
    const navigation = useNavigation();
    const [temperature, setTemperature] = useState(24);
    const {isDarkMode} = useTheme();
    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const rooms = isDarkMode ? darkModeRooms : lightModeRooms;
    const WattPoints = 72; {/* For random = Math.floor(Math.random() * 300) + 30; */}
    const isWeb = Platform.OS === 'web';

    {/*
    const chartWidth = isWeb 
    ? Math.min(Math.max(screenWidth * 0.6, 500), 800)
    : screenWidth - 32;

    const data = [
        { day: "Sun", usage: 20 },
        { day: "Mon", usage: 35 },
        { day: "Tue", usage: 30 },
        { day: "Wed", usage: 200 },
        { day: "Thu", usage: 28 },
        { day: "Fri", usage: 25 },
        { day: "Sat", usage: 38 },
    ];
    const maxUsage = Math.max(...data.map((item) => item.usage)); */}

    useEffect(() => {
            navigation.setOptions({ headerShown: false });
            }, [navigation]);

    const backgroundImage = screenWidth > 800
        ? require("../assets/images/gamification_desktop.jpg") 
        : require("../assets/images/gamification_mobile.jpg");  
    
    {/* Weather API */}
        const [weather, setWeather] = useState<{ temp: number; description: string } | null>(null);
        useEffect(() => {
            const apiKey = 'd0a8acdd23e7995e921ab1c49957c17d';
            const city = 'Dubai';

            fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`)
            .then((res) => res.json())
            .then((data) => {
                if (data.cod === 200) {
                const tempCelsius = parseFloat((data.main.temp - 273.15).toFixed(2));
                const description = data.weather[0].description;
                setWeather({ temp: tempCelsius, description });
                }
            })
            .catch((err) => console.error('Error fetching weather:', err));
        }, []);

    return (
        <ScrollView style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]}>
            <View style={{height: 15}}></View>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: isDarkMode ? "#fff" : "#000" }]}>Hey, <Text style={styles.boldText}>Maria 👋</Text></Text>
                    {weather ? (
                        <Text style={[styles.weatherText, { color: textColor }]}>
                            Weather outside is <Text style={{ fontWeight: 'bold', color: '#8B5CF6' }}>{weather.temp}°C</Text>, {weather.description}
                        </Text>
                    ) : (
                        <Text style={[styles.weatherText, { color: textColor }]}>Loading weather...</Text>
                    )}
                </View>  
                <TouchableOpacity onPress={() => navigation.navigate(ProfileSettings)}>
                <Image source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} style={styles.profileImage} />
                </TouchableOpacity>
            </View>

            <View style={[styles.tempControl, {backgroundColor: backgroundColor}]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Master Temperature Control</Text>
                <Text style={{ color: isDarkMode ? "#fff" : "#000" }}>{temperature}°C</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={42}
                    step={1} 
                    value={temperature}
                    onValueChange={(value) => setTemperature(value)}
                    minimumTrackTintColor="#8B5CF6"
                    maximumTrackTintColor="#e8e8e8"
                    thumbTintColor="#8B5CF6"/>
            </View>

            {/* Energy usage graph 
            <TouchableOpacity onPress={() => navigation.navigate("EnergyTrackingScreen", { propertyName: "my home" })}>
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
                                borderRadius: 15,
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
                        </TouchableOpacity> */}
            
            {/* Gamification Leaderboard */}
            <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.energyCard} imageStyle={{ width: "100%", height: "100%", borderRadius: 15, alignSelf: "center" }}>
                <Text style={styles.wattPoints}> {WattPoints} </Text>
                <Text style={styles.wattPointsText}>watt points</Text>
            </ImageBackground>

            {/* Rooms */}
            <View style={styles.roomGrid}>
                {rooms.map((room, index) => (
                    <TouchableOpacity key={index} style={[styles.roomCard, { backgroundColor: room.bgColor }]} onPress={() => navigation.navigate('RoomsDetails', { roomName: room.name})}>
                        <Text style={styles.roomText}>{room.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}


const lightModeRooms = [
    { name: "Kitchen", bgColor: "#B8E4F0" },
    { name: "Living Room", bgColor: "#A3E4D7" },
    { name: "Master Bedroom", bgColor: "#DCC7FF" },
];

const darkModeRooms = [
    { name: "Kitchen", bgColor: "#4DA6C3" },  
    { name: "Living Room", bgColor: "#3DA98F" }, 
    { name: "Master Bedroom", bgColor: "#7D5CD3" }   
];

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 20,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    profileImage: {
        width: Platform.OS==="web" ? 60 : 50,
        height: Platform.OS==="web" ? 60 : 50,
        borderRadius: Platform.OS==="web" ? 30 : 25,
        borderWidth: 2,
        borderColor: "#ddd",
    },
    greeting: {
        fontSize: Platform.OS==="web" ? 60 : 30,
    },
    boldText: {
        fontWeight: "bold",
    },
    weatherText: {
        fontSize: Platform.OS==="web" ? 20 : 15,
        color: "#777",
    },
    tempControl: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: Platform.OS==="web" ? 20 : 18,
        fontWeight: "bold",
        marginBottom: 5,
    },
    slider: {
        height: 0,
        backgroundColor: "#ddd",
        borderRadius: 5,
        marginTop: 5,
    },
    deviceGrid: {
        backgroundColor: "#fff",
        padding: 10,
        borderRadius: 10,
        marginTop: 20,
    },
    deviceScroll: {
        flexDirection: "row",
        paddingVertical: 10,
        paddingHorizontal: 5,
        paddingRight: 5
    },
    deviceCard: {
        backgroundColor: "#e8e8e8",
        width: Platform.OS==="web" ? '75%' : '42%',
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 5,
    },
    deviceCardPress: {
        backgroundColor: "#8B5CF6",
        width: '42%',
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginHorizontal: 5,
    },
    deviceText: {
        fontSize: 15,
        marginTop: 5,
    },
    energyCard: {
        width: '100%',
        borderRadius: 15,
        height: 250,
        marginTop: 20,
        overflow: "hidden"
    },
    wattPoints: {
        color: "yellow",
        fontSize: 120,
        fontWeight: "bold",
        alignSelf: 'center',
        marginTop: Platform.OS==="web" ? 75 : 30,
        justifyContent: 'center'
    },
    wattPointsText: {
        color: "white",
        fontSize: 21,
        fontWeight: "bold",
        alignSelf: 'center',
        marginTop: -27
    },
    roomGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
    },
    roomCard: {
        width: Platform.OS==='web' ? "33%" : '48%',
        padding: 20,
        borderRadius: 15,
        marginBottom: 10,
        height: 180,
    },
    roomText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    chartCard: {
        backgroundColor: '#8B5CF6',
        borderRadius: 15,
        padding: 40,
        marginTop: 20
        },
        chartScrollContainer: {
        paddingRight: 0,
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
});
