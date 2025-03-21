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
                    <View style={styles.setting}>
                        <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Location Access</Text>
                        <Switch value={location} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>
                    </View>
                    

                <View style={styles.setting}>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Camera Access</Text>
                    <Switch value={camera} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>
                </View>
                

                <View style={styles.setting}>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Bluetooth Access</Text>
                    <Switch value={bluetooth} trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>
                </View>
                

                <View style={styles.setting}>
                    <Text style={[styles.settingTitle, { color: isDarkMode ? "#fff" : "#000" }]}>Notifications</Text>
                    <Switch value={notifs}  trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }} thumbColor={ isDarkMode ? '#ffffff': "#8B5CF6"}/>
                </View>
            </ScrollView>
        );
    }
    
    const styles = StyleSheet.create({
        container: { flex: 1, backgroundColor: "#f5f5f5", padding: 20 },
        header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center"},
        title: { fontSize: 30, fontWeight: "bold", marginBottom: 30 },
        settingTitle: { fontSize: 24 },
        setting: {
            flexDirection: 'row',
            padding: 10,
            justifyContent: 'space-between'
        }
    });