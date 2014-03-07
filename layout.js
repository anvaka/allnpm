/**
 * This file will produce layout files from
 * graph made by `convertToGraph.js` program
 *
 * Each 60th iteration is saved to a file
 */
var fs = require('fs');
var fileName = process.argv[2] || 'graph.out';
var content = fs.readFileSync(fileName, 'utf8');
var serializer = require('ngraph.serialization/json');
var graph = serializer.load(content);
var layout = require('ngraph.forcelayout')(graph);

if (process.argv[3]) {
  console.log('initializing positions from ', process.argv[3]);
  var positions = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  positions.forEach(function (pos) {
    layout.setNodePosition(pos.node, pos.pos.x, pos.pos.y);
  });
}

var i = 0;
while (true) {
  console.log('step' + i);
  layout.step();
  if (i % 60 === 0) {
    saveIteration(Math.round(i/60));
  }
  ++i;
}

function saveIteration(name) {
  console.log("Saving: ", name + '.pos');
  var positions = [];

  graph.forEachNode(function (node) {
    var pos = layout.getNodePosition(node.id);
    pos.x = Math.round(pos.x);
    pos.y = Math.round(pos.y);
    positions.push({ node: node.id, pos: pos});
  });
  fs.writeFileSync(name + '.pos',JSON.stringify(positions));
}
