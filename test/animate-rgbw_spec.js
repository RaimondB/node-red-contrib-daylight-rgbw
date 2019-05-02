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

  it('should output messages to RGBW outputs after receive message for rainbow', function (done) {
    var flow = [
        { id:"f1", type:"tab", label:"Test flow"},
        { id: "n1", z:"f1", type: "animate-rgbw", animationType: "R",
          whiteLevel : 50, 
          name: "animate-rgbw",wires:[["n2"],[],[],[]] },
        { id: "n2", z:"f1", type: "helper" }
      ];
    helper.load(sutNode, flow, function () {
      try
      {          
      var n2 = helper.getNode("n2");
      var n1 = helper.getNode("n1");

      var msgNo = 0;
      n2.on("input", function (msg) {
        try
        {
          msgNo++;
          msg.should.have.property('payload').within(0,100);
          
          if(msgNo==1)
          {
            n1.receive({ payload: "STOP" });

            done();
          }
        }
        catch(err)
        {
          done(err);
        }
      });

      n1.receive({ payload: "randomdata" });

    }
      catch(err)
      {
        done(err);
      }  
    });
  });
});