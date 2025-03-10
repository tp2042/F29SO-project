import { View, Text, TouchableOpacity, StyleSheet, registerCallableModule } from 'react-native';
import { NavigationContainer, NavigationIndependentTree } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

//Importing Screens
import MoodProfilesScreen from './moodProfiles';
import MasterBedroomScreen from './masterBedroom';
import DeviceScreen from './device';
import SettingsScreen from './settings';
import HomeScreen from './Home';
import LoginScreen from './login';
import RegistrationScreen from './registration';

import { useState } from 'react';

const Tab = createBottomTabNavigator();

export default function IndexScreen() {
  const [isPressed, setIsPressed] = useState(false);

  return (
    <><NavigationIndependentTree><NavigationContainer>
      <Tab.Navigator screenOptions={({ route }: { route: any }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = 'home-outline';
          } else if (route.name === 'Settings') {
            iconName = 'settings-outline';
          } else if (route.name === 'Mood') {
            iconName = 'happy-outline';
          } else if (route.name === 'Devices') {
            iconName = 'bulb-outline';
          } else if (route.name === 'Rooms') {
            iconName = 'bed-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: {
          backgroundColor: '#8B5CF6',
          height: '8%',
          paddingLeft: '3%',
          paddingRight: '3%',
        },
        tabBarActiveTintColor: 'yellow',
        tabBarInactiveTintColor: 'white',
        tabBarLabelStyle: { fontSize: 14, fontWeight: 'bold',},
      })}>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="Rooms" component={MasterBedroomScreen} />
        <Tab.Screen name="Devices" component={DeviceScreen} />
        <Tab.Screen name="Mood" component={MoodProfilesScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />

        //Login and registration screen here just for checking will remove later
        {/*<Tab.Screen name="registration" component={RegistrationScreen} />
        <Tab.Screen name="Login" component={LoginScreen} />*/}
        
      </Tab.Navigator>
    </NavigationContainer></NavigationIndependentTree></>
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
