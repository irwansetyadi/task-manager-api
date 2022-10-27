const express = require('express');
const Task = require('../models/task');
const User = require('../models/user');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/tasks', auth, async (req, res) =>{
    const task = new Task({
        ...req.body,
        author: req.user._id
    });

    try{
        await task.save();
        res.status(201).send(task);
    } catch(e) {
        res.status(400).send(e);
    }
})

router.get('/tasks', auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};

        if(req.query.completed) match.completed = req.query.completed === 'true';

        if(req.query.sortBy) {
            const parts = req.query.sortBy.split('_');

            sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
        }


        // const tasks = await Task.find({author: req.user._id});
        await User.findById(req.user._id).populate({
            path: 'tasks',
            match,
            perDocumentLimit: parseInt(req.query.limit),
            options: {
                skip: parseInt(req.query.skip),
                sort
            }
        }).exec((err, user) => {
            if(err) throw new Error;

            res.send(user.tasks);
        })

        // res.send(tasks);
    } catch (e) {
        res.status(500).send()
    }
    
})

router.get('/tasks/:id', auth, async (req, res) => {
    const _id = req.params.id;

    try {
        const task = await Task.findOne({_id, author: req.user._id});

        if(!task) return res.status(404).send();

        res.send(task);
    } catch(e) {
        res.status(500).send(); 
    }
})

router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed'];
    const isValid = updates.every(update => allowedUpdates.includes(update));
    // console.log(isValid);

    if(!isValid) return res.status(400).send('invalid update request');

    try{
        const task = await Task.findOne({_id: req.params.id, author: req.user._id});

        if(!task) return res.status(404).send();

        updates.forEach(update => task[update] = req.body[update]);
        await task.save();
                
        res.send(task);
    } catch(e) {
        res.status(400).send(e);
    }
})

router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({_id: req.params.id, author: req.user._id});
        if(!task) return res.status(404).send();

        res.send(task);
    } catch(e) {
        res.status(500).send(e);
    }
})

module.exports = router;