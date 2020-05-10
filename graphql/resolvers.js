const bcrypt = require('bcryptjs');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = {
  createUser: async function({ userInput }, req) {
    //   const email = args.userInput.email;
    const errors = [];
    const existingUser = await User.findOne({ email: userInput.email });
    if(!validator.isEmail(userInput.email)){
        errors.push({message:'Email is invalid'});
    }
    if (
			validator.isEmpty(userInput.password) ||
			!validator.isLength(userInput.password, { min: 5 })
		) {
			errors.push({ message: "Password too Short" });
		}
    if(errors.length > 0 ){
      const error =  new Error('Invalid Input.');
      error.data = errors;
      error.code = 422;
      throw error;
    }
    if (existingUser) {
      const error = new Error('User exists already!');
      throw error;
    }
    const hashedPw = await bcrypt.hash(userInput.password, 12);
    const user = new User({
      email: userInput.email,
      name: userInput.name,
      password: hashedPw
    });
    const createdUser = await user.save();
    return { ...createdUser._doc, _id: createdUser._id.toString() };
  },
  login: async function({email, password}) {
    const user = await User.findOne({email});
    if(!user){
      const error = new Error('User not Found');
      error.code = 401;
      throw error;
    } 
    const isEqual = await bcrypt.compare(password, user.password);
    if(!isEqual){
      const error = new Error('Wrong Password');
      error.code = 401;
      throw error;
    }
    const token =  jwt.sign({
      userId: user._id.toString(),
      email: user.email

    },'supersecretsecret',
    {expiresIn:'1hr'}
    );
    return { token, userId: user._id.toString() };
  }
};
