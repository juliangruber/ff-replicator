/**
 * module dependencies
 */

var shoe = require('shoe')
var express = require('express')
var fs = require('fs')
var Model = require('scuttlebutt/model')

/**
 * webapp
 */

var app = express()
app.use(express.static(__dirname + '/static'))

/**
 * replication & server
 */

var model = new Model()

shoe(function (stream) {
  var ms = model.createStream()
  stream.pipe(ms).pipe(stream)
}).install(app.listen(3001), '/sock')

console.log('server listening on port ' + 3001)