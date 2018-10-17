var should = require("should");
var helper = require("node-red-node-test-helper");
var lowerNode = require("../daylight-rgbw.js");

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
    helper.load(lowerNode, flow, function () {
      var n1 = helper.getNode("n1");
      n1.should.have.property('name', 'daylight-rgbw');
      done();
    });
  });

  it('should convert color temp to RGBW outputs', function (done) {
    var flow = [
        { id:"f1", type:"tab", label:"Test flow"},
        { id: "n1", z:"f1", type: "daylight-rgbw", name: "daylight-rgbw",wires:[["n2"],["n3"]["n4"]] },
        { id: "n2", z:"f1", type: "helper" },
        { id: "n3", z:"f1", type: "helper" },
        { id: "n4", z:"f1", type: "helper" }
    ];
    helper.load(lowerNode, flow, function () {
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");
      n2.on("input", function (msg) {
        msg.should.have.property('payload', '100');
        done();
      });
      n1.receive({ payload: 1850 });
    });
  });
});