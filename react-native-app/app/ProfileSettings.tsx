import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Image, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "./ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Backend URL - Update this to your actual server address
const BACKEND_URL = "https://backend-1-y12u.onrender.com"; // Change to your Flask server URL

export default function ProfileSettings() {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [household_id, setHouseholdId] = useState("");
    const [password, setPassword] = useState("*****");
    const [userId, setUserId] = useState(""); // Changed from userUuid to userId
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();

    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";
    const inputBackground = isDarkMode ? "#000" : "#fff";
    const inputBorder = isDarkMode ? "#555" : "#ccc";
    const buttonBackground = '#8B5CF6';


    
    // Fetch user data on component mount
    useEffect(() => {
        const getUserData = async () => {
            setIsLoadingData(true);
            try {
                // We're now looking for user_id instead of user_uuid
                const storedUserId = await AsyncStorage.getItem("userId");
                const storedEmail = await AsyncStorage.getItem("email");
                const storedName = await AsyncStorage.getItem("name");
                const householdId = await AsyncStorage.getItem("householdId");

                
                console.log("Retrieved from AsyncStorage:", {
                    id: storedUserId,
                    email: storedEmail,
                    name: storedName
                });
                
                if (storedUserId) {
                    setUserId(storedUserId);
                } else {
                    console.warn("No user ID found in storage");
                }
                
                if (storedEmail) setEmail(storedEmail);
                if (storedName) setName(storedName);
                else setName(""); // Set empty name if not found
                
            } catch (error) {
                console.error("Error fetching user data:", error);
            } finally {
                setIsLoadingData(false);
            }
        };

        getUserData();
    }, []);

    const toggleEdit = () => setIsEditing(!isEditing);
    
    const handleSave = async () => {
        if (!userId) {
            Alert.alert("Error", "User ID not found. Please log in again.");
            return;
        }
        
        if (!name.trim()) {
            Alert.alert("Error", "Name cannot be empty");
            return;
        }
        
        setIsLoading(true);
        
        // Create the payload exactly as your backend expects
        const payload = {
            user_id: parseInt(userId), // Convert string to integer
            new_name: name
        };
        
        console.log("Sending update request with payload:", payload);
        
        try {
            const response = await fetch(`${BACKEND_URL}/update_account`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            
            if (data.success) {
                Alert.alert("Success", "Profile updated successfully");
                // Update the name in AsyncStorage
                await AsyncStorage.setItem("name", name);
            } else {
                Alert.alert("Error", data.error || "Failed to update profile");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            Alert.alert(
                "Connection Error", 
                `Failed to connect to server at ${BACKEND_URL}. Please check your backend connection.`
            );
        } finally {
            setIsLoading(false);
            setIsEditing(false);
        }
    };

    const handleResetPassword = async () => {
        if (!email) {
            Alert.alert("Error", "Email address is required");
            return;
        }
        
        setIsLoading(true);
        
        // Create the payload exactly as your backend expects
        const payload = {
            email: email
        };
        
        console.log("Sending password reset request with payload:", payload);
        
        try {
            const response = await fetch(`${BACKEND_URL}/reset_password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });
            
            console.log("Response status:", response.status);
            const data = await response.json();
            console.log("Response data:", data);
            
            if (data.success) {
                Alert.alert("Success", "Password reset email sent. Please check your inbox.");
            } else {
                Alert.alert("Error", data.error || "Failed to send reset email");
            }
        } catch (error) {
            console.error("Error resetting password:", error);
            Alert.alert(
                "Connection Error", 
                `Failed to connect to server at ${BACKEND_URL}. Please check your backend connection.`
            );
        } finally {
            setIsLoading(false);
        }
    };
    
    // For testing purposes - save data to AsyncStorage with numeric user_id
    

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

            {isLoadingData ? (
                <Text style={{color: textColor}}>Loading profile data...</Text>
            ) : (
                <>
                    {/* Profile Image */}
                    <View style={styles.profileIcon}>
                                            <Text style={styles.profileText}>
                                                {name ? name.charAt(0).toUpperCase() : "U"}
                                            </Text>
                                        </View>
                    <TouchableOpacity disabled={!isEditing}>
                        
                    </TouchableOpacity>

                    {/* User Name */}
                    <Text style={[styles.name, { color: textColor }]}>{name || "No Name Set"}</Text>
                    
                    {/* Debug info - remove in production */}
                    <Text style={{color: textColor, fontSize: 12, marginBottom: 10}}>
                        User ID: {userId || "Not set"}
                    </Text>

                    {/* Input Fields */}
                    {isEditing && (
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: textColor }]}>Name</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
                                value={name}
                                onChangeText={setName}
                                editable={isEditing}
                                placeholder="Enter your name"
                                placeholderTextColor={isDarkMode ? "#888" : "#aaa"}
                            />
                        </View>
                    )}

                    {!isEditing && (
                        <View style={styles.inputContainer}>
                            <Text style={[styles.label, { color: textColor }]}>Email Address</Text>
                            <TextInput
                                style={[styles.input, { backgroundColor: inputBackground, borderColor: inputBorder, color: textColor }]}
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                editable={false}
                            />
                        </View>
                    )}

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

                        <TouchableOpacity 
                            style={[styles.Button, { backgroundColor: buttonBackground }]} 
                            onPress={handleResetPassword}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? "Processing..." : "Reset Password"}
                            </Text>
                        </TouchableOpacity>
                        
                        {/* Debug button - remove in production */}
                        
                        </>
                    )}

                    {/* Save Button */}
                    {isEditing && (
                        <TouchableOpacity 
                            style={[styles.Button, { backgroundColor: buttonBackground }]} 
                            onPress={handleSave}
                            disabled={isLoading}
                        >
                            <Text style={styles.buttonText}>
                                {isLoading ? "Saving..." : "Save"}
                            </Text>
                        </TouchableOpacity>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
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
        fontSize: 18,
        fontWeight: "500",
        marginLeft: "1%",
        marginBottom: '0.3%'
    },
    input: {
        width: "100%",
        padding: 12,
        borderWidth: 1,
        borderRadius: 30,
        height: 45
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
    profileIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: "#6200ea", // Change color as needed
        justifyContent: "center",
        marginBottom: '0.8%',
        alignItems: "center",
    },
    profileText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold",
    }
});