const mongoose = require('mongoose');
// -----------TASK MODEL------------

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        required : true,
        trim: true
    },
    completed: {
        type: Boolean,
        required: false,
        default: false
    },
    //either the usermodel.js can store the id's of all the tasks it has created or each task can simply store the id of the user who create it in order to make a relationship
    ownerid:{
        type: mongoose.Schema.Types.ObjectId,
        required:true,
        ref: 'USER'
    }
},{
    timestamps : true
})

const Task = mongoose.model("TASK", taskSchema);

module.exports = Task;