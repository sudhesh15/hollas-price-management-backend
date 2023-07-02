const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const CategorySchema = new Schema({
  categoryName:String,
  author:{type:Schema.Types.ObjectId, ref:'User'},
}, {
  timestamps: true,
});

const CategoryModel = model('Category', CategorySchema);

module.exports = CategoryModel;