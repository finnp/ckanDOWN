var test = require('tape')
var testCommon = require('abstract-leveldown/testCommon')
var ckanDOWN = require('./')
var request = require('request')

var apikey = 'cc03492e-11b2-4ff5-aa81-148e6bb3da18'


// TODO: Automatic creation of the test resource
testCommon._resources = 
  [
    '4363f707-2796-4882-9e2d-63eb77259740',
    'd65cd314-d7dd-4aaa-995b-907f9169f0d2',
    'af2899f3-3df5-4764-90d4-d4682ca45a9e',
    '9bfc7ea8-f9f2-4a19-a4bd-0a86c43a45bb',
    '48438294-16d1-4ac4-87c1-0c73defcf0a5'
  ]
  
testCommon._locationid = 0

testCommon._resource = function () {
  if(!(this._locationid in this._resources)) this._locationid = 0
  return this._resources[this._locationid]
}

testCommon.location = function () {
  var resource = this._resource()
  this._locationid++
  return 'http://demo.ckan.org/?resource=' + resource + '&apikey=' + apikey
}

testCommon.cleanup = function (callback) {
  var countdown = this._resources.length
  this._resources.forEach(function (resource) {
    request({
      url: 'http://demo.ckan.org/api/3/action/datastore_delete',
      headers: {
        'content-type': 'application/json',
        'Authorization': apikey
      },
      method: 'POST',
      json: {
        'resource_id': resource,
        'force': true,
        'filters': {}
        }
    }, function (err, response, body) {
      if(err) throw err
      countdown--
      if(countdown === 0)
        callback()
    })
  })
}

testCommon.cleanup(function () {
  // not compatible with snapshot
  require('abstract-leveldown/abstract/iterator-test').setUp(ckanDOWN, test, testCommon)
  require('abstract-leveldown/abstract/iterator-test').args(test)
  require('abstract-leveldown/abstract/iterator-test').sequence(test)
  require('abstract-leveldown/abstract/iterator-test').iterator(ckanDOWN, test, testCommon, testCommon.collectEntries)
  require('abstract-leveldown/abstract/iterator-test').tearDown(test, testCommon)

  require('abstract-leveldown/abstract/open-test').args(ckanDOWN, test, testCommon)
  require('abstract-leveldown/abstract/open-test').open(ckanDOWN, test, testCommon)
   
  require('abstract-leveldown/abstract/put-test').all(ckanDOWN, test, testCommon)
  require('abstract-leveldown/abstract/get-test').all(ckanDOWN, test, testCommon)
  require('abstract-leveldown/abstract/del-test').all(ckanDOWN, test, testCommon)
  require('abstract-leveldown/abstract/put-get-del-test').all(ckanDOWN, test, testCommon, new Buffer('testbuffer'))

  require('abstract-leveldown/abstract/batch-test').all(ckanDOWN, test, testCommon)
})

