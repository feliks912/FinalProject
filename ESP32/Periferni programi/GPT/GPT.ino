#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <ArduinoJson.h>
#include <HTTPClient.h>

const char* ssid = "Desktop";
const char* password = "07123010";

String client_id = CLIENT_ID;
String client_secret = CLIENT_SECRET;

const static char* googleCert PROGMEM = R"raw(-----BEGIN CERTIFICATE-----
MIIFVzCCAz+gAwIBAgINAgPlrsWNBCUaqxElqjANBgkqhkiG9w0BAQwFADBHMQsw
CQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZpY2VzIExMQzEU
MBIGA1UEAxMLR1RTIFJvb3QgUjIwHhcNMTYwNjIyMDAwMDAwWhcNMzYwNjIyMDAw
MDAwWjBHMQswCQYDVQQGEwJVUzEiMCAGA1UEChMZR29vZ2xlIFRydXN0IFNlcnZp
Y2VzIExMQzEUMBIGA1UEAxMLR1RTIFJvb3QgUjIwggIiMA0GCSqGSIb3DQEBAQUA
A4ICDwAwggIKAoICAQDO3v2m++zsFDQ8BwZabFn3GTXd98GdVarTzTukk3LvCvpt
nfbwhYBboUhSnznFt+4orO/LdmgUud+tAWyZH8QiHZ/+cnfgLFuv5AS/T3KgGjSY
6Dlo7JUle3ah5mm5hRm9iYz+re026nO8/4Piy33B0s5Ks40FnotJk9/BW9BuXvAu
MC6C/Pq8tBcKSOWIm8Wba96wyrQD8Nr0kLhlZPdcTK3ofmZemde4wj7I0BOdre7k
RXuJVfeKH2JShBKzwkCX44ofR5GmdFrS+LFjKBC4swm4VndAoiaYecb+3yXuPuWg
f9RhD1FLPD+M2uFwdNjCaKH5wQzpoeJ/u1U8dgbuak7MkogwTZq9TwtImoS1mKPV
+3PBV2HdKFZ1E66HjucMUQkQdYhMvI35ezzUIkgfKtzra7tEscszcTJGr61K8Yzo
dDqs5xoic4DSMPclQsciOzsSrZYuxsN2B6ogtzVJV+mSSeh2FnIxZyuWfoqjx5RW
Ir9qS34BIbIjMt/kmkRtWVtd9QCgHJvGeJeNkP+byKq0rxFROV7Z+2et1VsRnTKa
G73VululycslaVNVJ1zgyjbLiGH7HrfQy+4W+9OmTN6SpdTi3/UGVN4unUu0kzCq
gc7dGtxRcw1PcOnlthYhGXmy5okLdWTK1au8CcEYof/UVKGFPP0UJAOyh9OktwID
AQABo0IwQDAOBgNVHQ8BAf8EBAMCAYYwDwYDVR0TAQH/BAUwAwEB/zAdBgNVHQ4E
FgQUu//KjiOfT5nK2+JopqUVJxce2Q4wDQYJKoZIhvcNAQEMBQADggIBAB/Kzt3H
vqGf2SdMC9wXmBFqiN495nFWcrKeGk6c1SuYJF2ba3uwM4IJvd8lRuqYnrYb/oM8
0mJhwQTtzuDFycgTE1XnqGOtjHsB/ncw4c5omwX4Eu55MaBBRTUoCnGkJE+M3DyC
B19m3H0Q/gxhswWV7uGugQ+o+MePTagjAiZrHYNSVc61LwDKgEDg4XSsYPWHgJ2u
NmSRXbBoGOqKYcl3qJfEycel/FVL8/B/uWU9J2jQzGv6U53hkRrJXRqWbTKH7QMg
yALOWr7Z6v2yTcQvG99fevX4i8buMTolUVVnjWQye+mew4K6Ki3pHrTgSAai/Gev
HyICc/sgCq+dVEuhzf9gR7A/Xe8bVr2XIZYtCtFenTgCR2y59PYjJbigapordwj6
xLEokCZYCDzifqrXPW+6MYgKBesntaFJ7qBFVHvmJ2WZICGoo7z7GJa7Um8M7YNR
TOlZ4iBgxcJlkoKM8xAfDoqXvneCbT+PHV28SSe9zE8P4c52hgQjxcCMElv924Sg
JPFI/2R80L5cFtHvma3AH/vLrrw4IgYmZNralw4/KBVEqE8AyvCazM90arQ+POuV
7LXTWtiBmelDGDfrs7vRWGJB82bSj6p4lVQgw1oudCvV0b4YacCs1aTPObpRhANl
6WLAYv7YTVWW4tAR+kg0Eeye7QUd5MjWHYbL
-----END CERTIFICATE-----)raw";

