import { View, Text } from 'react-native'

export default function PetScreen(navigation) {
    return (
        <View style={{ flex: 1, alightItems: 'center', justifyContent: 'center' }}>
            <Text
                onPress={() => alert('this is the Pet screen.')}
                style={{ fontSize: 26, fontWeight: 'bold' }}>
                Pet Screen
            </Text>
        </View>
    )
}