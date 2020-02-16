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
const opening = require('./func/opening.js')
const mysql = require('./func/mysql.js')
const cst = require('./secret/constant.js')

const app = express()
const googleMapsClient = require('@google/maps').createClient({
  key: cst.API_KEY,
  Promise : Promise
});
const PORT = 3000

// crypto MD5 Hex
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
};

app.use('/', express.static('public'))
app.use(bodyparser.urlencoded({
  extended: false
}))
app.use(bodyparser.json())
app.use(bearerToken())

app.get('/array' , (req,res)=>{
  console.log( algorithm.openingMatrix([req.body.lunchdetail] , [req.body.lunch]) );
  res.send('123')
})

app.post('/test' , async (req, res)  => {
  var AllTourPlaceIdlist = new Array()
  let periodarray = req.body.periodarray
  for (let i in periodarray) {

    let lunchdetailarr = new Array()
    let dinnerdetailarr = new Array()

    for (let q = 0; q < periodarray[i].period.place.length; q++) {

      let utchour = new Date(periodarray[i].period.place[q].time).getUTCHours()
      // 找午餐
      if (utchour == 10 || utchour == 14) {
        let lunch = await googlemap.nearby(periodarray[i].period.place[q].lat, periodarray[i].period.place[q].lng, 1000, ['restaurant'] , 5 )
        lunch = lunch.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in lunch) {
          let check = false
          for (let k in AllTourPlaceIdlist) {
            if (AllTourPlaceIdlist[k] === lunch[u].place_id ) { check = true }
          }
          if (!check) {
            let lunchdetail = await googlemap.placedetail(lunch[u].place_id)
            if (opening.restaurant(lunchdetail.result , periodarray[i].lunch.time)) {  // 去掉中午沒開的
              lunchdetailarr.push(lunchdetail.result)
              AllTourPlaceIdlist.push(lunch[u].place_id)
            }
          }
        }
      }

      // 找晚餐
      if (utchour == 16 || utchour == 19 || utchour == 20) {
        let dinner = await googlemap.nearby(periodarray[i].period.place[q].lat, periodarray[i].period.place[q].lng, 1000, ['restaurant'], 5 )
        dinner = dinner.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料

        for (let o in dinner) { // 去掉今天沒開的
          let check = false
          for (let k in AllTourPlaceIdlist) {
            if (AllTourPlaceIdlist[k] === dinner[o].place_id ) { check = true }
          }
          if (!check) {
            let dinnerdetail = await googlemap.placedetail(dinner[o].place_id)
            if (opening.day( dinnerdetail.result , periodarray[i].week )) {
              dinnerdetailarr.push(dinnerdetail.result)
              AllTourPlaceIdlist.push(dinner[o].place_id)
            }
          }
        }
      }

      if (q == periodarray[i].period.place.length-1) {
        sort.by(lunchdetailarr , 'user_ratings_total')
        periodarray[i].period.lunch.name = lunchdetailarr[0].name
        periodarray[i].period.lunch.place_id = lunchdetailarr[0].place_id
        periodarray[i].period.lunch.lat = lunchdetailarr[0].geometry.location.lat
        periodarray[i].period.lunch.lng = lunchdetailarr[0].geometry.location.lng
        periodarray[i].lunchREC = lunchdetailarr // 10 個左右

        sort.by(dinnerdetailarr , 'user_ratings_total')
        periodarray[i].period.dinner.name = dinnerdetailarr[0].name
        periodarray[i].period.dinner.place_id = dinnerdetailarr[0].place_id
        periodarray[i].period.dinner.lat = dinnerdetailarr[0].geometry.location.lat
        periodarray[i].period.dinner.lng = dinnerdetailarr[0].geometry.location.lng
        periodarray[i].dinnerREC = dinnerdetailarr // 10 個左右
      }
    }
  }
  res.send(periodarray)
})


