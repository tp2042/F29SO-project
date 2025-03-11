import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      
      <View style={styles.formContainer}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash-outline" size={60} color="#000" />
          </View>
          <Text style={styles.logoText}>My Watt</Text>
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>login</Text>
          <TextInput style={styles.input} />
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>password</Text>
          <TextInput style={styles.input} secureTextEntry />
        </View>
        
        <TouchableOpacity style={styles.loginButton}
        onPress={() => navigation.navigate('IndexTabs')}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
    padding: 20,
  },
  statusBar: {
    height: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    flex: 1,
    marginTop: 40,
    alignItems: 'center',
  },
  logo: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    marginBottom: 10,
  },
  logoText: {
    fontSize: 36,
    fontWeight: '600',
  },
  formGroup: {
    width: '100%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    fontSize: 16,
  },
  loginButton: {
    width: '100%',
    maxWidth: 200,
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginTop: 20,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#6B7280',
  },
  signUpButton: {
    width: '100%',
    maxWidth: 200,
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});