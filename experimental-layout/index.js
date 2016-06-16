var path = require('path');
var save = require('ngraph.tobinary');
var fs = require('fs');
var createGraph = require('nangraph');
var fileName = path.join(__dirname, '..', 'byField');

console.log('Parsing graph file...');
require('../lib/loadGraph.js')(performLayout, fileName, createGraph);

function performLayout(graph) {
  console.log('Graph parsed. Found ' + graph.getNodesCount() + ' nodes and ' + graph.getLinksCount() + ' edges');
  var layout = require('nanlayout')(graph.getNativeGraph());
  console.log('Starting layout. This will take a while...');

  console.time('layout');
  for (var i = 0; i < 500; ++i) {
    var velocity = layout.step();
    if (i % 5 === 0) {
      saveIteration(i);
    }
    console.log('step ' + i + '; average velocity: ' + velocity);
  }
  console.timeEnd('layout');

  console.log('Layout completed. Saving to binary format');
  saveIteration('positions');
  save(graph, { outDir: './data' });
  console.log('Done.');

  function saveIteration(name) {
    var fname = path.join('data', name + '.bin');

    console.log("Saving: ", fname);
    var nodesLength = graph.getNodesCount();
    var buf = new Buffer(nodesLength * 4 * 3);
    var i = 0;

    graph.forEachNode(function(node) {
      var idx = i * 4 * 3;
      var pos = layout.getNodePosition(node.id);
      buf.writeInt32LE(pos[0], idx);
      buf.writeInt32LE(pos[1], idx + 4);
      buf.writeInt32LE(pos[2], idx + 8);
      i++;
    });

    fs.writeFileSync(fname, buf);
  }
}

