var path = require('path');
var fileName = path.join(__dirname, '..', 'byField');

var toProtoBuf = require('ngraph.toprotobuf');

require('../lib/loadGraph.js')(save, fileName);

function save(graph) {
  toProtoBuf(graph, {
    outDir: 'data'
  });
}
