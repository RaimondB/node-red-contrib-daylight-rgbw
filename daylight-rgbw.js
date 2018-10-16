/*

Daylight RGBW Color control Node for Node-RED
-------------------------------------------------------------------------------------------------------------------

Copyright (c) 2018 Raimond Brookman

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

*/

module.exports = function(RED) {
    "use strict";
  
    var ct = require('color-temperature');
    var SunCalc = require('suncalc');
        
// ------------------------------------------------------------------------------------------
    function DaylightRGBWNode(n) {
    //
    // DaylightRGBW Input Node
    //
        
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        this.topic = n.topic;
        this.command = n.command;

        var node = this;
        var msg = {};
  
        // This will be executed on every input message
        this.on('input', function (msg) {
        
        node.uri = null;
        node.value = null;

        this.status({fill:"yellow",shape:"ring",text:"calculating"});
        
        var rgb = ct.colorTemperature2rgb(1850);
 
        var red = rgb.red;
        var green = rgb.green;
        var blue = rgb.blue;

        var msgRed = { topic: this.topic, payload: red};
        var msgGreen = { topic: this.topic, payload: green};
        var msgBlue = { topic: this.topic, payload: blue};
        
        this.send([msgRed, msgGreen, msgBlue]);

        this.status({fill:"green",shape:"ring",text:"R:" + red + ",G:" + green + ",B:" + blue});
            
        });

        this.on("close", function() {
        });
    }
    RED.nodes.registerType("daylight-rgbw",DaylightRGBWNode);
}
