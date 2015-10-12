/**
 * This file will produce layout files from
 * graph made by `convertToGraph.js` program
 *
 * Each 60th iteration is saved to a file
 */
console.log('Parsing graph file...');
require('./lib/loadGraph.js')(performLayout);

function performLayout(graph) {
  console.log('Graph parsed. Found ' + graph.getNodesCount() + ' nodes and ' + graph.getLinksCount() + ' edges');
  return;
  var layout = require('ngraph.offline.layout')(graph);
  console.log('Starting layout. This will take a while...');
  layout.run();
  console.log('Done. Now export this to binary format:');
  console.log('node toBinary.js');
}
