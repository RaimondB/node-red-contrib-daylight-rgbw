var should = require("should");
var helper = require("node-red-node-test-helper");

var sutNode = require("../daylight-rgbw.js");

helper.init(require.resolve('node-red'));

describe('daylight-rgbw Node', function () {

  beforeEach(function (done) {
    helper.startServer(done);
  });

  afterEach(function (done) {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "daylight-rgbw", name: "daylight-rgbw" }];
    helper.load(sutNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'daylight-rgbw');
      done();
    });
  });

  it('should send 2 messages to RGBW outputs after switch on - timestamp', function (done) {
    var flow = [
      { id: "f1", type: "tab", label: "Test flow" },
      {
        id: "n1", z: "f1", type: "daylight-rgbw",
        minColorTemp: 1000,
        maxColorTemp: 6000,
        whiteLevel: 50,
        name: "daylight-rgbw", wires: [["n2"], [], [], []]
      },
      { id: "n2", z: "f1", type: "helper" }
    ];
    helper.load(sutNode, flow, function () {
      try {
        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");

        var msgNo = 0;
        n2.on("input", function (msg) {
          try {
            msgNo++;
            msg.should.have.property('payload', 100);

            if (msgNo == 2) {
              done();
            }
          }
          catch (err) {
            done(err);
          }
        });

        n1.receive({ payload: "ON", topic: "item-switch" });

        var currentDateTime = new Date(2018, 10, 18, 0, 0, 0);
        n1.receive({ payload: currentDateTime, topic: "date-time" });
      }
      catch (err) {
        done(err);
      }
    });
  });

  let msgCases = [
    { 'description': 'START-STOP', 'start': 'START', 'stop': 'STOP' },
    { 'description': 'OpenHAB', 'start': 'ON', 'stop': 'OFF' },
    { 'description': 'HomeKit', 'start': { On: 1 }, 'stop': { On: 0 } },
    { 'description': 'HomeAssistant', 'start': { service: 'turn_on' }, 'stop': { service: 'turn_off' } },
  ]

  msgCases.forEach(({ description, start, stop }) => {

    it(`should send 1 messages to RGBW outputs after timestamp - switch on (${description})`, function (done) {
      var flow = [
        { id: "f1", type: "tab", label: "Test flow" },
        {
          id: "n1", z: "f1", type: "daylight-rgbw",
          minColorTemp: 1000,
          maxColorTemp: 6000,
          whiteLevel: 50,
          name: "daylight-rgbw", wires: [["n2"], [], [], []]
        },
        { id: "n2", z: "f1", type: "helper" }
      ];
      helper.load(sutNode, flow, function () {
        try {

          var n2 = helper.getNode("n2");
          var n1 = helper.getNode("n1");

          var msgNo = 0;
          n2.on("input", function (msg) {
            try {
              msgNo++;
              msg.should.have.property('payload', 100);

              if (msgNo == 1) {
                done();
              }
            }
            catch (err) {
              done(err);
            }
          });

          var currentDateTime = new Date(2018, 10, 18, 0, 0, 0);
          n1.receive({ payload: currentDateTime, topic: "date-time" });

          n1.receive({ payload: start, topic: "StateEvent" });
        }
        catch (err) {
          done(err);
        }
      });
    });
  });

  it('should send 1 messages to colorTemp output in Kelvin when Kelvin configured', function (done) {
    var flow = [
      { id: "f1", type: "tab", label: "Test flow" },
      {
        id: "n1", z: "f1", type: "daylight-rgbw",
        minColorTemp: 1000,
        maxColorTemp: 6000,
        whiteLevel: 50,
        colorTempUnit: "K",
        name: "daylight-rgbw", wires: [[], [], [], [], ["n2"]]
      },
      { id: "n2", z: "f1", type: "helper" }
    ];
    helper.load(sutNode, flow, function () {
      try {

        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");

        n2.on("input", function (msg) {
          try {
            msg.should.have.property('payload', 1000);
            done();
          }
          catch (err) {
            done(err);
          }
        });

        n1.receive({ payload: 1000, topic: "color-temp" });
        n1.receive({ payload: "ON", topic: "StateEvent" });
      }
      catch (err) {
        done(err);
      }
    });
  });

  it('should send 1 messages to colorTemp output in Mired when Mired configured', function (done) {
    var flow = [
      { id: "f1", type: "tab", label: "Test flow" },
      {
        id: "n1", z: "f1", type: "daylight-rgbw",
        minColorTemp: 1000,
        maxColorTemp: 6000,
        whiteLevel: 50,
        colorTempUnit: "M",
        name: "daylight-rgbw", wires: [[], [], [], [], ["n2"]]
      },
      { id: "n2", z: "f1", type: "helper" }
    ];
    helper.load(sutNode, flow, function () {
      try {

        var n2 = helper.getNode("n2");
        var n1 = helper.getNode("n1");

        n2.on("input", function (msg) {
          try {
            msg.should.have.property('payload', 1000000.0 / 1000);
            done();
          }
          catch (err) {
            done(err);
          }
        });

        n1.receive({ payload: 1000, topic: "color-temp" });
        n1.receive({ payload: "ON", topic: "StateEvent" });
      }
      catch (err) {
        done(err);
      }
    });
  });
});