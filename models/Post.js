const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const PostSchema = new Schema({
  productName:String,
  productCode:String,
  productMrp:String,
  productNlc:String,
  productHtcBp:String,
  brandName:String,
  categoryName:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const PostModel = model('Post', PostSchema);

module.exports = PostModel;