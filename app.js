const express = require('express')
const request = require('request')
const bodyparser = require('body-parser')
const bearerToken = require('express-bearer-token')
const crypto = require('crypto')
const moment = require('moment')

const weight = require('./func/addweight.js')
const googlemap = require('./func/googlemap.js')
const radius = require('./func/radius.js')
const sort = require('./func/sort.js')
const period = require('./func/period.js')
const algorithm = require('./func/algorithm.js')
const mysql = require('./func/mysql.js')
const cst = require('./secret/constant.js')

const app = express()
const googleMapsClient = require('@google/maps').createClient({
  key: cst.API_KEY,
  Promise : Promise
});
const PORT = 5000

// crypto MD5 Hex
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
};

app.use('/', express.static('public'))
app.use(bodyparser.urlencoded({
  extended: false
}))
app.use(bodyparser.json())

app.get('/test' , (req, res)  => {
  res.send('START!!')
})


app.post('/newAutour' , async function (req,res){
  // 先算有多少時段 才知道要拿多少個景點 // 順便放好 起點 住宿 終點資訊
  let periodarray = period.getperiod(req.body.start.time , req.body.end.time , req.body.timetype , req.body)
  let periodnumber = 0
  periodarray.forEach((item, i) => {
    periodnumber += periodarray[i].period.place.length
  });
  var quantity = periodnumber - req.body.mustgo.length

  var mustgolist = []
  // must go
  for (var i in req.body.mustgo) {
    let mustgoplace = await googlemap.findplace(req.body.mustgo[i])
    let mustgoplacedetail = await googlemap.placedetail(mustgoplace.candidates[0].place_id) // candidates[0] 選第一個
    mustgolist.push(mustgoplacedetail.result)
  }
  console.log('mustgolist finish !');
  //prefer go ( nearby start place so I need to get geocode first )
  let startplace = await googlemap.findplace(req.body.start.place)
  let endplace = await googlemap.findplace(req.body.end.place)
  let nearbyplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),req.body.prefertype,quantity)
  nearbyplace = nearbyplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料

  // 加上系統自己推薦 tourist_attraction
  let moreplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),['tourist_attraction'],quantity)
  moreplace = moreplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料
  console.log('moreplace finish !');
  //給權重 取得綜合分數
  weight.addscore(nearbyplace,0.8)
  weight.addscore(moreplace,0.5)

  // 合併 nearbyplace & moreplace
  nearbyplace = [...nearbyplace , ...moreplace]
  // sortby score
  sort.by(nearbyplace , 'score')

  // 全部放進最後的陣列 要把重複的去掉
  var finalPlaceList = []
  var placecount = 0
  for (var i = 0; i < mustgolist.length; i++) {
    finalPlaceList = [...finalPlaceList , mustgolist[i] ] // 如果有 mustgo 就先放
    placecount++
    if (placecount == periodnumber) break
  }
  for (let u = 0 ; u < nearbyplace.length ; u++) { // 剩下的補滿
    if (placecount == periodnumber) break
    let check = false
    for (let j in finalPlaceList) {if (finalPlaceList[j].id === nearbyplace[u].id ) {  check = true }  }
    if ( check == false ) {
      let thisplace =  await googlemap.placedetail(nearbyplace[u].place_id)
      finalPlaceList.push(thisplace.result)
      placecount++
    }
    if (placecount == periodnumber) break
  }
  console.log('finalPlaceList finish !');

  // 隨機打亂陣列 ( 先用這個 )
  finalPlaceList.sort(function() {
      return (0.5-Math.random());
  });


  // 安排每天的景點 ( 包括起點終點 ) 才能安排每天的順序
  var count = 0
  for (var i = 0; i < periodarray.length; i++) {
    let start = await googlemap.findplace(periodarray[i].period.start.name) // 起點
    let idarray = [`place_id:${start.candidates[0].place_id}`]
    let namearray = [start.candidates[0].name]
    let latarray = [0]
    let lngarray = [0]
    periodarray[i].period.start.lat = start.candidates[0].geometry.location.lat
    periodarray[i].period.start.lng = start.candidates[0].geometry.location.lng
    periodarray[i].period.start.place_id = start.candidates[0].place_id

    for (let j = 0 ; j < periodarray[i].period.place.length ; j++) { // 景點們
      idarray.push(`place_id:${finalPlaceList[count].place_id}`)
      namearray.push(finalPlaceList[count].name)
      latarray.push(finalPlaceList[count].geometry.location.lat)
      lngarray.push(finalPlaceList[count].geometry.location.lng)
      count++
    }

    let end = await googlemap.findplace(periodarray[i].period.end.name) // 終點
    idarray.push(`place_id:${end.candidates[0].place_id}`)
    namearray.push(end.candidates[0].name)
    periodarray[i].period.end.lat = end.candidates[0].geometry.location.lat
    periodarray[i].period.end.lng = end.candidates[0].geometry.location.lng
    periodarray[i].period.end.place_id = end.candidates[0].place_id



    var getMoveCost = await googlemap.distanceMatrix(idarray , idarray , 'driving')
    // 轉成 Matrix
    var moveCostMatrix = algorithm.toMatrix(getMoveCost)
    // 找到從起點到終點走過所有點的最短路徑
    var shortpath = algorithm.find2pointShortestPath(moveCostMatrix,0,idarray.length-1)
    // 依照最段路徑設置 把名字放進去
    for (let k = 0 ; k < periodarray[i].period.place.length ; k++) {
      periodarray[i].period.place[k].name = namearray[shortpath[k+1]]
      periodarray[i].period.place[k].lat = latarray[shortpath[k+1]]
      periodarray[i].period.place[k].lng = lngarray[shortpath[k+1]]
      periodarray[i].period.place[k].place_id = idarray[shortpath[k+1]].replace('place_id:', '')
    }
  }
  console.log('periodarray finish !');
  res.status(200).send(periodarray)

})

