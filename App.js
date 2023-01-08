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
} from "react-native";
import React, { useState, useEffect } from "react";
import moment from "moment";

import "expo-dev-client";

import firestore, { firebase } from "@react-native-firebase/firestore";

import image from "./assets/Cute-cat.jpg";

import {
  GoogleSignin,
  GoogleSigninButton,
} from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";

import MainContainer from "./navigation/MainContainer";

import ListContext from "./components/Context";

GoogleSignin.configure({
  webClientId: "783455449055-3aq47aap1qhf0q77pm8gf826svlsqad5.apps.googleusercontent.com",
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
    //revokeAccess removes automatic account selection on next login, so user must select their account again.
    //await GoogleSignin.revokeAccess();
    await auth().signOut();
  } catch (error) {
    console.error(error);
  }
}

async function firestoreData(action, collection_id, ...props) {
  try {
    if (action == "r") {
      if (props.length) {
        const temporary_var = await firestore()
          .collection(collection_id)
          .doc(props[0])
          .get();
        return temporary_var;
      } else {
        const temporary_var = await firestore().collection(collection_id).get();
        return temporary_var;
      }
    } else if (action == "w") {
      if (props.length == 2) {
        await firestore().collection(collection_id).doc(props[0]).set(props[1]);
      } else {
        await firestore().collection(collection_id).add(props[0]);
      }
    } else if (action == "a") {
      if (props.length != 2)
        throw new Error("insufficient arguments in append");
      await firestore()
        .collection(collection_id)
        .doc(props[0])
        .update(props[1]);
    } else {
      throw new Error("inappropriate arguments led to default");
    }
  } catch (error) {
    console.error("Error writing new message to Firebase Database", error);
  }
}

const vibrationPattern = [0, 30, 110, 30];

