import { View, Text, Image, StyleSheet, FlatList, Button, DeviceEventEmitter } from 'react-native'
import FeedItem from '../../components/FeedItem';

export default function FeedScreen({route, navigation}) {
    return (
        <View style={Styles.container}>

            <Image source={{ uri: route.params.userPhotoURL }}
                style={Styles.image}
            />

            <Text style={Styles.elementMargin}>
                <Text>Welcome, </Text>
                <Text style={{ fontWeight: 'bold' }}>{route.params.userDisplayName}</Text>
                <Text>.</Text>
            </Text>

            <View>
              <Button title="button"
                      onPress={DeviceEventEmitter.emit("event.testEvent", "Message event: button has been pressed.")}/>
            </View>

            {/* <View style={Styles.feedListContainer}>
                <FlatList data={route.params.feedList} renderItem={(feedData) => {
                const formattedTime = moment.unix(feedData.item.time).format("DD.MM.YYYY HH:mm:ss")
                return <FeedItem
                    text={
                    "Pet: Rex\nAmount: " 
                    + feedData.item.amount 
                    + "\nTime: "
                    + formattedTime
                    }
                    onDeleteItem={deleteFunction}
                    id={feedData.item.id} />
                }}
                keyExtractor={(item, index) => {
                return item.id;
                }}
                />
            </View> */}

        </View>
    )
}

const Styles = StyleSheet.create({
    elementMargin: {
      margin: 10,
    },
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center'
    },
    textInput: {
      borderWidth: 1,
      borderColor: '#cccccc',
      width: '100%',
      margin: 10,
      padding: 8,
    },
    postLoginView: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
        width: 75,
        height: 75,
        borderRadius: 50,
        margin: 10
    },
    googleButtonStyle: {
      width: '65%',
      height: 65,
      marginTop: 600,
    },
    feedListContainer: {
      flex: 5,
    }
  });