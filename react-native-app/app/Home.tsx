import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { useTheme } from "./ThemeContext";
import ProfileSettings from "./ProfileSettings";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import HouseholdLeaderboardScreen from './HouseholdLeaderboardScreen';
const screenWidth = Dimensions.get("window").width;

// ProfileIcon component defined outside of HomeScreen
const ProfileIcon = ({ navigation }) => {
    const [userName, setUserName] = useState("");

    useEffect(() => {
        const fetchUserName = async () => {
            try {
                const storedName = await AsyncStorage.getItem("name"); // Retrieve name from AsyncStorage
                if (storedName) {
                    setUserName(storedName);
                }
            } catch (error) {
                console.error("Error retrieving user name:", error);
            }
        };

        fetchUserName();
    }, []);

    return (
        <TouchableOpacity onPress={() => navigation.navigate("ProfileSettings")}>
            <View style={styles.profileIcon}>
                <Text style={styles.profileText}>
                    {userName ? userName.charAt(0).toUpperCase() : "U"}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

export default function HomeScreen() {
    const [showLeaderboard, setShowLeaderboard] = useState(false);
    const navigation = useNavigation();
    const [temperature, setTemperature] = useState(24);
    const { isDarkMode } = useTheme();
    const [userName, setUserName] = useState("User");
    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const [rooms, setRooms] = useState([]);
    const [roomEnergyData, setRoomEnergyData] = useState({});
    const [isLoadingRooms, setIsLoadingRooms] = useState(false);
    const [devices, setDevices] = useState([]);
    const [isLoadingDevices, setIsLoadingDevices] = useState(false);
    const [users, setUsers] = useState([]);
    const API_URL = "http://localhost:5003"; 
    const [isLoading, setIsLoading] = useState(true);
    // Energy insights state
    const [showEnergyInsights, setShowEnergyInsights] = useState(false);
    const [energyInsights, setEnergyInsights] = useState(null);
    const [isLoadingInsights, setIsLoadingInsights] = useState(false);
    const [householdId, setHouseholdId] = useState(null);
    const [userId, setUserId] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [WattPoints, setWattPoints] = useState(0);
  
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            setIsLoading(true);
    
            try {
                const storedUserId = await AsyncStorage.getItem('userId');
                const storedHouseholdId = await AsyncStorage.getItem('householdId');
                console.log("Leaderboard API Response:", storedUserId);

                if (!storedUserId || !storedHouseholdId) {
                    console.error("Missing userId or householdId in AsyncStorage");
                    setIsLoading(false);
                    return;
                }
    
                const userId = parseInt(storedUserId, 10);
                const householdId = parseInt(storedHouseholdId, 10);
    
                // Fetch data from API
                const response = await fetch(`${API_URL}/household_users?household_id=${householdId}&current_user_id=${userId}&timeframe=weekly`);
                const data = await response.json();
                console.log("Leaderboard API Response:", data);
    
                if (data.users) {
                    setLeaderboard(data.users);
                    const currentUser = data.users.find(user => user.isCurrentUser);
                    setWattPoints(currentUser ? currentUser.points : 0);
                }
            } catch (error) {
                console.error("Error fetching leaderboard data:", error);
            } finally {
                setIsLoading(false);
            }
        };
    
        fetchLeaderboardData();
    }, []);
    
    useEffect(() => {
        navigation.setOptions({ headerShown: false });

        const loadUserData = async () => {
            try {
                const storedName = await AsyncStorage.getItem("name");
                if (storedName) setUserName(storedName);
                
                const storedHouseholdId = await AsyncStorage.getItem("householdId");
                if (storedHouseholdId) {
                    setHouseholdId(storedHouseholdId);
                    fetchRooms(storedHouseholdId);
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };

        loadUserData();
    }, [navigation]);

    // Fetch rooms from API
    const fetchRooms = async (household_id) => {
        if (!household_id) return;
        
        setIsLoadingRooms(true);
        try {
            const response = await axios.get(`${API_URL}/rooms/${household_id}`);
            if (response.data && response.data.rooms) {
                const fetchedRooms = response.data.rooms;
                
                // Create room objects with styling based on dark/light mode
                const formattedRooms = fetchedRooms.map((room, index) => {
                    const colorIndex = index % 4; // Cycle through 4 colors
                    const colorSet = isDarkMode ? darkModeRoomColors : lightModeRoomColors;
                    return {
                        id: room.id,
                        name: room.name,
                        bgColor: colorSet[colorIndex]
                    };
                });
                
                setRooms(formattedRooms);
                
                // Fetch energy data for each room
                fetchRoomEnergyData(household_id, fetchedRooms);
            }
        } catch (error) {
            console.error("Error fetching rooms:", error);
        } finally {
            setIsLoadingRooms(false);
        }
    };

    // Fetch energy data for rooms
    const fetchRoomEnergyData = async (household_id, roomsList) => {
        try {
            const response = await axios.get(`${API_URL}/room_energy`, {
                params: { household_id }
            });
            
            if (response.data) {
                // Create a map of room_id to energy data
                const energyMap = {};
                response.data.forEach(roomData => {
                    energyMap[roomData.room_id] = {
                        energy_consumed: roomData.energy_consumed,
                        recorded_at: roomData.recorded_at
                    };
                });
                
                setRoomEnergyData(energyMap);
            }
        } catch (error) {
            console.error("Error fetching room energy data:", error);
        }
    };

    // Fetch devices for a specific room
    const fetchDevicesForRoom = async (roomId) => {
        if (!householdId || !roomId) return;
        
        setIsLoadingDevices(true);
        try {
            const response = await axios.get(`${API_URL}/devices`, {
                params: {
                    roomId: roomId,
                    householdId: householdId
                }
            });
            
            if (response.data) {
                setDevices(response.data);
            }
        } catch (error) {
            console.error(`Error fetching devices for room ${roomId}:`, error);
        } finally {
            setIsLoadingDevices(false);
        }
    };

    const fetchEnergyInsights = async () => {
        if (!householdId) {
            console.error("Household ID not available");
            return;
        }
        
        setIsLoadingInsights(true);
        try {
            const response = await axios.get(`${API_URL}/energy_insights`, {
                params: {
                    household_id: householdId
                }
            });
            setEnergyInsights(response.data);
            setShowEnergyInsights(true);
        } catch (error) {
            console.error("Error fetching energy insights:", error);
        } finally {
            setIsLoadingInsights(false);
        }
    };

    const handleRoomPress = (room) => {
        fetchDevicesForRoom(room.id);
        navigation.navigate(room.name, { 
            roomId: room.id, 
            roomName: room.name,
            energyData: roomEnergyData[room.id]
        });
    };

    const backgroundImage = screenWidth > 800
        ? require("../assets/images/gamification_desktop.jpg") 
        : require("../assets/images/gamification_mobile.jpg");  

    // Default devices list if API call fails
    const defaultDevices = [
        { name: "Bedroom Lights", icon: "sunny-outline", isPressed: false },
        { name: "Security", icon: "shield-outline", isPressed: false },
        { name: "Lock", icon: "lock-closed-outline", isPressed: false },
        { name: "Robo", icon: "hardware-chip-outline", isPressed: false }
    ];

    const displayDevices = devices.length > 0 ? devices.map(device => ({
        name: device.device_name || "Device",
        icon: getIconForDevice(device.device_type),
        isPressed: device.status === "on",
        id: device.device_id
    })) : defaultDevices;

    return (
        <ScrollView style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]}>
            <TouchableOpacity>
                <Ionicons name="help-circle-outline" size={28} color="#6A5AE0" />
            </TouchableOpacity>
            
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: isDarkMode ? "#fff" : "#000" }]}>Hey, <Text style={styles.boldText}>{userName} 👋</Text></Text>
                    <Text style={[styles.weatherText, { color: isDarkMode ? "#fff" : "#000" }]}>Weather outside is 999°C, hot outside</Text>
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("ProfileSettings")}>
                    <View style={styles.profileIcon}>
                        <Text style={styles.profileText}>
                            {userName ? userName.charAt(0).toUpperCase() : "U"}
                        </Text>
                    </View>
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

            {/* Devices */}
            <View style={[styles.deviceGrid, {backgroundColor: backgroundColor}]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#000" }]}> Devices</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deviceScroll}>
                    {isLoadingDevices ? (
                        <ActivityIndicator size="small" color="#8B5CF6" />
                    ) : (
                        displayDevices.map((device, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.deviceCard, {backgroundColor: device.isPressed ? "#8B5CF6" : "#e8e8e8"}]}
                            >
                                <Ionicons name={device.icon} size={24} color={device.isPressed ? "white" : "black"} />
                                <Text style={[styles.deviceText, {color: device.isPressed ? "white" : "black"}]}>{device.name}</Text>
                            </TouchableOpacity>
                        ))
                    )}
                </ScrollView>
            </View>

            {/* Gamification Leaderboard */}
            <TouchableOpacity 
                onPress={() => setShowLeaderboard(true)}
                activeOpacity={0.8}
            >
                <ImageBackground 
                    source={backgroundImage} 
                    resizeMode="cover" 
                    style={styles.energyCard} 
                    imageStyle={{ width: "100%", height: "100%", borderRadius: 15, alignSelf: "center" }}
                >
                    <View style={styles.energyCardContent}>
                        <View style={styles.pointsDisplay}>
                            <Text style={styles.wattPoints}>{isLoading ? "..." : WattPoints}</Text>
                            <Text style={styles.wattPointsText}>watt points</Text>
                        </View>
                        
                        <View style={styles.familyRankingPreview}>
                            <Text style={styles.familyRankingTitle}>Leaderboard</Text>

                            <View style={styles.familyAvatars}>
                                {leaderboard.slice(0, 5).map((user, index) => (
                                    <Image 
                                        key={user.id}
                                        source={{ uri: user.avatar }} 
                                        style={[
                                            styles.familyAvatar, 
                                            { marginLeft: index === 0 ? 0 : -15, zIndex: 5 - index }, 
                                            user.isCurrentUser ? { borderWidth: 2, borderColor: "#0d3b66" } : {}
                                        ]} 
                                    />
                                ))}
                            </View>
                        </View>
                    </View>
                </ImageBackground>
            </TouchableOpacity>

            {/* Household Leaderboard Modal */}
            <HouseholdLeaderboardScreen 
                visible={showLeaderboard}
                onClose={() => setShowLeaderboard(false)}
                householdId={householdId}
                currentUserWattPoints={WattPoints}
                API_URL={API_URL}
            />

            {/* Rooms */}
            <View style={styles.roomGrid}>
                {isLoadingRooms ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#8B5CF6" />
                        <Text style={styles.loadingText}>Loading rooms...</Text>
                    </View>
                ) : (
                    rooms.length > 0 ? (
                        rooms.map((room, index) => (
                            <TouchableOpacity 
                                key={index} 
                                style={[styles.roomCard, { backgroundColor: room.bgColor }]} 
                                onPress={() => handleRoomPress(room)}
                            >
                                <Text style={styles.roomText}>{room.name}</Text>
                                {roomEnergyData[room.id] && (
                                    <View style={styles.roomEnergyIndicator}>
                                        <Ionicons name="flash-outline" size={20} color="#333" />
                                        <Text style={styles.roomEnergyText}>
                                            {roomEnergyData[room.id].energy_consumed?.toFixed(1)} kWh
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>
                        ))
                    ) : (
                        <Text style={[styles.noContentText, {color: textColor}]}>No rooms found. Please set up your home.</Text>
                    )
                )}
            </View>

            {/* Energy Insights Button */}
            <TouchableOpacity 
                style={[styles.insightsButton, {backgroundColor: isDarkMode ? "#8B5CF6" : "#6A5AE0"}]} 
                onPress={fetchEnergyInsights}
                disabled={!householdId}>
                <Ionicons name="flash" size={24} color="white" />
                <Text style={styles.insightsButtonText}>Energy Insights</Text>
            </TouchableOpacity>

            {/* Energy Insights Panel */}
            {isLoadingInsights && (
                <View style={[styles.insightsPanel, {backgroundColor: backgroundColor}]}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={[styles.loadingText, {color: textColor}]}>Loading energy insights...</Text>
                </View>
            )}

            {showEnergyInsights && energyInsights && (
                <View style={[styles.insightsPanel, {backgroundColor: backgroundColor}]}>
                    <View style={styles.insightsHeader}>
                        <Text style={[styles.sectionTitle, {color: textColor}]}>Energy Insights</Text>
                        <TouchableOpacity onPress={() => setShowEnergyInsights(false)}>
                            <Ionicons name="close-circle" size={24} color={isDarkMode ? "#fff" : "#000"} />
                        </TouchableOpacity>
                    </View>
                    
                    <View style={styles.insightsSummary}>
                        <View style={styles.insightItem}>
                            <Ionicons name="flash-outline" size={24} color="#8B5CF6" />
                            <View>
                                <Text style={[styles.insightValue, {color: textColor}]}>
                                    {energyInsights.household_energy.total_energy_consumed.toFixed(1)} kWh
                                </Text>
                                <Text style={styles.insightLabel}>Total Consumption</Text>
                            </View>
                        </View>
                        
                        <View style={styles.insightItem}>
                            <Ionicons name="sunny-outline" size={24} color="#8B5CF6" />
                            <View>
                                <Text style={[styles.insightValue, {color: textColor}]}>
                                    {energyInsights.household_energy.total_energy_generated.toFixed(1)} kWh
                                </Text>
                                <Text style={styles.insightLabel}>Energy Generated</Text>
                            </View>
                        </View>
                        
                        <View style={styles.insightItem}>
                            <Ionicons name="leaf-outline" size={24} color="#8B5CF6" />
                            <View>
                                <Text style={[styles.insightValue, {color: textColor}]}>
                                    {energyInsights.household_energy.average_renewable_percentage.toFixed(1)}%
                                </Text>
                                <Text style={styles.insightLabel}>Renewable Energy</Text>
                            </View>
                        </View>
                    </View>
                    
                    <View style={styles.insightsTips}>
                        <Text style={[styles.tipsTitle, {color: textColor}]}>Smart Tips</Text>
                        {energyInsights.text_insights && energyInsights.text_insights.map((tip, index) => (
                            <View key={index} style={styles.tipItem}>
                                <Ionicons name="bulb-outline" size={20} color="#8B5CF6" />
                                <Text style={[styles.tipText, {color: textColor}]}>{tip}</Text>
                            </View>
                        ))}
                    </View>
                    
                    <View style={styles.roomEnergySection}>
                        <Text style={[styles.subSectionTitle, {color: textColor}]}>Room Energy Usage</Text>
                        <View style={styles.roomEnergyInfo}>
                            <Text style={[styles.energyText, {color: textColor}]}>
                                Total: {energyInsights.room_energy.total_energy_consumed.toFixed(1)} kWh
                            </Text>
                            <Text style={[styles.energyText, {color: textColor}]}>
                                Rooms tracked: {energyInsights.room_energy.total_records}
                            </Text>
                        </View>
                    </View>
                    
                    <View style={styles.deviceEnergySection}>
                        <Text style={[styles.subSectionTitle, {color: textColor}]}>Device Energy Usage</Text>
                        <View style={styles.deviceEnergyInfo}>
                            <Text style={[styles.energyText, {color: textColor}]}>
                                Total: {energyInsights.device_energy.total_energy_consumed.toFixed(1)} kWh
                            </Text>
                            <Text style={[styles.energyText, {color: textColor}]}>
                                Devices tracked: {energyInsights.device_energy.total_records}
                            </Text>
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
}

// Helper function to get appropriate icon based on device type
function getIconForDevice(deviceType) {
    const iconMap = {
        "light": "sunny-outline",
        "fan": "water-outline",
        "ac": "thermometer-outline",
        "heater": "flame-outline",
        "tv": "tv-outline",
        "lock": "lock-closed-outline",
        "camera": "camera-outline",
        "sensor": "analytics-outline",
        "outlet": "power-outline"
    };
    
    return iconMap[deviceType?.toLowerCase()] || "hardware-chip-outline";
}

// Revised room colors
const lightModeRoomColors = ["#DCC7FF", "#B8E4F0", "#A3E4D7", "#AED6F1"];
const darkModeRoomColors = ["#7D5CD3", "#4DA6C3", "#3DA98F", "#4A90E2"];

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
        width: 50,
        height: 50,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: "#ddd",
    },
    greeting: {
        fontSize: 22,
    },
    boldText: {
        fontWeight: "bold",
    },
    weatherText: {
        fontSize: 14,
        color: "#777",
    },
    tempControl: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
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
        padding: 20,
        borderRadius: 15,
        height: 240,
        marginTop: 20,
        overflow: "hidden"
    },
    wattPoints: {
        color: "yellow",
        fontSize: 120,
        fontWeight: "bold",
        marginLeft: '11%',
        marginTop: 45
    },
    wattPointsText: {
        color: "white",
        fontSize: 21,
        fontWeight: "bold",
        marginLeft: '15%',
        marginTop: -27
    },
    roomGrid: {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-between",
        marginTop: 20,
    },
    roomCard: {
        width: "48%",
        padding: 20,
        borderRadius: 15,
        marginBottom: 10,
        height: 180,
        position: "relative"
    },
    roomText: {
        fontSize: 24,
        fontWeight: "bold",
    },
    roomEnergyIndicator: {
        position: "absolute",
        bottom: 15,
        left: 15,
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "rgba(255,255,255,0.8)",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 15,
    },
    roomEnergyText: {
        marginLeft: 5,
        fontWeight: "500",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        padding: 20,
    },
    loadingText: {
        marginTop: 10,
        textAlign: "center",
    },
    noContentText: {
        textAlign: "center",
        width: "100%",
        padding: 20,
    },
    // Energy Insights Styles
    insightsButton: {
        backgroundColor: "#6A5AE0",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        padding: 12,
        borderRadius: 10,
        marginTop: 20,
    },
    insightsButtonText: {
        color: "white",
        fontWeight: "bold",
        fontSize: 16,
        marginLeft: 10,
    },
    insightsPanel: {
        backgroundColor: "#fff",
        padding: 15,
        borderRadius: 10,
        marginTop: 15,
    },
    insightsHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 15,
    },
    insightsSummary: {
        flexDirection: "row",
        justifyContent: "space-between",
        flexWrap: "wrap",
        marginBottom: 15,
    },
    insightItem: {
        flexDirection: "row",
        alignItems: "center",
        width: "48%",
        marginBottom: 15,
    },
    insightValue: {
        fontWeight: "bold",
        fontSize: 16,
    },
    insightLabel: {
        fontSize: 12,
        color: "#777",
    },
    insightsTips: {
        marginTop: 10,
        marginBottom: 15,
        padding: 10,
        backgroundColor: "rgba(139, 92, 246, 0.1)",
        borderRadius: 8,
    },
    tipsTitle: {
        fontWeight: "bold",
        marginBottom: 10,
    },
    tipItem: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    tipText: {
        marginLeft: 8,
        flex: 1,
        fontSize: 14,
    },
    subSectionTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 8,
    },
    roomEnergySection: {
        marginBottom: 15,
    },
    deviceEnergySection: {
        marginBottom: 8,
    },
    roomEnergyInfo: {
        backgroundColor: "rgba(139, 92, 246, 0.05)",
        padding: 10,
        borderRadius: 8,
    },
    deviceEnergyInfo: {
        backgroundColor: "rgba(139, 92, 246, 0.05)",
        padding: 10,
        borderRadius: 8,
    },
    energyText: {
        fontSize: 14,
        marginBottom: 4,
    },
    energyCardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: '100%',
    },
    pointsDisplay: {
        flex: 1,
    },
    familyRankingPreview: {
        width: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    familyRankingTitle: {
        color: '#0d3b66',
        fontWeight: 'bold',
        fontSize: 16,
        marginBottom: 10,
    },
    familyAvatars: {
        flexDirection: 'row',
        marginBottom: 10,
    },
    familyAvatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 1,
        borderColor: 'white',
    },
    viewLeaderboardButton: {
        position: "absolute",
        bottom: 15,
        right: 15,
        backgroundColor: "rgba(0,0,0,0.4)",
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
        flexDirection: "row",
        alignItems: "center"
    },
    viewLeaderboardText: {
        color: "white",
        fontWeight: "bold",
        marginRight: 5
    },
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#6200ea", // Change color as needed
        justifyContent: "center",
        alignItems: "center",
    },
    profileText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    }
});