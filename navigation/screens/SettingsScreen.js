import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { useContext } from "react";
import FeedItem from "../../components/FeedItem";
import ListContext from "../../components/Context";
import moment from "moment";

export default function SettingsScreen() {
  const context = useContext(ListContext);

  function deleteFunction(props) {
    console.log(props);
  }

  return (
    <View style={Styles.container}>
      <View style={Styles.feedListContainer}>
        <FlatList
          data={Object.values(context.deviceList)}
          renderItem={({ item, index }) => {
            return (
              <FeedItem
                text={
                  "Device name: " +
                  Object.keys(context.deviceList)[index] +
                  "\n" +
                  "Pet: " +
                  item.assignedPet +
                  "\n" +
                  "device ID: " +
                  item.deviceId +
                  "\n" +
                  "food left: " +
                  item.foodLeft
                }
                onDeleteItem={deleteFunction}
                id={item.deviceId}
              />
            );
          }}
          keyExtractor={(item, index) => {
            return item.deviceId;
          }}
        />
      </View>
    </View>
  );
}

const Styles = StyleSheet.create({
  elementMargin: {
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#cccccc",
    width: "100%",
    margin: 10,
    padding: 8,
  },
  postLoginView: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: 75,
    height: 75,
    borderRadius: 50,
    margin: 10,
  },
  googleButtonStyle: {
    width: "65%",
    height: 65,
    marginTop: 600,
  },
  feedListContainer: {
    flex: 5,
  },
});
