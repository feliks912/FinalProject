#include <WiFi.h>
#include <WebServer.h>
#include <AutoConnect.h>
#include <WiFiManager.h>
#include <AutoConnectAux.h>                        

const char VARTEXT[] PROGMEM = R"(
{
  "uri": "/vartext",
  "title": "Custom",
  "menu": true,
  "element": [
    {
      "name": "testButton",
      "type": "ACButton",
      "format": "Counter value %s"
    }
  ]
}
)";

// A source of the variable text as like counter
int counter;

WebServer server;
AutoConnect portal;
WiFiManager wm;

// Assign your intended sketch variable to the value member of AutoConnectText
String onPage(AutoConnectAux& varPage, PageArgument& args) {
  AutoConnectText&  var = varPage["var"].as<AutoConnectText>();
  var.value = String(++counter);  // The value member of AutoConnectText is always of type String.
  return String();
}


void setup() {
  wm.resetSettings();
  portal.load(VARTEXT);           // load the custom web page
  //portal.on("/vartext", onPage);  // Register the custom web page handler
  ACButton(testButton, "PRESS", [](){
    server.sendHeader("Location", "https://www.youtube.com");
    portal.send(302);
  });
  counter = 0;
  portal.begin();
}

void loop() {
  portal.handleClient();
}
