const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const User = require('../models/user.js');
const auth = require('../middleware/auth');
const router = new express.Router();
const upload = multer({
    limits: {
        fileSize: 1000000
    },

    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)) return cb(new Error('Please upload an image'));

        cb(undefined, true);
    }
})

router.post('/users', async (req, res) => {
    const user = new User(req.body);
    
    try {
        const token = await user.generateAuthToken();
        
        res.status(201).send({user, token});
    } catch(e) {
        res.status(400).send(e);
    }
})



router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);
        const token = await user.generateAuthToken();
        
        res.send({user, token});
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



router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'email', 'password', 'age'];
    const isValid = updates.every(update => allowedUpdates.includes(update));

    if(!isValid) return res.status(400).send('Invalid request');

    try {
        updates.forEach(update => req.user[update] = req.body[update]);
        await req.user.save();

        // const user = await User.findByIdAndUpdate(req.params.id, req.body, {new: true, runValidators: true})
        res.send(req.user);
    } catch (e) {
        res.status(400).send(e);
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();
        res.send(req.user);
    } catch(e) {
        res.status(500).send();
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    const buffer = await sharp(req.file.buffer).resize({
        width: 250,
        height: 250
    })
    .png()
    .toBuffer()
    
    
    req.user.profilePic = buffer;
    await req.user.save();
    
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({error: error.message});
})

router.delete('/users/me/avatar', auth, async (req, res) => {
    try {
        req.user.profilePic = undefined;
        await req.user.save();

        res.status(200).send();
    } catch(e) {
        res.status(400).send();
    }
})

router.get('/users/:id/avatar', async (req, res) => {
    try{
        const user = await User.findById(req.params.id);
        
        if(!user || !user.profilePic) throw new Error;
                
        res.set('Content-Type', 'image/png')
        res.send(user.profilePic);

    } catch(e) {
        res.status(404).send();
    }
})



module.exports = router;

