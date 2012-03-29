pg = require 'pg'
winston = require 'winston'
dns = require 'dns'
rl = require 'readline'

class DB
  constructor:(password)->
    @port = '5432'
    @user = 'wslaur'
    i = rl.createInterface process.stdin, process.stdout, null
    i.question "Password? ", (@pass) =>
      @resolve 'bg6.cs.wm.edu', =>
        do @connect
        do i.close
        do process.stdin.destroy

  connect:()->
    @connString = 'tcp://' + @user + ':' + @pass + '@' + @host + '/postgres'
    winston.info @connString
    pg.connect @connString, (err, @client)=>
      throw err if err
      winston.info JSON.stringify @client

  resolve:(hostname, cb) =>
    dns.resolve4 hostname, (err, adds)=>
      throw err if err
      @host = adds[0]
      do cb
exports.DB = DB