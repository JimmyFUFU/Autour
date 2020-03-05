const express = require('express');
const router = express.Router();
const { newAutour } = require('../controller/autour.js')

router.post('/newAutour', newAutour)

module.exports = router
