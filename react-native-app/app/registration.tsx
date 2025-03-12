import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function RegistrationScreen() {
  const router = useRouter();
  const [gender, setGender] = useState(null);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButtonWrapper} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={Platform.OS === 'web' ? 30 : 24} color="#000" />
            </TouchableOpacity>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Ionicons name="flash-outline" size={Platform.OS === 'web' ? 30 : 24} color="#000" />
              </View>
              <Text style={styles.logoText}>My Watt</Text>
            </View>
          </View>
          
          <Text style={styles.title}>Registration</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>name</Text>
            <TextInput style={styles.input} />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>email</Text>
            <TextInput style={styles.input} keyboardType="email-address" />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>password</Text>
            <TextInput style={styles.input} secureTextEntry />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>confirm password</Text>
            <TextInput style={styles.input} secureTextEntry />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]} 
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderOptionText, gender === 'male' && styles.genderOptionTextSelected]}>
                  male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]} 
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderOptionText, gender === 'female' && styles.genderOptionTextSelected]}>
                  female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'other' && styles.genderOptionSelected]} 
                onPress={() => setGender('other')}
              >
                <Text style={[styles.genderOptionText, gender === 'other' && styles.genderOptionTextSelected]}>
                  other
                </Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>age</Text>
            <TextInput style={styles.input} keyboardType="numeric" />
          </View>
          
          <TouchableOpacity 
            style={styles.signUpButton}
            onPress={() => navigation.navigate("IndexTabs")}
          >
            <Text style={styles.signUpButtonText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#8B5CF6',
  },
  scrollContent: {
    flexGrow: 1,
    padding: Platform.OS === 'web' ? '2% 15%' : 20,
    paddingBottom: 40,
  },
  statusBar: {
    height: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: Platform.OS === 'web' ? 60 : 30,
    marginTop: Platform.OS === 'web' ? 80 : 60,
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 800 : undefined,
    alignSelf: 'center',
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 30 : 20,
    width: '100%',
  },
  backButtonWrapper: {
    marginRight: Platform.OS === 'web' ? 20 : 15,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: Platform.OS === 'web' ? 15 : 10,
  },
  logoText: {
    fontSize: Platform.OS === 'web' ? 30 : 24,
    fontWeight: '500',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 42 : 32,
    fontWeight: '600',
    marginBottom: Platform.OS === 'web' ? 40 : 30,
    textAlign: 'center',
  },
  formGroup: {
    width: '100%',
    marginBottom: Platform.OS === 'web' ? 30 : 20,
    maxWidth: Platform.OS === 'web' ? 600 : undefined,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 20 : 18,
    color: '#6B7280',
    marginBottom: Platform.OS === 'web' ? 15 : 10,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: Platform.OS === 'web' ? 20 : 15,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    fontSize: Platform.OS === 'web' ? 18 : 16,
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Platform.OS === 'web' ? 15 : 10,
    width: '100%',
  },
  genderOption: {
    flex: 1,
    padding: Platform.OS === 'web' ? 15 : 10,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  genderOptionText: {
    fontSize: Platform.OS === 'web' ? 18 : 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  genderOptionTextSelected: {
    color: 'white',
  },
  signUpButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 300 : 200,
    padding: Platform.OS === 'web' ? 20 : 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 30 : 20,
    marginBottom: Platform.OS === 'web' ? 30 : 20,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 20 : 18,
    fontWeight: '500',
  },
});