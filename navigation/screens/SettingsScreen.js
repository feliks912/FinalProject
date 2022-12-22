import { View, Text } from 'react-native'

export default function SettingsScreen(navigation) {
    return (
        <View style={{ flex: 1, alightItems: 'center', justifyContent: 'center' }}>
            <Text
                onPress={() => navigation.navigate('Pets')}
                style={{ fontSize: 26, fontWeight: 'bold' }}>
                Settings Screen
            </Text>
        </View>
    )
}