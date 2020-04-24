const {validationResult} = require('express-validator/check')
const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.signup =(req,res,next) =>{
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new Error('validation failed')
    error.statusCode = 422;
    throw error;
  }
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;
  bcrypt.hash(password, 12).
  then(hashedPassword =>{
    const user = new User({
      email,
      password: hashedPassword,
      name,
    })
    return user.save();
  })
  .then(result =>{
    res.status(200).json({message:'user Created',userId:result._id})
  })
  .catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}
exports.login =(req,res,next) =>{
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({email:email}).then(user=>{
    if(!user){
      const error = new Error('A user with this email cannot be found')
      error.statusCode = 401;
        throw error;
    }
    loadedUser= user;
    bcrypt.compare(password,user.Password)
    .then(isEqual =>{
      if(!isEqual){
        const error = new Error('Wrong Password')
        error.statusCode = 401;
        throw error;
      }
    })
  }).catch(err => {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  })
}