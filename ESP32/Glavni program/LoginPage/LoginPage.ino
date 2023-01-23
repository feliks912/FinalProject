#include <WiFi.h>          // Replace with WiFi.h for ESP32
#include <WebServer.h>     // Replace with WebServer.h for ESP32
#include <AutoConnect.h>
#include <WiFiManager.h>

#define AUTOCONNECT_URI_ONSUCCESS "/_ac/googleLogin"

WiFiManager wm;
WebServer Server;
AutoConnect Portal(Server);
AutoConnectConfig Config;

static const char JSON_PAGES[] PROGMEM = R"raw(
{
  "uri": "/_ac/googleLogin",
  "title": "Authenticate device",
  "menu": true,
  "element": [
    {
      "name": "login",
      "type": "ACButton",
      "value": "Authenticate",
      "action": "minRed('STRING','https://www.google.com')"
    },
    {
      "name": "copyToClipboard",
      "type": "ACElement",
      "value": "<script>function minRed(e,s){let o=document.createElement('textarea');o.value=e,document.body.appendChild(o),o.select(),document.execCommand('copy'),document.body.removeChild(o),window.open(s)}</script>"
    }
  ]
}
)raw";

void setup() {
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
  
  wm.resetSettings();
  
  Serial.begin(115200);
  
  Config.retainPortal = true;

  Portal.config(Config);
  
  Portal.load(FPSTR(JSON_PAGES));

  Serial.println(WiFi.getMode());
  
  if (Portal.begin()) {
    Serial.println("WiFi connected: " + WiFi.localIP().toString());
  }
}

void loop() {
    Portal.handleClient();
    
}
