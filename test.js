// var test = require('tap').test
// var testCommon = require('abstract-leveldown/testCommon')
var ckanDOWN = require('./')

// require('abstract-leveldown/abstract/open-test').args(ckanDOWN, test, testCommon)
// require('abstract-leveldown/abstract/open-test').open(ckanDOWN, test, testCommon)
// 
// require('abstract-leveldown/abstract/put-test').all(ckanDOWN, test, testCommon)

var smalltest = ckanDOWN('http://demo.ckan.org')

// smalltest.create(function () {
//   console.log('done')
// })
// 
// 
smalltest.put('aberwas', 'blub', function (err) {
  smalltest.get('aberwas',function (err, value) {
    if(err) console.error(err)
    console.log(value)
    smalltest.del('aberwas', function (err) {
      if(err) console.error(err)
      console.log('deleted')
    })
  })
})

// smalltest.del('aberwas', function (err) {
//   if(err) console.error(err)
//   console.log('deleted')
// })
