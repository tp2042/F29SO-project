import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';

export default function RegistrationScreen() {
  const router = useRouter();
  const [gender, setGender] = useState<string | null>(null);
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.statusBar} />
      
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButtonWrapper} onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={24} color="#000" />
            </TouchableOpacity>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Ionicons name="flash-outline" size={24} color="#000" />
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
          
            <TouchableOpacity style={styles.signUpButton}
            onPress={() => navigation.navigate("Index" as never)}>
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
    padding: 20,
    paddingBottom: 40,
  },
  statusBar: {
    height: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    marginTop: 60,
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  backButtonWrapper: {
    marginRight: 15,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    marginBottom: 30,
    textAlign: 'center',
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
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    width: '100%',
  },
  genderOption: {
    flex: 1,
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  genderOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  genderOptionTextSelected: {
    color: 'white',
  },
  signUpButton: {
    width: '100%',
    maxWidth: 200,
    padding: 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});