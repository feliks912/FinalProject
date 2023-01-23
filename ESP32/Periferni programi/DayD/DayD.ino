#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <LCBUrl.h>

const char* ssid = "Desktop";
const char* password = "07123010";

String client_id = "783455449055-fucqpv9hknij27am582og52sc1f50bit.apps.googleusercontent.com";
String client_secret = "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";

#define NO_CERTIFICATE NULL

const static char* google_GTS_Root_R1 PROGMEM = R"raw(-----BEGIN CERTIFICATE-----
MIIFVzCCAz+gAwIBAgINAgPlk28xsBNJiGuiFzANBgkqhkiG9w0BAQwFADBHMQsw
CQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExMQzEU
MBIGA1UEAxMLR1RTIFJvb3QgUjEwHhcNMTYwNjIyMDAwMDAwWhcNMzYwNjIyMDAw
MDAwWjBHMQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZp
Y2VzIExMQzEUMBIGA1UEAxMLR1RTIFJvb3QgUjEwggIiMA0GCSqGSIb3DQEBAQUA
A4ICDwAwggIKAoICAQC2EQKLHuOhd5s73L+UPreVp0A8of2C+X0yBoJx9vaMf/vo
27xqLpeXo4xL+Sv2sfnOhB2x+cWX3u+58qPpvBKJXqeqUqv4IyfLpLGcY9vXmX7w 
Cl7raKb0xlpHDU0QM+NOsROjyBhsS+z8CZDfnWQpJSMHobTSPS5g4M/SCYe7zUjw
TcLCeoiKu7rPWRnWr4+wB7CeMfGCwcDfLqZtbBkOtdh+JhpFAz2weaSUKK0Pfybl
qAj+lug8aJRT7oM6iCsVlgmy4HqMLnXWnOunVmSPlk9orj2XwoSPwLxAwAtcvfaH
szVsrBhQf4TgTM2S0yDpM7xSma8ytSmzJSq0SPly4cpk9+aCEI3oncKKiPo4Zor8
Y/kB+Xj9e1x3+naH+uzfsQ55lVe0vSbv1gHR6xYKu44LtcXFilWr06zqkUspzBmk
MiVOKvFlRNACzqrOSbTqn3yDsEB750Orp2yjj32JgfpMpf/VjsPOS+C12LOORc92
wO1AK/1TD7Cn1TsNsYqiA94xrcx36m97PtbfkSIS5r762DL8EGMUUXLeXdYWk70p
aDPvOmbsB4om3xPXV2V4J95eSRQAogB/mqghtqmxlbCluQ0WEdrHbEg8QOB+DVrN
VjzRlwW5y0vtOUucxD/SVRNuJLDWcfr0wbrM7Rv1/oFB2ACYPTrIrnqYNxgFlQID
AQABo0IwQDAOBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E
FgQU5K8rJnEaK0gnhS9SZizv8IkTcT4wDQYJKoZIhvcNAQEMBQADggIBAJ+qQibb
C5u+/x6Wki4+omVKapi6Ist9wTrYggoGxval3sBOh2Z5ofmmWJyq+bXmYOfg6LEe
QkEzCzc9zolwFcq1JKjPa7XSQCGYzyI0zzvFIoTgxQ6KfF2I5DUkzps+GlQebtuy
h6f88/qBVRRiClmpIgUxPoLW7ttXNLwzldMXG+gnoot7TiYaelpkttGsN/H9oPM4
7HLwEXWdyzRSjeZ2axfG34arJ45JK3VmgRAhpuo+9K4l/3wV3s6MJT/KYnAK9y8J
ZgfIPxz88NtFMN9iiMG1D53Dn0reWVlHxYciNuaCp+0KueIHoI17eko8cdLiA6Ef
MgfdG+RCzgwARWGAtQsgWSl4vflVy2PFPEz0tv/bal8xa5meLMFrUKTX5hgUvYU/
Z6tGn6D/Qqc6f1zLXbBwHSs09dR2CQzreExZBfMzQsNhFRAbd03OIozUhfJFfbdT
6u9AWpQKXCBfTkBdYiJ23//OYb2MI3jSNwLgjt7RETeJ9r/tSQdirpLsQBqvFAnZ
0E6yove+7u7Y/9waLd64NnHi/Hm3lCXRSHNboTXns5lndcEZOitHTtNCjv0xyBZm
2tIMPNuzjsmhDYAPexZ3FL//2wmUspO8IFgV6dtxQ/PeEMMA3KgqlbbC1j+Qa3bb
bP6MvPJwNQzcmRk13NfIRmPVNnGuV/u3gm3c
-----END CERTIFICATE-----)raw";

char* deviceAuthorizationEndpoint;
char* tokenEndpoint;

StaticJsonDocument<1024> doc;

char* deviceCode;
char* userCode;
int expiresIn;
int interval = 0;
char* verificationUrl;

char* accessToken;

String mac;

int lastTime;

StaticJsonDocument<32> filter;

