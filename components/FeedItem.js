import { StyleSheet, Pressable, Text, View, Image } from 'react-native';

function FeedItem(props){
   return <View style={styles.feedItem}>
        <Pressable
            android_ripple={{color: '#210644', borderless: true}}
            onPress={props.onDeleteItem.bind(this, props.id)}>
            <View>
                <Text style={styles.feedText}> 
                    {props.text}
                </Text>
            </View>
        </Pressable>
    </View>
}

export default FeedItem

const styles = StyleSheet.create({
    feedItem:{
        margin: 8,
        borderRadius: 6,
        backgroundColor: '#5e08cc',
      },
      feedText:{
        color: 'white',
        padding: 8,
      }
})

