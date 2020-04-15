const express = require('express');
const router = express.Router();

const Task = require('./../models/TaskModel')
const authentication = require('./../middleware/Auth')


//create new tasks
router.post('/tasks/create', authentication, async (request, response) => {
    //const task = new Task(request.body);
    //here we change the model by attaching authentication to it and inserting a owner id
    //use a spread operator
    const task = new Task({
        ...request.body, 
        ownerid: request.user._id
    })
    try {
        await task.save();
        response.send('Saved');
    } catch (e) {
        response.status(400).send(e)
    }
})

//get all tasks
// GET/tasks?completed=false
// GET/tasks?limit=10&skip=10
// GET /tasks?sortBy=createdAt
router.get('/tasks', authentication, async (request, response) => {
    let result;
    //here we are checking if the query is undefined and if it is then we run routine 1 and else run routine 2
    try {
        if(request.query.completed !== undefined){
            result = await Task.find({
                ownerid: request.user._id,
                completed: request.query.completed
            }).sort({createdAt: 'desc'})
            .limit(parseInt(request.query.limit))   
            .skip(parseInt(request.query.skip))   
        }else{
            result = await Task.find({
                ownerid: request.user._id,
            }).sort({createdAt: 'desc'})
            .limit(parseInt(request.query.limit))
            .skip(parseInt(request.query.skip))   
        }
        response.send(result)
    } catch (e) {
        response.status(500).send(e)
    }
})

//get task by id
router.get('/tasks/:id', authentication, async (request, response) => {
    const task_id = request.params.id;
    
    try {
        //const task = await Task.findById(request.params.id);

        //check the database for a task with ownerid as supplied by the token and _id as provided by the params
        const task = await Task.findOne({ _id: task_id, ownerid: request.user._id })
        if(!task){
            return response.status(404).send('Task not Found');
        }
        response.send(task)
    } catch (e) {
        response.status(500).send(e)
    }
})

//update tasks
router.patch('/tasks/update/:id', authentication, async function (request, response) {
    const keys = Object.keys(request.body);
    const allowedOps = ['description', 'completed'];
    keys.forEach(key => {
        if (!allowedOps.includes(key)) {
            return response.status(400).send('Bad request');
        }
    })

    try {
        const task = await Task.findOne({_id:request.params.id, ownerid:request.user._id });
        if (!task) {
            return response.status(404).send('Task not found')
        }
        keys.forEach(key => task[key] = request.body[key])
        await task.save();
        response.status(200).send('Updated!')
    } catch (e) {
        response.status(500).send(e)
    }
})

//delete tasks
router.delete('/tasks/delete/:id', authentication, async function (request, response) {
    try {
        const task = await Task.findByIdAndDelete({ _id: request.params.id, ownerid: request.user._id})
        if (!task) {
            return response.status(400).send('Bad request')
        }
        response.status(202).send("Successfully removed!")
    } catch (e) {
        response.status(404).send(e)
    }
})

module.exports = router;
