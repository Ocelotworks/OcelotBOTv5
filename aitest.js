const Ector = require('ector');
let FileConceptNetwork = require('file-concept-network').FileConceptNetwork;

// let ector = new Ector("OcelotBOT", "Peter");

let fcn = new FileConceptNetwork();


fcn.addLink(fcn.addNode("hello").id, fcn.addNode("suck my balls").id)

fcn.addLink(fcn.addNode("hi").id, fcn.addNode("eat my ass").id)

fcn.save('test.json', console.log)