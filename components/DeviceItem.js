import { useEffect, useState, useContext } from "react";
import { StyleSheet, Pressable, Text, View, Image } from "react-native";
import moment from "moment";
import DropDownPicker from "react-native-dropdown-picker";
import Context from "../components/Context";

export default function DeviceItem(props) {
  const context = useContext(Context);

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple", value: "apple" },
    { label: "Banana", value: "banana" },
  ]);

  useEffect(() => {
    let tempList = [];
    console.log(context.petList);
    context.petList.forEach((data) => {
      tempList.push({ label: data.name + ", " + data.id, value: data.id });
    });
    // for (let key in context.petlist) {
    //   tempList.push({
    //     label: context.petlist[key].name + ", " + context.petlist[key].id,
    //     value: context.petlist[key].id,
    //   });
    // }
    setItems(tempList);
  }, [context.petList]);

  useEffect(() => {
    // We have selected a pet, now we must change the assigned device value of every pet feed from now on, but leave the exist feed list values intact.
    // Before we do that, let's make sure our ESP32 can add itself to the device list.
  }, [value]);

  return (
    <View style={Styles.feedItem}>
      <Pressable
      //   android_ripple={{ color: "#210644", borderless: true }}
      //   onPress={() => console.log(props.deviceId)}
      //
      >
        <View>
          <Text style={Styles.feedText}>Device name: {props.name}</Text>
          <DropDownPicker
            containerStyle={{ width: "50%" }}
            open={open}
            value={value}
            items={items}
            setOpen={setOpen}
            setValue={setValue}
            setItems={setItems}
          />
          <Text style={Styles.feedText}>
            Assigned pet:{" "}
            {props.info.assignedPetId ? props.info.assignedPetId : "unassigned"}
          </Text>
          <Text style={Styles.feedText}>Food left: {props.info.foodLeft}</Text>
          <Text style={Styles.feedText}>ID: {props.id}</Text>
        </View>
      </Pressable>
    </View>
  );
}

const Styles = StyleSheet.create({
  feedItem: {
    margin: 8,
    borderRadius: 6,
    //backgroundColor: "#5e08cc",
  },
  feedText: {
    fontSize: 20,
    color: "white",
    padding: 8,
  },
});
