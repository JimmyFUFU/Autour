const mysql = require('mysql')
const mysqlFunc = require('../func/mysql.js')
const cst = require('../secret/constant.js')
const { tourData } = require('./fakedata.js')

const pool = mysql.createPool({
  connectionLimit: 10,
  host: 'localhost',
  user: cst.MYSQLUSER,
  password: cst.MYSQLPASSWORD,
  database: cst.MYSQLTESTDBNAME
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
var sqlConnectionFake

beforeAll( async () => {
  sqlConnectionFake = await connection()
  await sqlConnectionFake.query("TRUNCATE TABLE tour")
})

describe('Tour CRUD', () => {

  for (let i in tourData) {
    test(`Create Data Test ${i+1}`, async () => {
      const response = await mysqlFunc.insertDataSet(sqlConnectionFake, 'tour', tourData[i])
      expect(response.affectedRows).toBe(1)
      expect(response.warningCount).toBe(0)
    })
  }

  test('Read Data Test' , async () =>{
    const response = await mysqlFunc.selectData(sqlConnectionFake,'*' ,'tour')
    expect(response.length).toBeGreaterThan(0);
  })

  test('Read Data With Condition Test' , async () =>{
    const response = await mysqlFunc.selectDataWithCond(sqlConnectionFake,'*' ,'tour' , { id: 20200221082813 })
    expect(response.length).toBe(1);
  })

  test('Read Data  With Condition Test (No result)' , async () =>{
    const response = await mysqlFunc.selectDataWithCond(sqlConnectionFake, '*', 'tour', { id: 123456} )
    expect(response.length).toBe(0);
  })

  test('Update Data Test' , async () =>{
    const response = await mysqlFunc.updateDataWithCond(sqlConnectionFake, 'tour', {tourtitle : "Update Test"}, { id: 20200221082813 })
    expect(response.changedRows).toBe(1)
    expect(response.warningCount).toBe(0)
  })

  test('Delete Data Test' , async () =>{
   const response = await mysqlFunc.deleteDataWithCond(sqlConnectionFake, 'tour', { id: 20200212115255} )
   expect(response.affectedRows).toBe(1)
   expect(response.warningCount).toBe(0)
  })

})

afterAll( async () => {
  sqlConnectionFake.release()
})
