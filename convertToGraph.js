var fileName = process.argv[2] || 'byField';
var fs = require('fs');
var packages = JSON.parse(fs.readFileSync(fileName, 'utf8')).rows;

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
