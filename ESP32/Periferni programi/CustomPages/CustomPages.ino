#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <AutoConnect.h>
#include <time.h>
#include <WiFiManager.h>

static const char JSPAGE[] PROGMEM = R"'(
{
  "uri": "/jselement",
  "title": "Clock",
  "menu": true,
  "element": [
    {
      "name": "time",
      "type": "ACText"
    },
    {
      "name": "js",
      "type": "ACElement",
      "value": "<script type='text/javascript'>var xhr;function clock(){xhr.open('GET', '/clock');xhr.responseType='text';xhr.send();}window.onclose=function(){xhr.abort();};window.onload=function(){xhr=new XMLHttpRequest();xhr.onreadystatechange=function(){if(this.readyState==4&&xhr.status==200){document.getElementById('time').innerHTML=this.responseText;}};setInterval(clock,1000);};</script>"
    }
  ]
}  
)'";

WebServer  server;
AutoConnect portal(server);
WiFiManager wm;

void auxClock() {
  time_t  t;
  struct tm *tm;
  char    dateTime[24];

  t = time(NULL);
  tm = localtime(&t);
  sprintf(dateTime, "%04d/%02d/%02d %02d:%02d:%02d.",
                    tm->tm_year + 1900, tm->tm_mon + 1, tm->tm_mday,
                    tm->tm_hour, tm->tm_min, tm->tm_sec);
  server.send(200, "text/plain", dateTime);
}

void setup() {
  wm.resetSettings();
  delay(1000);
  portal.load(FPSTR(JSPAGE));
  if (portal.begin()) {
    server.on("/clock", auxClock);
    configTime(0, 0, "europe.pool.ntp.org");
  }
}

void loop() {
  portal.handleClient();
}
