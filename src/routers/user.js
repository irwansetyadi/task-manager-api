const express = require('express');
const User = require('../models/user.js');
const auth = require('../middleware/auth');
const router = new express.Router();

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        const token = await user.generateAuthToken();
        const {password, ...userData} = user._doc;
        res.status(201).send({userData, token});
    } catch(e) {
        res.status(400).send(e);
    }
})



router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        const {password, ...userData} = user._doc;
        res.send({userData, token});
    } catch(err) {
        res.status(400).send(err.message);
    }
})


router.post('/users/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token);

        await req.user.save()

        res.send()
    } catch(e) {
        res.status(500).send(e);
    }
})


router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.send();

    } catch (e) {
        res.status(500).send();
    }
})



router.get('/users', auth, async (req, res) => {
    res.send(req.user);
})


router.get('/users/:id', async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        if(!user) return res.status(404).send();
        res.send(user);
    } catch(e) {
        res.status(500).send();
    } 
})



router.patch('/users/:id', async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValid = updates.every(update => allowedUpdates.includes(update));

    if(!isValid) return res.status(400).send('Invalid request');

    try {
        const user = await User.findById(req.params.id);

        updates.forEach(update => user[update] = req.body[update])
        await user.save();

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        if(!user) return res.status(404).send();
        res.send(user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);
        if(!user) return res.status(404).send();
        res.send(user);
    } catch(e) {
        res.status(500).send();
    }
})



module.exports = router;

