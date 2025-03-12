import React, { useState } from "react";
import { View, Text, Image, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import Slider from "@react-native-community/slider";


const screenWidth = Dimensions.get("window").width;

export default function HomeScreen() {
    const navigation = useNavigation();
    const [temperature, setTemperature] = useState(22);

    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity>
                <Ionicons name="help-circle-outline" size={28} color="#6A5AE0" />
            </TouchableOpacity>
            <View style={styles.header}>
                <View>
                    <Text style={styles.greeting}>Hey, <Text style={styles.boldText}>Tushu 👋</Text></Text>
                    <Text style={styles.weatherText}>Weather outside is 999°C, hot outside</Text>
                </View>
                <Image source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} style={styles.profileImage} />
            </View>

            <View style={styles.tempControl}>
                <Text style={styles.sectionTitle}>Master Temperature Control</Text>
                <Text>{temperature}°C</Text>
                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={42}
                    step={1} // Increment in 1°C
                    value={temperature}
                    onValueChange={(value) => setTemperature(value)}
                    minimumTrackTintColor="#8B5CF6"
                    maximumTrackTintColor="#e8e8e8"
                    thumbTintColor="#8B5CF6"/>
            </View>

            {/* Devices */}
            <View style={styles.deviceGrid}>
                <Text style={styles.sectionTitle}> Devices</Text>
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
            <View style={styles.energyCard}>
                <Text style={styles.energyText}>You saved</Text>
                <Text style={styles.wattPoints}>72 <Ionicons name="trophy-outline" size={80} color="gold"/></Text>
                <Text style={styles.wattPointsText}>watt points</Text>
            </View>

            {/* Rooms */}
            <View style={styles.roomGrid}>
                {rooms.map((room, index) => (
                    <TouchableOpacity key={index} style={[styles.roomCard, { backgroundColor: room.bgColor }]} onPress={() => navigation.navigate(room.name)}>
                        <Text style={styles.roomText}>{room.name}</Text>
                    </TouchableOpacity>
                ))}
            </View>
            <View style={{height:20}}/> {/*for extra space below to scroll*/}
        </ScrollView>
    );
}

const devices = [
    { name: "Bedroom Lights", icon: "sunny-outline", isPressed: false },
    { name: "Security", icon: "shield-outline", isPressed: false },
    { name: "Lock", icon: "lock-closed-outline", isPressed: false },
    { name: "Robo", icon: "hardware-chip-outline", isPressed: false }
];

const rooms = [
    { name: "Bathroom", bgColor: "#DCC7FF" },
    { name: "Kitchen", bgColor: "#B8E4F0" },
    { name: "Living Room", bgColor: "#A3E4D7" },
    { name: "Bedroom", bgColor: "#AED6F1" }
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
        backgroundColor: "#1e1e6e",
        padding: 20,
        borderRadius: 15,
        height: 240,
        marginTop: 20,
        marginBottom: 10,
    },
    energyText: {
        color: "white",
        fontSize: 36,
        fontWeight: "bold",
        marginLeft: '10%'
    },
    wattPoints: {
        color: "yellow",
        fontSize: 120,
        fontWeight: "bold",
        marginLeft: '11%',
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
