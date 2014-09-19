var test = require('tape')
var testCommon = require('abstract-leveldown/testCommon')
var ckanDOWN = require('./')
var request = require('request')

var apikey = 'cc03492e-11b2-4ff5-aa81-148e6bb3da18'
// TODO: Automatic creation of the test resource
var testresource = '4363f707-2796-4882-9e2d-63eb77259740'

testCommon.location = function () {
  return 'http://demo.ckan.org/?resource=' + testresource + '&apikey=' + apikey
}

testCommon.cleanup = function (callback) {
  request({
    url: 'http://demo.ckan.org/api/3/action/datastore_delete',
    headers: {
      'content-type': 'application/json',
      'Authorization': apikey
    },
    method: 'POST',
    json: {
      'resource_id': testresource,
      'force': true,
      'filters': {}
      }
  }, function (err, response, body) {
    if(err) throw err
    callback()
  })
}

require('abstract-leveldown/abstract/open-test').args(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/open-test').open(ckanDOWN, test, testCommon)
 
require('abstract-leveldown/abstract/put-test').all(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/get-test').all(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/del-test').all(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(ckanDOWN, test, testCommon, new Buffer('testbuffer'))

require('abstract-leveldown/abstract/batch-test').all(ckanDOWN, test, testCommon)

// require('abstract-leveldown/abstract/iterator-test').all(ckanDOWN, test, testCommon)