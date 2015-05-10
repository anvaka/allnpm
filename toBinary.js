var graph = require('./lib/loadGraph.js')();
var save = require('ngraph.tobinary');
save(graph, { outDir: './data' });
