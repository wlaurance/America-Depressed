winston = require 'winston'

class Rewards 
  constructor:(@db, @auth)->
    @merch = 'reward_merch'
    @sweep = 'reward_sweep'
    @reward_account = 'reward_account'
    @rewards_earned = 'rewards_earned'

  getSpecific:(params, cb)=>
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
      @db.query "select * from " + @sweep + " where cost <=" + upper + " and cost >" + lower + " order by sweep_id", (result)->
        cb result.rows
    else if params.type is 'merch'
      winston.info upper - 100
      @db.query "select * from " + @merch + " where cost <=" + upper + " and cost >" + lower + " order by merch_id", (result)->
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

  updatePoints:(params, cb)=>
    @account params, (reward_account)=>
      @db.query "update " + @reward_account + " set points='" + (Number(reward_account.points) + Number(params.points)) + "' where acct_id='" + reward_account.acct_id + "'", (result)=>
        cb result

  redeem:(params, cb)->
    winston.info JSON.stringify params
    @auth.getUsername params.sessionid, (username)=>
      if not username
        cb 'error'
        return
      else
        @getSpecific params, (reward)=>
          cost = reward.cost
          if params.type is 'sweep'
            reward.entries++
          else
            reward.quantity--
            if reward.quantity < 0
              cb 'Sorry, there are not enough of this item :('
              return

          @updateAccount params.acct_id, reward, (result)=>
            if result.err is true
              cb result.message
              return
            @updateReward reward, (result) =>
              winston.info 'updated reward ' + JSON.stringify reward
            cb result.message


  updateReward: (reward, cb)=>
    if reward.merch_id?
      @db.query "update " + @merch + " set quantity='" + reward.quantity + "' where merch_id='" + reward.merch_id + "'", (result)=>
        cb result
    else
      @db.query "update " + @sweep + " set entries='" + reward.entries + "'where sweep_id='" + reward.sweep_id + "'", (result)=>
        cb result

  updateAccount:(acct_id, reward, cb)=>
    rewardid = reward.merch_id || reward.sweep_id
    @db.query "select points from " + @reward_account + " where acct_id='" + acct_id + "'", (account)=>
      if reward.cost > account.rows[0].points
        cb error =
          err:true
          message:'Not enough points'
        return
      @db.query "select * from " + @rewards_earned + " where acct_id='" + acct_id + "' and reward_id='" + rewardid + "'", (result)=>
        if result.rows.length > 0
          cb error=
            err:true
            message:'HEY!!!! You already redeemed this one!'
          return
        @db.query "update " + @reward_account + " set points='" + (account.rows[0].points - reward.cost) + "' where acct_id='" + acct_id + "'", (r)=>
          @db.query "insert into " + @rewards_earned + " VALUES('" + acct_id + "','" + rewardid + "')", (r2)=>
            cb success=
              err:false
              message: 'Congrats! Reward redeemed'


  redeemed:(params, cb)->
    @db.query "select reward_id from " + @rewards_earned + " where acct_id='" + params.acct_id + "'", (result)=>
      reward_list = result.rows
      redeemed = []
      if reward_list.length is 0
        cb 'none'
        return
      getreward = (id, cb2) =>
        p=
          type: (if id < 500 then 'sweep' else 'merch')
          id: id
        @getSpecific p, (reward)=>
          cb2 reward
      for r in reward_list
        getreward r.reward_id, (rinfo)=>
          redeemed.push rinfo
          if redeemed.length is reward_list.length
            cb redeemed

module.exports = Rewards

