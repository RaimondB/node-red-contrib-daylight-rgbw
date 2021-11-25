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

    function outputValues(node, colorSource, previousColorInfo)
    {
        if(!node.stopAnimating)
        {
            var colorInfo = colorSource(previousColorInfo);

            var msgRed = { topic: node.topic, payload: ScaleRGBLevelToPercent(colorInfo.red)};
            var msgGreen = { topic: node.topic, payload: ScaleRGBLevelToPercent(colorInfo.green)};
            var msgBlue = { topic: node.topic, payload: ScaleRGBLevelToPercent(colorInfo.blue)};
            var msgWhite = { topic: node.topic, payload: ScaleRGBLevelToPercent(colorInfo.white)};
    
            node.send([msgRed, msgGreen, msgBlue, msgWhite]);
    
            node.lastTimeout = setTimeout(() => outputValues(node, colorInfo.nextSource, colorInfo), colorInfo.waitToNext);
        }
        else
        {
            //Switch off all colors
            var msgZero = { topic: node.topic, payload: 0}
            node.send([msgZero, msgZero, msgZero, msgZero]);
        }
    }
    
    function discoColorSource(previousColorInfo)
    {
        var hue = Math.floor(Math.random() * 360);
        var saturation = 100;
        var luminance = 50;
        
        var transformer = (x) => 1.0-((1.0-x)*(1.0-x));

        var whiteLevel = Math.floor( transformer(Math.random()) * 80);

        var result = convert.hsl.rgb(hue, saturation, luminance);

        var colorInfo = {};
        colorInfo.red = result[0];
        colorInfo.green = result[1];
        colorInfo.blue = result[2];
        colorInfo.white = whiteLevel;
        colorInfo.nextSource = discoColorSource;
        colorInfo.waitToNext = 1000;
        colorInfo.state = {hue:hue, sat:saturation, lum:luminance};
        return colorInfo;
    }

    function rainbowColorSource(previousColorInfo)
    {
        if(!previousColorInfo)
        {
            previousColorInfo = {};
        }
        if(!previousColorInfo.state)
        {
            previousColorInfo.state = {hue:0, sat:100, lum:50};
        }
        previousColorInfo.state.hue = (previousColorInfo.state.hue + 1) % 360;

        var hue = previousColorInfo.state.hue;
        var saturation = previousColorInfo.state.sat;
        var luminance = previousColorInfo.state.lum;
        var whiteLevel = 0;

        var result = convert.hsl.rgb(hue, saturation, luminance);

        var colorInfo = {};
        colorInfo.red = result[0];
        colorInfo.green = result[1];
        colorInfo.blue = result[2];
        colorInfo.white = whiteLevel;
        colorInfo.nextSource = rainbowColorSource;
        colorInfo.waitToNext = 100;
        colorInfo.state = previousColorInfo.state;
        return colorInfo;
    }

    
    function createColorSource(selection)
    {
        switch (selection)
        {
            case "R" : return rainbowColorSource;
            case "D" : return discoColorSource;
            case "C" : return null;
        }
    }

// ------------------------------------------------------------------------------------------
    function AnimateRGBWNode(n) {
    //
    // AnimateRGBW Input Node
    //
        
        // Create a RED node
        RED.nodes.createNode(this,n);

        var node = this;

        this.topic = n.topic;
        this.command = n.command;
        this.whiteLevel = Number(n.whiteLevel);
        this.changeInterval = Number(n.changeInterval) | 100;

        this.stopAnimating = true;
        this.log("Received Animationtype:" + n.animationType);
        this.colorSource = createColorSource(n.animationType);

        if(!this.colorSource)
        {
            this.status({fill:"red",shape:"dot",text:"Invalid animationtype"});
        }
        else
        {
            this.status({fill:"green",shape:"dot",text:"Animationtype:" + this.colorSource.name});
        }

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
                    if(this.colorSource)
                    {
                        setTimeout(() => outputValues(node, this.colorSource, null), this.changeInterval);
                    }
                }            
            }
        });

        this.on("close", function() {
            this.stopAnimating = true;
            if(this.lastTimeout)
            {
                this.log("Clear previous timer");
                //Make sure to cancel running animations on redeploy
                clearTimeout(this.lastTimeout);
            }
            var msgZero = { topic: node.topic, payload: 0}
            node.send([msgZero, msgZero, msgZero, msgZero]);
        });
    }
    RED.nodes.registerType("animate-rgbw", AnimateRGBWNode);
}