void printHeaders(char **header) {
  int count = 0;
  while (header[count] != NULL) {
    Serial.println(header[count]);
    count++;
  }
}

void setup() {
  mac = WiFi.macAddress();

  //filter["fields"][String(WiFi.macAddress())] = true;

  Serial.println(WiFi.macAddress());
  Serial.println(String(WiFi.macAddress()));

  filter["fields"]["0B:A4:DF:8F:80:EA"] = true;
  
  pinMode(13, OUTPUT);
  // initialize serial port
  Serial.begin(115200);
  // wait for serial port to connect
  while (!Serial);

  // configure WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  // print WiFi IP address
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());

  delay(1000);

  lastTime = millis();
}
//---------------------------------------------------------------------------------------------------------
String sendGET(char* address, bool reportError) {

  HTTPClient http;

  http.begin(address);

  int httpResponseCode = http.GET();

  if (httpResponseCode > 0) {
    if (reportError) Serial.printf("[HTTP] GET... code: %d\n", httpResponseCode);
    String response = http.getString();
    http.end();
    return response;
  }

  if (reportError) Serial.println("[HTTP] GET... failed, error: " + http.errorToString(httpResponseCode));
  http.end();
  return String(); //return empty string
}

String sendRequest(char* type, char* address, char **headerData, String payloadData, int *returnCode, const char* certificate, bool reportError) {

  // Validate input
  if (address == NULL) {
    if (reportError) Serial.println("Error: address cannot be null.");
    return String();
  }

  if (headerData == NULL) {
    if (reportError) Serial.println("Error: headerData cannot be null.");
    return String();
  }

  // Parse the address using the LCBUrl object
  LCBUrl url;

  if (!url.setUrl(address)) {
    if (reportError) Serial.println("Error: Failure in setUrl()");
    return String();
  }

  // Validate header data
  int headerCount = 0;
  while (headerData[headerCount] != NULL) {
    headerCount++;
  }

  if (headerCount % 2 != 0) {
    if (reportError) Serial.println("Error: Uneven number of strings in header argument, argument must have even number of strings");
    return String();
  }

  // Create a WiFiClientSecure object
  WiFiClientSecure  client;

  // Set the certificate if provided, otherwise set the connection as insecure
  if (certificate != NULL) {
    client.setCACert(certificate);
    if (reportError) Serial.println("using certificate");
  } else {
    client.setInsecure();
  }

  // Set a timeout for the connection
  client.setTimeout(3000);  // 3 seconds

  // Connect to the server
  if (!client.connect(url.getAuthority().c_str(), 443)) {
    if (reportError) Serial.println("Error: Connect() resulted in a negative value");
    return String();
  }

  // Construct the POST request
  // Set the request
  String payload = String(type) + " / HTTP/1.1\r\n";

  if (url.getPath() != "") payload = String("POST /") + url.getPath().c_str() + " HTTP/1.1\r\n";

  payload = payload + "Host: " + url.getAuthority().c_str() + "\r\n";

  for (int i = 0; i < headerCount; i += 2) {
    payload = payload + headerData[i] + ": " + headerData[i + 1] + "\r\n";
  }

  payload = payload + "Content-Length: " + payloadData.length() + "\r\n\r\n" + payloadData;


  // Send the request
  client.print(payload);

  // Read http return code
  client.readStringUntil(':'); //Assuming the first line of code is "return code: [CODE]"

  String symbol = String((char) client.read()); // Get next symbol - number or space?

  String returnNumber = "";

  if (!symbol.compareTo(String(' '))) { //Not a space but a number
    returnNumber += symbol;
  }

  //Following code works because there are no single numbered return codes
  char number = (char) client.read();
  do {
    returnNumber += number;
    number = (char) client.read();
  } while (isDigit(number));

  * returnCode = strtol(returnNumber.c_str(), NULL, 10); //We read until space? How do we know they print space after return code?

  // Get rid of the header payload, reads until there is a double new line
  String line = "";
  while (client.connected()) {
    line = client.readStringUntil('\n');
    if (line == "\r") {
      break;
    }
  }

  String nextLine = client.readStringUntil('\n');

  if (reportError) {
    Serial.print("nextLine:");
    Serial.println(nextLine);
  }

  String responseBody = "";

  if (nextLine.compareTo(String('{\n')) || nextLine.compareTo(String('{ \n'))) { //compareTo returns 0 for match, so here we assume we got numbers but the issue might be us comparing it to \n instead of \r\n

    //Server response includes chunked encoding
    Serial.println("response is chunked.");

    int dataRemaining = strtol(nextLine.c_str(), NULL, 16); //Get length of body response
    Serial.print("dataRemaining int:");
    Serial.println(dataRemaining);

    while (dataRemaining && client.available()) {
      int c = client.read(); //Read character by character
      if (c == -1) {
        if (reportError) Serial.println("client.read() returned -1, body length is not equal to that defined by the server.");
        break;
      }
      responseBody += (char) c;
      dataRemaining--;
    }
    Serial.println(responseBody);
  } else {
    Serial.println("no chunks.");
    responseBody = client.readString();
    Serial.println(responseBody);
  }

  // Close connection
  client.stop();

  return responseBody;
}

