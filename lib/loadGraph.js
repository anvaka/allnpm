module.exports = load;

var createGraph = require('ngraph.graph');
var forEachPackage = require('./forEachPackage.js');

function load(done, fileName, customCreateGraph) {
  fileName = fileName || './byField';
  customCreateGraph = customCreateGraph || createGraph;

  var graph = customCreateGraph({
    uniqueLinkIds: false
  });

  forEachPackage(fileName, savePackage, function() {
    done(graph);
  });

  return; // public part is over

  function savePackage(pkg) {
    graph.addNode(pkg.id);
    var deps = pkg.value.dependencies;
    if (deps) {
      Object.keys(deps).forEach(addLink);
    }

    function addLink(key) {
      graph.addLink(pkg.id, key);
    }
  }
}

