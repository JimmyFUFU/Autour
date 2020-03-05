const mysql = require('mysql')
const cst = require('../secret/constant.js')

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: cst.MYSQLUSER,
  password: cst.MYSQLPASSWORD,
  database: cst.MYSQLDBNAME
})

const selectDataFrom = function (selectColumn, table) {
  let sql = `SELECT ${selectColumn} FROM ${table}`
  return new Promise(function (resolve, reject) {
    pool.query(sql, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

const selectDataFromWhere = function (selectColumn, table, cond) {
  let sql
  if (Object.keys(cond).length > 1) {
    sql = `SELECT ${selectColumn} FROM ${table} WHERE ${Object.keys(cond)[0]} = ?`
    for (let i = 1; i < Object.keys(cond).length; i++) {
      sql += ` AND ${Object.keys(cond)[i]} = ?`
    }
    cond = Object.values(cond)
  }else {
    sql = `SELECT ${selectColumn} FROM ${table} WHERE ? `
  }
  return new Promise(function (resolve, reject) {
    pool.query(sql, cond,  (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

const updateDataFromWhere = function (table, set, cond) {
  let sql
  let paramArr = new Array()
  if (Object.keys(cond).length > 1) {
    paramArr = [set , Object.values(cond)[0] ]
    sql = `UPDATE ${table} SET ? WHERE ${Object.keys(cond)[0]} = ?`
    for (let i = 1; i < Object.keys(cond).length; i++) {
      sql += ` AND ${Object.keys(cond)[i]} = ?`
      paramArr.push(Object.values(cond)[i])
    }
  }else {
    paramArr = [set , cond]
    sql = `UPDATE ${table} SET ? WHERE ?`
  }
  return new Promise(function (resolve, reject) {
    pool.query(sql, paramArr , (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

const insertDataSet = function (table, set) {
  var sql = `INSERT INTO ${table} SET ?`
  return new Promise(function (resolve, reject) {
    pool.query(sql, set, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

const insertDataSetUpdate = function (table, set, update) {
  var sql = `INSERT INTO ${table} SET ? ON DUPLICATE KEY UPDATE ${update} `
  return new Promise(function (resolve, reject) {
    pool.query(sql, set, (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

const deleteFromWhere = function (table, cond) {
  let sql
  if (Object.keys(cond).length > 1) {
    sql = `DELETE FROM ${table} WHERE ${Object.keys(cond)[0]} = ?`
    for (let i = 1; i < Object.keys(cond).length; i++) {
      sql += ` AND ${Object.keys(cond)[i]} = ?`
    }
    cond = Object.values(cond)
  }else {
    sql = `DELETE FROM ${table} WHERE ${cond}`
  }
  return new Promise(function (resolve, reject) {
    pool.query(sql ,cond , (err, results) => {
      if (err) reject(err)
      else resolve(results)
    })
  })
}

module.exports = {
  selectDataFrom,
  selectDataFromWhere,
  updateDataFromWhere,
  insertDataSet,
  insertDataSetUpdate,
  deleteFromWhere
}
