
/**
 * Created by K. Suwatchai (Mobizt)
 *
 * Email: k_suwatchai@hotmail.com
 *
 * Github: https://github.com/mobizt/Firebase-ESP-Client
 *
 * Copyright (c) 2022 mobizt
 *
 */

/* This example shows how to authenticate using the OAuth2.0 access token generated from other app. */

#if defined(ESP32)
#include <WiFi.h>
#include <FirebaseESP32.h>
#elif defined(ESP8266)
#include <ESP8266WiFi.h>
#include <FirebaseESP8266.h>
#endif

// Provide the token generation process info.
#include <addons/TokenHelper.h>

// Provide the RTDB payload printing info and other helper functions.
#include <addons/RTDBHelper.h>

/* 1. Define the WiFi credentials */
#define WIFI_SSID "Desktop"
#define WIFI_PASSWORD "07123010"

/* 2. If work with RTDB, define the RTDB URL */
#define DATABASE_URL "URL" //<databaseName>.firebaseio.com or <databaseName>.<region>.firebasedatabase.app

/* 3. Define the Firebase Data object */
FirebaseData fbdo;

/* 4. Define the FirebaseAuth data for authentication data */
FirebaseAuth auth;

/* 5. Define the FirebaseConfig data for config data */
FirebaseConfig config;

unsigned long dataMillis = 0;
int count = 0;

String accessToken = "ya29.a0AX9GBdVAgrIl48PylL3p-uyNITc4E_ltjI5P4TzTZQlZRc-lm214u4R04ps9hehEtW4Syplfp_sSiZtW4HINPH8cvIq2E4sucgu25veFebvwZuU99bCW6vxNwsNpQHIeYRPhCZu9QQNMd5gLj_OPT3LgPCgpaCgYKAasSARMSFQHUCsbC2QGWIQqTi3GKy5tRaU2BRg0163";
String refreshToken = "1//09khqoRCtlksNCgYIARAAGAkSNwF-L9IrEoAY8op39Nv3kuqdVGoLfQquG0k5mOiKBc6NsMEJZxFaKz39Cu_feeWToBKJabHVA3M";
String client_id = "783455449055-fucqpv9hknij27am582og52sc1f50bit.apps.googleusercontent.com";
String client_secret = "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";

void setup()
{

    Serial.begin(115200);

    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
    Serial.print("Connecting to Wi-Fi");
    while (WiFi.status() != WL_CONNECTED)
    {
        Serial.print(".");
        delay(300);
    }
    Serial.println();
    Serial.print("Connected with IP: ");
    Serial.println(WiFi.localIP());
    Serial.println();

    Serial.printf("Firebase Client v%s\n\n", FIREBASE_CLIENT_VERSION);

    /* Assign the RTDB URL */
    //config.database_url = DATABASE_URL;

    Serial.println("after_URL");

    Firebase.reconnectWiFi(true);

    Serial.println("after_reconnectWiFi");

    /* Assign the callback function for the long running token generation task */
    config.token_status_callback = tokenStatusCallback; // see addons/TokenHelper.h

    // To refresh the token 5 minutes before expired
    config.signer.preRefreshSeconds = 5 * 60;

    Serial.println("after_configs");

    /* Set access token */
    // The access token obtained from other apps using OAuth2.0 authentication.

    // The APIs scopes that cover all library applications should include the following 
    // https://www.googleapis.com/auth/devstorage.full_control
    // https://www.googleapis.com/auth/datastore
    // https://www.googleapis.com/auth/userinfo.email
    // https://www.googleapis.com/auth/firebase.database
    // https://www.googleapis.com/auth/cloud-platform
    // https://www.googleapis.com/auth/iam

    // Refresh token, Client ID and Client Secret are required for OAuth2.0 token refreshing.
    // The Client ID and Client Secret can be taken from https://console.developers.google.com/apis/credentials
    
    // If Refresh token was not assigned or empty string, the id token will not refresh when it expired.
    Firebase.setAccessToken(&config, accessToken, 2000, refreshToken, client_id, client_secret);
    
    Serial.println("after_setAccessToken");

    Firebase.begin(&config, &auth);

    Serial.println("after_begin");
}

void loop()
{

    Serial.println("in loop");

    if (millis() - dataMillis > 5000 && Firebase.ready())
    {
      Serial.println("in if");
        dataMillis = millis();
        Serial.printf("Set int... %s\n", Firebase.setInt(fbdo, "/test/int", count++) ? "ok" : fbdo.errorReason().c_str());
        Serial.println("after print");
    }
}
