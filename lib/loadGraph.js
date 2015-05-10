var fs = require('fs');
var getGraph = require('./getGraph.js');
module.exports = load;

function load() {
  var fileName = process.argv[2] || './byField'
  console.log('Loading graph from ' + fileName);
  var content = fs.readFileSync(fileName, 'utf8');
  var graph = getGraph(JSON.parse(content).rows);
  console.log('Loaded ' + graph.getNodesCount() + ' nodes; ' + graph.getLinksCount() + ' packages');

  return graph;
}
