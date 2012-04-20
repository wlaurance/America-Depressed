winston = require 'winston'

class Rewards 
  constructor:(@db, @auth)->
    @merch = 'reward_merch'
    @sweep = 'reward_sweep'
    @reward_account = 'reward_account'
  getSpecific:(params, cb)->
    if params.type is 'sweep'
      @db.query "select * from " + @sweep + " where sweep_id="+ params.id + "", (result)->
        cb result.rows[0]

    else if params.type is 'merch'
      @db.query "select * from " + @merch + " where merch_id="+ params.id + "", (result)->
        cb result.rows[0]
    else
      cb params.type

  getRange:(params, cb)->
    upper = Number(params.upper)
    lower = String(upper - 100)
    if params.type is 'sweep'
      @db.query "select * from " + @sweep + " where cost <=" + upper + " and cost >" + lower, (result)->
        cb result.rows
    else if params.type is 'merch'
      winston.info upper - 100
      @db.query "select * from " + @merch + " where cost <=" + upper + " and cost >" + lower, (result)->
        cb result.rows

    else 
      cb params.type

  account:(params, cb)->
   @auth.getUsername params.sessionid, (username)=>
     if not username
       cb 'error'
       return
     else
       @db.query "select acct_id from earner where ssn='" + username + "'", (result)=>
         @db.query "select * from " + @reward_account + " where acct_id='" + result.rows[0].acct_id + "'", (result)=>
           cb result.rows[0]

module.exports = Rewards

