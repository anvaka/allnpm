/**
 * Converts saved graph into clusters
 */
console.log('Parsing graph file...');

var path = require('path');
var fileName = path.join(__dirname, '..', 'byField');
var saveClusters = require('./lib/saveClusters.js');

require('../lib/loadGraph.js')(performClustering, fileName);

function performClustering(graph) {
  saveClusters(graph, 'data/clusters');
}
