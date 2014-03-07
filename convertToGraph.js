/**
 * Converts npm registry `byField` response into serialized braph
 */
var packages = require('./lib/extractByFieldRows')(process.argv[2] || 'byField');

var graph = require('ngraph.graph')();
packages.forEach(function (pkg) {
  graph.addNode(pkg.id);
  var deps = pkg.value.dependencies;
  if (deps) {
    for(var key in deps) {
      if (deps.hasOwnProperty(key)) {
        graph.addLink(pkg.id, key);
      }
    }
  }
});

var serializer = require('ngraph.serialization/json');
console.log(serializer.save(graph));
