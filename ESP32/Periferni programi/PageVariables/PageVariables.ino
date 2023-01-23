#include <WiFi.h>          // Replace with WiFi.h for ESP32
#include <WebServer.h>     // Replace with WebServer.h for ESP32
#include <AutoConnect.h>
#include <WiFiManager.h>
#include <neotimer.h>

#define AUTOCONNECT_URI_ONSUCCESS "/_ac/googleLogin"

WiFiManager wm;
WebServer Server;
AutoConnect Portal(Server);
AutoConnectConfig Config;
AutoConnectAux page;
Neotimer timer;

int i = 0;

static const char JSON_PAGES[] PROGMEM = R"raw(
{
  "uri": "/blink",
  "title": "Blink Test",
  "menu": true,
  "element": [
    {
      "name": "box",
      "type": "ACCheckbox",
      "label": "This should blink now",
      "checked": false
    }
  ]
},
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

String onPage(AutoConnectAux& aux, PageArgument& args) {
  AutoConnectCheckbox &box = aux["box"].as<AutoConnectCheckbox>();
  if (i % 2)
    box.checked = true;
  else
    box.checked = false;
  return String();
}

bool increaseCount(){
  if(timer.repeat()){
    i++;
    if(i == 10){
      Serial.println("You should have been redirected.");
      page.redirect("/_ac/googleLogin/");
    }
    Serial.println(i);
  }
  return true;
}

void setup() {
  pinMode(13, OUTPUT);
  digitalWrite(13, HIGH);
  
  wm.resetSettings();
  
  Serial.begin(115200);
  
  Config.retainPortal = true;

  Portal.config(Config);
  
  page.load(FPSTR(JSON_PAGES));
  page.on(onPage);
  Portal.join(page);
  timer.set(2000);

  Portal.whileCaptivePortal(increaseCount);
  
  if (Portal.begin()) {
    Serial.println("WiFi connected: " + WiFi.localIP().toString());
  }
}

void loop() {
    Portal.handleClient();

    //To check if the box checking work we must increment a counter which is only doable in the loop. We might have to use whileonportal
    
    if(i < 5){
      Serial.println("This is text after handleClient");
      i++;
    }
}
