module.exports.getSwitchValue = getSwitchValue = function (payload) {
  if (payload != null) {
    if (payload == "STOP" || payload == "OFF" || payload.On == 0 || payload.service == "turn_off") {
      return "off";
    }
    if (payload == "START" || payload == "ON" || payload.On == 1 || payload.service == "turn_on") {
      return "on";
    }
  }
  return null;
}