import { View, Text, Image, StyleSheet, FlatList, Button } from "react-native";
import { useContext, useEffect, useState } from "react";
import FeedItem from "../../components/FeedItem";
import Context from "../../components/Context";

export default function FeedScreen() {
  const context = useContext(Context);
  const [displayList, setDisplayList] = useState([]);

  // Prepare the list for display
  useEffect(() => {
    console.log("useEffect in FeedScreen");
    console.log(JSON.stringify(context.feedList));
    console.log("----FeedItem.js new feedList----");

    const newList = [];

    for (let petId in context.feedList) {
      context.feedList[petId].feeds.forEach((feed) => {
        newList.push({
          name: context.petList[petId].name,
          petId: context.feedList[petId].id, // What a twisted world
          ...feed,
        }); // Notice we're taking the name from petList
      });
    }

    newList.sort((a, b) => a.time - b.time || a.name - b.name); // Sort on time, if it's sorted on time sort on name == sort on time then name. Useful for debugging
    console.log(newList);
    setDisplayList(newList);
  }, [context.feedList]);

  return (
    <View style={Styles.container}>
      <Image source={{ uri: context.userPhotoURL }} style={Styles.image} />

      <Text style={Styles.elementMargin}>
        <Text>Welcome, </Text>
        <Text style={{ fontWeight: "bold" }}>{context.userDisplayName}</Text>
        <Text>.</Text>
      </Text>

      <View style={Styles.elementMargin}>
        <Button
          title="Generate random feed"
          onPress={() =>
            context.addEvent(
              Math.floor(Math.random() * 15),
              Math.random() > 0.5 ? "Rex" : "Gricka"
            )
          }
        />
      </View>

      <FlatList
        data={displayList}
        renderItem={(data) => {
          console.log("----------------------------------------");
          console.log(data.item);
          return (
            <FeedItem
              petId={data.item.petId}
              name={data.item.name}
              amount={data.item.amount}
              time={data.item.time}
              id={data.item.id}
              onDeleteItem={context.onFlatListPressable}
            />
          );
        }}
        keyExtractor={(item, index) => {
          //TODO: Assuming firebase doesn't create 2 documents of equal ID for different pets. We can combine pet and document id's to create an unique ID sometime in the future
          return item.id;
        }}
      />

      {/* <View style={Styles.feedListContainer}>
        <VirtualizedList
          data={context.feedList}
          getItem={getItem}
          renderItem={(item) => {
              return(
                <FeedItem id={item.item.value.id}
                          text={item.item.petName}/>
              )
          }}
          getItemCount={getItemCount}
          keyExtractor={(item) => item.id}
          initialNumToRender={4}
        /> 
        </View>*/}
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
