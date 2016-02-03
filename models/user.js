var mongoose = require('mongoose');
//bcrypt is a library to hash password before you even save it
var bcrypt = require('bcryptjs');
var crypto = require('crypto');
var Schema = mongoose.Schema;


/*The User Schema attributes/characteristics /fields*/
var UserSchema = new Schema({
  email: {type:String,unique:true,lowercase:true},
  password: String,

  facebook: String,
  tokens: Array,

  profile:{
    name:{type:String,default:''},
    picture:{type:String,default:''}
  },
  address:String,
  //to save the history of purchase details
  history:[{
    paid:{type:Number,default:0},
    item:{ type: Schema.Types.ObjectId, ref:'Product'}
  }]
});

/* Hash the password before we even save it to the database*/
//pre is one of the mongoose method that every schema must have.It's like Pre save the password before you actually save it to the database
UserSchema.pre('save',function(next){
  //this refers to the UserSchema
  var user = this;
  //if user has not modified his passowrd then return a callback (next()) with no parameter
  if(!user.isModified('password')) return next();
  //genSalt will create random data and then you pass it to a function
  bcrypt.genSalt(10,function(err,salt){
//if there is an error in the password then return a callback with an Error
    if(err) return next(err);
    //pass user password,10 random data and the 3rd parameter is just used for progress.This all are passed for hashing the password
    bcrypt.hash(user.password, salt, function(err, hash) {
    //bcrypt.hash(user.password,salt,null,function(err,hash){
      if(err) return next(err);
      //user passowrd is equal to hashed data and then return the callback next()
      user.password = hash;
      next();
    });
  });
});


/* compare password in the database and the one that user type in*/
//We are creating our own custom method. so we need to write methods in order to define it. Then we passed user typed password as an argument insid eit
UserSchema.methods.comparePassword = function(password){
  //this.password is the password in DB
  return bcrypt.compareSync(password,this.password);
}

//for adding profile image

UserSchema.methods.gravatar = function(size) {
  //if size of image not mentioned then make it 200px
  if (!this.size) size = 200;
  //if email is not correct then return random image but if correct then hash the image and return it
  if (!this.email) return 'https://gravatar.com/avatar/?s' + size + '&d=retro';
  var md5 = crypto.createHash('md5').update(this.email).digest('hex');
  return 'https://gravatar.com/avatar/' + md5 + '?s=' + size + '&d=retro';
}

module.exports = mongoose.model('User',UserSchema);
