import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, ActivityIndicator, TextInput,ScrollView, ProgressBarAndroid } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
//import DateTimePicker from '@react-native-community/datetimepicker'; 

const HouseholdLeaderboardScreen = ({ visible, onClose, householdId, currentUserWattPoints }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly'); // weekly, monthly, allTime
  const [householdName, setHouseholdName] = useState('Your Home');
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [challengeType, setChallengeType] = useState('Consumption');
  const [targetValue, setTargetValue] = useState('');
  const [deadline, setDeadline] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [creatingChallenge, setCreatingChallenge] = useState(false);
  // New state variables for challenges
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [loadingChallenges, setLoadingChallenges] = useState(true);
  
  const API_URL = "https://backend-1-y12u.onrender.com"; 
  
  useEffect(() => {
    if (visible && householdId) {
      fetchHouseholdUsers();
      fetchHouseholdChallenges(); // New function to fetch challenges
    }
  }, [visible, householdId, timeframe]);
   

  const onDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || new Date();
    setShowDatePicker(false);
    setSelectedDate(currentDate);
    
    // Format the date as YYYY-MM-DD for backend
    const formattedDate = currentDate.toISOString().split('T')[0];
    setDeadline(formattedDate);
  };

  
  const fetchHouseholdUsers = async () => {
    const householdId = await AsyncStorage.getItem('householdId');
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/household_users`, {
        params: { household_id: householdId, timeframe: timeframe }
      });
  
      if (response?.data?.household_name) {
        setHouseholdName(response.data.household_name);
      }
  
      let data = response?.data?.users 
      // Sort by points (highest first)
      data.sort((a, b) => b.points - a.points);
  
      let currentUserRank = null;
  
      data.forEach((user, index) => {
        user.rank = index + 1;
        if (user.isCurrentUser) {
          currentUserRank = index + 1; 
        }
      });
  
      setLeaderboardData(data);
      if (currentUserRank !== null) {
        setUserRank(currentUserRank); 
      }
    } catch (error) {
      console.error("Error fetching household users data:", error);
    } finally {
      setLoading(false);
    }
  };

  // New function to fetch household challenges
  const fetchHouseholdChallenges = async () => {
    const householdId = await AsyncStorage.getItem('householdId');
    setLoadingChallenges(true);
    try {
      const response = await axios.get(`${API_URL}/challenges`, {
        params: { household_id: householdId }
      });
      
      if (response?.data?.challenges) {
        setActiveChallenges(response.data.challenges);
      }
    } catch (error) {
      console.error("Error fetching household challenges:", error);
    } finally {
      setLoadingChallenges(false);
    }
  };

  const startChallenge = async () => {
    const householdId = await AsyncStorage.getItem('householdId');
    if (!targetValue || !deadline) {
      alert("Please fill in all fields");
      return;
    }
    
    setCreatingChallenge(true);
    try {
      const response = await axios.post(`${API_URL}/create_challenge`, {
        household_id: householdId,
        goal_type: challengeType,
        target_value: parseFloat(targetValue),
        deadline: deadline,
      });
      
      if (response.status === 200 || response.status === 201) {
        alert("Challenge created successfully!");
        setShowChallengeModal(false);
        // Refresh challenges after creating a new one
        fetchHouseholdChallenges();
      }
    } catch (error) {
      console.error("Error creating challenge:", error);
      alert("Failed to create challenge. Please try again.");
    } finally {
      setCreatingChallenge(false);
    }
  };
  
  const renderTimeframeTab = (label, value) => (
    <TouchableOpacity
      style={[styles.timeframeTab, timeframe === value && styles.activeTimeframeTab]}
      onPress={() => setTimeframe(value)}>
      <Text style={[styles.timeframeText, timeframe === value && styles.activeTimeframeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderLeaderboardItem = ({ item }) => (
    <View style={[
      styles.leaderboardItem, 
      item.isCurrentUser && styles.currentUserItem
    ]}>
      <View style={styles.rankContainer}>
        {item.rank <= 3 ? (
          <View style={[styles.topRankBadge, 
            item.rank === 1 ? styles.firstRank : 
            item.rank === 2 ? styles.secondRank : styles.thirdRank
          ]}>
            <Text style={styles.topRankText}>{item.rank}</Text>
          </View>
        ) : (
          <Text style={styles.rankText}>{item.rank}</Text>
        )}
      </View>
      
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      
      <View style={styles.userInfoContainer}>
        <Text style={[styles.userName, item.isCurrentUser && styles.currentUserText]}>
          {item.name}
          {item.isCurrentUser && " (You)"}
        </Text>
        <View style={styles.roleContainer}>
          <Text style={styles.roleText}>{item.role}</Text>
        </View>
      </View>
      
      <View style={styles.pointsContainer}>
        <Ionicons name="flash" size={16} color="#FFD700" />
        <Text style={styles.pointsText}>{item.points}</Text>
      </View>
    </View>
  );

  // New function to render challenge items
  const renderChallengeItem = ({ item }) => {
    // Calculate days remaining for challenge
    const today = new Date();
    const deadlineDate = new Date(item.deadline);
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    
    // Calculate progress percentage
    const progressPercent = ((item.current_value / item.target_value) * 100).toFixed(0);
    
    // Get icon based on challenge type
    const getChallengeTypeIcon = () => {
      switch(item.goal_type.toLowerCase()) {
        case 'consumption':
          return <Ionicons name="flash" size={22} color="#8B5CF6" />;
        case 'cost':
          return <Ionicons name="cash" size={22} color="#8B5CF6" />;
        case 'carbon':
          return <Ionicons name="leaf" size={22} color="#8B5CF6" />;
        default:
          return <Ionicons name="trophy" size={22} color="#8B5CF6" />;
      }
    };
    
    // Get unit based on challenge type
    const getChallengeUnit = () => {
      switch(item.goal_type.toLowerCase()) {
        case 'consumption':
          return 'kWh';
        case 'cost':
          return '$';
        case 'carbon':
          return 'kg';
        default:
          return '';
      }
    };
    
    return (
      <View style={styles.challengeItem}>
        <View style={styles.challengeHeader}>
          {getChallengeTypeIcon()}
          <Text style={styles.challengeTitle}>
            {item.goal_type} Challenge
          </Text>
          <View style={[
            styles.challengeStatusBadge, 
            daysRemaining <= 0 ? styles.expiredBadge : 
            daysRemaining <= 3 ? styles.urgentBadge : 
            styles.activeBadge
          ]}>
            <Text style={styles.challengeStatusText}>
              {daysRemaining <= 0 ? 'Expired' : 
               daysRemaining <= 3 ? 'Urgent' : 
               'Active'}
            </Text>
          </View>
        </View>
        
        <View style={styles.challengeGoal}>
          <Text style={styles.challengeGoalText}>
            Goal: Reduce {item.goal_type.toLowerCase()} by {item.target_value} {getChallengeUnit()}
          </Text>
          <Text style={styles.challengeDeadlineText}>
            {daysRemaining <= 0 ? 
              'Challenge has ended' : 
              `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`}
          </Text>
        </View>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${Math.min(progressPercent, 100)}%` }]} />
          </View>
          <Text style={styles.progressText}>{progressPercent}% Complete</Text>
        </View>
        
        <View style={styles.challengeParticipants}>
          <Text style={styles.participantsText}>
            {item.participants_count} household members participating
          </Text>
        </View>
      </View>
    );
  };

  // Calculate total household points
  const totalHouseholdPoints = leaderboardData.reduce((sum, user) => sum + user.points, 0);
  
  // Get current leader
  const currentLeader = leaderboardData.length > 0 ? leaderboardData[0] : null;

  // Get unit based on challenge type
  const getChallengeUnit = () => {
    switch(challengeType) {
      case 'Consumption':
        return 'kWh';
      case 'Cost':
        return 'AED';
      case 'Carbon':
        return 'kg';
      default:
        return '';
    }
  };

  // Get icon based on challenge type
  const getChallengeIcon = (type, selected) => {
    const color = selected ? "#fff" : "#666";
    switch(type) {
      case 'Consumption':
        return <Ionicons name="flash" size={22} color={color} />;
      case 'Cost':
        return <Ionicons name="cash" size={22} color={color} />;
      case 'Carbon':
        return <Ionicons name="leaf" size={22} color={color} />;
      default:
        return <Ionicons name="help" size={22} color={color} />;
    }
  };

  // Challenge Modal
  const ChallengeModal = () => (
    <Modal
      visible={showChallengeModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowChallengeModal(false)}
    >
      <View style={styles.challengeModalContainer}>
        <View style={styles.challengeModalContent}>
          <View style={styles.challengeModalHeader}>
            <Text style={styles.challengeModalTitle}>Create New Challenge</Text>
            <TouchableOpacity onPress={() => setShowChallengeModal(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Challenge Type</Text>
          <View style={styles.challengeTypeContainer}>
            <TouchableOpacity 
              style={[styles.challengeTypeOption, challengeType === 'Consumption' && styles.selectedChallengeType]}
              onPress={() => setChallengeType('Consumption')}
            >
              {getChallengeIcon('Consumption', challengeType === 'Consumption')}
              <Text style={[styles.challengeTypeText, challengeType === 'Consumption' && styles.selectedChallengeTypeText]}>Consumption</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.challengeTypeOption, challengeType === 'Cost' && styles.selectedChallengeType]}
              onPress={() => setChallengeType('Cost')}
            >
              {getChallengeIcon('Cost', challengeType === 'Cost')}
              <Text style={[styles.challengeTypeText, challengeType === 'Cost' && styles.selectedChallengeTypeText]}>Cost</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.challengeTypeOption, challengeType === 'Carbon' && styles.selectedChallengeType]}
              onPress={() => setChallengeType('Carbon')}
            >
              {getChallengeIcon('Carbon', challengeType === 'Carbon')}
              <Text style={[styles.challengeTypeText, challengeType === 'Carbon' && styles.selectedChallengeTypeText]}>Carbon</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.inputLabel}>Target Value ({getChallengeUnit()})</Text>
          <TextInput
            style={styles.input}
            placeholder={`Enter target ${challengeType.toLowerCase()} reduction`}
            value={targetValue}
            onChangeText={setTargetValue}
            keyboardType="numeric"
          />
          
          <Text style={styles.inputLabel}>Deadline</Text>
          <TouchableOpacity 
            style={styles.datePickerButton} 
            onPress={() => setShowDatePicker(true)}
          >
            <Ionicons name="calendar" size={20} color="#8B5CF6" />
            <Text style={styles.datePickerButtonText}>
              {selectedDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="default"
              onChange={onDateChange}
              minimumDate={new Date()} // Prevent selecting past dates
            />
          )}
          <TouchableOpacity 
            style={styles.submitChallengeButton}
            onPress={startChallenge}
            disabled={creatingChallenge}
          >
            {creatingChallenge ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="flag" size={18} color="white" />
                <Text style={styles.submitChallengeText}>Start Challenge</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.leaderboardContainer}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
              <Text style={styles.headerTitle}>{householdName} Leaderboard</Text>
              <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.timeframeContainer}>
              {renderTimeframeTab('This Week', 'weekly')}
              {renderTimeframeTab('This Month', 'monthly')}
              {renderTimeframeTab('All Time', 'allTime')}
            </View>
            
            <View style={styles.householdSummary}>
              <View style={styles.householdSummaryItem}>
                <Text style={styles.summaryLabel}>Total Points</Text>
                <Text style={styles.summaryValue}>{totalHouseholdPoints}</Text>
              </View>
              
              <View style={styles.householdSummaryItem}>
                <Text style={styles.summaryLabel}>Current Leader</Text>
                <Text style={styles.summaryValue}>
                  {currentLeader ? currentLeader.name : '—'}
                </Text>
              </View>
              
              <View style={styles.householdSummaryItem}>
                <Text style={styles.summaryLabel}>Members</Text>
                <Text style={styles.summaryValue}>{leaderboardData.length}</Text>
              </View>
            </View>
            
            <View style={styles.userRankSummary}>
              <Text style={styles.rankSummaryText}>
                Your rank: <Text style={styles.rankHighlight}>#{userRank}</Text>
              </Text>
              <Text style={styles.pointsSummaryText}>
                <Ionicons name="flash" size={16} color="#FFD700" /> {currentUserWattPoints} watt points
              </Text>
            </View>
            
            {/* Challenges Section */}
            <View style={styles.challengesSection}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Household Challenges</Text>
                <TouchableOpacity 
                  style={styles.newChallengeButton}
                  onPress={() => setShowChallengeModal(true)}
                >
                  <Ionicons name="add" size={16} color="white" />
                  <Text style={styles.newChallengeButtonText}>New</Text>
                </TouchableOpacity>
              </View>
              
              {loadingChallenges ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#8B5CF6" />
                  <Text style={styles.loadingText}>Loading challenges...</Text>
                </View>
              ) : activeChallenges.length > 0 ? (
                <FlatList
                  data={activeChallenges}
                  renderItem={renderChallengeItem}
                  horizontal={true}
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.challengesListContainer}
                />
              ) : (
                <View style={styles.noChallengesContainer}>
                  <Ionicons name="trophy-outline" size={40} color="#ccc" />
                  <Text style={styles.noChallengesText}>No active challenges</Text>
                  <Text style={styles.noChallengesSubtext}>Create a challenge to start saving together!</Text>
                </View>
              )}
            </View>
            
            {/* Rankings Section - Now BEFORE the badge section */}
            <View style={styles.leaderboardSection}>
              <Text style={styles.sectionTitle}>Rankings</Text>
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#8B5CF6" />
                  <Text style={styles.loadingText}>Loading data...</Text>
                </View>
              ) : (
                <FlatList
                  data={leaderboardData}
                  renderItem={renderLeaderboardItem}
                  keyExtractor={item => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={styles.listContainer}
                  nestedScrollEnabled={true}
                  scrollEnabled={false}
                />
              )}
            </View>
            
            {/* Badge Section - Now AFTER the rankings section */}
            <View style={styles.leaderboardFooter}>
              <View style={styles.badgeSection}>
                <Text style={styles.badgeSectionTitle}>Conservation Badge</Text>
                {totalHouseholdPoints > 300 ? (
                  <View style={styles.badgeContainer}>
                    <Ionicons name="shield-checkmark" size={40} color="#8B5CF6" />
                    <Text style={styles.badgeTitle}>Energy Guardian</Text>
                    <Text style={styles.badgeDescription}>You're in the top 10% of energy savers!</Text>
                  </View>
                ) : (
                  <View style={styles.badgeContainer}>
                    <Ionicons name="leaf" size={40} color="#4CAF50" />
                    <Text style={styles.badgeTitle}>Conservation Hero</Text>
                    <Text style={styles.badgeDescription}>You're making great progress!</Text>
                  </View>
                )}
              </View>
            </View>
            </ScrollView>
      </View>
    </View>
      
      {/* Challenge Modal */}
      <ChallengeModal />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaderboardContainer: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  timeframeContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
  },
  timeframeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  activeTimeframeTab: {
    backgroundColor: '#8B5CF6',
  },
  timeframeText: {
    color: '#555',
    fontWeight: '500',
  },
  activeTimeframeText: {
    color: 'white',
  },
  householdSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f9f7ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  householdSummaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userRankSummary: {
    backgroundColor: '#f0ebff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#8B5CF6',
  },
  rankSummaryText: {
    fontSize: 16,
    marginBottom: 5,
  },
  rankHighlight: {
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  pointsSummaryText: {
    fontSize: 15,
    color: '#555',
  },
  // New Challenge Section Styles
  challengesSection: {
    marginBottom: 15,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  newChallengeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  newChallengeButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: 12,
    marginLeft: 3,
  },
  challengesListContainer: {
    paddingVertical: 5,
    paddingHorizontal: 5,
  },
  challengeItem: {
    width: 250,
    backgroundColor: '#f9f7ff',
    borderRadius: 12,
    padding: 15,
    marginRight: 15,
    borderWidth: 1,
    borderColor: '#e9e3ff',
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  challengeStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
  },
  urgentBadge: {
    backgroundColor: '#FF9800',
  },
  expiredBadge: {
    backgroundColor: '#F44336',
  },
  challengeStatusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  challengeGoal: {
    marginBottom: 10,
  },
  challengeGoalText: {
    fontSize: 14,
    color: '#444',
    marginBottom: 3,
  },
  challengeDeadlineText: {
    fontSize: 13,
    color: '#666',
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    marginBottom: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#8B5CF6',
    borderRadius: 5,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  challengeParticipants: {
    borderTopWidth: 1,
    borderTopColor: '#e9e3ff',
    paddingTop: 10,
  },
  participantsText: {
    fontSize: 12,
    color: '#666',
  },
  noChallengesContainer: {
    backgroundColor: '#f9f7ff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e9e3ff',
    borderStyle: 'dashed',
  },
  noChallengesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 10,
  },
  noChallengesSubtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 5,
  },
  leaderboardSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
  },
  listContainer: {
    paddingVertical: 5,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  currentUserItem: {
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    borderRadius: 10,
  },
  rankContainer: {
    width: 35,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#555',
  },
  topRankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
  },
  datePickerButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  firstRank: {
    backgroundColor: '#FFD700', // Gold
  },
  secondRank: {
    backgroundColor: '#C0C0C0', // Silver
  },
  thirdRank: {
    backgroundColor: '#CD7F32', // Bronze
  },
  topRankText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 15,
  },
  userInfoContainer: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '500',
  },
  currentUserText: {
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  roleContainer: {
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    color: '#777',
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  pointsText: {
    marginLeft: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  leaderboardFooter: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  badgeSection: {
    marginBottom: 15,
  },
  badgeSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  badgeContainer: {
    backgroundColor: '#f9f7ff',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  badgeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    marginBottom: 5,
  },
  badgeDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  challengeButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
  },
  challengeButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  // Challenge Modal Styles
  challengeModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  challengeModalContent: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  challengeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  challengeModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  challengeTypeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  challengeTypeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
  },
  selectedChallengeType: {
    backgroundColor: '#8B5CF6',
    borderColor: '#8B5CF6',
  },
  challengeTypeText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  selectedChallengeTypeText: {
    color: 'white',
    fontWeight: '500',
  },
  submitChallengeButton: {
    backgroundColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  submitChallengeText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  }
});

export default HouseholdLeaderboardScreen;