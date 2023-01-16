import { View, Text, Button, TextInput, StyleSheet } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useState, useContext } from "react";
import Context from '../../components/Context'

export default function PetScreen(navigation) {
  const [newFeedInfo, setNewFeedInfo] = useState("");
  const [petDeleteId, setPetDeleteId] = useState("");
  const [eventDeleteId, setEventDeleteId] = useState("");
  
  const [petName, setPetName] = useState("")
  const [petFeedAmount, setPetFeedAmount] = useState("");
  const [petAssignedDeviceId, setPetAssignedDeviceId] = useState("");

  const context = useContext(Context)

  return (
    <View>
      <TextInput
        style={styles.textInput}
        placeholder="New pet name"
        onChangeText={setPetName}
        value={petName}
      />
      <TextInput
        style={styles.textInput}
        placeholder="New pet feed amount"
        onChangeText={setPetFeedAmount}
        value={petFeedAmount}
      />
      <TextInput
        style={styles.textInput}
        placeholder="New pet assigned device ID"
        onChangeText={setPetAssignedDeviceId}
        value={petAssignedDeviceId}
      />

      <View style={{ margin: 10, color: "#49e941" }}>
        <Button
          title="Add pet"
          onPress={() => {
            //get current feed number
            //we're not testing how much food is left here
            context.addPet(petName, petFeedAmount, petAssignedDeviceId);
          }}
        />
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="Feed first pet this amount."
        onChangeText={setNewFeedInfo}
        value={newFeedInfo}
      />

      <View style={styles.elementMargin}>
        <Button
          title="Feed first pet"
          onPress={() => {
            //get current feed number
            //we're not testing how much food is left here
            context.addFeedEvent(newFeedInfo, context.petList[0].id);
          }}
        />
      </View>

      <TextInput
        style={styles.textInput}
        placeholder="ID of pet to remove"
        onChangeText={setPetDeleteId}
        value={petDeleteId}
      />

      <TextInput
        style={styles.textInput}
        placeholder="feed event ID to remove"
        onChangeText={setEventDeleteId}
        value={eventDeleteId}
      />

      <View style={styles.elementMargin}>
        <Button
          title="Remove feedEvent with ID"
          onPress={() => {
            context.deleteFeedEvent(petDeleteId, eventDeleteId).then(() => {
              console.log("App.js: Feed event deleted");
            });
          }}
        />
      </View>
    </View>

    // const [open, setOpen] = useState(false);
    // const [value, setValue] = useState(null);
    // const [items, setItems] = useState([
    //   {label: 'Apple', value: 'apple'},
    //   {label: 'Banana', value: 'banana'}
    // ]);

    // return (
    //   <DropDownPicker
    //     open={open}
    //     value={value}
    //     items={items}
    //     setOpen={setOpen}
    //     setValue={setValue}
    //     setItems={setItems}
    //   />
    // );
  );
}

const styles = StyleSheet.create({
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
    resizeMode: "cover",
    height: "100%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
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
