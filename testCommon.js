// TODO: Automatic creation of the test resource
var request = require('request')
var apikey = 'cc03492e-11b2-4ff5-aa81-148e6bb3da18'

var testCommon = {}

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

testCommon.setUp = function (t) {
      testCommon.cleanup(function (err) {
        t.notOk(err, 'cleanup returned an error')
        t.end()
      })
    }

testCommon.tearDown = function (t) {
      testCommon.setUp(t) 
    }

testCommon.collectEntries = function (iterator, callback) {
      var data = []
        , next = function () {
            iterator.next(function (err, key, value) {
              if (err) return callback(err)
              if (!arguments.length) {
                return iterator.end(function (err) {
                  callback(err, data)
                })
              }
              data.push({ key: key, value: value })
              process.nextTick(next)
            })
          }
      next()
    }
    
module.exports = testCommon