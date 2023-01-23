#include <HTTPClient.h> //Include HTTPClient library
#include <WiFi.h> //Include WiFi library
#include <WebServer.h> //Include WebServer library

//Create WebServer instance
WebServer server(80);

//Connect to SoftAP

//Create HTTPClient instance
HTTPClient http;

//Request handler of the WebServer class
void handleRoot() {
  HTTPClient http;
  WiFi.mode(WIFI_STA);
  const char *ssid = "Desktop"; //Station ssid
  const char *password = "07123010";
  WiFi.begin(ssid);
  String url = server.arg("url"); //Fetch URL from request
  if (http.begin("https://" + url)) { //Make HTTP request
    int httpCode = http.GET();
    if (httpCode > 0) {
      String payload = http.getString();
      //Send response to the browser
      server.send(200, "text/html", payload);
    }
  }
  http.end();
  WiFi.disconnect();
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid);
}

//Function to handle requests
void handleClient() {
  server.handleClient();
}

void setup() {
  WiFi.mode(WIFI_AP);
  const char *ssid = "ApSSID"; //SoftAP ssid
  WiFi.softAP(ssid);
  
  //Set server route
  server.on("/", handleRoot);
  
  //Start server
  server.begin();
}

void loop() {
  handleClient();
}
