import React, { useEffect, useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ImageBackground } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";
import { useTheme } from "./ThemeContext";
import ProfileSettings from "./ProfileSettings";


const screenWidth = Dimensions.get("window").width;


export default function HomeScreen() {
    const navigation = useNavigation();
    const [temperature, setTemperature] = useState(24);
    const {isDarkMode} = useTheme();
    const backgroundColor = isDarkMode ? "black" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const rooms = isDarkMode ? darkModeRooms : lightModeRooms;
    const WattPoints = 72; {/* For random = Math.floor(Math.random() * 300) + 30; */}

    useEffect(() => {
            navigation.setOptions({ headerShown: false });
            }, [navigation]);

    const backgroundImage = screenWidth > 800
        ? require("../assets/images/gamification_desktop.jpg") 
        : require("../assets/images/gamification_mobile.jpg");  

    return (
        <ScrollView style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]}>
            <TouchableOpacity>
                <Ionicons name="help-circle-outline" size={28} color="#6A5AE0" />
            </TouchableOpacity>
            <View style={styles.header}>
                <View>
                    <Text style={[styles.greeting, { color: isDarkMode ? "#fff" : "#000" }]}>Hey, <Text style={styles.boldText}>Tushu 👋</Text></Text>
                    <Text style={[styles.weatherText, { color: isDarkMode ? "#fff" : "#000" }]}>Weather outside is 999°C, hot outside</Text>
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

            {/* Devices */}
            <View style={[styles.deviceGrid, {backgroundColor: backgroundColor}]}>
                <Text style={[styles.sectionTitle, { color: isDarkMode ? "#fff" : "#000" }]}> Devices</Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.deviceScroll}>
                    {devices.map((device, index) => (
                        <TouchableOpacity key={index} style={[styles.deviceCard, {backgroundColor: device.isPressed ? "#8B5CF6" : "#e8e8e8"}]} >
                            <Ionicons name={device.icon} size={24} color="black" />
                            <Text style={styles.deviceText}>{device.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Gamification Leaderboard */}
            <ImageBackground source={backgroundImage} resizeMode="cover" style={styles.energyCard} imageStyle={{ width: "100%", height: "100%", borderRadius: 15, alignSelf: "center" }}>
                <Text style={styles.wattPoints}> {WattPoints} </Text>
                <Text style={styles.wattPointsText}>watt points</Text>
            </ImageBackground>



            {/* Rooms */}
            <View style={styles.roomGrid}>
                {rooms.map((room, index) => (
                    <TouchableOpacity key={index} style={[styles.roomCard, { backgroundColor: room.bgColor }]} onPress={() => navigation.navigate(room.name)}>
                        <Text style={styles.roomText}>{room.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const devices = [
    { name: "Bedroom Lights", icon: "sunny-outline", isPressed: false },
    { name: "Security", icon: "shield-outline", isPressed: false },
    { name: "Lock", icon: "lock-closed-outline", isPressed: false },
    { name: "Robo", icon: "hardware-chip-outline", isPressed: false }
];

const lightModeRooms = [
    { name: "Bathroom", bgColor: "#DCC7FF" },
    { name: "Kitchen", bgColor: "#B8E4F0" },
    { name: "Living Room", bgColor: "#A3E4D7" },
    { name: "Bedroom", bgColor: "#AED6F1" }
];

const darkModeRooms = [
    { name: "Bathroom", bgColor: "#7D5CD3" }, 
    { name: "Kitchen", bgColor: "#4DA6C3" },  
    { name: "Living Room", bgColor: "#3DA98F" }, 
    { name: "Bedroom", bgColor: "#4A90E2" }   
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
    },
    roomText: {
        fontSize: 24,
        fontWeight: "bold",
    },
});
