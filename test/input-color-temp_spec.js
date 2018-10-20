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

  it('should convert midnight to RGBW outputs RED 100%', function (done) {
    var flow = [
        { id:"f1", type:"tab", label:"Test flow"},
        { id: "n1", z:"f1", type: "daylight-rgbw",
          minColorTemp : 1000,
          maxColorTemp : 6000, 
          name: "daylight-rgbw",wires:[["n2"],[],[],[]] },
        { id: "n2", z:"f1", type: "helper" }
    ];
    helper.load(sutNode, flow, function () {
      
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");

      n2.on("input", function (msg) {
        try
        {
          msg.should.have.property('payload', 100);
          done();
        }
        catch(err)
        {
          done(err);
        }
      });

      var currentDateTime = new Date(2018,10,18,0,0,0);
      n1.receive({ payload: currentDateTime, topic:"date-time" });
    });
  });
});