winston = require 'winston'

psql_escape_string = (str) ->
  winston.info 'processing str ' + str
  str.replace /[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) ->
    winston.info 'got char callback ' + char
    switch char
      when "\u0000"
        "\\0"
      when "\b"
        "\\b"
      when "\t"
        "\\t"
      when "\u001a"
        "\\z"
      when "\n"
        "\\n"
      when "\r"
        "\\r"
      when "\"", "'", "\\", "%"
        "\\" + char

module.exports = (str)->
  psql_escape_string str
