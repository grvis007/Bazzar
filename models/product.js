var mongoose = require('mongoose');
//mongoosastic is a libraray that uses elastic search to replicate the data from elastic search
var mongoosastic = require('mongoosastic');
var Schema = mongoose.Schema;


var ProductSchema = new Schema({
  category: { type: Schema.Types.ObjectId, ref: 'Category'},
  name: String,
  price: Number,
  image: String

});
//mongoosastic runs on 9200
ProductSchema.plugin(mongoosastic, {
  hosts: [
    'localhost:9200'
  ]
});

module.exports = mongoose.model('Product',ProductSchema);