void loop() {


    DynamicJsonDocument DinDoc(JSON_OBJECT_SIZE(1));

    DinDoc["idtoken"] = "123123123";

    String payload;
    serializeJson(DinDoc, payload);

    char *header[] = {"Content-Type", "application/json",
                      NULL
                     };

    int returnCode;

    String response = sendRequest("POST", "https://us-central1-cat-d-v2.cloudfunctions.net/getIdToken", header, payload, &returnCode, /*google_GTS_Root_R1*/ NULL, false);

    Serial.print("return code:");
    Serial.println(returnCode);

    Serial.println(response);

//    JsonObject objectFields = doc["fields"]["B2:AA:43:82:B5:19"]["mapValue"].createNestedObject("fields");
//    objectFields["servoDegree"]["integerValue"] = 999;
//    objectFields["testValue"]["integerValue"] = 298374529;
//    objectFields["mac"]["stringValue"] = "B2:AA:43:82:B5:19";
//  
//    String payload;
//    serializeJson(doc, payload);
//
//    
      
    
      
//    String response = sendPOST("https://us-central1-cat-d-v2.cloudfunctions.net/getIdToken", false);
//
//    DeserializationError error = deserializeJson(doc, response, DeserializationOption::Filter(filter));
//
//    if (error) {
//      Serial.print("deserializeJson() failed: ");
//      Serial.println(error.c_str());
//      return;
//    }
//    
//    JsonObject responseDoc = doc["fields"]["B2:AA:43:82:B5:19"]["mapValue"]["fields"];
//    
//    const char* testValue = responseDoc["testValue"]["integerValue"];
//    const char* servoDegree = responseDoc["servoDegree"]["integerValue"];
//    const char* deviceMAC = responseDoc["mac"]["stringValue"];
//    
//    Serial.println(testValue);
//    Serial.println(servoDegree);
//    Serial.println(deviceMAC);

//    DeserializationError error = deserializeJson(DinDoc, payload);
//
//    if (error) {
//      Serial.print("deserializeJson() failed: ");
//      Serial.println(error.c_str());
//      return;
//    }
//
//    String buffer = DinDoc["fields"][0];
//
//    Serial.println(buffer);


//
//    

//    String payload;
//
//    StaticJsonDocument<256> doc;
//
//    JsonObject fields_2A_2F_D0_AE_9F_54_mapValue_fields = doc["fields"]["2A:2F:D0:AE:9F:54"]["mapValue"].createNestedObject("fields");
//    fields_2A_2F_D0_AE_9F_54_mapValue_fields["integer"]["integerValue"] = "123";
//    fields_2A_2F_D0_AE_9F_54_mapValue_fields["mac"]["stringValue"] = "2A:2F:D0:AE:9F:54";
//    
//    serializeJson(doc, payload);
//
////    DynamicJsonDocument DinDoc(JSON_OBJECT_SIZE(1));
////    
////    DinDoc["fields"][WiFi.macAddress()]["mapValue"]["fields"]["integer"] = 312312321;
////
////    String payload;
////    serializeJson(DinDoc, payload);
//
//    DeserializationError error = deserializeJson(doc, payload);
//
//    if (error) {
//      Serial.print("deserializeJson() failed: ");
//      Serial.println(error.c_str());
//      return;
//    }
//
//    
//const char* fields_2A_2F_D0_AE_9F_54_mapValue_fields_integer_integerValue = doc["fields"]["2A:2F:D0:AE:9F:54"]["mapValue"]["fields"]["integer"]["integerValue"];
//
//const char* fields_2A_2F_D0_AE_9F_54_mapValue_fields_mac_stringValue = doc["fields"]["2A:2F:D0:AE:9F:54"]["mapValue"]["fields"]["mac"]["stringValue"];
//
//    Serial.println(fields_2A_2F_D0_AE_9F_54_mapValue_fields_integer_integerValue);
//    Serial.println(fields_2A_2F_D0_AE_9F_54_mapValue_fields_mac_stringValue);
//
//    char *header[] = {"Content-Type", "application/json",
//                      NULL
//                     };
//
//    int returnCode;
//    
//    String response = sendRequest("https://firestore.googleapis.com/v1beta1/projects/cat-d-16085/databases/(default)/documents/", header, payload, &returnCode, NULL, false);
//
//    Serial.println(returnCode);
//    Serial.println(response);






      
//    DeserializationError error = deserializeJson(doc, response);
//    
//    if (error) {
//      Serial.print("deserializeJson() failed: ");
//      Serial.println(error.c_str());
//      return;
//    }
//
//    const char* returnTime = doc["cateTime"];
//
//    if(!returnTime) Serial.println("Registers as false.");
//
//    Serial.println(returnTime);
    
    delay(10000);
}
