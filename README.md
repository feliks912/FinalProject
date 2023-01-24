# Smart cat feeder - FER - Project E - Group 17 - 2022/2023

***Note this project and tutorial is not secret key safe - it does not utilize environment variables and application supported features for storing Google's access keys. For testing purposes install and run SmartFeederPreview.apk, it uses our database***

## Android build guide

This guide assumes user has a github account, has git installed on hit local machine and has connected their profile using
```
git config --global user.name "Your Name"
git config --global user.email "youremail@yourdomain.com"
```

1) Create a https://expo.dev/ account
2) run the following

```
git clone https://github.com/feliks912/FinalProject/
npx create-expo-app
#select a name

cp .\your_app_name\app.json .\FinalProject\app.json

cd FinalProject
npm install
```
```
eas build --profile preview --platform android

# if asked, log in to your Expo profile
# choose Yes when asked for automatic project creation
# select (and remember) your Android application id i.e. com.your_expo_username.testApplication
# select Yes if asked to continue with unsuported Expo SDK version
# select Yes when asked for a new Android Keystore
# wait for build to start, then cancel using ctrl+Create
```
```
eas credentials

# select Android
# select Preview
# note down application identifier (com.your_expo_username.application_id) and SHA1 fingerprint
# close credentials with ctrl+Cloud
```

3) Go to https://www.firebase.google.com -> Log in -> Go to console -> Add project -> (optional) disable additional features
4) once project is created, create a new android application
5) copy the application ID and SHA1 fingerprints -> Register App
7) download google-services.json file
8) continue to console
9) left panel -> Build -> Authentication -> Get Started
10) select Google under sign in method, enable it, select your e-mail in the second field, confirm
11) left panel -> Build -> Firestore database -> Create Database
12) select production mode -> Next -> select location closest to your users -> Enable
13) select '+ Start collection'
14) type "catFeeder_v1" under collection ID -> Next (no quotations)
15) type "userData" under document ID -> Save (no quotations)
16) select Rules under 'Cloud Firestore' title and paste the following

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated clients to create {userId} collection
    match /catFeeder_v1/userData/{userId} {
      allow create: if request.auth.uid == userId;
    }
    // Allow users to read and write to their collection
    match /catFeeder_v1/userData/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;		
    }
    match /test/{document=**} {
    	allow read, write: if true;
    }
  }
}
```

17) copy the downloaded google-services.json file to root of FinalProject folder
18) open it and copy the string after "client_id": right above "client_type": 3 
19) create a new file with a name 'AuthKeys.js' in root folder
20) paste the following code

```
import { GoogleSignin } from "@react-native-google-signin/google-signin";

const webClientId = "CLIENT_ID"

export default function initiateGoogleKeys(){
  return GoogleSignin.configure({
  webClientId: webClientId
})};
```

21) replace CLIENT_ID with your client id you just copied
22) open App.json, under line "slug..." paste the following

```
"plugins": [
      "@react-native-google-signin/google-signin",
      "@react-native-firebase/app"
    ],
```

under "android" paste 

```
"googleServicesFile": "./google-services.json",
```

so your file looks something as the following

```
{
  "expo": {
    "name": "ProjectName",
    "slug": "ProjectName",
	"plugins": [
      "@react-native-google-signin/google-signin",
      "@react-native-firebase/app"
    ],
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "updates": {
      "fallbackToCacheTimeout": 0
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true
    },
    "android": {
	  "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#FFFFFF"
      },
      "package": "com.your_expo_username.application_id"
    },
    "web": {
      "favicon": "./assets/favicon.png"
    },
    "extra": {
      "eas": {
        "projectId": "your_project_id"
      }
    }
  }
}

```

23) save the file and run this in the root folder
```
eas build --platform android --profile preview
```

let it automatically select everything and it should start building

24) after build is complete go to https://expo.dev/ and download the .apk of your last build

you can now install the .apk on your client device.

25) add google-services.json and AuthKeys.js to .gitignore - EAS Build only uploads the files tracked by git so, since we don't use EAS supported secrets https://docs.expo.dev/build-reference/variables/#accessing-secrets-in-eas-build we must exclude them during build


## ESP32 build guide
The source codes for ESP are stored in ESP32/"Glavni Program" and include .ino files. 

1) go to https://console.cloud.google.com/apis/credentials and log in with the same account used for firebase
2) click on "+ create credentials" -> Oauth client ID
3) under "application type" select "TVs and Limited Input Devices"
4) name it and create it, and store the client id and secret id
5) Install ESP32 in your Arduino environment with the following tutorial: https://randomnerdtutorials.com/installing-esp32-arduino-ide-2-0/ (older versions are supported)
6) Install all necessary libraries listed in the include header
7) copy your client ID under CLIENT_ID and secret ID under SECRET_ID
8) Under tools -> board select ESP32 Dev Module
9) Select 512000 under upload speed and enable PSRAM
10) Connect ESP32 with USB
11) Build and upload the sketch
