settings  = require __dirname + '/../settings'
logger    = require __dirname + '/../utils/logger'
mailchimp = require 'mailchimp-api'


exports.index = (req, res) ->
  res.render 'home', {}

exports.subscribe = (req, res) ->
  apiKey = settings.get("mailchimp:apiKey")
  console.log(req)
  api = new mailchimp.Mailchimp(apiKey)
  data =
    id: settings.get("mailchimp:id"),
    'email':
      'email': req.body.email,
    update_existing: true
  done = (a) -> console.log(a)
  fail = (e) -> console.log(e)
  api.lists.subscribe(data, done, fail)