const mysql = require('mysql')
const cst = require('../secret/constant.js')

var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: cst.MYSQLUSER,
  password: cst.MYSQLPASSWORD,
  database: cst.MYSQLDBNAME
})

var selectdatafrom = function (selectwhat, object) {
  var sql = `select ${selectwhat} from ${object}`
  return new Promise(function (resolve, reject) {
    pool.query(sql, (err, results) => {
      if (err) console.log(err)
      resolve(results)
    })
  })
}

var selectdatafromWhere = function (selectwhat, object, where) {
  var sql = `select ${selectwhat} from ${object} where ${where}`
  return new Promise(function (resolve, reject) {
    pool.query(sql, (err, results) => {
      if (err) console.log(err)
      resolve(results)
    })
  })
}

var updatedatafromWhere = function (object, set, where) {
  var sql = `UPDATE ${object} SET ${set} WHERE ${where}`
  return new Promise(function (resolve, reject) {
    pool.query(sql, (err, results) => {
      if (err) console.log(err)
      resolve(results)
    })
  })
}

var insertdataSet = function (object, set) {
  var sql = `INSERT INTO ${object} SET ?`
  return new Promise(function (resolve, reject) {
    pool.query(sql, set, (err, results) => {
      if (err) reject(new Error('insertFail'))
      resolve(results)
    })
  })
}

var insertdataSetUpdate = function (object, set , update ) {
  var sql = `INSERT INTO ${object} SET ? ON DUPLICATE KEY UPDATE ${update} `
  return new Promise(function (resolve, reject) {
    pool.query(sql, set, (err, results) => {
      if (err) {
        console.log(err);
        reject(new Error('insertUpdateFail'))
      }
      resolve(results)
    })
  })
}

var deletefromwhere = function ( object, where ) {
  let sql = `DELETE FROM ${object} WHERE ${where}`
  return new Promise(function (resolve, reject) {
    pool.query(sql , (err, results) => {
      if (err) reject(new Error('deleteFail'))
      resolve(results)
    })
  })
}

module.exports.selectdatafrom = selectdatafrom
module.exports.selectdatafromWhere = selectdatafromWhere
module.exports.updatedatafromWhere = updatedatafromWhere
module.exports.insertdataSet = insertdataSet
module.exports.insertdataSetUpdate = insertdataSetUpdate;
module.exports.deletefromwhere = deletefromwhere;
