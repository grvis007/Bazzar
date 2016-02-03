module.exports = {

  database:'mongodb://grvis007:love9548@ds047345.mongolab.com:47345/bazzar',
  port:3000,
  secretKey:"Gaurav@$@",
 //process.env. = used for global world

  facebook: {
    clientID: process.env.FACEBOOK_ID ||'502525446598393',
    clientSecret: process.env.FACEBOOK_SECRET || 'ae0edab8af67e8fd43ef21de426cd169',
    profileField: ['emails', 'displayName'],
    callbackURL:'http://localhost:3000/auth/facebook/callback'
  }
}
