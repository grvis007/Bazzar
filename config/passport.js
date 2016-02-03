/*if you want to use passport library in one of our route which is login we have to configure it first.
you can think of it as setting up a new rule in config file.It's a middleware*/

var passport = require('passport');
//Local strategy is a part of passport lib which is created for the sake of local login
var LocalStrategy = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var secret = require('../config/secret');
var User = require('../models/user');

//serialize and deserialize

/*Serialization is the process of translating data structures or object state into a format that can be stored.
Here we wanna translate data structures which is user and we wanna translate it into a format that can be stored in connect mongo which is our temp. DB */
passport.serializeUser(function(user,done){
  //user._id is created by default in mongoDB
  done(null,user._id);
});
//Here id is user._id
passport.deserializeUser(function(id,done){
  User.findById(id,function(err,user){
    done(err,user);
  });
});

//middleware

/*local-login is the name of the middleware so that it can be reffered later on in another router.
new LocalStrategy is the new anonynyms object of LocalStrategy where we pass usernameField etc
function(req,email,password,done) in this section we are finding the email which is saved in DB*/
passport.use('local-login', new LocalStrategy({
  usernameField: 'email',
  passwordField: 'password',
  passReqToCallback: true
}, function(req, email, password, done){
  User.findOne({ email: email}, function(err,user){
    if(err) return done(err);

    if(!user) {
      return done(null, false, req.flash('loginMessage','No user has been found'));
    }

    if(!user.comparePassword(password)){
      return done(null, false, req.flash('loginMessage','Oops! Wrong Password pal'));
    }

    return done(null,user);
  });
}));

passport.use(new FacebookStrategy(secret.facebook, function(token, refreshToken, profile, done) {
  User.findOne({ facebook: profile.id }, function(err, user) {
    if(err) return done(err);

    if(user) {
      return done(null, user);
    } else {
      var newUser = new User();
      newUser.email = profile._json.email;
      newUser.facebook = profile.id;
      newUser.tokens.push({kind: 'facebook', token: token});
      newUser.profile.name = profile.displayName;
      newUser.profile.picture = 'https://graph.facebook.com/' + profile.id +'/picture?type=large';

      newUser.save(function(err) {
        if (err) throw err;

        return done(null,newUser);
      });
    }
  });
}));

//custom function to validate

exports.isAuthenticated = function(req, res, next) {
  if(req.isAuthenticated()) {
    //if req is Authenticated pass to next page else redirect to login page
    return next();
  }
  res.redirect('/login');
}
