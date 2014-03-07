/**
 * Converts npm registry `byField` response into serialized braph
 */
var readJSON = require('./lib/readJSON');
var packages = readJSON(process.argv[2] || 'byField').rows;
var nodeToPosition = getNodePositions(process.argv[3] || '60.pos');
var nodes = [];
var nodeIdToIdx = {};

packages.forEach(function (pkg, idx) {
  var pos = nodeToPosition[pkg.id];
  if (!pos) {
    throw new Error('Unknown node: ', pkg.id);
  }
  var pkgInfo = pkg.value;
  var nodeInfo = {
    id: pkg.id,
    pos: pos
  };
  var license = getLicense(pkgInfo.license);
  if (license) {
    nodeInfo.l = license;
  }
  var author = getAuthor(pkgInfo.author);
  if (author) {
    nodeInfo.a = author;
  }
  nodes.push(nodeInfo);
  nodeIdToIdx[pkg.id] = idx;
});

packages.forEach(function (pkg, srcIdx) {
  var deps = pkg.value.dependencies;
  if (deps) {
    var resolvedIds = [];
    for(var key in deps) {
      if (deps.hasOwnProperty(key)) {
        var idx = nodeIdToIdx[key];
        if (typeof idx !== 'undefined') {
          resolvedIds.push(idx);
        }
      }
    }
    if (resolvedIds.length) {
      nodes[srcIdx].d = resolvedIds;
    }
  }
});

console.log('var graphSrc = ' + JSON.stringify(nodes));

function getNodePositions(fileName) {
  var positions = readJSON(fileName);
  var nodeToPosition = {};
  positions.forEach(function (descriptor) {
    nodeToPosition[descriptor.node] = descriptor.pos;
  });
  return nodeToPosition;
}
function getLicense(license) {
  if (!license) return;
  if (typeof license === 'string') {
    return license.toUpperCase();
  } else if (license[0]) {
    return getLicense(license[0]);
  } else {
    var str = license.type || license.name || license.license;
    if (typeof str === 'string') {
      return str.toUpperCase();
    }
  }
}

function getAuthor(author) {
  if (!author) return;
  if (typeof author === 'string') return author;
  if (typeof author.name === 'string') return author.name;
}
