import { useEffect } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";
import moment from 'moment'

export default function DeviceItem(props) {
  return (
    <View style={Styles.feedItem}>
      <Pressable
        android_ripple={{ color: "#210644", borderless: true }}
        onPress={() => console.log(props.deviceId)}
      >
        <View>
          <Text style={Styles.feedText}>Device name: {props.name}</Text>
          <Text style={Styles.feedText}>Assigned pet: {props.assignedPet}</Text>
          <Text style={Styles.feedText}>Food left: {props.foodLeft}</Text>
          <Text style={Styles.feedText}>ID: {props.deviceId}</Text>
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
    color: "white",
    padding: 8,
  },
});
