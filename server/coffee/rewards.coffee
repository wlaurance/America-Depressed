winston = require 'winston'

class Rewards 
  constructor:(@db, @auth)->
    @merch = 'reward_merch'
    @sweep = 'reward_sweep'
    @reward_account = 'reward_account'
    @rewards_earned = 'rewards_earned'
    @earner = 'earner'

  getSpecific:(params, cb)=>
    if params.id is ''
      cb ''
      return
    if params.type is 'sweep'
      @db.query "select * from " + @sweep + " where sweep_id="+ params.id + "", (result)->
        cb result.rows[0]

    else if params.type is 'merch'
      @db.query "select * from " + @merch + " where merch_id="+ params.id + "", (result)->
        cb result.rows[0]
    else if params.id isnt ''
      @db.query "select * from " + @sweep + " where sweep_id="+ params.id + "", (result)=>
        cb result.rows[0] if result.rows.length > 0
        if result.rows.length is 0
          @db.query "select * from " + @merch + " where merch_id="+ params.id + "", (result2)->
            cb result2.rows[0]
    else
      cb ''

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

  getAll:(params, cb)->
    if params.type is 'm'
      @db.query "select * from " + @merch, (merch)=>
        cb merch.rows
    else if params.type is 's'
      @db.query "select * from " + @sweep, (sweep)=>
        cb sweep.rows
    else
      @db.query "select * from " + @merch, (merch)=>
        merch = merch.rows
        @db.query "select * from " + @sweep, (sweep)=>
          for s in sweep.rows
            merch.push s
          cb merch

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


  create:(params, cb)->
    if params.type is 'merch'
      quantity = params.quantity
      if not quantity?
        cb 'not enough info: rejected'
        return
      type = params.type
      db = @merch
    else
      type= params.type
      end_date = params.end_date || '5-30-2012'
      db = @sweep
    name = params.name
    cost = params.cost

    if cost? and name? and type? and db?
      @getNextId db, (nextid)=>
       if db is @merch
         values = "values(" + nextid + ",'" + name + "'," + cost + ",'" + quantity + "')"
       else
         values = "values(" + nextid + ",'" + name + "'," + cost + "," + "'0'" + ",'" + end_date + "')"

        @db.query "insert into " + db + " " + values, (result)->
          cb name + ' inserted'
    else
      cb 'not enough info: rejected'

  getNextId:(db, cb)=>
    id = if db is @merch then 'merch_id' else 'sweep_id'
    @db.query "select max("+id+") from " + db, (result)->
      cb (result.rows[0].max + 1)


  update:(params, cb)->
    value = 'set'
    ov = value
    if params.cost? and params.cost isnt ''
      if value isnt ov
        value = value + ','
      value = value + " cost='" + params.cost + "'"
    if params.name? and params.name isnt ''
      if value isnt ov
        value = value + ','
      value = value + " name='" + params.name + "'"

    if params.type is 'merch'
      db = @merch
      if params.quantity? and params.quantity isnt ''
        if value isnt ov
          value = value + ','
        value = value + " quantity='" + params.quantity + "'"
    else if params.type is 'sweep'
      db = @sweep
      if params.end_date? and params.end_date isnt ''
        if value isnt ov
          value = value + ','
        value = value + " end_date='" + params.end_date + "'"
    else
      cb 'nothing to update'
      return

    if value isnt ov and params.id? and params.id isnt ''
      id = if db is @merch then 'merch_id' else 'sweep_id'
      w = " where " + id + "=" + params.id + ""
      @db.query "update " + db +  " " + value + w, (result)->
        cb 'update ' + params.name
    else
      cb 'nothing to update'


  getNextAcc:(cb)->
    @db.query "select max(acct_id) from " + @earner, (result)->
      cb (Number(result.rows[0].max) + 1)

  createAcc:(ssn, accnum, cb)->
    @db.query "insert into " + @earner + " values('" + ssn + "', '" + accnum + "')", (r)=>
      cb 'done'
module.exports = Rewards

