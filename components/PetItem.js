import { useEffect, useContext } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";

export default function FeedItem(props) {
  return (
    <View style={Styles.feedItem}>
      <Pressable
      // android_ripple={{ color: "#210644", borderless: true }}
      // //onPress={props.onDeleteItem.bind(this, props.id)}
      // onPress={() => props.onDeleteItem(props.petId, props.id).then(() => {
      //   console.log("feed deleted.")
      // })}
      >
        <View>
          <Text style={Styles.feedText}>Pet name: {props.name}</Text>
          <Text style={Styles.feedText}>last feed: {props.info.lastFeed}</Text>
          <Text style={Styles.feedText}>
            Assigned device: {props.info.assignedDevice}
          </Text>
          <Text style={Styles.feedText}>
            Feed amount: {props.info.feedAmount}
          </Text>
          <Text style={Styles.feedText}>Pet ID: {props.petId}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const Styles = StyleSheet.create({
  feedItem: {
    margin: 10,
    padding: 7,
    borderRadius: 6,
    backgroundColor: "#5e08cc",
  },
  feedText: {
    fontSize: 20,
    flex: 1,
    color: "white",
    padding: 3,
  },
});
