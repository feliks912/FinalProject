import { useEffect } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";
import moment from 'moment'

function DeviceItem(props) {
  return (
    <View style={styles.feedItem}>
      <Pressable
        android_ripple={{ color: "#210644", borderless: true }}
        onPress={() => console.log(props.id)}
      >
        <View>
          <Text>Device name: {props.name}</Text>
          <Text>Assigned pet: {props.assignedPet}</Text>
          <Text>Food left: {props.amount}</Text>
          <Text>ID: {props.deviceId}</Text>
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
