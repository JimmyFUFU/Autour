const redis = require('redis');
const googlemap = require('../func/googlemap.js')
// connect Redis
const client = redis.createClient() // this creates a new client for redis
client.on('connect', () => {
  console.log('Redis client connected')
})


const getFastMatrix = async function (req,res){

  client.hexists(`${req.body.tourid}`, `day:${req.body.day}`, async function (err, reply) {
      if (err) {
        console.log(err.name, ':', err.message)
        res.status(400).send({error:err.message})
      }else if (reply == 1) {
        client.hget(`${req.body.tourid}`, `day:${req.body.day}`, function (err, reply) {
          if (err) {
            console.log(err.name, ':', err.message)
            res.status(400).send('error')
          }else {
            // 變回JSON格式回傳
            console.log(`${req.body.tourid} day:${req.body.day} array from Redis`);
            res.status(200).send(JSON.parse(reply))
          }
        })
      }else{
        try {
          let transMatrix = new Array() // transition 2D Array
          let returnMatrix = new Array() // 用來回傳的 1D Array
          for (let i = 0; i < req.body.transportation.length; i++) {

            let matrix = await googlemap.distanceMatrix(req.body.id2Darray , req.body.id2Darray , req.body.transportation[i])
            console.log(`distanceMatrix 用了一次 (${req.body.id2Darray.length} items)`);
            let moveCostMatrix = algorithm.toMatrix(matrix , 'forTrans')
            if (i == 0) { // 用第一個交通方式來初始化 2D Array
              for (let j = 0; j < moveCostMatrix.length; j++) {
                moveCostMatrix[j].forEach((item, o) => { item.type = req.body.transportation[i] });
                transMatrix.push(moveCostMatrix[j])
              }
            }else{
              for (let j = 0; j < moveCostMatrix.length; j++) {
                moveCostMatrix[j].forEach((item, o) => { item.type = req.body.transportation[i] });
                for (let x = 0; x < moveCostMatrix[j].length; x++) {

                  if (transMatrix[j][x].time == -1 && moveCostMatrix[j][x].time != -1) {
                    transMatrix[j][x] = moveCostMatrix[j][x]
                  }
                  if (moveCostMatrix[j][x].time < transMatrix[j][x].time && moveCostMatrix[j][x].time != -1) {
                    transMatrix[j][x] = moveCostMatrix[j][x]
                  }
                  if (req.body.transportation[i] == 'walking' && moveCostMatrix[j][x].time <= 600) {
                    transMatrix[j][x] = moveCostMatrix[j][x]
                  }
                }
              }
            }
          }
          for (let i = 1; i < transMatrix.length; i++) {
            returnMatrix.push(transMatrix[i-1][i])
          }
          // 存進redis
          client.hset(`${req.body.tourid}`, `day:${req.body.day}` ,  `${JSON.stringify(returnMatrix)}`)
          client.expire(`${req.body.tourid}`, 9*3600) // expires after six hour
          console.log(`${req.body.tourid} day:${req.body.day} 已放進 redis`)
          res.status(200).send(returnMatrix)
        } catch (e) {
          console.log(e.name, ':', e.message);
          res.status(400).send('error')
        }
      }

  })

}

module.exports = {
  getFastMatrix
}
