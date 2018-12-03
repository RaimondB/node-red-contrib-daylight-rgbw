# node-red-contrib-daylight-rgbw
Lets your RGB(W) controllable lights or ledstrips follow the sun color and a warm color at night

## Daylight RGBW Control Node-RED Node

<span class="badge-npmversion"><a href="https://www.npmjs.com/package/node-red-contrib-daylight-rgbw" title="View this project on NPM"><img src="https://img.shields.io/npm/v/node-red-contrib-daylight-rgbw.svg" alt="NPM version" /></a></span>
<span class="badge-npmdownloads"><a href="https://npmjs.org/package/node-red-contrib-daylight-rgbw" title="View this project on NPM"><img src="https://img.shields.io/npm/dm/node-red-contrib-daylight-rgbw.svg" alt="NPM downloads" /></a></span>
[![Build Status](https://travis-ci.com/RaimondB/node-red-contrib-daylight-rgbw.svg?branch=master)](https://travis-ci.com/RaimondB/node-red-contrib-daylight-rgbw)

This node offers the possibility to control the color of a RGBW ledstrip according to time of day.
This is done by calculating the angle of the sun with the horizon and project that on a color temperature scale.
Therefore it is important to correctly configure your longitude and lattitude.

Typically you choose a color tempurature of around 1000K for sunrise/sunset (sun at horizon) and a color temperature around 5500K for the highest point of the sun.

But to tune it for your specific RGBW source you can tune these settings in the configuration.
The white level is kept constant (for now) and can be configured too.

When the item is switched off, it will still update the RGBW colors, so that when the light source is switched on it will drectly be set to the correct colors.


The typical setup is show below:
![alt text](https://raw.githubusercontent.com/RaimondB/node-red-contrib-daylight-rgbw/master/images/daylight-flow.PNG "Example flow")
<p>
This examples follows the rules below:

<b>Have an external node to provide the current timestamp.</b>

For instance the Inject Node offers this. 
Choose to provide the timestamp by interval to determine how often the colors will be updated.

<b> Have your RGB(W) node status attached to the input to provide ON or OFF</b>

This way you prevent the light source to come on each time when the colors are updated.
This node is optimized to work directly with OpenHab2 nodes, but will work with any node as long as the topic is set to _item-switch_.

<b> Have your RGB(W) dimmer controls for the color channels connected to the outputs.</b>

The current implementation will output percentages. If you need a range 0-255 you need to rescale.


## Installation

```
$ npm -g i node-red-contrib-daylight-rgbw
```

