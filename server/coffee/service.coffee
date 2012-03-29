journey = require("journey")
exports.createRouter = (db)->
  router = new (journey.Router)(
    strict: false
    strictUrls: false
    api: "basic"
  )
  router.path /\/profile/, ->
    @get().bind (res) ->
      res.send 501, {},
        action: "list"

    @get(/\/([\w|\d|\-|\_]+)/).bind (res, id) ->
      res.send 501, {},
        action: "show"

    @post().bind (res, bookmark) ->
      res.send 501, {},
        action: "create"

    @put(/\/([\w|\d|\-|\_]+)/).bind (res, profile) ->
      res.send 501, {},
        action: "update"

    @del(/\/([\w|\d|\-|\_]+)/).bind (res, id) ->
      res.send 501, {},
        action: "delete"

  router.path /\/time/, ->
    @get().bind (res) ->
      db.query "SELECT NOW() as when", (result)->
        res.send 200, {},
          hello: result.rows[0].when


  router
