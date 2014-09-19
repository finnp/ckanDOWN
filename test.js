var test = require('tape')
var testCommon = require('./testCommon')
var ckanDOWN = require('./')

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

