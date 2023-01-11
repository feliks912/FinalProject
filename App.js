import {
  StyleSheet,
  Text,
  View,
  Image,
  Button,
  ImageBackground,
  Vibration,
  ToastAndroid,
  TextInput,
  setState,
} from "react-native";
import React, { useState, useEffect, StrictMode, useRef } from "react";
import moment from "moment";

import "expo-dev-client";

import firestore, { firebase } from "@react-native-firebase/firestore";

import imageCatEats from "./assets/Cute-cat.jpg";
import imageCatBack from "./assets/Cat-back.jpg";

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

import MainContainer from "./navigation/MainContainer";

import ListContext from "./components/Context";

GoogleSignin.configure({
  webClientId:
    "783455449055-3aq47aap1qhf0q77pm8gf826svlsqad5.apps.googleusercontent.com",
});

async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();
  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  const user_sign_in = auth().signInWithCredential(googleCredential);

  user_sign_in
    .then((user) => {
      console.log(user);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function googleSignOut() {
  ToastAndroid.show("Signing out...", ToastAndroid.SHORT);
  try {
    //revokeAccess removes automatic account selection on next login, enabling us to log in using other accounts
    await GoogleSignin.revokeAccess();
    await auth().signOut();
  } catch (error) {
    console.error(error);
  }
}

// async function firestoreData(action, collection_id, ...props) {
//   try {
//     if (action == "r") {
//       if (props.length) {
//         const temporary_var = await firestore()
//           .collection(collection_id)
//           .doc(props[0])
//           .get();
//         return temporary_var;
//       } else {
//         const temporary_var = await firestore().collection(collection_id).get();
//         return temporary_var;
//       }
//     } else if (action == "w") {
//       if (props.length == 2) {
//         await firestore().collection(collection_id).doc(props[0]).set(props[1]);
//       } else {
//         await firestore().collection(collection_id).add(props[0]);
//       }
//     } else if (action == "a") {
//       if (props.length != 2)
//         throw new Error("insufficient arguments in append");
//       await firestore()
//         .collection(collection_id)
//         .doc(props[0])
//         .update(props[1]);
//     } else {
//       throw new Error("inappropriate arguments led to default");
//     }
//   } catch (error) {
//     console.error("Error writing new message to Firebase Database", error);
//   }
// }

function userCollection(UID) {
  return firestore()
    .collection("catFeeder_v1")
    .doc("userCollection")
    .collection(UID);
}

const vibrationPattern = [0, 30, 110, 30];

export default function App() {
  const [timesPressed, setTimesPressed] = useState(0);
  const [enteredMessageText, setEnteredMessageText] = useState("");
  const [newFeedInfo, setNewFeedInfo] = useState("");
  const [IDToDelete, setIDToDelete] = useState("");

  const [petList, setPetList] = useState([]);
  const [feedList, setFeedList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const coreSubscriptions = useRef([]);
  const feedSubscriptions = useRef([]);

  const prevPetList = useRef([]);
  const tempFeedListRef = useRef([]);
  const databaseInitiated = useRef(false);

  // TODO: Error handling
  // User authentication state listener

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChangedLocal);
    return subscriber; // unsubscribe on unmount
  }, []);

  // core listeners
  useEffect(() => {
    if (!databaseInitiated) return;

    const coreSubscriptionsIsEmpty =
      Array.isArray(coreSubscriptions.current) &&
      coreSubscriptions.current.length === 0;

    if (user && coreSubscriptionsIsEmpty) {
      // If user is logged in and no core subsciptions have been made
      // Device list listener
      coreSubscriptions.current.push(
        userCollection(user.uid)
          .doc("devices")
          .onSnapshot((documentSnapshot) => {
            if (documentSnapshot.exists) {
              let tempInfo = [];
              for (let key in documentSnapshot.data()) {
                tempInfo.push({
                  name: key,
                  info: documentSnapshot.data()[key],
                });
              }
              setDeviceList(tempInfo);
            }
          })
      );
      // Pet list listener
      coreSubscriptions.current.push(
        userCollection(user.uid)
          .doc("petInfo")
          .onSnapshot((documentSnapshot) => {
            if (documentSnapshot.exists) {
              let tempInfo = [];
              for (let key in documentSnapshot.data()) {
                tempInfo.push({
                  name: key,
                  info: documentSnapshot.data()[key],
                });
              }
              setPetList(tempInfo);
            }
          })
      );
      // User logged out, call unsubscribe functions if they have been set and remove them from an array
    } else if (!user && Array.isArray(coreSubscriptions.current)) {
      coreSubscriptions.current.forEach((unsubscribe) => unsubscribe());
      coreSubscriptions.current = [];
    }
    return () => {
      if (Array.isArray(coreSubscriptions.current)) {
        coreSubscriptions.current.forEach((unsubscribe) => unsubscribe());
        coreSubscriptions.current = [];
      }
    };
  }, [user, databaseInitiated]);

  // feed listeners
  useEffect(() => {
    if (petList.length) {
      let tempPetList = [];
      petList.forEach((pet) => tempPetList.push(pet.name));

      const subscribeTo = tempPetList.filter(
        (item) => !prevPetList.current.includes(item)
      ); // Is in new list but not in old
      const unsubscribeFrom = prevPetList.current.filter(
        (item) => !tempPetList.includes(item)
      ); // Is in old list but not in new

      console.log("Subscribe to array: " + subscribeTo);
      console.log("Unsubscribe from array: " + unsubscribeFrom);

      if (unsubscribeFrom) {
        unsubscribeFrom.forEach((unsubscribe) => unsubscribe());
        feedSubscriptions.current = feedSubscriptions.current.filter(
          (item) => !unsubscribeFrom.includes(item)
        );
      }
      if (subscribeTo) {
        subscribeTo.forEach((pet) => {
          console.log("Current pet: " + pet);
          feedSubscriptions.current.push(
            userCollection(user.uid)
              .doc("feedInfo")
              .collection(pet)
              .orderBy("time", "desc")
              .onSnapshot((querySnapshot) => {
                //TODO: instead of re-writing the whole pet array in feedList, we can use onChanges to simply add or delete the instance but right now I cannot be bothered.
                console.log("onSnapshot update");

                let petFeedList = [];
                let tempFeedList = [...tempFeedListRef.current];

                querySnapshot.forEach((documentSnapshot) => {
                  petFeedList.push({
                    ...documentSnapshot.data(),
                    id: documentSnapshot.id,
                  });
                });

                console.log("tempFeedList before addition of " + pet);
                console.log(JSON.stringify(tempFeedList));
                console.log(petFeedList.length);

                console.log("Acquired " + pet + " list is");
                console.log(petFeedList);
                console.log(
                  "And it's " + (petFeedList.length !== 0)
                    ? "full of data!"
                    : "dry as a rock."
                );

                if (petFeedList.length != 0) {
                  delete tempFeedList[pet];
                } else {
                  const arrayLength = tempFeedList.length;

                  if (arrayLength >= 2) {
                    let index = Object.keys(tempFeedList).filter(
                      (key) => tempFeedList[key].name == pet
                    );

                    if (index.length) tempFeedList[index].feeds = petFeedList;
                    else tempFeedList.push({ name: pet, feeds: petFeedList });
                  } else if (arrayLength == 1 && tempFeedList[0].name != pet) {
                    tempFeedList.push({ name: pet, feeds: petFeedList });
                  } else tempFeedList = [{ name: pet, feeds: petFeedList }];
                }

                console.log("tempFeedList after addition of " + pet);
                console.log(JSON.stringify(tempFeedList));

                setFeedList(() => {
                  tempFeedListRef.current = tempFeedList;
                  return tempFeedList;
                });

                // Update pet feed count in database
                userCollection(user.uid)
                  .doc("petInfo")
                  .update({
                    [pet + ".feedNum"]: petFeedList.length,
                  });
              })
          );
        });
      }
      prevPetList.current = tempPetList;
    }
    //FIXME: Return unsubscribe functions in the correct manner, the following executes them immediately.
    // return () => {
    //   if (Array.isArray(feedSubscriptions.current)) {
    //     feedSubscriptions.current.forEach((unsubscribe) => unsubscribe())
    //   }
    // }
  }, [petList]);

  function onAuthStateChangedLocal(user) {
    setUser(user);
    Vibration.vibrate(vibrationPattern);
    const currentTime = moment().unix();
    if (user) {
      //Check if user exists in the database
      userCollection(user.uid)
        .get()
        .then((data) => {
          if (data.empty) {
            const col = userCollection(user.uid);
            const batch = firestore().batch();

            batch.set(col.doc("petInfo"), {});
            batch.set(col.doc("feedInfo"), {});
            batch.set(col.doc("devices"), {});
            batch.set(col.doc("user"), {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              petCount: 0,
              firstSeen: currentTime,
              lastSeen: currentTime,
            });
            batch.commit().then((databaseInitiated = true));
          } else if (!data.empty) {
            databaseInitiated = true;
            userCollection(user.uid).doc("user").update({
              lastSeen: currentTime,
            });
          }
        })
        .catch((err) => {
          console.error(err);
        });

      ToastAndroid.show(
        "Successfuly signed in with Google.",
        ToastAndroid.SHORT
      );
    } else {
      ToastAndroid.show("You've been signed out", ToastAndroid.SHORT);
    }
    if (initializing) setInitializing(false);
  }

  // Add feed event for petName
  async function addFeedEvent(foodAmount, petName) {
    console.log("App.js: About to add " + foodAmount + " to " + petName);
    if (foodAmount && petName) {
      const currentTime = moment().unix();
      userCollection(user.uid)
        .doc("petInfo")
        .get()
        .then((data) => {
          console.log(data);
          const deviceNumber = data.data()[petName].assignedDevice;
          userCollection(user.uid)
            .doc("feedInfo")
            .collection(petName)
            .add({
              amount: parseInt(foodAmount),
              device: deviceNumber,
              time: currentTime,
            })
            .then(() => {
              // I can add error handling here as well, as they are bound to pop out of nowhere
              console.log("App.js: Feed event added.");
            })
            .catch((err) => {
              console.error(err);
            });
        });
    }
  }

  //Delete feed item of parsed ID
  async function deleteFeedEvent(name, id) {
    console.log("App.js: attempting to delete event id: " + id);

    return userCollection(user.uid)
      .doc("feedInfo")
      .collection(name)
      .doc(id)
      .delete()
      .then(() => console.log("App.js: deleted"));
  }

  // Handle setting a state
  function messageInputHandler(enteredText) {
    setEnteredMessageText(enteredText);
  }

  function onSendButtonPress(someSyntheticEvent) {
    //Good synthetic event example, still don't understand why we need it here. It says a submit button
    //triggers a overlay refresh which we want to avoid since it will disturb a part of the function sending
    //the inputed data? The data is in the variable we know, what is preventDefault?
    //Also good example of test if User is logged in before attempting to do an authentication requiring
    //function
    someSyntheticEvent.preventDefault(); //Forbid it to ignore our function!
    // Check that the user entered a message and is signed in. Doubt 'user' is the safest way to test
    //  authentication state
    if (Boolean(enteredMessageText) && Boolean(user)) {
      //Perform a check of user login even though they can only access the send button when logged in. User can probaby send the message somehow when not logged in through invoking button functions?
      saveMessage(enteredMessageText).then(() => {
        // Clear message text field and re-enable the SEND button.
        ToastAndroid.show("Message sent", ToastAndroid.SHORT);
        setEnteredMessageText("");
      });
    }
  }

  // Deprecated snapshot example
  function increaseButtonCount() {
    // Create a reference to the post
    const postReference = userCollection(user.uid).doc("user");

    return firestore().runTransaction(async (transaction) => {
      // Get post data first
      const postSnapshot = await transaction.get(postReference);

      if (!postSnapshot.exists) {
        throw "Post does not exist!";
      }

      transaction.update(postReference, {
        buttonPresses: postSnapshot.data().buttonPresses + 1,
      });
    });
  }

  //TODO: feedList change log
  useEffect(() => {
    console.log("------App.js new feedList-------");
    const newList = [];
    for (let pet in feedList) {
      feedList[pet].feeds.forEach((feed) => {
        newList.push({ name: feedList[pet].name, ...feed });
      });
    }
    newList.sort((a, b) => a.time - b.time || a.name - b.name);
  }, [feedList]);

  if (initializing) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={imageCatBack}
          resizeMode="stretch"
          style={styles.image}
        ></ImageBackground>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={imageCatEats}
          resizeMode="stretch"
          style={styles.image}
        >
          <GoogleSigninButton
            style={styles.googleButtonStyle}
            onPress={() =>
              onGoogleButtonPress().then(() => {
                console.log("App.js: Signed in with Google!");
              })
            }
          />
        </ImageBackground>
      </View>
    );
  }
  return (
    <StrictMode>
      <ListContext.Provider
        value={{
          feedList: JSON.parse(JSON.stringify(feedList)),
          deviceList: JSON.parse(JSON.stringify(deviceList)),
          userDisplayName: user.displayName,
          userPhotoURL: user.photoURL,
          addEvent: addFeedEvent,
          onFlatListPressable: deleteFeedEvent,
        }}
      >
        <MainContainer
          onLogOutButtonPress={() => {
            googleSignOut().then(() => console.log("App.js: Signed out!"));
          }}
        />
      </ListContext.Provider>
    </StrictMode>
    // <StrictMode>
    //   <ListContext.Provider
    //     value={{
    //       deviceList: [...deviceList],
    //       petInfo: [...petInfo],
    //       feedList: [...feedList],
    //       userDisplayName: user.displayName,
    //       userPhotoURL: user.photoURL,
    //       onFlatListPressable: deleteFeedEvent,
    //       addRandomFeedEvent: addFeedEvent
    //     }}
    //   >
    //     <MainContainer
    //       onButtonPress={() => {
    //         googleSignOut().then(() => console.log("App.js: Signed out!"));
    //       }}
    //     />
    //   </ListContext.Provider>
    // </StrictMode>

    // <View>
    //   <TextInput
    //     style={styles.textInput}
    //     placeholder="Feed Rex with this amount."
    //     onChangeText={setNewFeedInfo}
    //     value={newFeedInfo}
    //   />

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title="Feed Gricka"
    //       onPress={() => {
    //         //get current feed number
    //         //we're not testing how much food is left here
    //         addFeedEvent(newFeedInfo, "Gricka");
    //       }}
    //     />
    //   </View>

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title="Feed Rex"
    //       onPress={() => {
    //         //get current feed number
    //         //we're not testing how much food is left here
    //         addFeedEvent(newFeedInfo, "Rex");
    //       }}
    //     />
    //   </View>

    //   <TextInput
    //     style={styles.textInput}
    //     placeholder="ID to remove"
    //     onChangeText={setIDToDelete}
    //     value={IDToDelete}
    //   />

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title="Remove feedEvent with ID"
    //       onPress={() => {
    //         deleteFeedEvent(IDToDelete).then(() => {console.log("App.js: Feed event deleted")})
    //       }}
    //     />
    //   </View>

    //   <View style={styles.elementMargin}>
    //     <Button title="Get user info" onPress={() => console.log(user)} />
    //   </View>

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title="Log Rex feeds"
    //       onPress={() => {
    //         userCollection(user.uid)
    //           .doc("feedInfo")
    //           .collection("Rex")
    //           .get()
    //           .then((data) => {
    //             console.log(data.docs.map((doc) => doc.data()));
    //           });
    //       }}
    //     />
    //   </View>

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title="Log Gricka feeds"
    //       onPress={() => {
    //         userCollection(user.uid)
    //           .doc("feedInfo")
    //           .collection("Gricka")
    //           .get()
    //           .then((data) => {
    //             console.log(data.docs.map((doc) => doc.data()));
    //           });
    //       }}
    //     />
    //   </View>

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title={"Log feedList ids"}
    //       onPress={() => {
    //         Object.keys(feedList).map((subdata) => {
    //           console.log(subdata + ":");
    //           feedList[subdata].map((data) => console.log(data));
    //         });
    //       }}
    //     />
    //   </View>

    //   <View style={styles.elementMargin}>
    //     <Button
    //       title="Sign out"
    //       onPress={() => googleSignOut().then(() => console.log("App.js: Signed out!"))}
    //     />
    //   </View>
    // </View>
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
