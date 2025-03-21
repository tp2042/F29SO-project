import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';

const HouseholdLeaderboardScreen = ({ visible, onClose, householdId, currentUserWattPoints }) => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);
  const [timeframe, setTimeframe] = useState('weekly'); // weekly, monthly, allTime
  const [householdName, setHouseholdName] = useState('Your Home');
  const API_URL = "http://localhost:5003"; 
  useEffect(() => {
    if (visible && householdId) {
      fetchHouseholdUsers();
    }
  }, [visible, householdId, timeframe]);

  const fetchHouseholdUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/household_users`, {
        params: { household_id: householdId, timeframe: timeframe }
      });
  
      if (response?.data?.household_name) {
        setHouseholdName(response.data.household_name);
      }
  
      let data = response?.data?.users || [
        { id: 1, name: 'Mom', points: 98, avatar: 'https://randomuser.me/api/portraits/women/32.jpg', role: 'Parent' },
        { id: 2, name: 'Dad', points: 85, avatar: 'https://randomuser.me/api/portraits/men/44.jpg', role: 'Parent' },
        { id: 3, name: 'Emma', points: 79, avatar: 'https://randomuser.me/api/portraits/women/65.jpg', role: 'Child' },
        { id: 4, name: 'You', points: currentUserWattPoints, avatar: 'https://randomuser.me/api/portraits/women/45.jpg', isCurrentUser: true, role: 'Child' },
        { id: 5, name: 'Grandpa', points: 71, avatar: 'https://randomuser.me/api/portraits/men/22.jpg', role: 'Grandparent' },
      ];
  
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
      const sampleData = [
        { id: 1, name: 'Mom', points: 98, avatar: 'https://randomuser.me/api/portraits/women/32.jpg', rank: 1, role: 'Parent' },
        { id: 2, name: 'Dad', points: 85, avatar: 'https://randomuser.me/api/portraits/men/44.jpg', rank: 2, role: 'Parent' },
        { id: 3, name: 'Emma', points: 79, avatar: 'https://randomuser.me/api/portraits/women/65.jpg', rank: 3, role: 'Child' },
        { id: 4, name: 'You', points: currentUserWattPoints, avatar: 'https://randomuser.me/api/portraits/women/45.jpg', isCurrentUser: true, rank: 4, role: 'Child' },
        { id: 5, name: 'Grandpa', points: 71, avatar: 'https://randomuser.me/api/portraits/men/22.jpg', rank: 5, role: 'Grandparent' },
      ];
      setLeaderboardData(sampleData);
      setUserRank(4); // Default position in sample data
    } finally {
      setLoading(false);
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

  // Calculate total household points
  const totalHouseholdPoints = leaderboardData.reduce((sum, user) => sum + user.points, 0);
  
  // Get current leader
  const currentLeader = leaderboardData.length > 0 ? leaderboardData[0] : null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.leaderboardContainer}>
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
          
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>Family Rankings</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#8B5CF6" />
                <Text style={styles.loadingText}>Loading family data...</Text>
              </View>
            ) : (
              <FlatList
                data={leaderboardData}
                renderItem={renderLeaderboardItem}
                keyExtractor={item => item.id.toString()}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
              />
            )}
          </View>
          
          <View style={styles.leaderboardFooter}>
            <View style={styles.badgeSection}>
              <Text style={styles.badgeSectionTitle}>Family Conservation Badge</Text>
              {totalHouseholdPoints > 300 ? (
                <View style={styles.badgeContainer}>
                  <Ionicons name="shield-checkmark" size={40} color="#8B5CF6" />
                  <Text style={styles.badgeTitle}>Energy Guardian</Text>
                  <Text style={styles.badgeDescription}>Your family is in the top 10% of energy savers!</Text>
                </View>
              ) : (
                <View style={styles.badgeContainer}>
                  <Ionicons name="leaf" size={40} color="#4CAF50" />
                  <Text style={styles.badgeTitle}>Conservation Family</Text>
                  <Text style={styles.badgeDescription}>Your family is making great progress!</Text>
                </View>
              )}
            </View>
            
            <TouchableOpacity style={styles.challengeButton}>
              <Ionicons name="trophy" size={18} color="white" />
              <Text style={styles.challengeButtonText}>Start Family Challenge</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
});

export default HouseholdLeaderboardScreen;
