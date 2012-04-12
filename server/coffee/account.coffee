
class Account
  constructor:(@db)->
    @dbname = 'account_active'


  get:(account_number, cb)->
    @db.query "select * from " + @dbname + " where account_num_a='" + account_number + "'" , (result) ->
      cb result.rows[0]

module.exports = Account
