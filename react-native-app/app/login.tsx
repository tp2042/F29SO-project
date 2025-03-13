import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function LoginScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({
    email: '',
    password: ''
  });

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = () => {
    const newErrors = {
      email: '',
      password: ''
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

    setErrors(newErrors);

    if (!newErrors.email && !newErrors.password) {
      navigation.navigate('IndexTabs');
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.formContainer}>
        <View style={styles.logo}>
          <View style={styles.logoIcon}>
            <Ionicons name="flash-outline" size={Platform.OS === 'web' ? 60 : 60} color="#000" />
          </View>
          <Text style={styles.logoText}>My Watt</Text>
        </View>
        
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
          style={styles.loginButton}
          onPress={handleLogin}
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
  loginButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 200 : 200,
    padding: Platform.OS === 'web' ? 15 : 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 20 : 20,
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
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '500',
  },
});