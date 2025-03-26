import React, { useEffect, useState } from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet, ScrollView, Switch, Modal, ActivityIndicator, Alert, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from 'axios';

export default function LegalSettings() {
    const navigation = useNavigation();
    const { isDarkMode, toggleDarkMode } = useTheme();
    const [terms, setTerms] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [userUuid, setUserUuid] = useState("");

    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";

    // API configuration
    const API_URL = 'https://backend-1-y12u.onrender.com';
    // Get user data on component mount
    useEffect(() => {
        const getUserData = async () => {
            try {
                const userData = await AsyncStorage.getItem('userId');
                if (userData) {
                    // If it's stored as a string
                    setUserUuid(userData);
                    // Or if it's stored as JSON:
                    // const parsedData = JSON.parse(userData);
                    // setUserUuid(parsedData);
                }
            } catch (error) {
                console.error("Error retrieving user data:", error);
            }
        };
        
        getUserData();
    }, []);

    const handleDeleteAccount = async () => {
        if (!userId) {
            Alert.alert("Error", "User ID not found. Please log in again.");
            navigation.navigate("Login");
            return;
        }
    
        setIsLoading(true);
        
        try {
            // Make API call to delete account using Axios
            console.log(`Making request to: ${API_URL}/delete_account with user_uuid: ${userId}`);
            
            const response = await axios({
                method: 'DELETE',
                url: `${API_URL}/delete_account`,
                data: { user_id: userId }
            });
            
            // Axios automatically throws errors for non-2xx responses
            // and parses JSON response automatically
            
            if (response.data.success) {
                // Clear stored user data
                await AsyncStorage.removeItem('userData');
                await AsyncStorage.removeItem('user_Id');
                
                setModalVisible(false);
                Alert.alert(
                    "Account Deleted", 
                    "Your account has been successfully deleted.",
                    [{ text: "OK", onPress: () => navigation.navigate("Login") }]
                );
            } else {
                Alert.alert("Error", response.data.error || "Failed to delete account");
            }
        } catch (error) {
            console.error("Error deleting account:", error);
            
            // Better error handling with Axios
            if (error.response) {
                // The server responded with a status code outside the 2xx range
                console.error("Server responded with:", error.response.status, error.response.data);
                Alert.alert("Server Error", `Status: ${error.response.status}. ${error.response.data.error || "Unknown error"}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error("No response received:", error.request);
                Alert.alert("Network Error", "No response from server. Check your connection and try again.");
            } else {
                // Something happened in setting up the request
                console.error("Request error:", error.message);
                Alert.alert("Request Error", error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
            <View style={{padding: 10}}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Ionicons name="chevron-back-outline" size={27} color={textColor} />
                </TouchableOpacity>
            </View>
            <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Terms and Privacy</Text>
            
            <TouchableOpacity style={styles.settingItem} onPress={() => setTerms(prev => !prev)}>
                <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Terms of Service</Text>
                </View>
                <Ionicons name={terms ? "chevron-down-outline" : "chevron-forward"} size={20} color={isDarkMode ? "#fff" : "#888"} />
            </TouchableOpacity>

            {terms && ( 
                <ScrollView style={{ maxHeight: 420 }}>
                    <Text style={{ padding: 16, lineHeight: 22 }}>
                    <Text style={[{color: '#8B5CF6'},{fontSize: 24}]}>Terms of Service{"\n"}{"\n"}</Text>
                    <Text style={[{color: textColor}, {fontSize: 20}]}>
                    Welcome to MyWatt! These Terms of Service govern your use of our app. By downloading, accessing, or using the app, you agree to these terms. If you do not agree, please refrain from using the app.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>1. Acceptance of Terms{"\n"}</Text>
                    By using MyWatt, you confirm that you have read, understood, and agreed to these Terms of Service. If you are using the app on behalf of an organization, you represent that you have the authority to bind that organization to these terms.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>2. Eligibility{"\n"}</Text>
                    You must be at least 13 years old to use this app. If you are under 18, you must have permission from a parent or guardian to use the app.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>3. Account Registration and Security{"\n"}</Text>
                    You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration. Notify us immediately at mywattapp@gmail.com if you suspect any unauthorized use of your account.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>4. Permitted Use{"\n"}</Text>
                    You may use the app only for its intended purpose: managing and controlling your smart home devices.{"\n"}
                    You agree not to misuse the app, including but not limited to:{"\n"}
                    • Reverse-engineering, decompiling, or disassembling the app.{"\n"}
                    • Using the app for illegal or unauthorized purposes.{"\n"}
                    • Interfering with the app's functionality or servers.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>5. Intellectual Property{"\n"}</Text>
                    All content, features, and technology in the app are owned by MyWatt or its licensors.{"\n"}
                    You are granted a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial purposes.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>6. Third-Party Services{"\n"}</Text>
                    The app may integrate with third-party services or devices. We are not responsible for the functionality, privacy practices, or content of third-party services.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>7. Updates and Changes{"\n"}</Text>
                    We may update the app or these terms from time to time. Continued use of the app after changes constitutes your acceptance of the updated terms.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>8. Termination{"\n"}</Text>
                    We reserve the right to suspend or terminate your access to the app if you violate these terms or engage in misuse.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>9. Limitation of Liability{"\n"}</Text>
                    To the fullest extent permitted by law, MyWatt shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>10. Governing Law{"\n"}</Text>
                    These terms are governed by the laws of United Arab Emirates. Any disputes will be resolved in the courts of Emirate of Dubai.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>11. Contact Us{"\n"}</Text>
                    If you have questions about these terms, contact us at:{"\n"}
                    MyWatt{"\n"}
                    Email: mywattapp@gmail.com{"\n"}
                    </Text>
                    </Text>
                </ScrollView> )}
            
            <TouchableOpacity style={styles.settingItem} onPress={() => setPrivacy(prev => !prev)}>
            <View>
                <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Privacy Policy</Text>
            </View>
            <Ionicons name={privacy ? "chevron-down-outline" : "chevron-forward"} size={20} color={isDarkMode ? "#fff" : "#888"} />
            </TouchableOpacity>

            {privacy && (
                <ScrollView style={{maxHeight: 420}}>
                    <Text style={{ padding: 16, lineHeight: 22 }}>
                    <Text style={[{ color: '#8B5CF6' }, { fontSize: 24 }]}>Privacy Policy{"\n\n"}</Text>
                    <Text style={[{ color: textColor }, { fontSize: 20 }]}>
                    Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use MyWatt.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>1. Information We Collect{"\n"}</Text>
                    Personal Information: Name, email address, phone number, and payment details (if applicable).{"\n"}
                    Device Information: IP address, device type, operating system, and unique device identifiers.{"\n"}
                    Usage Data: Information about how you interact with the app, such as features used and time spent.{"\n"}
                    Smart Home Data: Data from connected devices, such as temperature settings, lighting preferences, and security logs.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>2. How We Use Your Information{"\n"}</Text>
                    To provide and improve the app's functionality.{"\n"}
                    To personalize your experience and offer tailored recommendations.{"\n"}
                    To communicate with you about updates, promotions, and support.{"\n"}
                    To ensure the security and integrity of the app.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>3. Sharing Your Information{"\n"}</Text>
                    We do not sell your personal information to third parties.{"\n"}
                    We may share your information with:{"\n"}
                    • Service providers who assist us in operating the app.{"\n"}
                    • Law enforcement or government authorities if required by law.{"\n"}
                    • Third parties in the event of a merger, acquisition, or sale of assets.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>4. Data Security{"\n"}</Text>
                    We use industry-standard security measures to protect your information.{"\n"}
                    However, no method of transmission over the internet or electronic storage is 100% secure.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>5. Your Rights{"\n"}</Text>
                    You may access, update, or delete your personal information by contacting us at mywattapp@gmail.com.{"\n"}
                    You may opt out of receiving promotional communications at any time.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>6. Children's Privacy{"\n"}</Text>
                    The app is not intended for children under 13. We do not knowingly collect personal information from children under 13.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>7. Changes to This Policy{"\n"}</Text>
                    We may update this Privacy Policy from time to time. We will notify you of significant changes through the app or via email.{"\n\n"}

                    <Text style={{ fontWeight: "bold" }}>8. Contact Us{"\n"}</Text>
                    If you have questions about this Privacy Policy, contact us at:{"\n"}
                    MyWatt{"\n"}
                    Email: mywattapp@gmail.com{"\n\n"}

                    Thank you for trusting MyWatt!
                    </Text>
                </Text>
                </ScrollView>                   
            )}
            
            <View style={styles.footer}>
                <TouchableOpacity style={styles.button} onPress={() => setModalVisible(true)}>
                    <Text style={styles.buttonText}>Delete Account</Text>
                </TouchableOpacity>
            </View>

            {/* Delete account popup */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
                    <Text style={[styles.modalTitle, { color: textColor }, {marginBottom: 0}]}>Are you sure? </Text>
                    <Text style={[styles.modalTitle, { color: textColor }]}>Your account will be permanently deleted.</Text>


                        <View style={styles.modalButtons}>
                            <TouchableOpacity 
                                style={styles.cancelButton} 
                                onPress={() => setModalVisible(false)}
                                disabled={isLoading}
                            >
                                <Text style={{ color: '#8B5CF6' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                                style={[styles.addButton, isLoading && { opacity: 0.7 }]} 
                                onPress={handleDeleteAccount}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <Text style={{ color: '#fff' }}>Delete</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
    greeting: { fontSize: 22 },
    bold: { fontWeight: "bold" },
    profileImage: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: "#ddd" },
    title: { fontSize: 28, fontWeight: "bold", marginBottom: 15 },
    settingItem: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: "#ddd" },
    settingTitle: { fontSize: 18, fontWeight: "bold" },
    settingSubtitle: { fontSize: 14, color: "#777" },
    footer: { alignItems: "center", marginTop: 20 },
    button: { backgroundColor: "#8B5CF6", padding: 15, borderRadius: 25, 
        width: Platform.OS==="web" ? "18%" : '50%',
        alignItems: "center", marginVertical: 5 },
    buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
    houseId: { color: "gray", marginTop: 10 },
    modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
    modalContent: { 
        width: Platform.OS==="web" ? '54%' : '80%', 
        borderRadius: 15, padding: 20 },
    modalTitle: { fontSize: 22, fontWeight: '600', marginBottom: 15, alignSelf: 'center'},
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    cancelButton: { padding: 10 },
    addButton: { backgroundColor: '#8B5CF6', padding: 10, borderRadius: 8 }
});