app.post('/storeAutour' , async function (req,res){
  try {
    var thisuser = await mysql.selectdatafromWhere('*' , 'user' , `id = ${req.body.userid}`)
    if(Object.keys(thisuser).length === 0){
      console.log('User Not found')
      res.status(400).send({ error: 'User Not found' })
    }else{
      const inserttourpost = {
        id:moment(moment().valueOf()).format('YYYYMMDDHHmmss'),
        userid:req.body.userid,
        tourdetail:req.body.tour
      }
      await mysql.insertdataSet('tour',inserttourpost)
      res.status(200).send({ success: true })
    }
  } catch (e) {
    res.status(400).send({ error: 'DB error' })
  }
})

app.post('/user/login' , async function (req,res){
  if (req.body.provider === 'native') {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send({error : 'Email and password are required'})
  } else {
    var userdetails = await mysql.selectdatafromWhere('*', 'user', `email = '${req.body.email}' && password = '${req.body.password}'`)
    if (Object.keys(userdetails).length === 0) {
      console.log('User Not found')
      res.status(400).send({ error: 'Log In Error' })
    } else {
      // Give a new access_token and new access_expired everytime the user Signin
      let time = moment().valueOf()
      // produce a new access_token by email + time Now
      let nowTime = moment(time).format('YYYYMMDDHHmmss')
      let token = md5(`${req.body.email}` + `${nowTime}`)
      // get the time One hour later as new access_expired
      let expiredtime = moment(time).add(1, 'h').format('YYYY-MM-DD HH:mm:ss') // 一小時過期
      // let expiredtime = moment(time).add(30, "s").format('YYYY-MM-DD HH:mm:ss');//30s過期

      var updateTokenExpired = await mysql.updatedatafromWhere('user', `provider = '${req.body.provider}' , access_token = '${token}', access_expired = '${expiredtime}'`, `email = '${req.body.email}'`)
      console.log('NEW Log In !! UPDATE provider and token and expired successfully ~ ')
      let signInOutputUser = {
        data : {
          access_token: token,
          access_expired: expiredtime,
          user : {
            id : userdetails[0].id ,
            provider : userdetails[0].provider,
            name :userdetails[0].name ,
            email : userdetails[0].email,
            picture :userdetails[0].picture
          }
        }
      }
      res.send(signInOutputUser)
      console.log('User is found')
    }
  }
  } else if (req.body.provider === 'facebook') {
  if (req.body.access_token == null) {
    signInNULLOutputUser['error'] = 'Request Error: access token is required.'
    res.status(400).send(signInNULLOutputUser)
  } else {
    // if FB access_token exists  // get information from Facebook API
    request(`https://graph.facebook.com/v5.0/me?fields=id%2Cname%2Cemail&access_token=${req.body.access_token}`, (error, response, body) => {
      if (error) console.log(error)
      var userdata = JSON.parse(body)

      if (userdata.error == null) {
        let time = moment().valueOf()
        // produce access_token by email + time Now
        let nowTime = moment(time).format('YYYYMMDDHHmmss')
        let token = md5(`${userdata.email}` + `${nowTime}`)

        // get the time One hour later as access_expired
        let expiredtime = moment(time).add(1, 'h').format('YYYY-MM-DD HH:mm:ss')

        let fbsignInpost = {
          provider: 'facebook',
          name: userdata.name,
          email: userdata.email,
          access_token: token,
          access_expired: expiredtime,
          fb_id: userdata.id,
          fb_access_token: req.body.access_token
        }
        let fbsignInsql = `INSERT INTO user_object SET ?
                            ON DUPLICATE KEY UPDATE name = VALUES(name),
                                                   email = VALUES(email),
                                            access_token = VALUES(access_token),
                                          access_expired = VALUES(access_expired),
                                         fb_access_token = VALUES(fb_access_token)` // 如果FB的ID有重複 就更新使用者資料
        pool.query(fbsignInsql, fbsignInpost, async (err, results) => {
          if (err) console.log(err)
          else {
            console.log('FB signIN !! Insert into user_object successfully ! Ready to select ID from user_object')
            let userdatafromMysql = await fromMysql.selectdatafromWhere(pool, 'id ,access_token ,access_expired', 'user_object', `email = "${userdata.email}"`)
            var outputUser = {}
            var data = {}
            var user = {}
            user['id'] = `${userdatafromMysql[0].id}`
            user['provider'] = 'facebook'
            user['name'] = `${userdata.name}`
            user['email'] = `${userdata.email}`
            user['picture'] = 'null'

            data['access_token'] = `${userdatafromMysql[0].access_token}`
            data['access_expired'] = `${userdatafromMysql[0].access_expired}`
            data['user'] = user

            outputUser['data'] = data
            res.send(outputUser)
          }
        })
      } else {
        res.status(400).send(userdata)
      }
    })
  }
  } else {
  res.status(400).send({ error: 'Wrong Request' })
}
})

