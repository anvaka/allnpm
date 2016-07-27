var path = require('path');
var save = require('ngraph.tobinary');
var createLayout = require('hlayout');
var fs = require('fs');
var fileName = path.join(__dirname, '..', 'byField');

console.log('Parsing graph file...');
require('../lib/loadGraph.js')(performLayout, fileName);

function performLayout(graph) {
  console.log('Graph parsed. Found ' + graph.getNodesCount() + ' nodes and ' + graph.getLinksCount() + ' edges');
  var layout = createLayout(graph);
  layout.run();

  console.log('Layout completed. Saving to binary format');

  saveIteration('positions2d');
  save(graph, { outDir: './data' });
  console.log('Done.');

  function saveIteration(name) {
    var fname = path.join('data', name + '.bin');

    console.log('Saving: ', fname);
    var nodesLength = graph.getNodesCount();
    var buf = new Buffer(nodesLength * 4 * 3);
    var i = 0;
    var missed = 0;

    graph.forEachNode(function(node) {
      var idx = i * 4 * 3;
      var pos = layout.getNodePosition(node.id);
      var size = 0;
      var links = graph.getLinks(node.id);
      if (links) {
        links.forEach(function(link) {
          if (link.toId === node.id) size += 1;
        });
      }

      if (!pos) {
        missed += 1;
        console.log('missing position for ' + node.id);
        pos = {x : 0, y: 0};
      }

      buf.writeInt32LE(pos.x, idx);
      buf.writeInt32LE(pos.y, idx + 4);
      buf.writeInt32LE(size, idx + 8);
      i++;
    });

    fs.writeFileSync(fname, buf);
    console.log('missed: ', missed);
  }
}

