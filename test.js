var test = require('tape')
var testCommon = require('abstract-leveldown/testCommon')
var ckanDOWN = require('./')

testCommon.location = function () {
  return 'http://demo.ckan.org/?resource=37e5da24-90d5-4e57-b900-df6dd960c38d&apikey=cc03492e-11b2-4ff5-aa81-148e6bb3da18'
}

require('abstract-leveldown/abstract/open-test').args(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/open-test').open(ckanDOWN, test, testCommon)
 
require('abstract-leveldown/abstract/put-test').all(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/get-test').all(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/del-test').all(ckanDOWN, test, testCommon)
require('abstract-leveldown/abstract/put-get-del-test').all(ckanDOWN, test, testCommon, new Buffer('testbuffer'))

require('abstract-leveldown/abstract/batch-test').all(ckanDOWN, test, testCommon)

// require('abstract-leveldown/abstract/iterator-test').all(ckanDOWN, test, testCommon)