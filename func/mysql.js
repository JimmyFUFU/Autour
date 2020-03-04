const mysql = require('mysql')
const cst = require('../secret/constant.js')

var pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: cst.MYSQLUSER,
  password: cst.MYSQLPASSWORD,
  database: cst.MYSQLDBNAME
})

var selectDataFrom = function (selectwhat, object) {
  let sql = `select ${selectwhat} from ${object}`
  return new Promise(function (resolve, reject) {
    pool.query(sql, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

var selectDataFromWhere = function (selectwhat, object, where) {
  let sql
  if (Object.keys(where).length > 1) {
    sql = `select ${selectwhat} from ${object} where ${Object.keys(where)[0]} = ?`
    for (let i = 1; i < Object.keys(where).length; i++) {
      sql += ` AND ${Object.keys(where)[i]} = ?`
    }
    where = Object.values(where)
  }else {
    sql = `select ${selectwhat} from ${object} where ? `
  }

  return new Promise(function (resolve, reject) {
    pool.query(sql, where,  (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

var updateDataFromWhere = function (object, set, where) {
  let sql
  let paramArr = new Array()
  if (Object.keys(where).length > 1) {
    paramArr = [set , Object.values(where)[0] ]
    sql = `UPDATE ${object} SET ? WHERE ${Object.keys(where)[0]} = ?`
    for (let i = 1; i < Object.keys(where).length; i++) {
      sql += ` AND ${Object.keys(where)[i]} = ?`
      paramArr.push(Object.values(where)[i])
    }
  }else {
    paramArr = [set , where]
    sql = `UPDATE ${object} SET ? WHERE ?`
  }
  return new Promise(function (resolve, reject) {
    pool.query(sql, paramArr , (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

var insertDataSet = function (object, set) {
  var sql = `INSERT INTO ${object} SET ?`
  return new Promise(function (resolve, reject) {
    pool.query(sql, set, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

var insertDataSetUpdate = function (object, set, update) {
  var sql = `INSERT INTO ${object} SET ? ON DUPLICATE KEY UPDATE ${update} `
  return new Promise(function (resolve, reject) {
    pool.query(sql, set, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

var deleteFromWhere = function (object, where) {
  let sql
  if (Object.keys(where).length > 1) {
    sql = `DELETE FROM ${object} WHERE ${Object.keys(where)[0]} = ?`
    for (let i = 1; i < Object.keys(where).length; i++) {
      sql += ` AND ${Object.keys(where)[i]} = ?`
    }
    where = Object.values(where)
  }else {
    sql = `DELETE FROM ${object} WHERE ${where}`
  }

  return new Promise(function (resolve, reject) {
    pool.query(sql ,where , (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

module.exports.selectDataFrom = selectDataFrom
module.exports.selectDataFromWhere = selectDataFromWhere
module.exports.updateDataFromWhere = updateDataFromWhere
module.exports.insertDataSet = insertDataSet
module.exports.insertDataSetUpdate = insertDataSetUpdate;
module.exports.deleteFromWhere = deleteFromWhere;
