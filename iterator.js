var AbstractIterator = require('abstract-leveldown').AbstractIterator
var util = require('util')
var sql = require('pg-escape')
var request = require('request')

function ckanIterator(db, options) {
  AbstractIterator.call(this, db)
  this.url = db.location + '/api/3/action/datastore_search_sql'
  this.sqlQuery = sql('SELECT key, value FROM %I ORDER BY key ASC', db.resourceID)
  this.fetched = []
  this.fetchedAll = false
}

util.inherits(ckanIterator, AbstractIterator)

ckanIterator.prototype._fetch = function (callback) {  
  request({
    url: this.url,
    qs: {
      sql: this.sqlQuery
    }
  }, function (err, response, body) {
    if(err) return callback(err)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    var data = JSON.parse(body)
    if(data.result.records.length === 0) return callback(new Error('NotFound'))
    this.fetched = this.fetched.concat(data.result.records)
    this.fetchedAll = true // does this API use/allow pagination?
    callback(null)
  }.bind(this))

}

ckanIterator.prototype._next = function (callback) {
  // fetch first
  var self = this
  if(!this.fetchedAll) {
    this._fetch(function (err) {
      if(err) return callback(err)
      self._next(callback)
    })
  } else {
    if(this.fetched.length === 0) return callback()
    var current = this.fetched.shift()
    callback(null, new Buffer(current.key), new Buffer(current.value))
  }
  
}

module.exports = ckanIterator