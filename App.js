import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Image, Button, ImageBackground, Vibration, ToastAndroid,
TextInput, FlatList, Pressable } from 'react-native';
import React, {useState, useEffect} from 'react'
import 'expo-dev-client';

import { GoogleSignin, GoogleSigninButton } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

import firestore from '@react-native-firebase/firestore'

GoogleSignin.configure({
  webClientId: '783455449055-3aq47aap1qhf0q77pm8gf826svlsqad5.apps.googleusercontent.com'
});

async function onGoogleButtonPress() {
  // Check if your device supports Google Play
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
  // Get the users ID token
  const { idToken } = await GoogleSignin.signIn();
  // Create a Google credential with the token
  const googleCredential = auth.GoogleAuthProvider.credential(idToken);

  const user_sign_in = auth().signInWithCredential(googleCredential);
  user_sign_in.then((user) => {
    console.log(user);
  })
  .catch((error) =>{
    console.log(error);
  })
}

async function googleSignOut() {
  ToastAndroid.show("Signing out...", ToastAndroid.SHORT);
  try{
    //revokeAccess removes automatic account selection on next login (any many more things)
    await GoogleSignin.revokeAccess();
    await auth().signOut();
  } catch(error){
    console.error(error);
  }
}

async function firestoreData(action, collection_id, ...props){
  try {
    if(action == 'r'){
      if(props.length){
        const temporary_var = await firestore().collection(collection_id).doc(props[0]).get();
        return temporary_var;
      }else{
        const temporary_var = await firestore().collection(collection_id).get();
        return temporary_var;
      }
    }
    else if(action == 'w'){
      if(props.length == 2){
        await firestore().collection(collection_id).doc(props[0]).set(props[1])
      }else{
        await firestore().collection(collection_id).add(props[0])
      }
    }
    else if(action == 'a'){
      if(props.length != 2) throw new Error('insufficient arguments in append')
      await firestore().collection(collection_id).doc(props[0]).update(props[1])
    }else{
      throw new Error('inappropriate arguments led to default')
    }
  }
  catch(error){
    console.error('Error writing new message to Firebase Database', error);
  }
}

import image from './assets/Cute-cat.jpg'
const vibrationPattern = [0,30,110,30];

