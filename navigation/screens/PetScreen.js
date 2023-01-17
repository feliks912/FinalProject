import {
  View,
  Text,
  Button,
  TextInput,
  StyleSheet,
  FlatList,
} from "react-native";
import { useState, useContext } from "react";
import Context from "../../components/Context";
import PetItem from "../../components/PetItem";

export default function PetScreen(navigation) {
  const [newFeedInfo, setNewFeedInfo] = useState("");

  const [petName, setPetName] = useState("");
  const [petFeedAmount, setPetFeedAmount] = useState("");
  const [petAssignedDeviceId, setPetAssignedDeviceId] = useState("");

  const context = useContext(Context);

  return (
    <View style={styles.container}>
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

      <View style={styles.elementMargin}>
        <Button
          title="Add pet"
          color="#49e941"
          onPress={() => {
            setPetName("")
            setPetFeedAmount("")
            setPetAssignedDeviceId("")
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

      <FlatList
        data={context.petList}
        renderItem={(data) => {
          return (
            <PetItem
              petId={data.item.id}
              name={data.item.name}
              info={data.item.info}
              onDeleteItem={context.onDeleteMyPet}
            />
          );
        }}
        keyExtractor={(item, index) => {
          //TODO: Assuming firebase doesn't create 2 documents of equal ID for different pets. We can combine pet and document id's to create an unique ID sometime in the future
          return item.id;
        }}
      />
    </View>
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
