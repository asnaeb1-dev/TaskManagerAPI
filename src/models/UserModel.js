const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const Task = require('./TaskModel')
//----------USER MODEL-----------
// //User here is the user model, which means that all the documents of the user will follow the same structure

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Enter a valid email')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 8,
        validate(value) {
            if (value === 'password') {
                throw new Error('Seriously? Please try again.')
            }
        }
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
   
    age: {
        type: Number,
        required: false,
        default: 1,
        trim: true,
        validate(value) {
            if (value < 0) {
                throw new Error('No negative values allowed')
            }
        }
    },
    //this stores images to database(store image binary data)
    avatar:{
        type: Buffer
    },
    //We should keep a track of all the tokens being generated otherwise the user will never be able to log out
    //Below is the model to store an array of tokens which consist of individual token.
    tokens: [{
            token :{
                type : String,
                required: true
            }
        }]
    },
    
    //this will generate 2 more fields in the database, CREATED AT and UPDATED AT
    {
        timestamps : true
    });
 //virtual attritube which actually doenst exist in the databse 
 //helps in establishing a relationship between models/collections
userSchema.virtual('tasks', {
    ref : 'TASK',
    localField:'_id',
    foreignField:'ownerid'
})



//NOTE: "pre" won't work for UPDATE function so restructuring required because some mongoose operations bypass these

//this is very important
userSchema.pre('save', async function(next){
    //we dont want to hash the password everytime there is an update but only when the password field is updated!
    //mongooose provides 'isModified()' function which 
    if(this.isModified('password')){
        this.password = await bcrypt.hash(this.password, 8)
    }
    //next function is very imprtnt since it will help the control move to the next line otherwise the control will be hung!
    next();
})

//Delete user tasks when user is deleted
userSchema.pre('remove', async function(next){
    await Task.deleteMany({ ownerid: this._id})
    next();
})

userSchema.methods.generateAuthToken = async function(){
    //we will generate a token
    //the sign function takes in a unique identifier(_id here)
    const token = await jwt.sign({_id: this._id.toString()}, process.env.SECRET)
    this.tokens.push({token});
    await this.save();
    return token;
}

//methods are used when we want functins on instances of mdel
userSchema.methods.getPublicProfile = function(){
    const userObj = this.toObject();

    delete userObj.password;
    delete userObj.tokens;
    //this will try to return the avatar which will slow down thr whole process
    //therefore ist better to remove it by using 'delete'
    delete userObj.avatar;

    return userObj;
}

//statics are used when we want functions on models as a whole
userSchema.statics.findUserByCredentials = async function(email, password){
    //get an user by email address
    const user = await User.findOne({ email: email})
    //now check the user exists
    if(!user){
        throw new Error('Email does not exist');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        throw new Error('Username or password is incorrect')
    }
    return user;
} 

const User = mongoose.model("USER", userSchema);

module.exports = User;

//NOTE: userSchema is the model structure
// User contains the referene to the database`

