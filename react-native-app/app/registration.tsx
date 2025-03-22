import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Platform, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios'; 
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export default function RegistrationScreen() {
  const router = useRouter();
  const [gender, setGender] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [userType, setUserType] = useState('');
  const [isUserTypeOpen, setIsUserTypeOpen] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    gender: '',
    userType: '',
    general: '' 
  });
  const navigation = useNavigation();

  const userTypes = ['Home User', 'Home Manager'];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS === 'web') {
      const date = new Date(event.target.value);
      setDateOfBirth(date);
      setErrors(prev => ({ ...prev, dateOfBirth: '' }));
    } else {
      
      if (selectedDate) {
        setDateOfBirth(selectedDate);
        setErrors(prev => ({ ...prev, dateOfBirth: '' }));
        if (Platform.OS === 'android') {
          setShowDatePicker(false);
        }
      }
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSignUp = async () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      dateOfBirth: '',
      gender: '',
      userType: '',
      general: ''
    };

    
    if (!name) {
      newErrors.name = 'Name is required';
    }

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

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!dateOfBirth) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }

    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }

    if (!userType) {
      newErrors.userType = 'Please select a user type';
    }

    setErrors(newErrors);

    
    if (Object.values(newErrors).some(error => error && error !== newErrors.general)) {
      return;
    }

    const role = userType === 'Home User' ? 'Home User' : 'Home Manager';


    const userData = {
      name,
      email,
      password,
      gender,
      date_of_birth: dateOfBirth.toISOString().split('T')[0],
      role
    };
  
    setLoading(true);
    //--------------------------------------integration--------------------------------//
    try {
      const response = await axios.post('http://localhost:5003/register', userData);
    
      if (response.data.success) {
        setLoading(false);
        alert(response.data.message || 'Registration successful! Please check your email to verify your account before logging in.');
        navigation.navigate('Login');
      } else {
        setLoading(false);
        setErrors(prev => ({
          ...prev,
          general: response.data.error || 'Registration failed'
        }));
      }
    } catch (error) {
      setLoading(false);
      console.error('Error:', error);
    
      if (error.response && error.response.data && error.response.data.error) {
        setErrors(prev => ({ ...prev, general: error.response.data.error }));
      } else {
        setErrors(prev => ({
          ...prev,
          general: 'An error occurred. Please try again.'
        }));
      }
    }
  };
  //--------------------------------------integration--------------------------------//
  const renderDatePicker = () => {
    if (Platform.OS === 'web') {
      return (
        <input
          type="date"
          value={dateOfBirth.toISOString().split('T')[0]}
          onChange={handleDateChange}
          style={{
            width: '100%',
            padding: '15px',
            borderRadius: '50px',
            backgroundColor: '#E5E7EB',
            fontSize: '16px',
            border: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            cursor: 'pointer'
          }}
          min="1900-01-01"
          max={new Date().toISOString().split('T')[0]}
        />
      );
    }

    return (
      <>
        <TouchableOpacity
          style={[styles.input, errors.dateOfBirth && styles.inputError]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.dateText, !dateOfBirth && styles.placeholderText]}>
            {dateOfBirth ? formatDate(dateOfBirth) : 'Select your date of birth'}
          </Text>
        </TouchableOpacity>
        
        {Platform.OS === 'ios' ? (
          <Modal
            animationType="slide"
            transparent={true}
            visible={showDatePicker}
            onRequestClose={() => setShowDatePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Select Date</Text>
                  <TouchableOpacity 
                    style={styles.modalCloseButton}
                    onPress={() => setShowDatePicker(false)}
                  >
                    <Text style={styles.modalCloseButtonText}>Done</Text>
                  </TouchableOpacity>
                </View>
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  minimumDate={new Date(1900, 0, 1)}
                  textColor="#000000"
                  style={styles.datePickerIOS}
                />
              </View>
            </View>
          </Modal>
        ) : (
          showDatePicker && (
            <DateTimePicker
              value={dateOfBirth}
              mode="date"
              display="default"
              onChange={handleDateChange}
              maximumDate={new Date()}
              minimumDate={new Date(1900, 0, 1)}
            />
          )
        )}
      </>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent}>
    <View style={styles.container}>
      <View style={styles.statusBar} />      
        <View style={styles.formContainer}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButtonWrapper} onPress={() => navigation.goBack()}>
              <Ionicons name="chevron-back" size={Platform.OS === 'web' ? 24 : 24} color="#000" />
            </TouchableOpacity>
            <View style={styles.logo}>
              <View style={styles.logoIcon}>
                <Ionicons name="flash-outline" size={Platform.OS === 'web' ? 24 : 24} color="#000" />
              </View>
              <Text style={styles.logoText}>My Watt</Text>
            </View>
          </View>
          
          <Text style={styles.title}>Registration</Text>
          
          {/* Display general error message */}
          {errors.general ? (
            <View style={styles.generalError}>
              <Text style={styles.generalErrorText}>{errors.general}</Text>
            </View>
          ) : null}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name</Text>
            <TextInput 
              style={[styles.input, errors.name && styles.inputError]} 
              value={name}
              onChangeText={(text) => {
                setName(text);
                setErrors(prev => ({ ...prev, name: '' }));
              }}
              placeholder="Enter your name"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
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
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter your email"
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
              secureTextEntry 
              placeholder="Enter your password"
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput 
              style={[styles.input, errors.confirmPassword && styles.inputError]} 
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                setErrors(prev => ({ ...prev, confirmPassword: '' }));
              }}
              secureTextEntry 
              placeholder="Confirm your password"
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Gender</Text>
            <View style={styles.genderOptions}>
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'male' && styles.genderOptionSelected]} 
                onPress={() => {
                  setGender('male');
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
              >
                <Text style={[styles.genderOptionText, gender === 'male' && styles.genderOptionTextSelected]}>
                  male
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'female' && styles.genderOptionSelected]} 
                onPress={() => {
                  setGender('female');
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
              >
                <Text style={[styles.genderOptionText, gender === 'female' && styles.genderOptionTextSelected]}>
                  female
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.genderOption, gender === 'other' && styles.genderOptionSelected]} 
                onPress={() => {
                  setGender('other');
                  setErrors(prev => ({ ...prev, gender: '' }));
                }}
              >
                <Text style={[styles.genderOptionText, gender === 'other' && styles.genderOptionTextSelected]}>
                  other
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender ? <Text style={styles.errorText}>{errors.gender}</Text> : null}
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Date of Birth</Text>
            {renderDatePicker()}
            {errors.dateOfBirth ? <Text style={styles.errorText}>{errors.dateOfBirth}</Text> : null}
          </View>

          <View style={[styles.formGroup, { zIndex: 1000 }]}>
            <Text style={styles.label}>User Type</Text>
            <TouchableOpacity 
              style={[styles.dropdownButton, errors.userType && styles.inputError]}
              onPress={() => setIsUserTypeOpen(!isUserTypeOpen)}
            >
              <Text style={styles.dropdownButtonText}>
                {userType || 'Select user type'}
              </Text>
              <Ionicons 
                name={isUserTypeOpen ? 'chevron-up' : 'chevron-down'} 
                size={20} 
                color="#6B7280" 
              />
            </TouchableOpacity>
            {isUserTypeOpen && (
              <View style={styles.dropdownList}>
                {userTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setUserType(type);
                      setIsUserTypeOpen(false);
                      setErrors(prev => ({ ...prev, userType: '' }));
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            {errors.userType ? <Text style={styles.errorText}>{errors.userType}</Text> : null}
          </View>
          
          <TouchableOpacity 
            style={[styles.signUpButton, loading && styles.disabledButton]}
            onPress={handleSignUp}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Signing up...' : 'Sign up'}
            </Text>
          </TouchableOpacity>
        </View>
    </View>

    <Modal visible={isModalVisible} animationType="fade" onRequestClose={() => setIsModalVisible(false)}>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: isDarkMode ? "#222" : "#fff" }]}>
          <Text style={styles.modalTitle}>Create New Mood</Text>
          <ScrollView style={{ maxHeight: 420 }}>
                              <Text style={{ padding: 16, lineHeight: 22 }}>
                              <Text style={[{color: '#8B5CF6'},{fontSize: 24}]}>Terms of Service{"\n"}{"\n"}</Text>
                              <Text style={[{color: textColor}, {fontSize: 20}]}>
                              Welcome to MyWatt! These Terms of Service govern your use of our app. By downloading, accessing, or using the app, you agree to these terms. If you do not agree, please refrain from using the app.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>1. Acceptance of Terms{"\n"}</Text>
                              By using MyWatt, you confirm that you have read, understood, and agreed to these Terms of Service. If you are using the app on behalf of an organization, you represent that you have the authority to bind that organization to these terms.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>2. Eligibility{"\n"}</Text>
                              You must be at least 13 years old to use this app. If you are under 18, you must have permission from a parent or guardian to use the app.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>3. Account Registration and Security{"\n"}</Text>
                              You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration. Notify us immediately at mywattapp@gmail.com if you suspect any unauthorized use of your account.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>4. Permitted Use{"\n"}</Text>
                              You may use the app only for its intended purpose: managing and controlling your smart home devices.{"\n"}
                              You agree not to misuse the app, including but not limited to:{"\n"}
                              • Reverse-engineering, decompiling, or disassembling the app.{"\n"}
                              • Using the app for illegal or unauthorized purposes.{"\n"}
                              • Interfering with the app's functionality or servers.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>5. Intellectual Property{"\n"}</Text>
                              All content, features, and technology in the app are owned by MyWatt or its licensors.{"\n"}
                              You are granted a limited, non-exclusive, non-transferable license to use the app for personal, non-commercial purposes.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>6. Third-Party Services{"\n"}</Text>
                              The app may integrate with third-party services or devices. We are not responsible for the functionality, privacy practices, or content of third-party services.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>7. Updates and Changes{"\n"}</Text>
                              We may update the app or these terms from time to time. Continued use of the app after changes constitutes your acceptance of the updated terms.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>8. Termination{"\n"}</Text>
                              We reserve the right to suspend or terminate your access to the app if you violate these terms or engage in misuse.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>9. Limitation of Liability{"\n"}</Text>
                              To the fullest extent permitted by law, MyWatt shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>10. Governing Law{"\n"}</Text>
                              These terms are governed by the laws of United Arab Emirates. Any disputes will be resolved in the courts of Emirate of Dubai.{"\n\n"}
          
                              <Text style={{ fontWeight: "bold" }}>11. Contact Us{"\n"}</Text>
                              If you have questions about these terms, contact us at:{"\n"}
                              MyWatt{"\n"}
                              Email: mywattapp@gmail.com{"\n"}
                              </Text>
                              </Text>
                          </ScrollView>
            <TouchableOpacity onPress={navigation.navigate("Login")} style={styles.signUpButton}>
              <Text style={styles.signUpButtonText}>Sign Up</Text>
            </TouchableOpacity>
            </View>
            </View>
    </Modal>
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
    padding: Platform.OS === 'web' ? '2% 15%' : 20,
    paddingBottom: 40,
  },
  statusBar: {
    height: 40,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: Platform.OS === 'web' ? 40 : 30,
    marginTop: Platform.OS === 'web' ? 40 : 60,
    alignItems: 'center',
    maxWidth: Platform.OS === 'web' ? 500 : undefined,
    alignSelf: 'center',
    width: '100%',
    position: 'relative',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Platform.OS === 'web' ? 20 : 20,
    width: '100%',
  },
  backButtonWrapper: {
    marginRight: Platform.OS === 'web' ? 15 : 15,
  },
  logo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoIcon: {
    marginRight: Platform.OS === 'web' ? 10 : 10,
  },
  logoText: {
    fontSize: Platform.OS === 'web' ? 24 : 24,
    fontWeight: '500',
  },
  title: {
    fontSize: Platform.OS === 'web' ? 32 : 32,
    fontWeight: '600',
    marginBottom: Platform.OS === 'web' ? 30 : 30,
    textAlign: 'center',
  },
  formGroup: {
    width: '100%',
    marginBottom: Platform.OS === 'web' ? 20 : 20,
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    position: 'relative',
  },
  label: {
    fontSize: Platform.OS === 'web' ? 16 : 18,
    color: '#6B7280',
    marginBottom: Platform.OS === 'web' ? 8 : 10,
    textAlign: 'left',
  },
  input: {
    width: '100%',
    padding: Platform.OS === 'web' ? 15 : 15,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    fontSize: Platform.OS === 'web' ? 16 : 16,
  },
  dateText: {
    fontSize: Platform.OS === 'web' ? 16 : 16,
    color: '#1F2937',
  },
  placeholderText: {
    color: '#6B7280',
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
    maxWidth: Platform.OS === 'web' ? 400 : undefined,
    padding: 10,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: 20,
  },
  generalErrorText: {
    color: '#EF4444',
    textAlign: 'center',
  },
  genderOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Platform.OS === 'web' ? 10 : 10,
    width: '100%',
  },
  genderOption: {
    flex: 1,
    padding: Platform.OS === 'web' ? 12 : 10,
    borderRadius: 50,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
  },
  genderOptionSelected: {
    backgroundColor: '#3B82F6',
  },
  genderOptionText: {
    fontSize: Platform.OS === 'web' ? 16 : 16,
    fontWeight: '500',
    color: '#1F2937',
  },
  genderOptionTextSelected: {
    color: 'white',
  },
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Platform.OS === 'web' ? 15 : 15,
    backgroundColor: '#E5E7EB',
    borderRadius: 50,
  },
  dropdownButtonText: {
    fontSize: Platform.OS === 'web' ? 16 : 16,
    color: '#1F2937',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 15,
    marginTop: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 1000,
  },
  dropdownItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  dropdownItemText: {
    fontSize: Platform.OS === 'web' ? 16 : 16,
    color: '#1F2937',
  },
  signUpButton: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 200 : 200,
    padding: Platform.OS === 'web' ? 15 : 15,
    borderRadius: 50,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    marginTop: Platform.OS === 'web' ? 20 : 20,
    zIndex: 1,
  },
  disabledButton: {
    backgroundColor: '#93C5FD', 
  },
  signUpButtonText: {
    color: 'white',
    fontSize: Platform.OS === 'web' ? 16 : 18,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalCloseButton: {
    padding: 10,
  },
  modalCloseButtonText: {
    color: '#3B82F6',
    fontSize: 16,
    fontWeight: '600',
  },
  datePickerIOS: {
    height: 200,
    width: '100%',
  },
});