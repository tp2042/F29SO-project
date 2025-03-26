import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios'; 
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Clear previous errors
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };


    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

  
   
//----------------------------------------------int------------------------------
    setErrors(newErrors);

    
    if (!newErrors.email && !newErrors.password) {
      setLoading(true);
      
      try {
        
        const response = await axios.post('https://backend-1-y12u.onrender.com/login', {
          email: email,
          password: password
        });


        setLoading(false);
        
        if (response.data.success) {
          const userData = {
            userUuid: response.data.user_uuid,
            role: response.data.role,
         
          };
          
          
          await AsyncStorage.setItem('name', response.data.name);
          await AsyncStorage.setItem('role', response.data.role);
          await AsyncStorage.setItem('email', response.data.email);
          await AsyncStorage.setItem('user_uuid', response.data.user_uuid);
          await AsyncStorage.setItem("userId", response.data.user_id);
          await AsyncStorage.setItem('userData', JSON.stringify(userData));
         
        
          if (response.data.role === "Home Manager") {
            navigation.navigate('PropertyManagerScreen');
          } else if (response.data.role === "Home User") {
            navigation.navigate('HousesScreen');
          } else {
            setErrors({
              ...newErrors,
              general: 'Invalid role. Please contact support.',
            });
          }
        } else {
          setErrors({
            ...newErrors,
            general: response.data.error || 'Login failed. Please try again.',
          });
        }
      } catch (error) {
        setLoading(false);
        console.error('Login error:', error);
        setErrors({
          ...newErrors,
          general: 'Network error. Please check your connection and try again.',
        });
      }
    }
  };
//----------------------------------------------int------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash-outline" size={Platform.OS === 'web' ? 60 : 60} color="#000" />
          </View>
          <Text style={styles.logoText}>My Watt</Text>
        </View>
        
        {errors.general ? (
          <View style={styles.generalError}>
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          </View>
        ) : null}
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Email</Text>
          <TextInput 
            style={[styles.input, errors.email && styles.inputError]}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors(prev => ({ ...prev, email: '' }));
            }}
            placeholder="Enter your email"
            keyboardType="email-address"
            autoCapitalize="none"
            placeholderTextColor="#6B7280"
          />
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
        </View>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput 
            style={[styles.input, errors.password && styles.inputError]}
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              setErrors(prev => ({ ...prev, password: '' }));
            }}
            placeholder="Enter your password"
            secureTextEntry
            placeholderTextColor="#6B7280"
          />
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
        </View>
        
        <TouchableOpacity 
          style={[styles.loginButton, loading && styles.disabledButton]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Logging in...' : 'Log in'}</Text>
        </TouchableOpacity>
        
        <View style={styles.divider}>
          <View style={styles.line} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.line} />
        </View>
        
        <TouchableOpacity 
          style={styles.signUpButton}
          onPress={() => navigation.navigate("registration")}
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
    padding: Platform.OS === 'web' ? 40 : 30,
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  logo: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 40 : 40,
  },
  logoIcon: {
    marginBottom: Platform.OS === 'web' ? 20 : 10,
  },
  logoText: {
    fontSize: Platform.OS === 'web' ? 36 : 36,
    fontWeight: '600',
    color: '#000',
  },
  formGroup: {
    width: '100%',
    marginBottom: Platform.OS === 'web' ? 20 : 20,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    color: '#8B5CF6',
    marginBottom: 10,
    textAlign: 'left',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: Platform.OS === 'web' ? 15 : 15,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    fontSize: Platform.OS === 'web' ? 16 : 16,
    color: '#1F2937',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 5,
    marginLeft: 15,
  },
  generalError: {
    width: '100%',
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 20,
  },
  generalErrorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  loginButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 200 : 200,
    padding: Platform.OS === 'web' ? 15 : 15,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 20 : 20,
  },
  disabledButton: {
    backgroundColor: '#93C5FD', // Lighter blue for disabled state
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: Platform.OS === 'web' ? 30 : 30,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    paddingHorizontal: 15,
    color: '#6B7280',
    fontSize: Platform.OS === 'web' ? 16 : 16,
  },
  signUpButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 200 : 200,
    padding: Platform.OS === 'web' ? 15 : 15,
    borderRadius: 50,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '500',
  },
});