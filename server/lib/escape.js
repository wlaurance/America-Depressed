(function() {
  var psql_escape_string, winston;

  winston = require('winston');

  psql_escape_string = function(str) {
    winston.info('processing str ' + str);
    return str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, function(char) {
      winston.info('got char callback ' + char);
      switch (char) {
        case "\u0000":
          return "\\0";
        case "\b":
          return "\\b";
        case "\t":
          return "\\t";
        case "\u001a":
          return "\\z";
        case "\n":
          return "\\n";
        case "\r":
          return "\\r";
        case "\"":
        case "'":
        case "\\":
        case "%":
          return "\\" + char;
      }
    });
  };

  module.exports = function(str) {
    return psql_escape_string(str);
  };

}).call(this);
