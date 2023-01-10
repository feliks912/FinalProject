import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { useContext, useState, useEffect } from "react";
import DeviceItem from "../../components/FeedItem";
import ListContext from "../../components/Context";
import moment from "moment";

export default function SettingsScreen() {
  const context = useContext(ListContext);
  const [displayList, setDisplayList] = useState([]);

  useEffect(() => {
    if (context.deviceList.length) {
      const newList = [];
      console.log("deviceList before sort")
      console.log(context.deviceList)
      for (let device in context.deviceList) {
        newList.push({name:context.deviceList[device].name, ...context.deviceList[device].info})
      }
      newList.sort((a, b) => b.time - a.time);
      console.log("new deviceList after sort")
      console.log(newList)
      setDisplayList(newList);
    }
  }, [context.deviceList]);

  return(
    <View>
      <FlatList
        data={displayList}
        renderItem={(item) => {
          return (
            <DeviceItem
              name={item.item.name}
              assignedPet={item.item.assignedPet}
              foodLeft={item.item.foodLeft}
              deviceId={item.item.deviceId}
            />
          );
        }}
        keyExtractor={(item, index) => {
          return item.deviceId;
        }}
      />
    </View>
  )

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
