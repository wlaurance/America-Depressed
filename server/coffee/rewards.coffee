winston = require 'winston'

class Rewards 
  constructor:(@db)->
    @merch = 'reward_merch'
    @sweep = 'reward_sweep'

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
    if params.type is 'sweep'
      @db.query "select * from " + @sweep + " where cost <=" + upper + " and cost >" + upper - 100, (result)->
        cb result.rows

    else if params.type is 'merch'
      @db.query "select * from " + @merch + " where cost <=" + upper + " and cost >" + upper - 100, (result)->
        cb result.rows

    else 
      cb params.type


module.exports = Rewards

