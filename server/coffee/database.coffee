pg = require 'pg'
winston = require 'winston'
dns = require 'dns'
rl = require 'readline'

class DB
  constructor:(@opts)->
    winston.info JSON.stringify @opts
    @port = '5432'
    @user = @opts.dbuser
    if not @opts.pass?
      if process.env.PGPASSWORD?
        @pass = process.env.PGPASSWORD
        do @resume
      else
        i = rl.createInterface process.stdin, process.stdout, null
        i.question "Password? ", (@pass) =>
          do @resume
          do i.close
          do process.stdin.destroy
    else
      @pass = @opts.pass
      do @resume

  connect:()=>
    @connString = 'tcp://' + @user + ':' + @pass + '@' + @host + '/americadepressed'
    winston.info @connString
    pg.connect @connString, (err, client)=>
      throw err if err
      winston.info 'Connected to db'

  resolve:(hostname, cb) =>
    dns.resolve4 hostname, (err, adds)=>
      throw err if err
      @host = adds[0]
      do cb

  resume:()=>
    if @opts.dbhost isnt 'localhost'
      @resolve @opts.dbhost, =>
        do @connect
    else
      @host = @opts.dbhost
      do @connect

  query:(sql, cb) ->
    winston.info 'sql:// ' + sql
    pg.connect @connString, (err, client)=>
      throw err if err
      client.query sql, (err, result)->
        throw err if err
        cb result

exports.DB = DB
