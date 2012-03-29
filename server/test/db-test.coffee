vows = require 'vows'
winston = require 'winston'

db = require '../lib/database'

dbhash = {dbuser:"postgres", dbhost:"localhost", pass:"postgres"}

pg = undefined
vows
  .describe('Database')
  .addBatch
    'when setting up database connection':
      topic: -> new db.DB dbhash, @callback
      'connection should be there': (result) ->
        pg = result
  .addBatch
    'test query':
      topic: -> pg.query "SELECT NOW() as when"
      'query should give us the time as w': (query)->
        console.log query
        query.on 'row', (row)->
          console.log row
  .export(module)