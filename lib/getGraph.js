var createGraph = require('ngraph.graph');
module.exports = getGraph;

function getGraph(packages) {
  var graph = createGraph({ uniqueLinkIds: false });

  packages.forEach(addPackage);

  return graph;

  function addPackage(pkg) {
    graph.addNode(pkg.id);
    var deps = pkg.value.dependencies;
    if (deps) {
      for (var key in deps) {
        if (deps.hasOwnProperty(key)) {
          graph.addLink(pkg.id, key);
        }
      }
    }
  }
}
