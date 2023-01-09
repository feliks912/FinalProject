import { useEffect } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";
import moment from 'moment'

function FeedItem(props) {
  return (
    <View style={styles.feedItem}>
      <Pressable
        android_ripple={{ color: "#210644", borderless: true }}
        onPress={props.onDeleteItem.bind(this, props.id)}
      >
        <View>
          <Text>Pet name: {props.petName}</Text>
          <Text>Feed amount: {props.feedAmount}</Text>
          <Text>Time: {moment.unix(props.time).format("DD.MM.YYYY HH:mm:ss")}</Text>
        </View>
      </Pressable>
    </View>
  );
}

export default FeedItem;

const styles = StyleSheet.create({
  feedItem: {
    margin: 8,
    borderRadius: 6,
    backgroundColor: "#5e08cc",
  },
  feedText: {
    color: "white",
    padding: 8,
  },
});
