var test = require('tap').test
var testCommon = require('abstract-leveldown/testCommon')
var ckanDOWN = require('./')

// require('abstract-leveldown/abstract/open-test').args(ckanDOWN, test, testCommon)
// require('abstract-leveldown/abstract/open-test').open(ckanDOWN, test, testCommon)
// 
// require('abstract-leveldown/abstract/put-test').all(ckanDOWN, test, testCommon)

var smalltest = ckanDOWN('http://demo.ckan.org')

smalltest.put('test', 'blub', function (err) {
  console.error(err)
  console.log('done')
})