import { View, Text, Image, StyleSheet, FlatList } from "react-native";
import { useContext, useState, useEffect } from "react";
import DeviceItem from "../../components/DeviceItem";
import Context from "../../components/Context";

export default function SettingsScreen() {
  const context = useContext(Context);
  const [displayList, setDisplayList] = useState([]);

  return(
    <View>
      <FlatList
        data={context.deviceList}
        renderItem={(data) => {
          return (
            <DeviceItem
              name={data.item.name}
              info={data.item.info}
              id={data.item.id}
            />
          );
        }}
        keyExtractor={(item, index) => {
          return item.id;
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
