const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const BrandSchema = new Schema({
  brandName:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const BrandModel = model('Brand', BrandSchema);

module.exports = BrandModel;