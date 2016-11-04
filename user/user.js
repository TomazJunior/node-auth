var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var moment = require('moment');
var constants = require('../util/constants');

var UserSchema = new mongoose.Schema({
  email: {type:String, required: [true, 'email is required'], unique: true},
  password: {type:String, required: [true, 'password is required'], select: false},
  verified: {type:Boolean, default: false},
  lastlogin: {type:Date},
  createwhen: {type:Date, default:moment.utc(new Date())},
  attemptsfailure: {type:Number, default:0},
  role: {type:String, default:constants.ROLES.user, validate: {
    validator: function(value) {
      return !!constants.ROLES[value];
    },
    message: '{VALUE} is not a valid role!'
  }}
});

// generate hash
UserSchema.methods.generateHash = function(password) {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
  return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);