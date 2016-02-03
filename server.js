var express = require('express');
/*Morgan is another HTTP request logger middleware for Node.js. It simplifies the process of logging requests to your application.
You might think of Morgan as a helper that collects logs from your server, such as your request logs.
It saves developers time because they don’t have to manually create common logs. It standardizes and automatically creates request logs.*/
var morgan = require('morgan');
var mongoose = require('mongoose');
//parses Json or urlencoded files
var bodyParser = require('body-parser');
//ejs-mate is the extension of ejs which helps in creating flexible webpages
var ejs = require('ejs');
var engine = require('ejs-mate');
//session is used to store the user ID in temporary DB
var session = require('express-session');
/*Express flash job is to flush error or success messages depending on logic of ur routes.
Express flash is dependent on another library called cookie parser and express session.
Express.js uses cookies to store a session ID which is an encryption signature*/
/*cookieParser will parse the cookie header and handle cookie seperation and heading may be even decrypt it.cookie will take the session data
,encrypt it and pass to the browser*/
var cookieParser = require('cookie-parser');
var flash = require('express-flash');
//MongoStore DB for storing the session on the server side for login purpose. this is express session
var MongoStore = require('connect-mongo')(session);
var passport = require('passport');

var secret = require('./config/secret');
var User =require('./models/user');
var Category = require('./models/category');

var cartLength = require('./middlewares/middlewares');


var app=express();

mongoose.connect(secret.database,function(err) {
  if(err) {
    console.log(err);
  } else {
    console.log("Connected to the database");
  }
});

//Middleware
//this is used so that express can use static files like css,JS etc
app.use(express.static(__dirname+ '/public'));
app.use(morgan('dev'));
//this means that our express server can now parse JSON data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:true }));
app.use(cookieParser());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: secret.secretKey,
  store: new MongoStore({ url: secret.database, autoReconnect: true})
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
//following middleware helps in giving every routes this user function so that we need not to type it again nd again
app.use(function(req, res, next) {
  res.locals.user = req.user;
  next();
});

app.use(cartLength);
/*Here we are finding for every query<=Category.find({}, function(err, categories)
  res.locals.categories = categories=> Here we are saving it in a local variable called category */
app.use(function(req,res,next){
  Category.find({}, function(err, categories) {
    if(err) return next(err);
    res.locals.categories = categories;
    next();
  });
});

app.engine('ejs',engine);
app.set('view engine','ejs');

var mainRoutes = require('./routes/main');
var userRoutes = require('./routes/user');
var adminRoutes = require('./routes/admin');
var apiRoutes = require('./api/api');

app.use(mainRoutes);
app.use(userRoutes);
app.use(adminRoutes);
app.use('/api',apiRoutes);


app.listen(secret.port,function(err){

  if(err) throw err;
  console.log("Server is running on port " + secret.port);
});
