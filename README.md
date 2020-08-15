# node-red-contrib-daylight-rgbw
Lets your RGB(W) controllable lights or ledstrips follow the sun color and a warm color at night. Also offers color animations (Disco & Rainbow)

## Daylight RGBW Control Node-RED Node

<span class="badge-npmversion"><a href="https://www.npmjs.com/package/node-red-contrib-daylight-rgbw" title="View this project on NPM"><img src="https://img.shields.io/npm/v/node-red-contrib-daylight-rgbw.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/node-red-contrib-daylight-rgbw" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/node-red-contrib-daylight-rgbw.svg" alt="NPM downloads" /></a></span>
[![Build Status](https://travis-ci.com/RaimondB/node-red-contrib-daylight-rgbw.svg?branch=master)](https://travis-ci.com/RaimondB/node-red-contrib-daylight-rgbw)
[![Known Vulnerabilities](https://snyk.io/test/github/RaimondB/node-red-contrib-daylight-rgbw/badge.svg?targetFile=package.json)](https://snyk.io/test/github/RaimondB/node-red-contrib-daylight-rgbw?targetFile=package.json)


This node offers the possibility to control the color of a RGBW ledstrip according to time of day.
This is done by calculating the angle of the sun with the horizon and project that on a color temperature scale.
Therefore it is important to correctly configure your longitude and lattitude.

Typically you choose a color tempurature of around 1000K for sunrise/sunset (sun at horizon) and a color temperature around 5500K for the highest point of the sun.

But to tune it for your specific RGBW source you can tune these settings in the configuration.
The white level is kept constant (for now) and can be configured too.

When the item is switched off, it will still update the RGBW colors, so that when the light source is switched on it will drectly be set to the correct colors.


The typical setup is show below:
![alt text](https://raw.githubusercontent.com/RaimondB/node-red-contrib-daylight-rgbw/master/images/daylight-flow.PNG "Example flow")

Also see this link for an [importable version of the example](https://raw.githubusercontent.com/RaimondB/node-red-contrib-daylight-rgbw/master/examples/daylight-flow-basic.json).

*Minimum Node version is now at 10.x*

<p>
This example follows the rules below:

<b>Have an external node to provide the current timestamp.</b>

For instance the Inject Node offers this. 
Choose to provide the timestamp by interval to determine how often the colors will be updated.

<b> Have your RGB(W) node status attached to the input to provide ON or OFF</b>

This way you prevent the light source to come on each time when the colors are updated.
This node is optimized to work directly with OpenHab2 nodes, but will work with any node as long as the topic is set to _item-switch_.

<b> Choose your output </b> 
You can output RGBW separate components (port 1,2,3,4) and/or make use of the colorTemp output (port 5) 

<b> Have your RGB(W) dimmer controls for the color channels connected to port 1,2,3,4.</b>
The current implementation will output percentages. If you need a range 0-255 you need to rescale.
You do not need to use port 4 if you do not have a White channel.

<b> Have your Kelvin or Mired compatible color control connected to port 5.</b>
The result will internally be caculated in Kelvin. 

## Animation RGBW Control Node
A second node within this package offers RGB animations. Currently 2 modes exist: disco (random colors) and rainbow (walking all possible colors)

## Installation

First go to your .node-red directory, then run the command below (or just install from the palette manager)

```
$ npm install node-red-contrib-daylight-rgbw
```

