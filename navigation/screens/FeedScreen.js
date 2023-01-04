import { View, Text, Image, StyleSheet, FlatList } from 'react-native'
import FeedItem from '../../components/FeedItem';
import moment from 'moment';

export default function FeedScreen({route, navigation}) {
    console.log(JSON.stringify(route.params))
    return (
        <View style={{
            flex: 1,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
        }}>
            
            <Image source={{ uri: route.params.photoURL }}
                style={styles.profilePhoto}
            />
            <Text style={styles.elementMargin}>
                <Text>Welcome, </Text>
                <Text style={{ fontWeight: 'bold' }}>{route.params.displayName}</Text>
            </Text>

            {/* <TextInput style={styles.textInput}
                placeholder="Feed Rex with this amount."
                onChangeText={setNewFeedEvent}
                value={newFeedEvent}
            /> 
             <Button title='Feed'
                onPress={() => {
                //get current feed number
                //we're not testing how much food is left here
                if(newFeedEvent){
                    firestore().collection(user.uid).doc('pets').collection('Rex').doc('settings').get().then((data) => {
                    const totalFeedNum = data.data().feedNum
                    console.log("currently fed Rex " + totalFeedNum + " times.")
                    const currentTime = moment().unix()
                    firestore().collection(user.uid).doc('pets').collection('Rex').doc('feed' + totalFeedNum).set({
                        amount: newFeedEvent,
                        device: 0,
                        time: currentTime
                    }).then(() => {
                        //Increase feed amount by one in pet settings
                        firestore().collection(user.uid).doc('pets').collection('Rex').doc('settings').update({feedNum: totalFeedNum + 1}).then(() => {
                        console.log("feed added.")
                        })
                    })
                    })
                }
                }} />

            <View style={styles.elementMargin}>
                <Button title='Get user info'
                onPress={() => console.log(user)}
                />
            </View>

            <View style={styles.elementMargin}>
                <Button title='Log Rex feeds'
                onPress={() => {
                    firestore().collection(user.uid).doc('pets').collection('Rex').where('device', '>=', 0).get().then((data) => {
                    console.log(data.docs.map(doc => doc.data()))
                    })
                }}
                />
            </View>

            <View style={styles.elementMargin}>
                <Button
                title={"you've pressed this button " + timesPressed.toString() + " times."}
                onPress={increaseButtonCount}
                />
            </View>

            <View style={styles.elementMargin}>
                <Button title={"Reset number"}
                onPress={() => sendTimesPressed(0)}
                />
            </View>

            <View style={styles.elementMargin}>
                <Button title="Sign out"
                onPress={() => googleSignOut().then(() => console.log('Signed out!'))}
                />
            </View> */}

            <View style={styles.feedListContainer}>
                <FlatList data={route.params.feedList} renderItem={(feedData) => {
                const formattedTime = moment.unix(feedData.item.time).format("DD.MM.YYYY HH:mm:ss")
                return <FeedItem
                    text={
                    "Pet: Rex\nAmount: " 
                    + feedData.item.amount 
                    + "\nTime: "
                    + formattedTime
                    }
                    onDeleteItem={deleteFeedEvent}
                    id={feedData.item.id} />
                }}
                keyExtractor={(item, index) => {
                return item.id;
                }}
                />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    profilePhoto: {
        width: 75,
        height: 75,
        borderRadius: 50,
        margin: 10
    },
    elementMargin: {
      margin: 10,
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
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
      resizeMode: "cover",
      height: '100%',
      width: '100%',
      justifyContent: 'center',
      alignItems: 'center',
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