app.post('/user/signup' , async function (req,res){
  if (req.body.password === '' || req.body.name === '' || req.body.email === '') {
    res.status(400).send({error:'Name, email and password are required.'})
  } else {
    // check Email exists or not
    const checkEmail = await mysql.selectdatafromWhere('email', 'user', `email = "${req.body.email}"`)
    if (Object.keys(checkEmail).length === 0) {
      console.log('The email is valid , ready to insert into database')

      const time = moment().valueOf()
      // produce access_token by email + time Now
      const nowTime = moment(time).format('YYYYMMDDHHmmss')
      const token = md5(`${req.body.email}` + `${nowTime}`)
      // get the time One hour later as access_expired
      const expiredtime = moment(time).add(1, 'h').format('YYYY-MM-DD HH:mm:ss')

      const insertUserpost = {
        provider: 'native',
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        access_token: token,
        access_expired: expiredtime
      }
      var insertUser = await mysql.insertdataSet('user', insertUserpost)
      console.log('insert into user successfully ! Ready to select ID from user')
      var selectuser = await mysql.selectdatafromWhere('*', 'user', `email = "${req.body.email}"`)
      var outputUser = {
        data : {
          access_token: selectuser[0].access_token,
          access_expired: selectuser[0].access_expired,
          user : {
            id : selectuser[0].id ,
            provider : selectuser[0].provider,
            name :selectuser[0].name ,
            email : selectuser[0].email,
            picture :selectuser[0].picture
          }
        }
      }
      res.send(outputUser)
    } else if (Object.keys(checkEmail).length > 0) {
      console.log('error : Email Already Exists')
      res.status(400).send({error : 'Email Already Exists'})
    }
  }
})


app.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
