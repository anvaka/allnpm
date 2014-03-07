module.exports = function (fileName) {
  var fs = require('fs');
  return JSON.parse(fs.readFileSync(fileName, 'utf8')).rows;
};
