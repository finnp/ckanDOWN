# ckanDOWN

Experiment for using CKAN DataStore as levelDOWN drop-in replacement.
It passes a subset (see test.js) of the [abstract-leveldown](https://github.com/rvagg/abstract-leveldown)
test suite.

## Example

```js
var location = 'http://demo.ckan.org/?resource={resource-id}&apikey={apikey}'

var db = ckanDOWN(location)
db.open(function () {
  // open makes sure your resource has the right format
  db.put('serious', 'data', function (err) {
    db.get('serious', function (err, value) {
      console.log(value)
      db.del('serious', function (err) {
        console.log('deleted')
      })
    })
  })
})

```