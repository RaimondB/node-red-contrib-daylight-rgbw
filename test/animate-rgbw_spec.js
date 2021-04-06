var should = require("should");
var helper = require("node-red-node-test-helper");

var sutNode = require("../animate-rgbw.js");

helper.init(require.resolve('node-red'));

describe('animate-rgbw Node', function () {

  beforeEach(function (done) {
    helper.startServer(done);
  });

  afterEach(function (done) {
    helper.unload();
    helper.stopServer(done);
  });

  it('should be loaded', function (done) {
    var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
    helper.load(sutNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'animate-rgbw');
      done();
    });
  });

  // it('should support openhab ON', function () {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : "ON"  };

  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.true();
  //     done();
  //   });
  // });

  // it('should support openhab OFF', function (done) {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : "OFF"  };
  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.false();
  //     done();
  //   });
  // });

  // it('should support homekit ON', function (done) {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : { On: 1 }  };

  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.true();
  //     done();
  //   });
  // });

  // it('should support homekit OFF', function (done) {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : { On: 0 }  };
  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.false();
  //     done();
  //   });
  // });

  // it('should support START', function (done) {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : "START"  };
  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.true();
  //     done();
  //   });
  // });

  // it('should support STOP', function (done) {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : "STOP"  };
  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.false();
  //     done();
  //   });
  // });

  // it('should ignore unknown values', function (done) {
  //   var flow = [{ id: "n1", type: "animate-rgbw", name: "animate-rgbw" }];
  //   var msg = { payload : { On : "Somevalue"}  };
  //   helper.load(sutNode, flow, function () {
  //     var val = sutNode.getSwitchValue(msg.payload);

  //     val.should.be.null();
  //     done();
  //   });
  // });

  let msgCases = [
    { 'description': 'START-STOP', 'start': 'START', 'stop': 'STOP' },
    { 'description': 'OpenHAB', 'start': 'ON', 'stop': 'OFF' },
    { 'description': 'HomeKit', 'start': { On: 1 }, 'stop': { On: 0 } },
    { 'description': 'HomeAssistant', 'start': { service: 'turn_on' }, 'stop': { service: 'turn_off' } },
  ]

  msgCases.forEach(({ description, start, stop }) => {
  //  ${ response_code }
    it(`should output messages to RGBW outputs with '${ description }' commands`, function (done) {
      var flow = [
        { id: "f1", type: "tab", label: "Test flow" },
        {
          id: "n1", z: "f1", type: "animate-rgbw", animationType: "R",
          whiteLevel: 50,
          name: "animate-rgbw", wires: [["n2"], [], [], []]
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
              msg.should.have.property('payload').within(0, 100);

              if (msgNo == 1) {
                n1.receive({ payload: stop });
              }
            }
            catch (err) {
              done(err);
            }
          });

          n1.on("input", function (msg) {
            try {
              if (JSON.stringify(msg.payload) == JSON.stringify(stop)) {
                msgNo.should.be.equal(1);
                done();
              }
            }
            catch (err) {
              done(err);
            }
          });

          n1.receive({ payload: start });

        }
        catch (err) {
          done(err);
        }
      });
    });
  });
});