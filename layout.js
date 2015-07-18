/**
 * This file will produce layout files from
 * graph made by `convertToGraph.js` program
 *
 * Each 60th iteration is saved to a file
 */
var fs = require('fs');
var graph = require('./lib/loadGraph.js')();
var layout = require('ngraph.offline.layout')(graph);
console.log('Starting layout. This will take a while...');
layout.run();
console.log('Done. Now export this to binary format:');
console.log('node toBinary.js');
