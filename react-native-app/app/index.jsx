import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useState } from 'react';

export default function IndexScreen() {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 20, marginBottom: 20 }}>Welcome to Home</Text>
      <TouchableOpacity
        style={{
          backgroundColor: isHovered ? '#4A3AB0' : '#6A5AE0',
          padding: 15,
          borderRadius: 10,
        }}
        onPress={() => router.push({ pathname: '/device' })}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>Go to Device Page</Text>
        
      </TouchableOpacity>
    </View>
  );
}