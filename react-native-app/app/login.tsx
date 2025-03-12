import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash-outline" size={Platform.OS === 'web' ? 80 : 60} color="#000" />
          </View>
          <Text style={styles.logoText}>My Watt</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Login</Text>
          <TextInput 
            style={styles.input}
            placeholderTextColor="#6B7280"
          />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={styles.input}
            secureTextEntry
            placeholderTextColor="#6B7280"
          />
        </View>
        
        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('IndexTabs')}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>
        
        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={() => navigation.navigate('Registration')}
        >
          <Text style={styles.buttonText}>Sign up</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  scrollContent: {
    flexGrow: 1,
    padding: Platform.OS === 'web' ? '5% 15%' : 20,
    justifyContent: 'center',
    minHeight: '100%',
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: Platform.OS === 'web' ? 60 : 30,
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 60 : 40,
  },
  logoIcon: {
    marginBottom: Platform.OS === 'web' ? 20 : 10,
  },
  logoText: {
    fontSize: Platform.OS === 'web' ? 48 : 36,
    fontWeight: '600',
    color: '#000',
  },
  formGroup: {
    width: '100%',
    marginBottom: Platform.OS === 'web' ? 30 : 20,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: '#8B5CF6',
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: Platform.OS === 'web' ? 20 : 15,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    fontSize: Platform.OS === 'web' ? 18 : 16,
    color: '#1F2937',
  },
  loginButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 300 : 200,
    padding: Platform.OS === 'web' ? 20 : 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 30 : 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Platform.OS === 'web' ? 40 : 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#6B7280',
    fontSize: Platform.OS === 'web' ? 18 : 16,
  },
  signUpButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 300 : 200,
    padding: Platform.OS === 'web' ? 20 : 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '500',
  },
});