var util = require('util')
var request = require('request')
var AbstractLevelDOWN = require('abstract-leveldown').AbstractLevelDOWN

function ckanDOWN (location) {
  if(!(this instanceof ckanDOWN)) return new ckanDOWN(location)
  AbstractLevelDOWN.call(this, location)
  this.resourceID = 'caf5eb36-27f7-42df-8b7a-beda9efafc59'
  this.apikey = 'cc03492e-11b2-4ff5-aa81-148e6bb3da18'
}

util.inherits(ckanDOWN, AbstractLevelDOWN)

ckanDOWN.prototype._open = function (options, callback) {
  // open connection to CKAN?
  // datestore_create?
  //http://{YOUR-CKAN-INSTALLATION}/api/3/action/datastore_create
  callback()
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
    method: 'insert' // for 'upsert' i need to set a key
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
    console.error(body)
    if(response.statusCode !== 200) return callback(new Error('StatusCode ' + response.statusCode))
    callback()
  })
  
  
}

ckanDOWN.prototype._get = function (key, options, callback) {
  //http://{YOUR-CKAN-INSTALLATION}/api/3/action/datastore_search
  var url = this.location + '/api/3/action/datastore_search'
  request({
    url: url,
    qs: {
      resource_id: this.resourceID,
      q: {
        key: key
      }
    }
  }, callback)
  
}

ckanDOWN.prototype._del = function (key, options, callback) {
  // delete
  var url = this.location + '/api/3/action/datastore_delete'
  request({
    url: url,
    json: {
      resource_id: this.resourceID
    }
  }, callback)
}

ckanDOWN.prototype._ckancall = function (resource) {
  var url = this.location = this.location + '/api/3/action/' + resource
  
  
  //datastore_upsert
}

module.exports = ckanDOWN