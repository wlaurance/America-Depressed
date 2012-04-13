billing = require './billing'

class Account
  constructor:(@db)->
    @dbname = 'account_active'


  get:(account_number, cb)->
    @db.query "select * from " + @dbname + " where account_num_a='" + account_number + "'" , (result) ->
      cb result.rows[0]


  postCharge:(account_number, amount, cb)->


  postPayment:(account_number, amount, cb)->


  applyInterest:(account_number, interest, cb)->


  getBilling:(account_number, forwhen, cb)->




module.exports = Account
