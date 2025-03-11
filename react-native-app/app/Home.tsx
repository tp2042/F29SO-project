import React from "react";
import { View, Text, Image, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styled from "styled-components/native";
import { useNavigation } from "@react-navigation/native";

// Styled Components
const Container = styled.SafeAreaView`
    flex: 1;
    background-color: #f5f5f5;
    padding: 20px;
`;

const Header = styled.View`
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
`;

const ProfileImage = styled.Image`
    width: 50px;
    height: 50px;
    border-radius: 25px;
    border: 2px solid #ddd;
`;

const WeatherText = styled.Text`
    font-size: 14px;
    color: #777;
`;

const SectionTitle = styled.Text`
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 5px;
`;

const DeviceGrid = styled.View`
    background-color: #fff;
    padding: 10px;
    border-radius: 10px;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 20px;
    
`;

const DeviceCard = styled.TouchableOpacity`
    background-color: #e8e8e8;
    width: 22%;
    padding: 15px;
    border-radius: 10px;
    align-items: center;
    margin: 5px;
`;

const DeviceText = styled.Text`
    font-size: 15px;
    margin-top: 5px;
`;

const EnergyCard = styled.View`
    background-color: #1e1e6e;
    padding: 20px;
    border-radius: 15px;
    height: 240px;
    margin-top: 20px;
    margin-bottom: 10px;
`;

const EnergyText = styled.Text`
    color: white;
    font-size: 36px;
    font-weight: bold;
    margin-left: 30;
    margin-bottom: -25;
`;

const WattPoints = styled.Text`
    color: yellow;
    font-size: 120px;
    font-weight: bold;
    margin-left: 42;
    margin-bottom: 0;
`;

const WattPointsText = styled.Text`
    color: white;
    font-size: 21px;
    font-weight: bold;
    margin-left: 60;
    margin-top: -24;
`;

const RoomGrid = styled.View`
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;
    margin-top: 20px;
`;

const RoomCard = styled.TouchableOpacity`
    background-color: ${(props) => props.bgColor || "#fff"};
    width: 48%;
    padding: 20px;
    border-radius: 15px;
    margin-bottom: 10px;
    height: 180px;
`;

const RoomText = styled.Text`
    font-size: 24;
    font-weight: bold;
`;

export default function HomeScreen() {
    const navigation = useNavigation();

    return (
    <ScrollView>
    <Container>
        <Header>
        <TouchableOpacity>
            <Ionicons name="help-circle-outline" size={28} color="#6A5AE0" />
        </TouchableOpacity>
        <View>
            <Text style={{ fontSize: 22, fontWeight: "bold" }}>Hey, <Text style={{ fontWeight: "bold" }}>Maria 👋</Text></Text>
            <WeatherText>Weather outside is 999°C, hot outside</WeatherText>
        </View>
        <ProfileImage source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} />
        </Header>

        <View style={{ backgroundColor: "#fff", padding: 15, borderRadius: 10, marginTop: 10 }}>
        <SectionTitle>Master Temperature Control</SectionTitle>
        <Text>0°C</Text>
        {/* Replace this with a proper slider component */}
        <View style={{ height: 10, backgroundColor: "#ddd", borderRadius: 5, marginTop: 5 }} />
        </View>

      {/* Devices */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style= {{flex: 1, flexDirection: "row", flexGrow: 1, paddingRight: 10}}>
        <DeviceGrid>
        <SectionTitle>Devices</SectionTitle>
        <Text></Text>
        <DeviceCard>
            <Ionicons name="sunny-outline" size={24} color="black" />
            <DeviceText>Bedroom Lights</DeviceText>
        </DeviceCard>
        <DeviceCard>
            <Ionicons name="shield-outline" size={24} color="black" />
            <DeviceText>Security</DeviceText>
        </DeviceCard>
        <DeviceCard>
            <Ionicons name="lock-closed-outline" size={24} color="black" />
            <DeviceText>Lock</DeviceText>
        </DeviceCard>
        <DeviceCard>
            <Ionicons name="hardware-chip-outline" size={24} color="black" />
            <DeviceText>Robo</DeviceText>
            <View style={{width:20}}></View>
        </DeviceCard>
        </DeviceGrid>
        </ScrollView>

      {/* Gamification Leaderboard */}
      {/* add background image */}
        <EnergyCard>
        <EnergyText>You saved</EnergyText>
        <WattPoints>72 <Ionicons name="trophy-outline" size={80} color="gold"/></WattPoints>
        <WattPointsText>watt points</WattPointsText>
        </EnergyCard>

        <RoomGrid>
        <RoomCard bgColor="#DCC7FF" onPress={() => navigation.navigate("Bathroom")}>
            <RoomText>Bathroom</RoomText>
        </RoomCard>
        <RoomCard bgColor="#B8E4F0" onPress={() => navigation.navigate("Kitchen")}>
            <RoomText>Kitchen</RoomText>
        </RoomCard>
        <RoomCard bgColor="#A3E4D7" onPress={() => navigation.navigate("LivingRoom")}>
            <RoomText>Living Room</RoomText>
        </RoomCard>
        <RoomCard bgColor="#AED6F1" onPress={() => navigation.navigate("Bedroom")}>
            <RoomText>Bedroom</RoomText>
        </RoomCard>
        </RoomGrid>
    </Container>
    </ScrollView>
    );
}   