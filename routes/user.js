const express = require('express');
const router = express.Router();
const { profile, login, signup } = require('../controller/user.js')

router.get('/profile', profile)

router.post('/login', login)

router.post('/signup', signup)

module.exports = router;
