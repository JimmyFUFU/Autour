const express = require('express')
const bodyparser = require('body-parser')
const bearerToken = require('express-bearer-token')
// const util = require('util')

const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)

const userRouter = require('./routes/user')
const autourRouter = require('./routes/autour')
const tourRouter = require('./routes/tour')
const googleRouter = require('./routes/google')

const cst = require('./secret/constant.js')
const {getIo} = require('./controller/autour.js')
getIo(io)

app.use('/', express.static('public'))
app.use(bodyparser.json({limit: '20mb', extended: true}))
app.use(bodyparser.urlencoded({limit: '20mb', extended: true}))
app.use(bearerToken())

app.use('/user' , userRouter)
app.use('/autour' , autourRouter)
app.use('/tour' , tourRouter)
app.use('/google' , googleRouter)

const {
  find2PointAllPath,
  toMatrix,
  openingMatrix,
  findShortestPath
} = require('./func/algorithm.js')
const sort = require('./func/sort.js')

app.post('/test', (res, req) =>{
})

server.listen(cst.PORT , () =>{
  console.log(`App is running on port ${cst.PORT}!`)
})
