import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "./ThemeContext";

export default function PrivacySettings() {
    const navigation = useNavigation();
    const { isDarkMode } = useTheme();
    const location = false;
    const notifs = false;
    const camera = false;
    const bluetooth = false;

    const backgroundColor = isDarkMode ? "#000" : "#fff";
    const textColor = isDarkMode ? "#fff" : "#000";


    return (
            <ScrollView style={[styles.container, { backgroundColor: isDarkMode ? "#333" : "#f5f5f5" }]}>
                <View style={{padding: 10}}>
                    <TouchableOpacity onPress={() => navigation.goBack()}>
                        <Ionicons name="chevron-back-outline" size={27} color={textColor} />
                    </TouchableOpacity>
                </View>
                <Text style={[styles.title, { color: isDarkMode ? "#fff" : "#000" }]}>Privacy and Security</Text>
                    <View>
                        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Location Access</Text>
                    </View>
                    <Switch value={location} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>

                <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Camera Access</Text>
                </View>
                <Switch value={camera} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>

                <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Bluetooth Access</Text>
                </View>
                <Switch value={bluetooth} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>

                <View>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Notifications</Text>
                </View>
                <Switch value={notifs}  trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>
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
        button: { backgroundColor: "#8B5CF6", padding: 15, borderRadius: 25, width: "30%", alignItems: "center", marginVertical: 5 },
        buttonText: { color: "white", fontSize: 16, fontWeight: "bold" },
        houseId: { color: "gray", marginTop: 10 },
        modalContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.4)' },
        modalContent: { width: '54%', borderRadius: 15, padding: 20 },
        modalTitle: { fontSize: 22, fontWeight: '600', marginBottom: 15, alignSelf: 'center'},
        modalButtons: { flexDirection: 'row', justifyContent: 'space-between' },
        cancelButton: { padding: 10 },
        addButton: { backgroundColor: '#8B5CF6', padding: 10, borderRadius: 8 }
    });