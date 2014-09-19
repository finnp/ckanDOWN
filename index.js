var util = require('util')
var request = require('request')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN
var ckanIterator = require('./iterator')
var sql = require('pg-escape')
var qs = require('querystring')

function ckanDOWN (location) {
  if(!(this instanceof ckanDOWN)) return new ckanDOWN(location)
  AbstractLevelDOWN.call(this, location)
  var parts = this.location.split('?')
  this.location = parts[0]
  // remove / in the end
  if(this.location[this.location.length-1] === '/')
    this.location = this.location.slice(0,-1)
  // opts
  var opts = qs.parse(parts[1])
  this.resourceID = opts.resource // e.g '37e5da24-90d5-4e57-b900-df6dd960c38d'
  this.apikey = opts.apikey // e.g. 'cc03492e-11b2-4ff5-aa81-148e6bb3da18'
}

util.inherits(ckanDOWN, AbstractLevelDOWN)

ckanDOWN.prototype._open = function (options, callback) {
  // open connection to CKAN?
  // set the correct layout for the resource
  request({
    url: this.location + '/api/3/action/datastore_create',
    headers: {
      'content-type': 'application/json',
      'Authorization': this.apikey
    },
    method: 'POST',
    
    json: {
      force: 'True',
      resource_id: this.resourceID,
      fields: [
        {
          id: 'key',
          type: 'text'
        },
        {
          id: 'value',
          type: 'text'
        }
      ],
      primary_key: 'key'
    }
  }, function (err, response, body) {
    if(err) return callback(err)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    callback()
  })
}

ckanDOWN.prototype._put = function (key, value, options, callback) {
  // upsert
  //http://docs.ckan.org/en/latest/maintaining/datastore.html#ckanext.datastore.logic.action.datastore_upsert
  //http://{YOUR-CKAN-INSTALLATION}/api/3/action/datastore_upsert
  var url = this.location + '/api/3/action/datastore_upsert'
  var params = {
    resource_id: this.resourceID,
    records: [{
      key: key.toString(),
      value: value.toString()
    }],
    force: 'True', // is there another way?
    method: 'upsert' // for 'upsert' i need to set a key
  }
  request({
    url: url,
    headers: {
      'content-type': 'application/json',
      'Authorization': this.apikey
    },
    json: params,
    method: 'POST' // or PUT? who knows fuck the documentation
  }, function (err, response, body) {
    if(err) return callback(err)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    callback()
  })
  
  
}

ckanDOWN.prototype._get = function (key, options, callback) {
  //http://{YOUR-CKAN-INSTALLATION}/api/3/action/datastore_search
  var url = this.location + '/api/3/action/datastore_search_sql'
  var sqlQuery = sql('SELECT key, value FROM %I WHERE key = %L', this.resourceID, key.toString())
  request({
    url: url,
    qs: {
      sql: sqlQuery
    }
  }, function (err, response, body) {
    if(err) return callback(err)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    var data = JSON.parse(body)
    if(data.result.records.length === 0) return callback(new Error('NotFound'))
    var result = data.result.records[0].value
    if(options.asBuffer)
      result = new Buffer(result)
    callback(null, result)
  })
  
}

ckanDOWN.prototype._del = function (key, options, callback) {
  // delete
  // debug curl -X POST http://demo.ckan.org/api/3/action/datastore_delete -H "Authorization: cc03492e-11b2-4ff5-aa81-148e6bb3da18" -d '{"resource_id": "37e5da24-90d5-4e57-b900-df6dd960c38d", "filters": {"key": "aberwas"}, "force": "True"}'
  var url = this.location + '/api/3/action/datastore_delete'
  request({
    url: url,
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Authorization': this.apikey
    },
    json: {
      resource_id: this.resourceID,
      force: 'True',
      filters: {
        key: key.toString()
      }
    }
  }, function (err, response, body) {
    if(err) return callback(err)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    callback()
  })

}

ckanDOWN.prototype._batch = function (array, options, callback) {
  if(array.length === 0) return callback()
  
  var next = function next (err) {
    if(err) return callback(err)
    if(array.length > 0)
      this._batch(array.slice(1), options, callback)
    else 
      callback()  
  }.bind(this)
  
  var current = array.slice(0,1)[0] // no shift, do not modify input array
  if(current.type === 'del') {
    this.del(current.key, options, next)
  } else if(current.type == 'put') {
    if(!('value' in current) || current.value === null)
        current.value = ''
    this.put(current.key, current.value, options, next)
  }
}

ckanDOWN.prototype._iterator = function (options) {
  return new ckanIterator(this, options)
}

module.exports = ckanDOWN