const char* deviceAuthorizationEndpoint;
const char* tokenEndpoint;
const char* deviceCode;
const char* userCode;
int expiresIn;
int interval;
const char* verificationUrl;
int lastTime;

void setup() {
  // initialize serial port
  Serial.begin(115200);
  // wait for serial port to connect
  while(!Serial);

  Serial.println("TEST!");

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


  // configure HTTPS client
  WiFiClientSecure httpsClient;
  //httpsClient.setCACert(root_ca);
  httpsClient.setInsecure();
  HTTPClient http;
  
  http.begin("https://accounts.google.com/.well-known/openid-configuration");
  
  int httpResponseCode = http.GET();
  
  if (httpResponseCode>0) {

    Serial.print("HTTP Response code: ");
    Serial.println(httpResponseCode);
    
    String payload = http.getString();
    
    StaticJsonDocument<1024> doc;
    deserializeJson(doc, payload);
    
    deviceAuthorizationEndpoint = (char*) malloc((sizeof(doc["device_authorization_endpoint"])+1)*sizeof(char)); /*+1 for '\0' character */
    tokenEndpoint = (char*) malloc((sizeof(doc["token_endpoint"])+1)*sizeof(char)); /*+1 for '\0' character */

    if (deviceAuthorizationEndpoint == NULL) {
        printf("Cannot allocate bytes for deviceAuthorizationEndpoint\n");
        exit(EXIT_FAILURE);
    }
    
    deviceAuthorizationEndpoint = doc["device_authorization_endpoint"];
    tokenEndpoint = doc["token_endpoint"];
    
    Serial.print("***URL future requests will be pointing to: ");
    Serial.println(deviceAuthorizationEndpoint);
    Serial.print("***URL token querries will be pointing to: ");
    Serial.println(tokenEndpoint);
  }
  else {
    Serial.print("Error code: ");
    Serial.println(httpResponseCode);
  }

  while(true){
  
    http.begin(httpsClient, deviceAuthorizationEndpoint);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  
    // send POST request
    int httpCode = http.POST("client_id="+client_id+"&scope=email%20profile");
    // check response
    if (httpCode > 0) {
      // HTTP header has been send and Server response header has been handled
      Serial.printf("[HTTP] POST... code: %d\n", httpCode);
  
      // file found at server
      if (httpCode == HTTP_CODE_OK) {
        String payload = http.getString();
        Serial.println(payload);
  
        StaticJsonDocument<1024> doc;
        deserializeJson(doc, payload);
  
        deviceCode = (char*) malloc((sizeof(doc["device_code"])+1)*sizeof(char)); /*+1 for '\0' character */
        userCode = (char*) malloc((sizeof(doc["user_code"])+1)*sizeof(char)); /*+1 for '\0' character */
        verificationUrl = (char*) malloc((sizeof(doc["verification_url"])+1)*sizeof(char)); /*+1 for '\0' character */
  
        if(!(deviceCode && userCode && verificationUrl)){
          Serial.println("Cannot allocate bytes for deviceCode && userCode && verificationUrl\n");
          exit(0);
        }
        
        Serial.println("Memory allocated for deviceCode && userCode && verificationUrl\n");
        
        deviceCode = doc["device_code"];
        userCode = doc["user_code"];
        verificationUrl = doc["verification_url"];
        
        expiresIn = doc["expires_in"];
        interval = doc["interval"];
  
        Serial.println(deviceCode);
        Serial.println(userCode);
        Serial.println(expiresIn);
        Serial.println(interval);
        Serial.println(verificationUrl);

        http.end();
        break;
      }
    } else {
      Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
    }
    http.end();
  }
  lastTime = millis();
}

void sendPOST(){
  //WiFiClientSecure httpsClient;
  //httpsClient.setCACert(root_ca);
  //httpsClient.setInsecure();
  HTTPClient http;

  //http.begin(httpsClient, "https://oauth2.googleapis.com/token");

  http.begin("https://oauth2.googleapis.com/token", googleCert);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  
  String payload = "client_id=CLIENT_ID&grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Adevice_code";

//  Serial.print("Token endpoint: ");
//  Serial.println(tokenEndpoint);

  Serial.println(payload);
  
  int httpCode = http.POST(payload);
                  
  // check response
  if (httpCode > 0) {
    // HTTP header has been send and Server response header has been handled
    Serial.printf("[HTTP] POST... code: %d\n", httpCode);

    // file found at server
    if (httpCode == HTTP_CODE_OK) {
      String payload = http.getString();
      Serial.println(payload);
    }
  } else {
    Serial.printf("[HTTP] POST... failed, error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
}

void loop() {
  if(millis() - lastTime > interval*1000 && interval*10 > 1){ //poll Google's servers every {interval} seconds, add condition of interval being defined
    sendPOST();
    lastTime = millis();
  }
}
