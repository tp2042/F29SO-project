import React, { useState } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeContext";

export default function ProfileSettings() {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("Maria");
    const [phone, setPhone] = useState("0000000000");
    const [email, setEmail] = useState("aaaaaaa@a.com");
    const [password, setPassword] = useState("*************");
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const inputBackground = isDarkMode ? "#000" : "#fff";
    const inputBorder = isDarkMode ? "#555" : "#ccc";
    const buttonBackground = '#8B5CF6';

    const toggleEdit = () => setIsEditing(!isEditing);
    const handleSave = () => {
        console.log("Saved:", { name, phone, email });
        setIsEditing(false);
    };

    const handleChangePassword = () => {
        console.log("Change Password Pressed");
    };

    return (
        <View style={[styles.container, {backgroundColor: isDarkMode ? "#333" : "#f5f5f5"}]}>
            {/* Back and Edit Icons */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back-outline" size={27} color={textColor} />
                </TouchableOpacity>
                <TouchableOpacity onPress={toggleEdit}>
                    <Ionicons name={isEditing ? "close-outline" : "pencil-outline"} size={20} color={textColor} />
                </TouchableOpacity>
            </View>

            {/* Profile Image */}
            <Image source={{ uri: "https://randomuser.me/api/portraits/women/45.jpg" }} style={styles.profileImage} />
            <TouchableOpacity disabled={!isEditing}>
                <Text style={[styles.changePicText, { color: isEditing ? "#3B82F6" : "#888" }]}>
                    Change Profile Picture
                </Text>
            </TouchableOpacity>

            {/* User Name */}
            <Text style={[styles.name, { color: textColor }]}>{name}</Text>

            {/* Input Fields */}

            {isEditing && (
                <>
                <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: textColor }]}>Name</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
                    value={name}
                    onChangeText={setName}
                    editable={isEditing}
                    />
                </View>
                </>
                )}

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: textColor }]}>Phone Number</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    editable={isEditing}
                />
            </View>

            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: textColor }]}>Email Address</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    editable={isEditing}
                />
            </View>

            {!isEditing && (
            <>
            <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: textColor }]}>Password</Text>
                <TextInput
                    style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    editable={false}
                />
            </View>

            <TouchableOpacity style={[styles.Button, { backgroundColor: buttonBackground }]} onPress={handleChangePassword}>
                <Text style={styles.buttonText}>Reset Password</Text>
            </TouchableOpacity>
            </>
            )}

            {/* Save Button */}
            {isEditing && (
                <TouchableOpacity style={[styles.Button, { backgroundColor: buttonBackground }]} onPress={handleSave}>
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        alignItems: "center",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
        marginBottom: 20,
    },
    editIcon: {
        fontSize: 18,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 10,
    },
    changePicText: {
        marginBottom: 10,
        fontWeight: "bold",
    },
    name: {
        fontSize: 30,
        fontWeight: "bold",
        marginBottom: 20,
    },
    inputContainer: {
        width: "75%",
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: "500",
        marginLeft: "1%"
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderRadius: 30,
    },
    Button: {
        marginTop: 20,
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 30,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff"
    },
});
