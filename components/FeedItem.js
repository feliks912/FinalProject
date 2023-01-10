import { useEffect } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";
import moment from 'moment'

export default function FeedItem(props) {
  return (
    <View style={Styles.feedItem}>
      <Pressable
        android_ripple={{ color: "#210644", borderless: true }}
        //onPress={props.onDeleteItem.bind(this, props.id)}
        onPress={() => props.onDeleteItem(props.name, props.id)}
      >
        <View>
            <Text style={Styles.feedText}>Pet name: {props.name}</Text>
            <Text style={Styles.feedText}>Feed amount: {props.amount}</Text>
            <Text style={Styles.feedText}>Time: {moment.unix(props.time).format("DD.MM.YYYY HH:mm:ss")}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const Styles = StyleSheet.create({
  feedItem: {
    margin: 8,
    borderRadius: 6,
    backgroundColor: "#5e08cc",
  },
  feedText: {
    fontSize: 20,
    flex:1,
    color: "white",
    padding: 8,
  },
});
