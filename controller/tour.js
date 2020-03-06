const mysql = require('../func/mysql.js')
const moment = require('moment')

const stourTour = async function (req,res){
  const sqlConnection = await mysql.connection()
  try {
    let userDetail = await mysql.selectDataWithCond(sqlConnection, '*', 'user', { id : req.body.userid })
    if(!Object.keys(userDetail).length){
      console.log('User Not found')
      res.status(400).send({ error: 'User Not found' })
    }else{
      const insertTourPost = {
        id: moment(moment().valueOf()).format('YYMMDDHHmmssSSS'),
        userid: req.body.userid,
        tourtitle: req.body.tourtitle,
        tourDetail: req.body.tour,
        warningarray: req.body.warningarray,
        prefertype: req.body.prefertype,
        timetype : req.body.timetype,
        transportation : req.body.transportation
      }
      await mysql.insertDataSet(sqlConnection, 'tour', insertTourPost)
      res.status(200).send({ success: true })
    }
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error: e.message})
  } finally {
    sqlConnection.release()
  }
}

const getTour =  async function(req,res){
  const sqlConnection = await mysql.connection()
  try {
    let tourDetail = await mysql.selectDataWithCond(sqlConnection, '*', 'tour' , { id : req.query.id })
    tourDetail = JSON.stringify(tourDetail)
    tourDetail = JSON.parse(tourDetail)
    res.status(200).send(tourDetail)
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error: e.message})
  } finally {
    sqlConnection.release()
  }
}

const deleteTour = async function(req,res){
  const sqlConnection = await mysql.connection()
  try {
    let userDetail = await mysql.selectDataWithCond(sqlConnection, 'id', 'user', {access_token : req.token} )
    await mysql.deleteDataWithCond(sqlConnection, 'tour', {userid : userDetail[0].id , id : req.headers.id})
    res.status(200).send({success : true})
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error:e.message})
  } finally {
    sqlConnection.release()
  }
}

const reviseTourTitle =  async function(req,res){
  const sqlConnection = await mysql.connection()
  try {
    await mysql.updateDataWithCond(sqlConnection, 'tour', {tourtitle : req.body.revisetitle}, {id : req.body.tourId} )
    res.status(200).send({success:true})
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error:e.message})
  } finally {
    sqlConnection.release()
  }
}

module.exports = {
  stourTour,
  getTour,
  deleteTour,
  reviseTourTitle
};
