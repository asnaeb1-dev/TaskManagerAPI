const express = require('express');
const multer = require('multer');

const User = require('./../models/UserModel');
const {sendWelcomeEmail, sendCancellationMail} = require('./../emails/account')

//what does this do?
//the Auth.js file contains code that will make sure that all the operations that was previously being done by any user can only be done by a registered user.
//How will this do it? --> by checking the incoming token and making sure the token exists in the tokens array
const authentication = require('./../middleware/Auth')
const router = new express.Router();

//sign up the user
router.post('/user/signup', async(request, response) => {
    const user = new User(request.body);
    try{
        await user.save()
        sendWelcomeEmail(user.email, user.name)
        const token = await user.generateAuthToken();
        response.status(201).send({user, token, message:"success"})
    }catch(e){
        response.status(400).send(e)
    }
});

// login user 
// here we could manually find all the user and then find a particular user that matches all the credentials which will be long and inefficient.

router.post('/user/login', async function(request, response){
    try{
        const user = await User.findUserByCredentials(request.body.email, request.body.password)
        //userSchema.methods. ..... used in UserModel.js is an instance method and doesnt work on the main object model
        //so token will work on individual instance of the User model
        const token = await user.generateAuthToken();
        response.status(201).send({user: user.getPublicProfile(), token})
    }catch(e){
        console.log(e)
        response.status(404).send('Failed to login')
    }
});

//get your profile in the databse
//MIDDLEWARE: to set a function as a middleware all we do is pass it as a parameter between 1st and 3rd argument
router.get('/users/me', authentication, async (request, response) => {
    //PREVIOUSLY:
    // try{
    //     const result = await User.find({});
    //     response.send(result)
    // }catch(e){
    //     response.status(500).send(e)
    // }

    //since the user never needs to actually see other user we will repurpose this route handelr so that user can view his/her own profile

    //NOW:
    //REMEMBER: we had put the user object inside of request
    response.status(200).send(request.user)
})

//update the user details
router.patch('/users/update', authentication, async function(request, response){
    const keys = Object.keys(request.body);
    const allowedOps = ['name', 'age', 'password', 'email'];

    keys.forEach(key => {
        if(!allowedOps.includes(key)){
            return response.status(400).send('Bad operation')
        }
    })

    try{
        //this will save the new data following all the rules it was saved the first time 
        //INITIAL CODE WAS : await User.findByIdAndUpdate(request.params.id, request.body, { new : true, runValidators: true})
        //had to change this inorder so that the findByIdAndUpdate doesn't bypas the pre function in the UserModel

        const userF = await User.findById(request.user._id);
        //below is the brakcet notation. In order to keep things dynamic since we dont know exactly which field was updated
        keys.forEach(key => userF[key] = request.body[key])
        await userF.save();
        response.status(200).send("Updated!")
    }catch(e){
        response.status(500).send('Failed to update')
    }
})

//delete a user
router.delete('/users/delete', authentication, async function(request, response){
    try{
        //since the token already contaims the id which is peing parsed in Auth.js file we get the 'user' instance 
        //now its just abut getting the user id from the 'user' instance
        await request.user.remove()
        sendCancellationMail(request.user.email, request.user.name)
        response.status(202).send({user : request.user.name, message: 'success'})
    }catch(e){ 
        response.status(500).send(e)
    }
});

//log out a user
router.post('/users/logout', authentication, async function(request, response){
    try{
        request.user.tokens = request.user.tokens.filter((token) => token.token!==request.token)
        await request.user.save();
        response.status(200).send({message : "logged_out", name: request.user.name})

    }catch(e){
        response.status(500).send({message : "failed_to_log_out"})
    } 
})

//logout all sessions
router.post('/users/logout/all', authentication, async function(request, response){
    try{
        request.user.tokens = []
        await request.user.save();
        response.status(200).send({message: "success"})
    }catch(e){
        response.status(500).send({message: 'failure'})
    }
})

/**
 * express doesnt support file uploads
    1) but using 'multer' we can easily upload images
    2) Limits- sometimes we need to set the file size. Like suppose the file size is 4MB limit. We use limits{ fileSize: **filesize**} 
 */

const avatar = multer({
    // dest:'avatar',
    //inorder to get access to the image file data we pass that data to the .post function by romoving the 'dest' field
    limits:{
        fileSize: 1000000,
    },
    fileFilter(request, file, cb){
        if(!(file.originalname.endsWith('.png') ||
             file.originalname.endsWith('.jpg') ||
             file.originalname.endsWith('.jpeg'))){
                
            return cb(new Error('File format unsupported'))
        }
        cb(undefined, true);
    }
})
router.post('/users/me/avatar', authentication ,avatar.single('avatar') ,async function(request, response){
    request.user.avatar = request.file.buffer;
    await request.user.save();
    response.status(201).send()
}, function(error, request, response, next){
    //this callback is only used to handle errors
    response.status(400).send({ error: error.message, message: 'failure'})
})
//remove the profile picture user set
//RECHECK THIS
router.post('/users/me/avatar/remove', authentication, async function(request, response){
    try{
        request.user.avatar = null;
        await request.user.save();
        response.send({message:'success'})
    }catch(e){
        response.send({error: e.message})
    }
})
//view profile picture
router.get('/users/:id/avatar', async function(request, response){
    try{
        const user = await User.findById(request.params.id)
        if(!user || user.avatar === null){
            throw new Error('User unavailable')
        }
        //.set() is used to set headers for response
        //by defult the 'Content-Type' is set to application/json
        //to set it to image/jpg
        response.set('Content-Type', 'image/jpg')
        response.send(user.avatar)
    }catch(e){
        response.status(404).send()
    }
})
module.exports = router;