#include <WiFi.h>

#include <WiFiClientSecure.h>

#include <ArduinoJson.h>

#include <HTTPClient.h>

#include <LCBUrl.h>

const char * ssid = "Desktop";
const char * password = "07123010";

String client_id = CLIENT_ID;
String client_secret = CLIENT_SECRET;

#define NO_CERTIFICATE NULL

const static char * google_GTS_Root_R1 PROGMEM = R"raw(-----BEGIN CERTIFICATE-----
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

char * deviceAuthorizationEndpoint;
char * tokenEndpoint;

StaticJsonDocument < 1024 > doc;

char * deviceCode;
char * userCode;
int expiresIn;
int interval = 0;
char * verificationUrl;

char * accessToken;

int lastTime;

void printHeaders(char ** header) {
  int count = 0;
  while (header[count] != NULL) {
    Serial.println(header[count]);
    count++;
  }
}

void setup() {
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
String sendGET(char * address, bool reportError) {

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

String sendPOST(char * address, char ** headerData, String payloadData, int * returnCode,
  const char * certificate, bool reportError) {

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
  WiFiClientSecure client;

  // Set the certificate if provided, otherwise set the connection as insecure
  if (certificate != NULL) {
    client.setCACert(certificate);
    if (reportError) Serial.println("using certificate");
  } else {
    client.setInsecure();
  }

  // Set a timeout for the connection
  client.setTimeout(3000); // 3 seconds

  // Connect to the server
  if (!client.connect(url.getAuthority().c_str(), 443)) {
    if (reportError) Serial.println("Error: Connect() resulted in a negative value");
    return String();
  }

  // Construct the POST request
  // Set the request
  String payload = String("POST / HTTP/1.1\r\n");

  if (url.getPath() != "") payload = String("POST /") + url.getPath().c_str() + " HTTP/1.1\r\n";

  payload = payload + "Host: " + url.getAuthority().c_str() + "\r\n";

  for (int i = 0; i < headerCount; i += 2) {
    payload = payload + headerData[i] + ": " + headerData[i + 1] + "\r\n";
  }

  payload = payload + "Content-Length: " + payloadData.length() + "\r\n\r\n" + payloadData;

  // Send the request
  client.print(payload);

  //ABOVE CODE TESTED - OK

  // Read http return code
  client.readStringUntil(':'); //Assuming the first line of code is "return code: [CODE]"

  String symbol = String((char) client.read()); // Get next symbol - number or space?

  String returnNumber = "";

  if (symbol.compareTo(String(' '))) {
    //space, not a number, so the next is return code
    char number = (char) client.read();
    do {
      returnNumber += number;
      number = (char) client.read();
    } while (isDigit(number));
  }

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

void types(String a) {
  Serial.println("it's a String");
}
void types(int a) {
  Serial.println("it's an int");
}
void types(char * a) {
  Serial.println("it's a char*");
}
void types(float a) {
  Serial.println("it's a float");
}
void types(bool a) {
  Serial.println("it's a bool");
}

//---------------------------------------------------------------------------------------------------------
void loop() {
  if (!deviceAuthorizationEndpoint) { //first run

    //    Serial.println("");
    //    Serial.println("Making first request");

    String response = sendGET("https://accounts.google.com/.well-known/openid-configuration", false);

    if (response.length()) { //if HTTP GET responded with content
      deserializeJson(doc, response);

      deviceAuthorizationEndpoint = (char * ) malloc((strlen(doc["device_authorization_endpoint"]) + 1) * sizeof(char)); /*+1 for '\0' character */
      tokenEndpoint = (char * ) malloc((strlen(doc["token_endpoint"]) + 1) * sizeof(char)); /*+1 for '\0' character */

      if (deviceAuthorizationEndpoint == NULL || tokenEndpoint == NULL) {
        printf("Cannot allocate bytes for deviceAuthorizationEndpoint or tokenEndpoint\n");
        exit(EXIT_FAILURE);
      }

      strcpy(deviceAuthorizationEndpoint, doc["device_authorization_endpoint"]);
      strcpy(tokenEndpoint, doc["token_endpoint"]);

      Serial.print("***URL future requests will be pointing to: ");
      Serial.print(deviceAuthorizationEndpoint);
      Serial.print(", ");
      Serial.println(tokenEndpoint);
    }
    delay(3000);
  }
  //---------------------------------------------------------------------------------------------------------
  if (!interval && deviceAuthorizationEndpoint) { //interval hasn't been fetched yet but deviceAuth address has

    //    Serial.println("");
    //    Serial.println("Making second request. ");

    DynamicJsonDocument DinDoc(JSON_OBJECT_SIZE(2));

    DinDoc["client_id"] = client_id.c_str();
    DinDoc["scope"] = "email profile";

    String payload;
    serializeJson(DinDoc, payload);

    char * header[] = {
      "Content-Type",
      "application/json",
      NULL
    };

    int returnCode;

    String response = sendPOST(deviceAuthorizationEndpoint, header, payload, & returnCode, google_GTS_Root_R1, false);

    Serial.print("return code:");
    Serial.println(returnCode);

    if (response.length()) { //if HTTP POST responded with content
      if (returnCode == 200) {

      } else {
        Serial.print("Server responded with code ");
        Serial.print(returnCode);
        Serial.println(", response body:");
        Serial.println(response);
      }
      deserializeJson(doc, response);

      deviceCode = (char * ) malloc((strlen(doc["device_code"]) + 1) * sizeof(char)); /*+1 for '\0' character */
      userCode = (char * ) malloc((strlen(doc["user_code"]) + 1) * sizeof(char)); /*+1 for '\0' character */
      verificationUrl = (char * ) malloc((strlen(doc["verification_url"]) + 1) * sizeof(char)); /*+1 for '\0' character */

      if (deviceCode == NULL || userCode == NULL || verificationUrl == NULL) {
        printf("Cannot allocate bytes for deviceCode, userCode, or verificationUrl\n");
        exit(EXIT_FAILURE);
      }

      strcpy(deviceCode, doc["device_code"]);
      strcpy(userCode, doc["user_code"]);
      strcpy(verificationUrl, doc["verification_url"]);

      expiresIn = doc["expires_in"];
      interval = doc["interval"];

      Serial.println("");
      Serial.println("//--------------------------------------------------");
      Serial.println("deviceCode: " + String(deviceCode));
      Serial.println("userCode: " + String(userCode));
      Serial.println("interval: " + String(interval));
      Serial.println("expiresIn: " + String(expiresIn));
      Serial.println("verificationUrl: " + String(verificationUrl));
      Serial.println("//--------------------------------------------------");
    }

    delay(5000);

    lastTime = millis();
  }
  //---------------------------------------------------------------------------------------------------------
  if (interval && !accessToken) { //now interval has been fetched, we can start polling for an access token
    if (millis() - lastTime > 2 * interval * 1000) { //If interval has passed (DEV 2*interval)

      //      Serial.println("");
      //      Serial.println("Making third request. ");

      DynamicJsonDocument DinDoc(JSON_OBJECT_SIZE(4));

      String deviceCodeSecond = String(deviceCode);

      DinDoc["client_id"] = client_id.c_str();
      DinDoc["client_secret"] = client_secret.c_str();
      DinDoc["device_code"] = deviceCodeSecond.c_str();
      DinDoc["grant_type"] = "urn:ietf:params:oauth:grant-type:device_code";

      String payload;
      serializeJson(DinDoc, payload);

      char * header[] = {
        "Content-Type",
        "application/json",
        "Connection",
        "close",
        NULL
      };

      int returnCode;

      String response = sendPOST(tokenEndpoint, header, payload, & returnCode, google_GTS_Root_R1, false);

      if (response.length()) {

        deserializeJson(doc, response);

        Serial.println("");
        Serial.println("//--------------------------------------------------");
        Serial.println(response);
        Serial.println("//--------------------------------------------------");
        digitalWrite(13, HIGH);
        //accessToken = "lololol";
      } else {
        Serial.println("");
        Serial.println("Payload not provided in third response");
        Serial.println("");
      }

      lastTime = millis();
    }
  }
}
