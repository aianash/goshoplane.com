express       = require 'express'
passport      = require 'passport'
compress      = require 'compression'
errorHandler  = require 'errorhandler'
morgan        = require 'morgan'
bodyParser    = require 'body-parser'
methodOverride = require 'method-override'
favicon         = require 'serve-favicon'

settings      = require __dirname + '/settings'
logger        = require __dirname + '/utils/logger'
winston       = require 'winston'


env = settings.get('NODE_ENV')
port = settings.get('server:port')
host = settings.get('server:host')

app = express()
app.settings.env = env

jsonParser = bodyParser.json()
urlencodedParser = bodyParser.urlencoded(extended: true)

app.set 'showStackError', true
app.set 'views',          __dirname + '/views'
app.set 'view engine',    'jade'
app.set 'showStackError', true

app.enable 'case sensitive routing'
app.enable 'strict routing'

app.use compress()
app.use methodOverride()
app.use morgan('combined')
app.use errorHandler()

app.locals.title = 'Shoplane'


app.engine 'jade', require('jade').__express
app.use favicon(__dirname + '/styles/favicon.ico')
# app.use express.static(__dirname + '/home',    maxAge: 31557600000)


app.use '/fonts', express.static(__dirname + '/fonts')
app.use '/styles', express.static(__dirname + '/styles')
app.use '/images', express.static(__dirname + '/images')


# Add api routes file name from the routes directory
# [only those that needs authentication]
apiRoutes = ['home']

for route in apiRoutes
  require(__dirname + "/routes/#{route}")(app)


server = app.listen port, host, ->
  host = server.address().address
  port = server.address().port

  logger.log 'info', 'Server started ...', {port: port, host: host}