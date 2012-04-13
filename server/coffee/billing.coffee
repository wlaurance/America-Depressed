singleton = require './utils/singleton'
class Billing extends singleton
  constructor:()->

  getBillFor:(account_number, timewhen, cb)->


module.exports = do Billing.get
