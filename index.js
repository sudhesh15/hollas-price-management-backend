const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const Post = require('./models/Post');
const Brand = require('./models/Brand');
const Category = require('./models/Category');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const fs = require('fs');
const { ObjectId } = require('mongodb');
require('dotenv').config()
const PORT = process.env.PORT || 4000;
const BASE_URL = process.env.BASE_URL;
const MONGO_URL = process.env.MONGO_URL;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'https://hollas-price-portal.netlify.app');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

const salt = bcrypt.genSaltSync(10);
const secret = "aszxde12we0dsjm3";

app.use(cors({credentials:true, origin: `${BASE_URL}`}));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads', express.static(__dirname + '/uploads'));

mongoose.connect(`${MONGO_URL}`);

let ifLoggedIn = false;

app.post('/register', async (req,res)=>{
  const {firstName, lastName, dateOfBirth, username, password} = req.body;
  try{
    const userDoc = await User.create({firstName, lastName, dateOfBirth, username, password:bcrypt.hashSync(password, salt), type: "user"});
    res.json(userDoc);
  }catch(err){
    res.status(400).json(err);
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const userDoc = await User.findOne({ username });
  const result = bcrypt.compareSync(password, userDoc.password);
  if (result) {
    jwt.sign({ username, id: userDoc._id }, secret, {}, (err, token) => {
      if (err) throw err;
      res.cookie('token', token, { httpOnly: true }).json({
        id: userDoc._id,
        username,
      });
      ifLoggedIn = true;
      console.log("token===>", token);
    });
  } else {
    res.status(400).json('wrong credentials');
  }
});

app.post('/logout', (req, res) => {
  ifLoggedIn = false;
  res.clearCookie('token');
  res.status(200).json('Logged out successfully');
});

app.post('/post', async (req,res) => {
  if(ifLoggedIn){
    const {productName,productCode,productMrp,productNlc,productHtcBp,brandName,categoryName} = req.body;
    const postDoc = await Post.create({
      productName,
      productCode,
      productMrp,
      productNlc,
      productHtcBp,
      brandName,
      categoryName,
    });
    res.json(postDoc);
  }
});

app.put('/post', upload.single('file'), async (req,res) => {
  if(ifLoggedIn){
    await Post.findByIdAndUpdate(req.body.id, {
      productName : req.body.productName,
      productCode : req.body.productCode,
      productMrp : req.body.productMrp,
      productNlc : req.body.productNlc,
      productHtcBp : req.body.productHtcBp,
      brandName : req.body.brandName,
      categoryName : req.body.categoryName,
    });
    displayAlertMessage(res, 'Product updated successfully!');
  }
});

function displayAlertMessage(res, message) {
  const html = `
    <script>
      window.location.href = '/';
    </script>
  `;
  res.send(html);
}

app.delete('/deleteProduct/:id', async (req, res) => {
  if(ifLoggedIn){
    const productId = req.params.id;
    try {
      const result = await Post.deleteOne({ _id: new ObjectId(productId) });
      if (result.deletedCount > 0) {
        res.status(200).json({ message: 'Product deleted successfully' });
      } else {
        res.status(404).json({ error: 'Product not found' });
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      res.status(500).json({ error: 'Failed to delete the product' });
    }
    }
});

app.get('/getProductOnBrandAndCategory', async (req,res) => {
  if(ifLoggedIn){
    res.json(
      await Post.find()
        .populate('productName')
        .sort({brandName: 1})
    );
  }
});

app.get('/category', async (req,res) => {
  if(ifLoggedIn){
    res.json(
      await Category.find()
        .populate('categoryName')
        .sort({categoryName: 1})
        .limit(100)
    );
  }
});

app.get('/brand', async (req,res) => {
  if(ifLoggedIn){
    res.json(
      await Brand.find()
        .populate('brandName')
        .sort({brandName: 1})
        .limit(100)
    );
  }
});

app.get('/product/:id', async (req, res) => {
  if(ifLoggedIn){
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('categoryName');
    res.json(postDoc);
  }
});

app.get('/category/:category', async (req, res) => {
  if(ifLoggedIn){
    const {category} = req.params;
    let categoryName = category;
    const getPostOnCategory = await Post.find({categoryName}).sort({brandName: 1});
    res.json(getPostOnCategory);
  }
});

app.get('/brand/:brand', async (req, res) => {
  if(ifLoggedIn){
    const {brand} = req.params;
    let brandName = brand;
    const getPostOnBrand = await Post.find({brandName}).sort({categoryName: 1});
    res.json(getPostOnBrand);
  }
});

app.post('/createBrand', upload.single('file'), async (req, res) => {
  console.log("ifLoggedIn==>", ifLoggedIn)
  if(ifLoggedIn){
    try {
      const { brandName } = req.body;
      const postDoc = await Brand.create({
        brandName,
      });
      res.json(postDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create brand' });
    }
  }
});

app.post('/createCategory', upload.single('file'), async (req, res) => {
  if(ifLoggedIn){
    try {
      const { categoryName } = req.body;
      const postDoc = await Category.create({
        categoryName,
      });
      res.json(postDoc);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  } 
});

app.listen(PORT);