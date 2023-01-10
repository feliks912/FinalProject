import {
  View,
  Text,
  Image,
  StyleSheet,
  FlatList,
  Button,
} from "react-native";
import { useContext, useEffect, useState } from "react";
import FeedItem from "../../components/FeedItem";
import ListContext from "../../components/Context";

export default function FeedScreen() {
  const context = useContext(ListContext);
  const [displayList, setDisplayList] = useState([]);

  useEffect(() => {
    if (context.feedList.length) {
      const newList = [];
      for (let pet in context.feedList) {
        context.feedList[pet].feeds.forEach((feed) => {
          newList.push({name:context.feedList[pet].name, ...feed})
        })
      }
      newList.sort((a, b) => b.time - a.time);
      setDisplayList(newList);
    }
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
        renderItem={(item) => {
          return (
            <FeedItem
              name={item.item.name}
              amount={item.item.amount}
              time={item.item.time}
              id={item.item.id}
              onDeleteItem={context.onFlatListPressable}
            />
          );
        }}
        keyExtractor={(item, index) => {
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
