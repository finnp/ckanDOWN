var util = require('util')
var request = require('request')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN

function ckanDOWN (location) {
  if(!(this instanceof ckanDOWN)) return new ckanDOWN(location)
  AbstractLevelDOWN.call(this, location)
  this.resourceID = '37e5da24-90d5-4e57-b900-df6dd960c38d'
  this.apikey = 'cc03492e-11b2-4ff5-aa81-148e6bb3da18'
  this.headers = {
    'content-type': 'application/json',
    'Authorization': this.apikey
  }
}

util.inherits(ckanDOWN, AbstractLevelDOWN)

ckanDOWN.prototype._open = function (options, callback) {
  // open connection to CKAN?
  // set the correct layout for the resource
  request({
    url: this.location + '/api/3/action/datastore_create',
    headers: this.headers,
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
      key: key,
      value: value
    }],
    force: 'True', // is there another way?
    method: 'upsert' // for 'upsert' i need to set a key
  }
  request({
    url: url,
    headers: this.headers,
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
  var sqlQuery = 'SELECT key, value FROM "' + this.resourceID + '" WHERE key = \'' + key + '\''
  request({
    url: url,
    qs: {
      sql: sqlQuery
    }
  }, function (err, response, body) {
    if(err) return callback(err)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    var data = JSON.parse(body)
    if(data.result.records.length === 0) return callback(new Error('Not Found'))
    callback(null, data.result.records[0].value)
  })
  
}

ckanDOWN.prototype._del = function (key, options, callback) {
  // delete
  // debug curl -X POST http://demo.ckan.org/api/3/action/datastore_delete -H "Authorization: cc03492e-11b2-4ff5-aa81-148e6bb3da18" -d '{"resource_id": "37e5da24-90d5-4e57-b900-df6dd960c38d", "filters": {"key": "aberwas"}, "force": "True"}'
  var url = this.location + '/api/3/action/datastore_delete'
  console.log(this.headers)
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
        key: key
      }
    }
  }, function (err, response, body) {
    if(err) return callback(err)
    console.log(body)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    callback()
  })

}

ckanDOWN.prototype._ckancall = function (resource) {
  var url = this.location = this.location + '/api/3/action/' + resource
  
  
  //datastore_upsert
}



module.exports = ckanDOWN


