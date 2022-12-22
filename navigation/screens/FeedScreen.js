import { View, Text } from 'react-native'
import FeedItem from '../../components/FeedItem';

export default function FeedScreen(navigation) {
    return (
        <View style={{ flex: 1, alightItems: 'center', justifyContent: 'center' }}>
            <Text
                onPress={() => alert('this is the Feed screen.')}
                style={{ fontSize: 26, fontWeight: 'bold' }}>
                Feed Screen
            </Text>
        </View>
    )
}