export default function App() {

  const [ initializing, setInitializing ] = useState(true);
  const [ user, setUser ] = useState();

  const [ enteredMessageText, setEnteredMessageText ] = useState('');
  const [ timesPressed, setTimesPressed ] = useState(0);

  const [ newFeedEvent, setNewFeedEvent ] = useState('');
  const [ feedList, setFeedList ] = useState([]);
  
  //Delete feed item with parsed ID from the list
  function deleteFeedEvent(id){
    setFeedList((currentFeedList) => {
      return currentFeedList.filter((feed) => feed.id !== id);
    });
  }

  //Add a feed item to the list. TODO is update Firebase list, get the list back, filter the list,
  //and assign the ID of the list to the ID of local list
  function addToFeedList(){
    setFeedList((currentFeedList) => [
      ...currentFeedList,
      {text: newFeedEvent, id: Math.random().toString()}
    ]);
  }


  function messageInputHandler(enteredText){
    setEnteredMessageText(enteredText)
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
    if (Boolean(enteredMessageText) && Boolean(user)) { //Perform a check of user login even though they can only access the send button when logged in. User can probaby send the message somehow when not logged in through invoking button functions?
      saveMessage(enteredMessageText).then(() => {
        // Clear message text field and re-enable the SEND button.
        ToastAndroid.show("Message sent", ToastAndroid.SHORT);
        setEnteredMessageText('');
      });
    }
  }

  //send a button count *update* to Firebase
  function increaseButtonCount() {
    // Create a reference to the post
    const postReference = firestore().collection(user.uid).doc(`user_info`);

    return firestore().runTransaction(async transaction => {
      // Get post data first
      const postSnapshot = await transaction.get(postReference);
  
      if (!postSnapshot.exists) {
        throw 'Post does not exist!';
      }
  
      transaction.update(postReference, {
        buttonPresses: postSnapshot.data().buttonPresses + 1,
      });
    });
  }

 async function sendTimesPressed(number){
    await firestoreData('a', user.uid, 'user_info', {buttonPresses: number})
  }

  //Subscribe on user events
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChangedLocal);
    return subscriber; // unsubscribe on unmount
  }, []);

  //On User state change
  function onAuthStateChangedLocal(user) {
    setUser(user);

    Vibration.vibrate(vibrationPattern);
    const currentTime = Math.floor(Date.now()/1000)
    if(user){
      //Initialize or update user data
      firestoreData('r', user.uid).then((data) => {
        if(data.empty){
          firestoreData('w', user.uid, 'user_info', {
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            petCount: 0,
          })
          firestoreData('a', user.uid, 'user_info', {
            'activity.firstLogin': currentTime,
            'activity.lastLogin': currentTime
          })
        } else if(data.empty == false) {
          firestoreData('a', user.uid, 'user_info', {
            'activity.lastLogin': currentTime
          });
        } else { console.error('data is undefined.') }
      })
      //Start listeners on login
      //Button press counter
      firestore().collection(user.uid).doc('user_info').onSnapshot(documentSnapshot => {
        setTimesPressed(documentSnapshot.data().buttonPresses)
      });
      //feedList
      //CODE
      //PetList
      //CODE
      //Show message
      ToastAndroid.show("Successfuly signed in with Google.", ToastAndroid.SHORT);
    }else{
      ToastAndroid.show("You've been signed out", ToastAndroid.SHORT);
    }
    if (initializing) setInitializing(false);
  }

  if (initializing) return null;

  if(!user){
    return (
      <View style={styles.container}>
        <ImageBackground source={image} 
          resizeMode="stretch"
          style={styles.image}>
            <GoogleSigninButton
              style = {styles.googleButtonStyle}
              onPress = {() => onGoogleButtonPress().then(() => {
                console.log('Signed in with Google!');
              })}
            />
        </ImageBackground>
      </View>
    );
  }
  return(
      <View style={styles.postLoginView}>
        <Image source={{uri:user.photoURL}}
            style={{width:75, 
                    height:75, 
                    borderRadius:50,
                    margin:10}}
            />
        <Text style={styles.elementMargin}>
          <Text>Welcome, </Text>
          <Text style={{fontWeight: 'bold'}}>{user.displayName}</Text>
        </Text>

        <TextInput style={styles.textInput} 
          placeholder="Write Your message here." 
          onChangeText={setNewFeedEvent} 
          value={newFeedEvent}
        />

        <Button title = 'Send'
          onPress={addToFeedList}/>

        <View style={styles.elementMargin}>
          <Button title = 'Get user info'
            onPress={() => console.log(user)}
          />
        </View>
        
        <View style={styles.elementMargin}>
          <Button
            title = {"you've pressed this button " + timesPressed.toString() + " times."}
            onPress={increaseButtonCount}
          />
        </View>
        
        <View style={styles.elementMargin}>
          <Button title = {"Reset number"}
            onPress={() => sendTimesPressed(0)}
          />
        </View>
        
        <View style={styles.elementMargin}>
          <Button title = "Sign out"
            onPress={() => googleSignOut().then(() => console.log('Signed out!'))}
          />
        </View>

        <View style={styles.feedListContainer}>
          <FlatList data={feedList} renderItem={(feedData) => {
            return(
              <View style={styles.feedItem}>
                <Pressable
                  android_ripple={{color: '#210644', borderless: true}}
                  onPress={deleteFeedEvent.bind(this, feedData.item.id)}
                >
                  <View>
                    <Text style={styles.feedText}> 
                      {feedData.item.text}
                    </Text>
                  </View>
                </Pressable>
              </View>
            )
          }}
          keyExtractor={(item, index) => {
            return item.id;
          }}
          />
        </View>
      </View>
  )
}

const styles = StyleSheet.create({
  elementMargin: {
    margin: 10,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#cccccc',
    width: '100%',
    margin: 10,
    padding: 8,
  },
  postLoginView: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    resizeMode: "cover",
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonStyle:{
    width: '65%', 
    height: 65, 
    marginTop: 600,
  },
  feedListContainer:{
    flex: 5,
  },
  feedItem:{
    margin: 8,
    borderRadius: 6,
    backgroundColor: '#5e08cc',
  },
  feedText:{
    color: 'white',
    padding: 8,
  }
});
