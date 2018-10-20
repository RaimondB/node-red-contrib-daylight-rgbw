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
    
    function ScaleRGBLevelToPercent(rgbLevel) {
        return rgbLevel * 100.0 / 255.0;
    }
    
// ------------------------------------------------------------------------------------------
    function DaylightRGBWNode(n) {
    //
    // DaylightRGBW Input Node
    //
        
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        this.topic = n.topic;
        this.command = n.command;
        this.minTemp = n.minColorTemp;
        this.maxTemp = n.maxColorTemp;
        this.whiteLevel = n.whiteLevel;

        var node = this;
        var msg = {};
  
        // This will be executed on every input message
        this.on('input', function (msg) {
        
            this.log("Received Topic:" + msg.topic);
            var colorTemp = null;

            if(msg.topic == "date-time")
            {
                this.dateTime = msg.payload;
                this.log("Received dt:" + this.dateTime);

                var positionResult = SunCalc.getPosition(this.dateTime, 51.8926122, 5.8764425);
                this.log("Sun position:" + positionResult.altitude);

                var fraction = positionResult.altitude * 2.0 / Math.PI;
                this.log("Sun position fraction:" + fraction);

                colorTemp = this.minTemp + (Math.max(fraction,0) * (this.maxTemp-this.minTemp));
            } else if(msg.topic == "color-temp")
            {
                colorTemp = Number(msg.payload);
            }
            else
            {
                this.status({fill:"red",shape:"dot",text:"unknown topic:" + msg.topic});
                return;
            }

            this.log("Color-temp:" + colorTemp);

            node.uri = null;
            node.value = null;

            this.status({fill:"yellow",shape:"ring",text:"calculating for:" + colorTemp});
            
            var rgb = ct.colorTemperature2rgb(colorTemp);
    
            // Convert values to percentage
            var red = ScaleRGBLevelToPercent(rgb.red);
            var green = ScaleRGBLevelToPercent(rgb.green);
            var blue = ScaleRGBLevelToPercent(rgb.blue);

            var msgRed = { topic: this.topic, payload: red};
            var msgGreen = { topic: this.topic, payload: green};
            var msgBlue = { topic: this.topic, payload: blue};
            var msgWhite = { topic: this.topic, payload: this.whiteLevel};
            
            this.send([msgRed, msgGreen, msgBlue, msgWhite]);

            this.status({fill:"green",shape:"ring",text:"R:" + red.toFixed(1) + 
                ",G:" + green.toFixed(1) + ",B:" + blue.toFixed(1) +
                ",W:" + this.whiteLevel.toFixed(1)});            
        });

        this.on("close", function() {
        });
    }
    RED.nodes.registerType("daylight-rgbw",DaylightRGBWNode);
}
