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

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import initiateGoogleKeys from "./AuthKeys";

import MainContainer from "./navigation/MainContainer";

import Context from "./components/Context";

import { useCardAnimation } from "@react-navigation/stack";

initiateGoogleKeys();

async function onGoogleButtonPress() {
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  const { idToken } = await GoogleSignin.signIn();

  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  const user_sign_in = auth()
    .signInWithCredential(googleCredential)
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
    //revokeAccess removes automatic account selection on next login, enabling us to log in using other accounts. It also seems to trigger an [Error: SIGN_IN_REQUIRED]
    await GoogleSignin.revokeAccess();
    await auth().signOut();
  } catch (error) {
    console.error(error);
  }
}

function userCollection(UID) {
  return firestore().collection("catFeeder_v1").doc("userData").collection(UID);
}

const vibrationPattern = [0, 30, 110, 30];

export default function App() {
  const [enteredMessageText, setEnteredMessageText] = useState("");

  const [petList, setPetList] = useState([]);
  const [feedList, setFeedList] = useState([]);
  const [deviceList, setDeviceList] = useState([]);

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  const [databaseInitiated, setDatabaseInitiated] = useState(false);

  const coreSubscriptions = useRef([]);
  const feedSubscriptions = useRef([]);

  const prevPetList = useRef([]);
  const tempFeedListRef = useRef([]);
  const databaseChecked = useRef(false);

  // TODO: Firestore error handling
  // User authentication state listener

  function reinitializeAllRegisters() {
    console.log("Removing everything lol fuck you.");
    setPetList([]);
    setFeedList([]);
    setDeviceList([]);
    setDatabaseInitiated(false);
    coreSubscriptions.current = [];
    feedSubscriptions.current = [];
    prevPetList.current = [];
    tempFeedListRef.current = [];
    databaseChecked.current = false;
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChangedLocal);
    return subscriber; // unsubscribe on unmount
  }, []);

  // FIXME: If petInfo or deviceInfo are empty documents at the time of running the app, will these listeners be created?
  // TODO: Some more work here
  // petList, deviceList listeners
  useEffect(() => {
    console.log(
      "Entered useEffect databaseInitiated and it's " +
        databaseInitiated.toString()
    );

    if (!databaseInitiated) return;

    const coreSubscriptionsIsEmpty =
      Array.isArray(coreSubscriptions.current) &&
      coreSubscriptions.current.length === 0;

    if (user && coreSubscriptionsIsEmpty) {
      console.log("Creating core listeners");
      // Double trigger safety mechanism
      // If user is logged in and no core subsciptions have been made
      // Device list listener
      coreSubscriptions.current.push(
        userCollection(user.uid)
          .doc("deviceInfo")
          .onSnapshot((documentSnapshot) => {
            console.log("deviceInfo updated");
            if (documentSnapshot && documentSnapshot.exists) {
              let tempInfo = [];
              for (let key in documentSnapshot.data()) {
                // List through keys of random values
                let { name, id, ...rest } = documentSnapshot.data()[key]; // Deconstruct device information
                tempInfo.push({
                  name: name,
                  id: id,
                  info: rest,
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
            console.log("petInfo updated");
            if (documentSnapshot && documentSnapshot.exists) {
              let tempInfo = [];
              for (let key in documentSnapshot.data()) {
                let { name, id, ...rest } = documentSnapshot.data()[key];
                tempInfo.push({
                  name: name,
                  id: id,
                  info: rest,
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
  }, [databaseInitiated]);

  // feedList listeners
  useEffect(() => {
    console.log(
      "Entered useEffect petList, it's length is " + petList.length.toString()
    );

    if (petList.length == 0) return;

    let tempPetList = [];

    console.log(petList);

    petList.forEach((petId) => tempPetList.push(petId.id));

    const subscribeTo = tempPetList.filter(
      (item) => !prevPetList.current.includes(item)
    ); // Is in new list but not in old
    const unsubscribeFrom = prevPetList.current.filter(
      (item) => !tempPetList.includes(item)
    ); // Is in old list but not in new

    console.log("Subscribe to array: " + subscribeTo);
    console.log("Unsubscribe from array: " + unsubscribeFrom);

    if (unsubscribeFrom) {
      const newSubscriptions = feedSubscriptions.current.filter(
        (subscription) => {
          if (unsubscribeFrom.includes(subscription.id)) {
            subscription.function();
            return false;
          }
          return true;
        }
      );
      feedSubscriptions.current = newSubscriptions;
    }
    if (subscribeTo) {
      subscribeTo.forEach((petId) => {
        console.log("Subscribing to a pet id: " + petId);
        feedSubscriptions.current.push({
          id: petId,
          function: userCollection(user.uid)
            .doc("feedInfo")
            .collection(petId)
            .orderBy("time", "desc")
            .onSnapshot((querySnapshot) => {
              //TODO: instead of re-writing the whole pet array in feedList, we can use onChanges to simply add or delete the instance but right now I cannot be bothered.
              console.log("onSnapshot update");
              if (querySnapshot) {
                let petFeedList = [];
                let tempFeedList = [...tempFeedListRef.current]; // Non-linking copy

                querySnapshot.forEach((documentSnapshot) => {
                  petFeedList.push({
                    ...documentSnapshot.data(),
                    id: documentSnapshot.id,
                  });
                });

                console.log("tempFeedList before addition of " + petId);
                console.log(JSON.stringify(tempFeedList));
                console.log(petFeedList.length);

                console.log("Acquired " + petId + " list is");
                console.log(petFeedList);
                if (petFeedList.length) {
                  console.log("And it has data.");
                } else {
                  console.log("And it's empty.");
                }

                //TODO: Please find an alternative
                if (petFeedList.length == 0) {
                  console.log("%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%");
                  console.log("petFeedList is empty");
                  console.log(petFeedList);
                  console.log(tempFeedList);
                  // let index = Object.keys(tempFeedList).filter(
                  //   // Returns an index of the local list where pet is stored
                  //   (key) => tempFeedList[key].id == petId
                  // );
                  tempFeedList = tempFeedList.filter((obj) => obj.id !== petId); // If the new pet feed list has no feeds, we delete all pet feeds residue from the local list
                  console.log(tempFeedList);
                } else {
                  const arrayLength = tempFeedList.length;
                  console.log(
                    "currently tempFeedList has " +
                      arrayLength.toString() +
                      " members."
                  );
                  if (arrayLength >= 2) {
                    // More than two pets are in the local list, we must find the key of the pet we want to edit
                    let index = Object.keys(tempFeedList).filter(
                      // Returns an index of the local list where pet is stored
                      (key) => tempFeedList[key].id == petId
                    );

                    //FIXME: Was using index here but index is an array with one value so index[0] must be used.
                    if (index[0] && index.length)
                      tempFeedList[index[0]].feeds = petFeedList;
                    // feeds exist so we overwrite the 'feeds' key
                    else tempFeedList.push({ id: petId, feeds: petFeedList }); // Otherwise we create a new object with keys id and feeds
                  } else if (arrayLength == 1 && tempFeedList[0].id != petId) {
                    // There is only one pet in the local list, and it's not the current one
                    tempFeedList.push({ id: petId, feeds: petFeedList }); // Create a new object with keys id and feeds
                  } else tempFeedList = [{ id: petId, feeds: petFeedList }]; // Otherwise we create a new list with a new object with keys id and feeds
                }

                console.log("tempFeedList after addition of " + petId);
                console.log(tempFeedList);
                console.log(JSON.stringify(tempFeedList));
                for (let pet in tempFeedList) {
                  console.log(tempFeedList[pet]);
                }

                setFeedList(() => {
                  // Functional useState using previous value ensures chronological execution
                  tempFeedListRef.current = tempFeedList;
                  return tempFeedList;
                });

                // Update pet last feed time
                userCollection(user.uid)
                  .doc("petInfo")
                  .get()
                  .then((data) => {
                    console.log("that data");
                    console.log(data.data());
                    // Returns an index of the local list where pet is stored
                    let index = Object.keys(data.data()).filter(
                      (key) => data.data()[key].id == petId
                    );
                    if (index.length) {
                      // Conditionally refresh last feed time
                      const lastListFeed = Math.max(
                        ...petFeedList.map((o) => o.time),
                        0
                      ); // "Find the object whose property "Y" has the greatest value in an array of objects, default to 0" thank you Stackexchange.
                      if (lastListFeed > data.data()[index[0]].lastFeed) {
                        console.log(data.data()[index[0]].lastFeed);
                        data.data()[index[0]].lastFeed = lastListFeed;
                        console.log(data.data()[index[0]].lastFeed);
                        userCollection(user.uid)
                          .doc("petInfo")
                          .update(data.data())
                          .then(() => console.log("update successful."));
                      }
                    }
                  });
              }
            }),
        });
      });
    }
    prevPetList.current = tempPetList;
    //FIXME: Return unsubscribe functions in the correct manner, the following executes them immediately.
    return () => {
      if (Array.isArray(feedSubscriptions.current)) {
        // Check if array duh
        feedSubscriptions.current.forEach(
          (subscription) => subscription.function
        );
      }
    };
  }, [petList]);

  function onAuthStateChangedLocal(user) {
    console.log("user state changed");
    setUser(user);

    if (initializing) setInitializing(false);

    if (!user) {
      reinitializeAllRegisters();
      ToastAndroid.show("You've been signed out", ToastAndroid.SHORT);
      return;
    }

    Vibration.vibrate(vibrationPattern);
    const currentTime = moment().unix();

    if (user && !databaseChecked.current) {
      //Check if user exists in the database
      userCollection(user.uid)
        .get()
        .then((data) => {
          if (data.empty) {
            const col = userCollection(user.uid);
            const batch = firestore().batch();

            batch.set(col.doc("petInfo"), {});
            batch.set(col.doc("feedInfo"), {});
            batch.set(col.doc("deviceInfo"), {});
            batch.set(col.doc("user"), {
              name: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
              petCount: 0,
              firstSeen: currentTime,
              lastSeen: currentTime,
            });
            batch.commit().then(() => {
              userCollection(user.uid)
                .get()
                .then((documentSnapshot) => {
                  if (documentSnapshot && !documentSnapshot.empty)
                    // The document has been written,
                    setDatabaseInitiated(() => true); //We can trigger
                  console.log("database initiated");
                });
            });
          } else if (!data.empty) {
            console.log("database already initiated");
            setDatabaseInitiated(() => true); // User data already exists in the database
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
    }
  }

  // Add feed event for petName
  async function addFeedEvent(foodAmount, petId) {
    if (!(foodAmount && petId)) return 1;

    console.log("App.js: About to add " + foodAmount + " to " + petId);
    const currentTime = moment().unix();
    //We need to fetch the pet information to see which device they are assigned to (there are better local storage ways). Error if the pet doesn't exist, but in the final app we don't add feeds, only read and delete them
    userCollection(user.uid)
      .doc("petInfo")
      .get()
      .then((data) => {
        console.log(data);
        const deviceNumber = data.data()[petId].assignedDevice; // Get the number
        userCollection(user.uid) // Add feed to pet
          .doc("feedInfo")
          .collection(petId)
          .add({
            amount: parseInt(foodAmount),
            device: deviceNumber,
            time: currentTime,
          })
          .then(() => console.log("feed added to cloud"));
        let index = Object.keys(data.data()).filter(
          (key) => data.data()[key].id == petId
        );
        if (index.length) {
          data.data()[index[0]].feedCount++;
          userCollection(user.uid)
            .doc("petInfo")
            .update(data.data())
            .then(() => console.log("petInfo feedCount updated"));
        }
      });
  }

  //Delete feed item of parsed ID
  async function deleteFeedEvent(petId, feedId) {
    if (!(petId && feedId)) return 1;

    console.log(
      "App.js: attempting to delete pet feed " + petId + " event id " + feedId
    );

    userCollection(user.uid)
      .doc("feedInfo")
      .collection(petId)
      .doc(feedId)
      .delete();
  }

  function addPet(petName, feedAmount, assignedDeviceId) {
    if (!(petName && assignedDeviceId && feedAmount)) return 1;

    // Updating pets doesn't happen often, so we can do something dirty
    userCollection(user.uid)
      .doc("petInfo")
      .get()
      .then((data) => {
        let match = false;
        let randomId;
        do {
          randomId = Math.random().toString(36).slice(2, 10);
          match = false;

          for (let key in data.data()) {
            if (key == randomId) match = true;
          }

          if (!match) {
            userCollection(user.uid) // Listeners don't get created if there is no documents in a collection, so a dummy document must be made. Empty documents are ignored by snapshots.
              .doc("feedInfo")
              .collection(randomId)
              .doc("_init_")
              .set({});
            userCollection(user.uid)
              .doc("petInfo")
              .update({
                [randomId]: {
                  name: petName,
                  id: randomId,
                  assignedDevice: assignedDeviceId,
                  feedAmount: feedAmount,
                  feedCount: 0,
                  lastFeed: 0,
                },
              })
              .then(() => console.log("Pet added."));
          }
        } while (match);
      });
  }

  function removePet(petId) {
    if (!petId) return 1;

    // Check if the pet under that ID exists
    userCollection(user.uid)
      .doc("petInfo")
      .get()
      .then((data) => {
        for (let key in data.data()) {
          if (key == petId) {
            userCollection(user.uid)
              .doc("petInfo")
              .update({
                [petId]: firestore.FieldValue.delete(),
              })
              .then(() => console.log("pet deleted."));
          }
        }
      });
  }

  function removeDevice(deviceId) {
    if (!deviceId) return 1;

    // Check if the pet under that ID exists
    userCollection(user.uid)
      .doc("deviceInfo")
      .get()
      .then((data) => {
        for (let key in data.data()) {
          if (key == petId) {
            userCollection(user.uid)
              .doc("deviceInfo")
              .update({
                [deviceId]: firestore.FieldValue.delete(),
              })
              .then(() => console.log("device deleted."));
          }
        }
      });
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
    console.log(feedList);
    console.log(JSON.stringify(feedList));
    const newList = [];
    for (let pet in feedList) {
      console.log(feedList[pet]);
    }
    // for (let pet in feedList) {
    //   feedList[pet].feeds.forEach((feed) => {
    //     newList.push({ name: feedList[pet].name, ...feed });
    //   });
    // }
    // newList.sort((a, b) => a.time - b.time || a.name - b.name);
  }, [feedList]);

  if (initializing) return

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
    //<StrictMode>
    <Context.Provider
      value={{
        feedList: JSON.parse(JSON.stringify(feedList)),
        deviceList: JSON.parse(JSON.stringify(deviceList)),
        petList: JSON.parse(JSON.stringify(petList)),
        userDisplayName: user.displayName,
        userPhotoURL: user.photoURL,
        addEvent: addFeedEvent,
        onFlatListPressable: deleteFeedEvent,
        addFeedEvent: addFeedEvent,
        addPet: addPet,
        deleteFeedEvent: deleteFeedEvent,
      }}
    >
      <MainContainer onLogOutButtonPress={googleSignOut} />
    </Context.Provider>
    //</StrictMode>
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