app.post('/newAutour' , async function (req,res){

//--------------------------------------------------------預備工作 先把時段放好--------------------------------------------------------//
  // 先算有多少時段 才知道要拿多少個景點 // 順便放好 起點 住宿 終點資訊
  let periodarray = period.getperiod(req.body)



  /*try {
    // 找到每天起點、終點的資料
    var startplacelist = new Array()
    for (let k in periodarray) {
      let startplace = await googlemap.findplace(periodarray[k].period.start.name)
      startplacelist.push(startplace.candidates[0])
      periodarray[k].period.start.place_id = startplace.candidates[0].place_id
      periodarray[k].period.start.lat = startplace.candidates[0].geometry.location.lat
      periodarray[k].period.start.lng = startplace.candidates[0].geometry.location.lng
      let endplace = await googlemap.findplace(periodarray[k].period.end.name)
      periodarray[k].period.end.place_id = endplace.candidates[0].place_id
      periodarray[k].period.end.lat = endplace.candidates[0].geometry.location.lat
      periodarray[k].period.end.lng = endplace.candidates[0].geometry.location.lng
    }

    var AllTourPlaceIdlist = new Array()


  //-------------------------------------------------------- must go --------------------------------------------------------//

    var mustgolist = []
    for (var i in req.body.mustgo) {
      let mustgoplace = await googlemap.findplace(req.body.mustgo[i])
      let mustgoplacedetail = await googlemap.placedetail(mustgoplace.candidates[0].place_id) // candidates[0] 選第一個
      mustgolist.push(mustgoplacedetail.result)
    }
    console.log('mustgolist finish !');
    // 放進適合的天的placelist
    // 先找到每天起點的 place_id
    var startplaceid = new Array()
    for (let k in startplacelist) { startplaceid.push(`place_id:${startplacelist[k].place_id}`) }

    for (let i in mustgolist) {
      let getMoveCost = await googlemap.distanceMatrix(startplaceid , [`place_id:${mustgolist[i].place_id}`] , 'driving')
      // 轉成 Matrix
      let moveCostMatrix = algorithm.toMatrix(getMoveCost)
      let theNearest = 0 , minweight = -1
      for(let j = 0 ; j < moveCostMatrix.length ; j++){
        if( opening.day( mustgolist[i] , periodarray[j].week ) ){
          if (minweight == -1 || moveCostMatrix[j][0] < minweight) {
            minweight = moveCostMatrix[j][0]
            theNearest = j
          }
        }
      }
      // 如果是 amusement_park 放兩個 如果評論 > 9560 放三個
      if(mustgolist[i].types.includes('amusement_park')) {
        let n = 2
        if (mustgolist[i].user_ratings_total >= 9560) { n = 3}
        else if (mustgolist[i].user_ratings_total < 500) { n = 1}
        for (var p = 0; p < n; p++) {
           periodarray[theNearest].placelist.push({name : mustgolist[i].name ,
                                                   place_id : mustgolist[i].place_id ,
                                                   lat : mustgolist[i].geometry.location.lat ,
                                                   lng : mustgolist[i].geometry.location.lng } )
         }
      }else{
        periodarray[theNearest].placelist.push({name : mustgolist[i].name ,
                                                place_id : mustgolist[i].place_id ,
                                                lat : mustgolist[i].geometry.location.lat ,
                                                lng : mustgolist[i].geometry.location.lng } )
      }
      AllTourPlaceIdlist.push(mustgolist[i].place_id)
    }
    console.log('mustgolist push in periodarray.placelist !');

  //-------------------------------------------------------- must go --------------------------------------------------------//

  // --------------------------------------------------排每天的景點進 placelist-----------------------------------------------//

    for (let i in periodarray) {
      let idarray = [`place_id:${periodarray[i].period.start.place_id}`]
      let remain = periodarray[i].period.place.length - periodarray[i].placelist.length // 今天還剩多少時段

      // console.log(`day${i} 原本有 ${periodarray[i].period.place.length} 已經有 ${periodarray[i].placelist.length} 個時段`);
      // console.log(`day${i} 還剩 ${remain}個時段`);

      // 還有剩才需要給偏好跟推薦
      if (remain > 0) {
        //prefer go ( nearby start place so I need to get geocode first )
        let nearbyplace = await googlemap.nearby(startplacelist[i].geometry.location.lat,
          startplacelist[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          req.body.prefertype,
          periodarray[i].period.place.length )
          nearbyplace = nearbyplace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
          for (let o in nearbyplace) {
            let check = await opening.idday(nearbyplace[o].place_id , periodarray[i].week)
            nearbyplace[o].openingcheck = check
          }
          // 去掉今天完全沒開的 (有保留沒營業時間的)
          nearbyplace = nearbyplace.filter((item, index, array)=>{return item.openingcheck == true });
          console.log(`day${i} nearbyplace finish !`);

          // console.log(`day${i} 找到 ${nearbyplace.length} 個 nearbyplace `);

          // 加上系統自己推薦 tourist_attraction
          let moreplace = await googlemap.nearby(startplacelist[i].geometry.location.lat,
            startplacelist[i].geometry.location.lng,
            radius.getradius(req.body.transportation),
            ['tourist_attraction'],
            periodarray[i].period.place.length )
            moreplace = moreplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料
            for (let o in moreplace) {
              let check = await opening.idday(moreplace[o].place_id , periodarray[i].week)
              moreplace[o].openingcheck = check
            }
            // 去掉今天完全沒開的 (有保留沒營業時間的)
            moreplace = moreplace.filter((item, index, array)=>{return item.openingcheck == true });
            console.log(`day${i} moreplace finish !`);

            // console.log(`day${i} 找到 ${moreplace.length} 個 moreplace `);

            //給權重 取得綜合分數
            weight.addscore(nearbyplace,0.8)
            weight.addscore(moreplace,0.5)

            // 合併 nearbyplace & moreplace 去掉重複
            var finalPlaceList = new Array()

            for (let u in nearbyplace) {
              let check = false
              for (let j in finalPlaceList) {
                if (finalPlaceList[j].id === nearbyplace[u].id ) {
                  check = true
                }
              }
              for (let k in AllTourPlaceIdlist) {
                if (AllTourPlaceIdlist[k] === nearbyplace[u].place_id ) {
                  check = true
                }
              }
              if ( check == false ) {
                finalPlaceList.push(nearbyplace[u])
                AllTourPlaceIdlist.push(nearbyplace[u].place_id)
              }
            }

            for (let u in moreplace) {
              let check = false
              for (let j in finalPlaceList) {
                if (finalPlaceList[j].id === moreplace[u].id ) {
                  check = true
                }
              }
              for (let k in AllTourPlaceIdlist) {
                if (AllTourPlaceIdlist[k] === moreplace[u].place_id ) {
                  check = true
                }
              }
              if ( check == false ) {
                finalPlaceList.push(moreplace[u])
                AllTourPlaceIdlist.push(moreplace[u].place_id)
              }
            }

            // sortby score
            sort.by(finalPlaceList , 'score')

            // console.log(`day${i} 最後有 ${finalPlaceList.length} 個 finalPlaceList `);

            let count = 0
            for (var p in finalPlaceList) {
              if (count == remain) break
              let check = false
              for (let j in periodarray[i].placelist) {if (periodarray[i].placelist[j].id === finalPlaceList[p].place_id ) {  check = true }  }
              if ( check == false ) {
                periodarray[i].placelist.push({name:finalPlaceList[p].name ,
                  place_id:finalPlaceList[p].place_id ,
                  lat : finalPlaceList[p].geometry.location.lat,
                  lng : finalPlaceList[p].geometry.location.lng });
                  count++;
                }
              }
      }

      var placelistdetail = new Array() // 等等用來看營業時間
      for (let y in periodarray[i].placelist) {
        idarray.push(`place_id:${periodarray[i].placelist[y].place_id}`)
        let thisPlaceDetail = await googlemap.placedetail(periodarray[i].placelist[y].place_id)
        placelistdetail.push(thisPlaceDetail.result)
      }

      idarray.push(`place_id:${periodarray[i].period.end.place_id}`)

      let getMoveCost = await googlemap.distanceMatrix(idarray , idarray , 'driving')
      let moveCostMatrix = algorithm.toMatrix(getMoveCost)

      let allpath = algorithm.find2pointAllPath(moveCostMatrix,0,idarray.length-1)
      sort.bysmall2big(allpath , "weight")

      // console.log('placelist' , periodarray[i].placelist);

      let placeopeningMatrix = algorithm.openingMatrix( placelistdetail , periodarray[i].period.place )

      var shortpath = algorithm.findShortestPath(allpath ,placeopeningMatrix )
      console.log(`day${i} shortpath` , shortpath);

      for (let k = 1 ; k < shortpath.length-1 ; k++) {
        periodarray[i].period.place[k-1].name = periodarray[i].placelist[shortpath[k]-1].name
        periodarray[i].period.place[k-1].lat = periodarray[i].placelist[shortpath[k]-1].lat
        periodarray[i].period.place[k-1].lng = periodarray[i].placelist[shortpath[k]-1].lng
        periodarray[i].period.place[k-1].place_id = periodarray[i].placelist[shortpath[k]-1].place_id
      }

      for (let q = 0; q < periodarray[i].period.place.length; q++) {
        let utchour = new Date(periodarray[i].period.place[q].time).getUTCHours()

        // 找午餐
        if (utchour == 10) {
          let lunch = await googlemap.nearby(periodarray[i].period.place[q].lat, periodarray[i].period.place[q].lng, 1000, ['restaurant'] , 5 )
          let lunchdetailarr = new Array()
          lunch = lunch.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
          lunch = lunch.filter((item, index, array)=>{return item.types.indexOf('bar') == -1 && item.types.indexOf('cafe') == -1 && item.types.indexOf('lodging') == -1}); // 去掉 bar lodging cafe

          for (let o in lunch) { // 去掉今天沒開的
            let lunchdetail = await googlemap.placedetail(lunch[o].place_id)
            if (opening.day( lunchdetail.result , periodarray[i].week )) {
              lunchdetailarr.push(lunchdetail.result)
            }
          }

          sort.by(lunchdetailarr , 'user_ratings_total')
          let no1lunch = lunchdetailarr[0]
          periodarray[i].period.lunch.name = lunchdetailarr[0].name
          periodarray[i].period.lunch.place_id = lunchdetailarr[0].place_id
          periodarray[i].period.lunch.lat = lunchdetailarr[0].geometry.location.lat
          periodarray[i].period.lunch.lng = lunchdetailarr[0].geometry.location.lng
          // periodarray[i].lunchREC = lunchdetailarr
        }

        // 找晚餐
        if (utchour == 16) {
          let dinner = await googlemap.nearby(periodarray[i].period.place[q].lat, periodarray[i].period.place[q].lng, 1000, ['restaurant'], 5 )
          let dinnerdetailarr = new Array()
          dinner = dinner.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
          dinner = dinner.filter((item, index, array)=>{return item.types.indexOf('bar') == -1 && item.types.indexOf('cafe') == -1 && item.types.indexOf('lodging') == -1}); // 去掉 bar lodging cafe

          for (let o in dinner) { // 去掉今天沒開的
            let dinnerdetail = await googlemap.placedetail(dinner[o].place_id)
            if (opening.day( dinnerdetail.result , periodarray[i].week )) {
              dinnerdetailarr.push(dinnerdetail.result)
            }
          }

          sort.by(dinner , 'user_ratings_total')
          periodarray[i].period.dinner.name = dinnerdetailarr[0].name
          periodarray[i].period.dinner.place_id = dinnerdetailarr[0].place_id
          periodarray[i].period.dinner.lat = dinnerdetailarr[0].geometry.location.lat
          periodarray[i].period.dinner.lng = dinnerdetailarr[0].geometry.location.lng
          // periodarray[i].dinnerREC = dinnerdetailarr

        }
      }
      console.log(`day ${i} lunch & dinner are OK !`);

    }
    console.log('periodarray finish !');
    res.status(200).send(periodarray)
  } catch (e) {
    res.status(400).send({error:e})
  }*/

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
        tourtitle:req.body.tourtitle,
        tourdetail:req.body.tour
      }
      await mysql.insertdataSet('tour',inserttourpost)
      res.status(200).send({ success: true })
    }
  } catch (e) {
    res.status(400).send({ error: 'DB error' })
  }
})

