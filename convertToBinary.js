var fs = require('fs');

var posFileName = process.argv[2];
var graphFileName = 'graph.out';

var nodes = JSON.parse(fs.readFileSync(posFileName, 'utf8'));

savePositions(nodes);
saveLinks(nodes);
saveLabels(nodes);

function savePositions(nodes) {
  var buf = new Buffer(nodes.length * 4 * 3);
  nodes.forEach(function(element, i) {
    var idx = i * 4 * 3;
    buf.writeInt32LE(element.pos.x, idx);
    buf.writeInt32LE(element.pos.y, idx + 4);
    buf.writeInt32LE(element.pos.z, idx + 8);
  });

  fs.writeFileSync('positions.bin', buf);
}

function saveLabels(nodes) {
  var labels = [];
  nodes.forEach(function(element, i) {
    labels.push(element.node);
  });
  fs.writeFileSync('labels.json', JSON.stringify(labels), 'utf8');
}

function saveLinks(nodes) {
  var graph = JSON.parse(fs.readFileSync(graphFileName, 'utf8'));
  var nodeMap = Object.create(null);

  nodes.forEach(function(element, i) {
    nodeMap[element.node] = i;
  });

  var linkMap = Object.create(null);

  graph.links.forEach(function (link) {
    if (typeof nodeMap[link.fromId] !== 'number') {
      console.log('skipping', link);
    }

    var store = linkMap[link.fromId];
    if (!store) {
      store = linkMap[link.fromId] = [];
    }
    var nodeIdx = nodeMap[link.toId];
    if (typeof nodeIdx !== 'number') {
      console.log('skipping', link);
    }

    store.push(nodeIdx);
  });

  var buf = new Buffer((nodes.length + graph.links.length) * 4);
  var idx = 0;

  nodes.forEach(function(element, i) {
    var nodeId =  nodeMap[element.node] + 1; // + 1 so that we avoid 0
    buf.writeInt32LE(-nodeId, idx);
    idx += 4;
    var adjacent = linkMap[element.node];
    if (adjacent) {
      adjacent.forEach(function (element) {
        buf.writeInt32LE(element, idx);
        idx += 4;
      });
    }
  });
  fs.writeFileSync('links.bin', buf);
}
