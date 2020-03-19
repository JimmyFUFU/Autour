const express = require('express')
const router = express.Router()
const { getFastMatrix } = require('../controller/google.js')

router.post('/fastMatrix' , getFastMatrix)

module.exports = router
