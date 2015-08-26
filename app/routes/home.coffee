bodyParser = require 'body-parser'
Q = require 'q'

controller_path = __dirname + '/../controllers'
models_path     = __dirname + '/../models'

settings        = require __dirname + '/../settings'
logger          = require __dirname + '/../utils/logger'
winston         = require 'winston'


module.exports = (app) ->

  urlencodedParser = bodyParser.urlencoded(extended: true)

  home = require controller_path + '/home'

  app.get '/', urlencodedParser, home.index
  app.post '/subscribe', bodyParser.json(), home.subscribe