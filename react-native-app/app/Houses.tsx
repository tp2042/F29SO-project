import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, FlatList, Platform, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

export default function HousesScreen() {
    const navigation = useNavigation();
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [houseCode, setHouseCode] = useState('');
    const [error, setError] = useState('');

    const houses = [
    { id: 'home-001', name: 'My Home', icon: 'home', color: '#8B5CF6' },
    { id: 'villa-002', name: 'Villa Sunset', icon: 'business', color: '#60A5FA' },
    { id: 'cabin-003', name: 'Cabin Woods', icon: 'home', color: '#34D399' },
    ];

    const handleSelectHouse = (house: any) => {
    navigation.navigate('IndexTabs', { house });
    };

    const handleJoinHouse = () => {
    if (!houseCode.trim()) {
        setError('Please enter a valid house code');
        return;
    }
    // Ideally you'd validate the code against your API here
    setShowJoinModal(false);
    navigation.navigate('IndexTabs', { houseCode });
    setHouseCode('');
    setError('');
    };

    const renderHouseCard = ({ item }: { item: any }) => (
    <TouchableOpacity
        style={[styles.card, { backgroundColor: item.color }]}
        onPress={() => handleSelectHouse(item)}
    >
        <Ionicons name={item.icon} size={28} color="white" />
        <Text style={styles.cardText}>{item.name}</Text>
    </TouchableOpacity>
    );

    return (
    <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.row}>
                {[...houses, { id: 'add', isAddCard: true }].map((item) =>
                    item.isAddCard ? (
                        <TouchableOpacity
                            key="add"
                            style={[styles.card, styles.addCard]}
                            onPress={() => setShowJoinModal(true)}
                        >
                            <Ionicons name="add" size={32} color="#1F2937" />
                            <Text style={styles.addText}>Join House</Text>
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            key={item.id}
                            style={[styles.card, { backgroundColor: item.color }]}
                            onPress={() => handleSelectHouse(item)}
                        >
                            <Ionicons name={item.icon} size={28} color="white" />
                            <Text style={styles.cardTitle}>{item.name}</Text>
                        </TouchableOpacity>
                    )
                )}
            </ScrollView>

      {/* Join House Modal */}
        <Modal
        visible={showJoinModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowJoinModal(false)}
        >
        <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter House Code</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                placeholder="House code"
                value={houseCode}
                onChangeText={(text) => {
                setHouseCode(text);
                setError('');
                }}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <TouchableOpacity style={styles.joinButton} onPress={handleJoinHouse}>
                <Text style={styles.joinButtonText}>Join</Text>
            </TouchableOpacity>
            </View>
        </View>
        </Modal>
    </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        justifyContent: 'center', 
        alignItems: 'center', 
        padding: 16,
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 15,
        display: 'flex'
    },
    card: {
        borderRadius: 16,
        padding: 16,
        justifyContent: 'center',
        alignItems: 'center',
        width: '45%', 
        minWidth: 150,
        aspectRatio: 1,
        marginBottom: 15,
    },
    cardTitle: {
        marginTop: 8,
        color: 'white',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 16,
    },
    addCard: {
        backgroundColor: '#A9A9A9',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    addText: {
        marginTop: 8,
        color: '#1F2937',
        fontWeight: '500',
        textAlign: 'center',
        fontSize: 16,
    },
    modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    },
    modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    },
    modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#111827',
    },
    input: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 12,
    fontSize: 16,
    },
    inputError: {
    borderColor: '#EF4444',
    borderWidth: 1,
    },
    errorText: {
    color: '#EF4444',
    fontSize: 14,
    marginTop: 4,
    },
    joinButton: {
    backgroundColor: '#8B5CF6',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 16,
    },
    joinButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    },
});
