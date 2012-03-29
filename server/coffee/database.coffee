pg = require 'pg'
winston = require 'winston'
dns = require 'dns'
rl = require 'readline'

class DB
  constructor:(opts)->
    winston.info JSON.stringify opts
    @port = '5432'
    @user = opts.dbuser
    i = rl.createInterface process.stdin, process.stdout, null
    i.question "Password? ", (@pass) =>
      if opts.dbhost isnt 'localhost'
        @resolve opts.dbhost, =>
          do @connect
      else
        @host = opts.dbhost
        do @connect
      do i.close
      do process.stdin.destroy

  connect:()->
    @connString = 'tcp://' + @user + ':' + @pass + '@' + @host + '/postgres'
    winston.info @connString
    pg.connect @connString, (err, client)=>
      throw err if err
      @connection = client
      winston.info 'Connected to db'

  resolve:(hostname, cb) =>
    dns.resolve4 hostname, (err, adds)=>
      throw err if err
      @host = adds[0]
      do cb
exports.DB = DB