app.get('/getAutour' , async function(req,res){

  var tourdetail = await mysql.selectdatafromWhere('tourdetail , tourtitle','tour' , `id = "${req.query.id}"`)
  tourdetail = JSON.stringify(tourdetail)
  tourdetail = JSON.parse(tourdetail)
  res.status(200).send(tourdetail)
})

app.delete('/deleteAutour' , async function(req,res){
  try {
    var userdetail = await mysql.selectdatafromWhere('id', 'user' , `access_token = "${req.token}"`)
    await mysql.deletefromwhere( 'tour' , `userid = "${userdetail[0].id}" && id = "${req.headers.id}"`)
    res.status(200).send({success : true})
  } catch (e) {
    console.log(e);
    res.status(400).send({success : false})
  }
})

app.put('/revisetitle' , async function(req,res){

})

app.post('/user/login' , async function (req,res){

  if (req.body.provider === 'native') {
    if (req.body.email === '' || req.body.password === '') {
      res.status(400).send({error : 'Email and password are required'})
    } else {
      var userdetails = await mysql.selectdatafromWhere('*', 'user', `email = '${req.body.email}' AND password = '${req.body.password}' AND provider = "${req.body.provider}"`)
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

        var updateTokenExpired = await mysql.updatedatafromWhere('user', `provider = '${req.body.provider}' , access_token = '${token}', access_expired = '${expiredtime}'`, `email = '${req.body.email}' AND provider = "${req.body.provider}"`)
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
      res.status(400).send({error : 'Request Error: access token is required.'})
    } else {
      // if FB access_token exists  // get information from Facebook API
      request(`https://graph.facebook.com/v5.0/me?fields=email%2Cname%2Cpicture&access_token=${req.body.access_token}`, async (error, response, body) => {
        if (error) console.log(error)
        var userdata = JSON.parse(body)
        try {
          if (userdata.error == null) {
            let time = moment().valueOf()
            // produce access_token by email + time Now
            let nowTime = moment(time).format('YYYYMMDDHHmmss')
            let token = md5(`${userdata.email}` + `${nowTime}`)

            // get the time One hour later as access_expired
            let expiredtime = moment(time).add(1, 'h').format('YYYY-MM-DD HH:mm:ss')

            let fbsignInpost = {
              provider: req.body.provider,
              name: userdata.name,
              email: userdata.email,
              picture : userdata.picture.data.url,
              access_token: token,
              access_expired: expiredtime,
              three_rd_id: userdata.id,
              three_rd_access_token: req.body.access_token
            }

             // 如果FB的ID有重複 就更新使用者資料
            let fbsignupdate = `name = VALUES(name),email = VALUES(email),picture = VALUES(picture),access_token = VALUES(access_token),access_expired = VALUES(access_expired),three_rd_access_token = VALUES(three_rd_access_token)`
            await mysql.insertdataSetUpdate( 'user' , fbsignInpost , fbsignupdate)
            console.log('FB signIN !! Insert into user_object successfully ! Ready to select ID from user_object')
            let userdatafromMysql = await mysql.selectdatafromWhere('*', 'user', `three_rd_id = "${userdata.id}" AND provider = "${req.body.provider}"`)
            var outputUser = {
              data : {
                access_token : `${userdatafromMysql[0].access_token}` ,
                access_expired : `${userdatafromMysql[0].access_expired}` ,
                user : {
                  id : userdatafromMysql[0].id,
                  provider: userdatafromMysql[0].provider,
                  name:  `${userdata.name}`,
                  email: `${userdata.email}`,
                  picture : `${userdata.picture.data.url}`
                }
              }
            }
            res.status(200).send(outputUser)
          }
        }catch (e) {
          console.log(e);
          res.status(400).send({ error: 'Wrong Request' })
        }
      })
    }
  } else if (req.body.provider === 'google'){
    if (req.body.access_token == null) {
      res.status(400).send({error : 'Request Error: access token is required.'})
    } else {
      request(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.access_token}` , async (error , response , body) => {
        if (error) console.log(error)
        var userdata = JSON.parse(body)
        try {
          if (userdata.error == null) {
            let time = moment().valueOf()
            // produce access_token by email + time Now
            let nowTime = moment(time).format('YYYYMMDDHHmmss')
            let token = md5(`${userdata.email}` + `${nowTime}`)

            // get the time One hour later as access_expired
            let expiredtime = moment(time).add(1, 'h').format('YYYY-MM-DD HH:mm:ss')

            let googlepost = {
              provider: req.body.provider,
              name: userdata.name,
              email: userdata.email,
              picture : userdata.picture,
              access_token: token,
              access_expired: expiredtime,
              three_rd_access_token: req.body.access_token,
              three_rd_id : req.body.google_Id
            }

             // 如果FB的ID有重複 就更新使用者資料
            let googleupdate = `name = VALUES(name),email = VALUES(email),picture = VALUES(picture),access_token = VALUES(access_token),access_expired = VALUES(access_expired),three_rd_access_token = VALUES(three_rd_access_token)`
            await mysql.insertdataSetUpdate( 'user' , googlepost , googleupdate)
            console.log('Google signIN !! Insert into user_object successfully ! Ready to select ID from user_object')
            let userdatafromMysql = await mysql.selectdatafromWhere('*', 'user', `email = "${userdata.email}" AND provider = "${req.body.provider}"`)
            var outputUser = {
              data : {
                access_token : `${userdatafromMysql[0].access_token}` ,
                access_expired : `${userdatafromMysql[0].access_expired}` ,
                user : {
                  id : userdatafromMysql[0].id,
                  provider: userdatafromMysql[0].provider,
                  name:  userdatafromMysql[0].name,
                  email: userdatafromMysql[0].email,
                  picture : userdatafromMysql[0].picture
                }
              }
            }
            res.status(200).send(outputUser)
          }
        }catch (e) {
          console.log(e);
          res.status(400).send({ error: 'Wrong Request' })
        }
      })
    }
  }else {
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

app.get('/user/profile' , async function(req,res){
  if (!req.headers.authorization) {
    res.status(403).send({ error: 'Wrong Request: authorization is required.' })
  }else{
    //先找使用者
    var userdetail = await mysql.selectdatafromWhere('*' , 'user' , `access_token = "${req.token}"`)
    if (Object.keys(userdetail).length === 0) {
      res.status(403).send( { error: 'Invalid Access Token' })
    }else{
      var time = moment().valueOf()
      var expiredtime = userdetail[0].access_expired
      if (moment(expiredtime).isBefore(time) === false) {
        var userTour = await mysql.selectdatafromWhere('id , tourtitle' , 'tour' , `userid = "${userdetail[0].id}"`)
        userTour = JSON.stringify(userTour)
        userTour = JSON.parse(userTour)
        var profileObj = {
          user :{
            id : userdetail[0].id,
            name :　userdetail[0].name,
            email : userdetail[0].email,
            picture : userdetail[0].picture
          },
          tour : userTour
        }
        res.status(200).send(profileObj)
      }else {
        res.status(403).send({ error: 'The token is expired , Please log in again' })
      }
    }
  }
})



app.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
