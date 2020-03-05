const express = require('express');
const router = express.Router();
const { stourTour, getTour, deleteTour, reviseTourTitle } = require('../controller/tour.js')

router.post('/stourTour', stourTour)

router.get('/getTour', getTour)

router.delete('/deleteTour', deleteTour)

router.put('/reviseTourTitle', reviseTourTitle)

module.exports = router;
