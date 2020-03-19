const express = require('express');
const router = express.Router();
const { stourTour, getTour, deleteTour, reviseTourTitle } = require('../controller/tour.js')

router.post('/tour', stourTour)

router.get('/tour', getTour)

router.delete('/tour', deleteTour)

router.put('/tour', reviseTourTitle)

module.exports = router;
