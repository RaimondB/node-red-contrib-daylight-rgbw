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
    var convert = require('color-convert');
    
    function ScaleRGBLevelToPercent(rgbLevel) {
        return rgbLevel * 100.0 / 255.0;
    }

    function outputValues(node, colorSource)
    {
        if(!node.stopAnimating)
        {
            var rgbw = colorSource.colors();

            var msgRed = { topic: node.topic, payload: ScaleRGBLevelToPercent(rgbw.red)};
            var msgGreen = { topic: node.topic, payload: ScaleRGBLevelToPercent(rgbw.green)};
            var msgBlue = { topic: node.topic, payload: ScaleRGBLevelToPercent(rgbw.blue)};
            var msgWhite = { topic: node.topic, payload: ScaleRGBLevelToPercent(rgbw.white)};
    
            node.send([msgRed, msgGreen, msgBlue, msgWhite]);
    
            setTimeout(() => outputValues(node, colorSource.nextSource()), colorSource.nextTimeout());
        }
        else
        {
            var msgZero = { topic: node.topic, payload: 0}
            node.send([msgZero, msgZero, msgZero, msgZero]);
        }
    }
    
    var discoColorSource =
    {
        colors : function ()
        {
            var randomHue = Math.floor(Math.random() * 360);
            var saturation = 100;
            var brightness = 50;
            
            var transformer = (x) => 1.0-((1.0-x)*(1.0-x));

            var whiteLevel = Math.floor( transformer(Math.random()) * 80);

            var result = convert.hsl.rgb(randomHue, saturation, brightness);

            var rgbw = {};
            rgbw.red = result[0];
            rgbw.green = result[1];
            rgbw.blue = result[2];
            rgbw.white = whiteLevel;
            return rgbw;
        },

        nextSource : () =>
        {
            return discoColorSource;
        },

        nextTimeout : () => 1000
    }
      
// ------------------------------------------------------------------------------------------
    function AnimateRGBWNode(n) {
    //
    // AnimateRGBW Input Node
    //
        
        // Create a RED node
        RED.nodes.createNode(this,n);
        
        this.topic = n.topic;
        this.command = n.command;
        this.whiteLevel = Number(n.whiteLevel);
        this.stopAnimating = false;

        var node = this;
  
        // This will be executed on every input message
        this.on('input', function (msg) {
        
            if(msg.topic)
            {
                this.log("Received Topic:" + msg.topic);
            }
            if(msg.topic == "white-level")
            {
                var currentWhiteLevel = this.whiteLevel;
                var newWhiteLevel = Number(msg.payload) * 1.0;

                if(newWhiteLevel >= 0 || newWhiteLevel <= 100)
                {
                    this.whiteLevel = newWhiteLevel;
                }
            }
            else
            {
                if(msg.payload == "STOP")
                {
                    this.stopAnimating = true;
                }
                else
                {
                    this.stopAnimating = false;
                    setTimeout(() => outputValues(node, discoColorSource), 100);
                }            
            }

//            this.status({fill:"yellow",shape:"ring",text:"calculating for:" + this.colorTemp.toFixed(1)});
                
//            this.status({fill:"green",shape:"ring",text:"R:" + red.toFixed(1) + 
//            ",G:" + green.toFixed(1) + ",B:" + blue.toFixed(1) +
//            ",W:" + white.toFixed(1) + ",colorTemp:" + colorTempOut.toFixed(1)});                        
        });

        this.on("close", function() {
        });
    }
    RED.nodes.registerType("animate-rgbw", AnimateRGBWNode);
}