export default function App() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState();

  const [enteredMessageText, setEnteredMessageText] = useState("");
  const [timesPressed, setTimesPressed] = useState(0);

  const [newFeedInfo, setNewFeedInfo] = useState("");
  const [feedList, setFeedList] = useState([]);

  const [petList, setPetList] = useState([]);
  const [petCount, setPetCount] = useState(0);

  const [petsWithIndices, setPetsWithIndices] = useState([]);

  const [deviceList, setDeviceList] = useState([]);

  //App subscriber
  useEffect(() => {
    console.log("useEffect")
    if(user){
      console.log("user exists")
      user = null
    }
    const subscriber = auth().onAuthStateChanged(onAuthStateChangedLocal);
    return subscriber; // unsubscribe on unmount
  }, []);

  //Delete feed item with parsed ID from the list
  function deleteFeedEvent(id) {
    setFeedList((currentFeedList) => {
      return currentFeedList.filter((feed) => feed.id !== id);
    });
  }

  function messageInputHandler(enteredText) {
    setEnteredMessageText(enteredText);
  }

  //Good synthetic event example, still don't understand why we need it here. It says a submit button
  //triggers a overlay refresh which we want to avoid since it will disturb a part of the function sending
  //the inputed data? The data is in the variable we know, what is preventDefault?
  //Also good example of test if User is logged in before attempting to do an authentication requiring
  //function
  function onSendButtonPress(someSyntheticEvent) {
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

  //send a button count *update* to Firebase
  function increaseButtonCount() {
    // Create a reference to the post
    const postReference = firestore().collection(user.uid).doc(`user`);

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

  async function sendTimesPressed(number) {
    await firestoreData("a", user.uid, "user", { buttonPresses: number });
  }

  //On User state change
  function onAuthStateChangedLocal(user) {
    setUser(user);
    user ? console.log("user!") : console.log("no user.")
    console.log(user)
    Vibration.vibrate(vibrationPattern);
    const currentTime = moment().unix();
    if (user) {
      //Initialize or update user datar
      firestoreData("r", user.uid).then((data) => {
        if (data.empty) {
          firestoreData("w", user.uid, "user", {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            petCount: 0,
            buttonPresses: 0,
          });
          firestoreData("a", user.uid, "user", {
            "activity.firstLogin": currentTime,
            "activity.lastLogin": currentTime,
          });
        } else if (data.empty == false) {
          firestoreData("a", user.uid, "user", {
            "activity.lastLogin": currentTime,
          });
        } else {
          console.error("data is undefined.");
        }
      });

      // Start listeners on user login (please convert this to hooks)

      // Button press counter
      firestore()
        .collection(user.uid)
        .doc("user")
        .onSnapshot((documentSnapshot) => {
          if (documentSnapshot.exists) {
            setTimesPressed(documentSnapshot.data().buttonPresses);
          } else console.log("Snapshot doesn't exist?");
        });

      // Get device list
      firestore()
        .collection(user.uid)
        .doc("devices")
        .onSnapshot((documentSnapshot) => {
          if (documentSnapshot.exists) {
            setDeviceList(documentSnapshot.data());
          } else console.log("No devices appended to user");
          // console.log(Object.keys(deviceList)[0])
          // console.log(deviceList[Object.keys(deviceList)].assignedPet)
        });

      console.log("go get it")

      // // Get pet list
      // firestore()
      //   .collection(user.uid)
      //   .doc("pets")
      //   .get()
      //   .then((data) => {
      //     const petList = data.data().petList;
      //     setPetCount(petList.length);

      //     firestoreData("a", user.uid, "user", {
      //       petCount: petCount,
      //     });

      //     // If any pets are assigned to user
      //     if (petCount) {
      //       //Initialize petList
      //       //Might be placed in a useEffect so we can change the number of pets in the application
      //       //Instead of it being refreshed every time an user logs in
      //       //Would also have to initialize new firestore snapshots
      //       //But for now leave it be.
      //       const pets = petList.map((pet, index) => ({
      //         name: pet,
      //         index: index,
      //       }));

      //       setPetsWithIndices(pets);

      //       console.log("this?")
      //       console.log(petsWithIndices)

      //       for (const {name: pet, index} of petsWithIndices) {

      //         console.log("iteration")
      //         firestore()
      //           .collection(user.uid)
      //           .doc("pets")
      //           .collection(pet.toString())
      //           .where("time", ">=", 0)
      //           .orderBy("time", "asc")
      //           .onSnapshot((querySnapshot) => {
      //             const tempFeeds = [];
      //             querySnapshot.forEach((documentSnapshot) => {
      //               tempFeeds.push({
      //                 ...documentSnapshot.data(),
      //                 id: documentSnapshot.id,
      //               });
      //             });

      //             console.log("fetched data:")
      //             console.log(tempFeeds)
      //             console.log("current feedList:")
      //             console.log(feedList)
      //             console.log("\n")

      //             if(pet.toString() in feedList){
      //               console.log("key exists")
      //               delete newObj[pet.toString()]
      //             } // If pet exists in the list
                    
                  
      //             console.log("feedList after deleting:")
      //             console.log(feedList)
      //             console.log("\n")

      //             setFeedList([{...feedList, [pet.toString()]: tempFeeds}]) // Append fetched data to list

      //             console.log("feedList after appending:")
      //             console.log(feedList)
      //             console.log("\n")

      //             // Update feed count on every list change
      //             firestore()
      //               .collection(user.uid)
      //               .doc("pets")
      //               .collection(pet.toString())
      //               .doc("settings")
      //               .update({ feedNum: tempFeeds.length });
      //           });
      //       }
      //     }
      //   });

      // PetList
      // firestore().collection(user.uid).doc('pets').collection('Rex').where('time', '>=', 0).orderBy('time', 'asc').onSnapshot(querySnapshot => {
      //   const tempPets = [];
      //   querySnapshot.forEach(documentSnapshot => {
      //     tempPets.push({
      //       ...documentSnapshot.data(),
      //       id: documentSnapshot.id,
      //     });
      //   });
      //   setFeedList(tempPets);
      // });

      // Show welcome message
      ToastAndroid.show(
        "Successfuly signed in with Google.",
        ToastAndroid.SHORT
      );
    } else {
      ToastAndroid.show("You've been signed out", ToastAndroid.SHORT);
    }
    if (initializing) setInitializing(false);
  }

  async function addToFeedList(feedInfo, petName) {
    if (feedInfo) {
      const currentTime = moment().unix();
      firestore()
        .collection(user.uid)
        .doc("pets")
        .collection(petName)
        .doc("settings")
        .get()
        .then((data) => {
          const deviceNumber = data.data().assignedDevice;

          firestore()
            .collection(user.uid)
            .doc("pets")
            .collection(petName)
            .doc(currentTime.toString())
            .set({
              amount: feedInfo,
              device: deviceNumber,
              time: currentTime,
            })
            .then(() => {
              // I can add error handling here as well, as they are bound to pop out of nowhere
              console.log("Feed added.");
            });
        });
    }
  }

  if (initializing) return null;

  if (!user) {
    return (
      <View style={styles.container}>
        <ImageBackground
          source={image}
          resizeMode="stretch"
          style={styles.image}
        >
          <GoogleSigninButton
            style={styles.googleButtonStyle}
            onPress={() =>
              onGoogleButtonPress().then(() => {
                console.log("Signed in with Google!");
              })
            }
          />
        </ImageBackground>
      </View>
    );
  }
  return (
    // <ListContext.Provider
    //   value={{
    //     deviceList,
    //     feedList,
    //     userDisplayName: user.displayName,
    //     userPhotoURL: user.photoURL,
    //   }}
    // >
    //   <MainContainer />
    // </ListContext.Provider>

    <View>
      <TextInput style={styles.textInput}
        placeholder="Feed Rex with this amount."
        onChangeText={setNewFeedInfo}
        value={newFeedInfo}
      />

      <Button title='Feed'
        onPress={() => {
          //get current feed number
          //we're not testing how much food is left here
          addToFeedList(newFeedInfo, 'Gricka').then(() => {
            console.log("Feed added.")
          })
        }} />

      <View style={styles.elementMargin}>
        <Button title='Get user info'
          onPress={() => console.log(user)}
        />
      </View>

      <View style={styles.elementMargin}>
        <Button title='Log Rex feeds'
          onPress={() => {
            firestore().collection(user.uid).doc('pets').collection('Rex').where('device', '>=', 0).get().then((data) => {
              console.log(data.docs.map(doc => doc.data()))
            })
          }}
        />
      </View>

      <View style={styles.elementMargin}>
        <Button title='Log Gricka feeds'
          onPress={() => {
            firestore().collection(user.uid).doc('pets').collection('Gricka').where('device', '>=', 0).get().then((data) => {
              console.log(data.docs.map(doc => doc.data()))
            })
          }}
        />
      </View>

      <View style={styles.elementMargin}>
        <Button
          title={"you've pressed this button " + timesPressed.toString() + " times."}
          onPress={increaseButtonCount}
        />
      </View>

      <View style={styles.elementMargin}>
        <Button title={"Reset number"}
          onPress={() => sendTimesPressed(0)}
        />
      </View>

      <View style={styles.elementMargin}>
        <Button title="Sign out"
          onPress={() => googleSignOut().then(() => console.log('Signed out!'))}
        />
      </View>
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
