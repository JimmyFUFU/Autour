const mysql = require('../func/mysql.js')
const moment = require('moment')

const stourTour = async function (req,res){
  try {
    var thisuser = await mysql.selectDataFromWhere('*' , 'user' , { id : req.body.userid })
    if(Object.keys(thisuser).length === 0){
      console.log('User Not found')
      res.status(400).send({ error: 'User Not found' })
    }else{
      const inserttourpost = {
        id: moment(moment().valueOf()).format('YYMMDDHHmmssSSS'),
        userid: req.body.userid,
        tourtitle: req.body.tourtitle,
        tourdetail: req.body.tour,
        warningarray: req.body.warningarray,
        prefertype: req.body.prefertype,
        timetype : req.body.timetype,
        transportation : req.body.transportation
      }
      await mysql.insertDataSet('tour',inserttourpost)
      res.status(200).send({ success: true })
    }
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error: e.message})
  }
}

const getTour =  async function(req,res){
  try {
    var tourdetail = await mysql.selectDataFromWhere('*', 'tour' , { id : req.query.id })
    tourdetail = JSON.stringify(tourdetail)
    tourdetail = JSON.parse(tourdetail)
    res.status(200).send(tourdetail)
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error: e.message})
  }
}

const deleteTour = async function(req,res){
  try {
    let userdetail = await mysql.selectDataFromWhere('id', 'user' , {access_token : req.token} )
    await mysql.deleteFromWhere( 'tour' , {userid : userdetail[0].id , id : req.headers.id})
    res.status(200).send({success : true})
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error:e.message})
  }
}

const reviseTourTitle =  async function(req,res){
  try {
    await mysql.updateDataFromWhere('tour', {tourtitle : req.body.revisetitle} , {id : req.body.tourId} )
    res.status(200).send({success:true})
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error:e.message})
  }
}

module.exports = {
  stourTour,
  getTour,
  deleteTour,
  reviseTourTitle
};
