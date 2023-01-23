#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>
#include <LCBUrl.h>

const char* ssid = "Desktop";
const char* password = "07123010";

String client_id = CLIENT_ID;
String client_secret = CLIENT_SECRET;

const static char* stripeCert PROGMEM = R"raw(-----BEGIN CERTIFICATE-----
MIIDQTCCAimgAwIBAgITBmyfz5m/jAo54vB4ikPmljZbyjANBgkqhkiG9w0BAQsF
ADA5MQswCQYDVQQGEwJVUzEPMA0GA1UEChMGQW1hem9uMRkwFwYDVQQDExBBbWF6
b24gUm9vdCBDQSAxMB4XDTE1MDUyNjAwMDAwMFoXDTM4MDExNzAwMDAwMFowOTEL
MAkGA1UEBhMCVVMxDzANBgNVBAoTBkFtYXpvbjEZMBcGA1UEAxMQQW1hem9uIFJv
b3QgQ0EgMTCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALJ4gHHKeNXj
ca9HgFB0fW7Y14h29Jlo91ghYPl0hAEvrAIthtOgQ3pOsqTQNroBvo3bSMgHFzZM
9O6II8c+6zf1tRn4SWiw3te5djgdYZ6k/oI2peVKVuRF4fn9tBb6dNqcmzU5L/qw
IFAGbHrQgLKm+a/sRxmPUDgH3KKHOVj4utWp+UhnMJbulHheb4mjUcAwhmahRWa6
VOujw5H5SNz/0egwLX0tdHA114gk957EWW67c4cX8jJGKLhD+rcdqsq08p8kDi1L
93FcXmn/6pUCyziKrlA4b9v7LWIbxcceVOF34GfID5yHI9Y/QCB/IIDEgEw+OyQm
jgSubJrIqg0CAwEAAaNCMEAwDwYDVR0TAQH/BAUwAwEB/zAOBgNVHQ8BAf8EBAMC
AYYwHQYDVR0OBBYEFIQYzIU07LwMlJQuCFmcx7IQTgoIMA0GCSqGSIb3DQEBCwUA
A4IBAQCY8jdaQZChGsV2USggNiMOruYou6r4lK5IpDB/G/wkjUu0yKGX9rbxenDI
U5PMCCjjmCXPI6T53iHTfIUJrU6adTrCC2qJeHZERxhlbI1Bjjt/msv0tadQ1wUs
N+gDS63pYaACbvXy8MWy7Vu33PqUXHeeE6V/Uq2V8viTO96LXFvKWlJbYK8U90vv
o/ufQJVtMVT8QtPHRh8jrdkPSHCa2XV4cdFyQzR1bldZwgJcJmApzyMZFo6IQ6XU
5MsI+yMRQ+hDKXJioaldXgjUkK642M4UwtBV8ob2xJNDd2ZhwLnoQdeXeGADbkpy
rqXRfboQnoZsG4q5WTP468SQvvG5
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

int lastTime;

void setup() {
  pinMode(13, OUTPUT);
  // initialize serial port
  Serial.begin(115200);
  // wait for serial port to connect
  while(!Serial);

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
}

const int httpsPort = 443;

String sendPOST(char* address, char **headerData, String payloadData, const char *certificate, bool reportError){
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

  Serial.println(url.getAuthority().c_str());

  // Validate header data
  int headerCount = 0;
  while (headerData[headerCount] != NULL) {
    headerCount++;
  }
  
  if (headerCount % 2 != 0) {
    if (reportError) Serial.println("Error: Uneven number of strings in header argument, argument must have even number of strings");
    return String();
  }
  
  WiFiClientSecure client;

  // Set th
  client.setCACert(stripeCert);

  Serial.println("Certificate set");
  
  if (!client.connect(url.getAuthority().c_str(), 443)) {
    Serial.println("Connection failed!");
    return String();
  }


  // Set the request
  String payload = String("POST / HTTP/1.1\r\n");
  
  if (url.getPath() != "") payload = String("POST /") + url.getPath().c_str() + " HTTP/1.1\r\n";
  
  payload = payload + "Host: " + url.getAuthority().c_str() + "\r\n";
  
  for (int i = 0; i < headerCount; i += 2) {
    payload = payload + headerData[i] + ": " + headerData[i+1] + "\r\n";
  }
  
  payload = payload + "Content-Length: " + payloadData.length() + "\r\n\r\n" + payloadData;          


  // Send the request
  client.print(payload);

  // Read response meta information
  client.readStringUntil(' ');
  Serial.println(strtol(client.readStringUntil(' ').c_str(), NULL, 10));
  
  String line = "";
  while (client.connected()) {
    line = client.readStringUntil('\n');
    //Serial.println(line);
    if (line == "\r") {
      break;
    }
  }

  // Read the response payload
  String response = client.readString();
  Serial.println(response);

  client.stop();

  return response;
}

//---------------------------------------------------------------------------------------------------------
void loop() {

  Serial.println("");
  Serial.print("Making request. ");

  DynamicJsonDocument DinDoc(JSON_OBJECT_SIZE(2));
  
  DinDoc["client_id"] = client_id.c_str();
  DinDoc["scope"] = "email profile";
  
  String payload;
  serializeJson(DinDoc, payload);

  deviceAuthorizationEndpoint = "https://eoo4canyu0yx4h.m.pipedream.net";
  payload = "{\"name\": \"Feliks\", \"surname\": \"Feliks\"}";
  char *header[] = {"Content-Type", "application/json", NULL};

  String response = sendPOST(deviceAuthorizationEndpoint, header, payload, stripeCert, true);

  Serial.println("out");

  while(true){}
}
