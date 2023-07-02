const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  firstName : {type: String, required: true},
  lastName : {type: String, required: true},
  dateOfBirth : {type: Date, required: true},
  username : {type: String, required: true, min: 4, unique: true}, 
  password : {type: String, required: true},
  type : {type: String, required: true}
},
{
  timestamps: true
});

const userModel = mongoose.model('User',UserSchema);
module.exports = userModel;