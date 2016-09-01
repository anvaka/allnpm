/**
 * This code will produce a clustering file
 */
var coarsen = require('ngraph.coarsen');
var path = require('path');
var detectClusters = require('ngraph.louvain/native.js').fromNgraph;
var toProtobuf = require('ngraph.toprotobuf');
var ProtoBuf = require('protobufjs');
var fs = require('fs');
var mkdirp = require('mkdirp');

module.exports = saveClusters;

var builder = ProtoBuf.protoFromString(getClustersProtoString());

var Clusters = builder.build('Clusters');
var Record = builder.build('NodeCluster');

function saveClusters(graph, outDir) {
  if (!fs.existsSync(outDir)) {
    mkdirp.sync(outDir);
  }

  var currentLayer = 0;
  var clusters;

  do {
    clusters = detectClusters(graph);
    clusters.renumber();

    console.log('Clusters found. Saving layer ' + currentLayer);
    saveToDist(graph, clusters, currentLayer);

    console.log('Coarsening the graph');
    graph = coarsen(graph, clusters);
    currentLayer += 1;
  } while (clusters.canCoarse());

  console.log('All done');

  function saveToDist(graph, clusters, layer) {
    var layerStr = layer.toString(10);
    var dir = path.join(outDir, layerStr)
    toProtobuf(graph, { outDir: dir })

    var records = [];
    graph.forEachNode(function(node) {
      var clusterId = clusters.getClass(node.id);
      var record = new Record();
      record.clusterId = number(clusterId);
      record.nodeId = node.id.toString();
      records.push(record);
    });

    var clusters = new Clusters();
    clusters.records = records;
    console.log('records: ' + records.length);
    saveProtoObject(clusters, path.join(dir, 'clusters.pb'));
  }
}

function saveProtoObject(object, fileName) {
  var arrayBuffer = object.toArrayBuffer();
  // Turns out node 5.1 crashes when array buffer has length 0.
  var nodeBuffer = (arrayBuffer.byteLength > 0) ? new Buffer(arrayBuffer) : new Buffer(0);
  fs.writeFileSync(fileName, nodeBuffer);
  fs.writeFileSync(fileName + '.proto', getClustersProtoString(), 'utf8');
}

function number(x) {
  var result = Number.parseInt(x);
  return result;
}

function getClustersProtoString() {
  return [
    'syntax = "proto3";',
    '',
    'message NodeCluster {',
    '  string nodeId = 1;',
    '  int32 clusterId = 2;',
    '}',
    '',
    'message Clusters {',
    '  repeated NodeCluster records = 1;',
    '}',
  ].join('\n');
}
