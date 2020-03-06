const mysql = require('mysql')
const cst = require('../secret/constant.js')

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: cst.MYSQLUSER,
  password: cst.MYSQLPASSWORD,
  database: cst.MYSQLDBNAME
})

const connection = () => {
  return new Promise(function(resolve, reject) {
    pool.getConnection( (err, connection) => {
      if (err) reject(err)
      // console.log("MySQL pool connected: threadId " + connection.threadId)
      const query = (sql, binding) => {
        // console.log(sql);
        return new Promise(function(resolve, reject) {
          connection.query(sql, binding, (err, result) => {
            if(err) reject(err)
            else resolve(result)
          })
        })
      }
      const release = () => {
        return new Promise(function(resolve, reject) {
          if(err) reject(err)
          // console.log("MySQL pool released: threadId " + connection.threadId);
          resolve(connection.release())
        })
      }
      resolve({ query, release })
    })
  })
}

const selectData = async function (sqlConnection, selectColumn, table) {
  let sql = `SELECT ${selectColumn} FROM ${table}`
  let result = await sqlConnection.query(sql)
  return result
}

const selectDataWithCond = async function (sqlConnection, selectColumn, table, cond) {
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
  let result = await sqlConnection.query(sql, cond)
  return result
}

const updateDataWithCond = async function (sqlConnection, table, set, cond) {
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
  let result = await sqlConnection.query(sql, paramArr)
  return result
}

const insertDataSet = async function (sqlConnection, table, set) {
  var sql = `INSERT INTO ${table} SET ?`
  let result = await sqlConnection.query(sql, set)
  return result
}

const insertDataSetUpdate = async function (sqlConnection, table, set, update) {
  var sql = `INSERT INTO ${table} SET ? ON DUPLICATE KEY UPDATE ${update} `
  let result = await sqlConnection.query(sql, set)
  return result
}

const deleteDataWithCond = async function (sqlConnection, table, cond) {
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
  let result = await sqlConnection.query(sql, cond)
  return result
}

module.exports = {
  selectData,
  selectDataWithCond,
  updateDataWithCond,
  insertDataSet,
  insertDataSetUpdate,
  deleteDataWithCond,
  connection
}
