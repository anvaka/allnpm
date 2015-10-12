/**
 * This file will produce layout files from
 * graph made by `convertToGraph.js` program
 *
 * Each 60th iteration is saved to a file
 */
var save = require('ngraph.tobinary');
console.log('Parsing graph file...');
require('./lib/loadGraph.js')(performLayout);

function performLayout(graph) {
  console.log('Graph parsed. Found ' + graph.getNodesCount() + ' nodes and ' + graph.getLinksCount() + ' edges');
  var layout = require('ngraph.offline.layout')(graph);
  console.log('Starting layout. This will take a while...');
  layout.run();
  console.log('Layout completed. Saving to binary format');
  save(graph, { outDir: './data' });
  console.log('Done.');
}
