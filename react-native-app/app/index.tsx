import { View, Text, Button, TextInput, TouchableOpacity, StyleSheet, registerCallableModule } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from "./ThemeContext"; 

//Importing Screens
import MoodProfilesScreen from './moodProfiles';
import RoomsScreen from './rooms';
import RoomsDetails from './roomDetails';
import DeviceDetailScreen from './deviceDetails';
import SettingsScreen from './settings';
import HomeScreen from './Home';
import LoginScreen from './login';
import RegistrationScreen from './registration';
import CoverScreen from './cover';
import ProfileSettings from './ProfileSettings';
import LegalSettings from './LegalSettings';
import EnergyTrackingScreen from './energyTracking';
import PropertyManagerScreen from './Propertymanager';
import PrivacySettings from './PrivacySettings';
import managerSettingsScreen from './managerSettings';
import SupportScreen from './Support';
import HousesScreen from './Houses';
import { useEffect } from 'react';



const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export type RootStackParamList = {
  RoomDetails: undefined;
  DeviceDetails: {
    deviceName: string;
    roomName: string;
    isOn: boolean;
    energyUsage: number;
    unit: string;
    averageTemp?: number;
    lightLevel?: number;
  };
};

function TabNavigator() {
  return (
    <ThemeProvider>
    {/*NavBar with text on tabs 
    
    <Tab.Navigator screenOptions={({ route }: { route: any }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home-outline';
        } else if (route.name === 'Settings') {
          iconName = 'settings-outline';
        } else if (route.name === 'Mood') {
          iconName = 'happy-outline';
        } else if (route.name === 'Rooms') {
          iconName = 'bed-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarStyle: {
        backgroundColor: '#8B5CF6',
        height: '10%',
        paddingLeft: '3%',
        paddingRight: '3%',
      },
      tabBarActiveTintColor: 'yellow',
      tabBarInactiveTintColor: 'white',
      tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold',},
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Rooms" component={MasterBedroomScreen} />
      <Tab.Screen name="Mood" component={MoodProfilesScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator> */}

    <Tab.Navigator screenOptions={{tabBarShowLabel: false,
      tabBarStyle: {
        backgroundColor: '#8B5CF6',
        height: '8%',
        paddingLeft: '3%',
        paddingRight: '3%',
      },
      tabBarActiveTintColor: 'yellow',
      tabBarInactiveTintColor: 'white',
      tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold',},
    }}>
    <Tab.Screen 
    name="Home" 
    component={HomeScreen} 
    options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="home-outline" size={size} color={color} />
      ),
    }} 
  />
  <Tab.Screen 
    name="Rooms" 
    component={RoomsScreen} 
    options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="bed-outline" size={size} color={color} />
      ),
    }} 
        />
          <Tab.Screen 
    name="Energy" 
    component={EnergyTrackingScreen} 
    options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="flash-outline" size={size} color={color} />
      ),
    }} 
  />
  <Tab.Screen 
    name="Mood" 
    component={MoodProfilesScreen} 
    options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="happy-outline" size={size} color={color} />
      ),
    }} 
  />
  <Tab.Screen 
    name="Settings" 
    component={SettingsScreen} 
    options={{
      tabBarIcon: ({ color, size }) => (
        <Ionicons name="settings-outline" size={size} color={color} />
      ),
    }} 
  />
    </Tab.Navigator>
    </ThemeProvider>
  )
}
export default function IndexScreen() {
  useEffect(() => {
    Text.defaultProps = Text.defaultProps || {};
    Text.defaultProps.style = { fontFamily: 'Montserrat-Regular' };

    TextInput.defaultProps = TextInput.defaultProps || {};
    TextInput.defaultProps.style = { fontFamily: 'Montserrat-Regular' };
  }, []);
  return (
    <ThemeProvider>
    <><NavigationIndependentTree><NavigationContainer>
      <Stack.Navigator initialRouteName="Cover" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Cover" component={CoverScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }}/>
          <Stack.Screen name="HousesScreen" component={HousesScreen} />
          <Stack.Screen name="registration" component={RegistrationScreen} options={{ headerShown: false }} />
        <Stack.Screen name="IndexTabs" component={TabNavigator} options={{ headerShown: false }}/>
          <Stack.Screen name="ProfileSettings" component={ProfileSettings} />
          <Stack.Screen name="PropertyManagerScreen" component={PropertyManagerScreen} />
          <Stack.Screen name="PrivacySettings" component={PrivacySettings} />
          <Stack.Screen name="managerSettings" component={managerSettingsScreen}/>
          <Stack.Screen name="LegalSettings" component={LegalSettings} />
          <Stack.Screen name="SupportScreen" component={SupportScreen} />
          <Stack.Screen name='energyTracking' component={EnergyTrackingScreen} />
        <Stack.Screen name="RoomsDetails" component={RoomsDetails} />
        <Stack.Screen name="DeviceDetails" component={DeviceDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer></NavigationIndependentTree></>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    backgroundColor: '#6A5AE0',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonPressed: {
    backgroundColor: '#4A3AB0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
