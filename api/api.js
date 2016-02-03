var router = require('express').Router();
var async = require('async');
var faker = require('faker');
var Category = require('../models/category');
var Product = require('../models/product');

router.post('/search', function(req,res,next) {
  console.log(req.body.search_term);
  Product.search({
    query_string: { query: req.body.search_term }
  }, function(err, results) {
    if (err) return next(err);
    res.json(results);
  });
});



/* /:name=>first we are seraching for category based on the category we typed in the url*/
router.get('/:name', function(req,res,next) {

  async.waterfall([
    function(callback) {
      //Hre we're finding the category in the Db
      Category.findOne({ name: req.params.name }, function(err,category) {
        if (err) return next(err);
        callback(null,category);
      });
    },
    // After finding the category it's pass to th efor loop
    function(category,callback) {
      for (var i=0;i<30;i++) {
        var product = new Product();
        product.category = category._id;
        product.name = faker.commerce.productName();
        product.price = faker.commerce.price();
        product.image = faker.image.image();

        product.save();
      }
    }
  ]);
  res.json({ message: 'Success'});
});

module.exports = router;
