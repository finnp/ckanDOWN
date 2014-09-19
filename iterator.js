var AbstractIterator = require('abstract-leveldown').AbstractIterator
var util = require('util')
var sql = require('pg-escape')
var request = require('request')

function ckanIterator(db, options) {
  AbstractIterator.call(this, db)
  
  if(options.keyAsBuffer === false) this._keyAsBuffer = false
  else this._keyAsBuffer = true
  if(options.valueAsBuffer === false) this._valueAsBuffer = false
  else this._valueAsBuffer = true
    
  this.url = db.location + '/api/3/action/datastore_search_sql'
  var order = this.reverse ? 'DESC' : 'ASC'
  
  var start = options.start
  var end = options.end
  
  var query = ['SELECT key, value FROM %I']
  var queryValues = [db.resourceID]
  
  if (options.reverse) {
      if (start && end){
        query.push('WHERE key <= %L AND key >= %L')
        queryValues.push(start, end)
      } else if (start) {
        query.push('WHERE key <= %L')
        queryValues.push(start)
      } 
      else if (end) {
        query.push('WHERE key >= %L')
        queryValues.push(end)
      }
      query.push('ORDER BY key DESC')
    } else {
      if (start && end) {
        query.push('WHERE key >= %L AND key <= %L')
        queryValues.push(start, end)
      } else if (start) {
        query.push('WHERE key >= %L')
        queryValues.push(start)
      } else if (end) {
        query.push('WHERE key <= %L')
        queryValues.push(end)  
      }
      query.push('ORDER BY key ASC')
    }
    
  if ((options.limit && options.limit !== -1) || options.limit === 0) {
    query.push('LIMIT ' + options.limit)
  }
  
  this.sqlQuery = sql.apply(null, [query.join(' ')].concat(queryValues))
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
    if(this._keyAsBuffer) current.key = new Buffer(current.key)
    if(this._valueAsBuffer) current.value = new Buffer(current.value)
    callback(null, current.key, current.value)
  }
  
}

module.exports = ckanIterator