const express = require('express')
const request = require('request')
const bodyparser = require('body-parser')
const bearerToken = require('express-bearer-token')
const crypto = require('crypto')
const moment = require('moment')
const util = require('util')
const redis = require('redis')

const weight = require('./func/addweight.js')
const googlemap = require('./func/googlemap.js')
const radius = require('./func/radius.js')
const sort = require('./func/sort.js')
const period = require('./func/period.js')
const algorithm = require('./func/algorithm.js')
const mysql = require('./func/mysql.js')
const cst = require('./secret/constant.js')

const app = express()
const server = require('http').Server(app);
const io = require('socket.io')(server);
const googleMapsClient = require('@google/maps').createClient({
  key: cst.API_KEY,
  Promise : Promise
});
// connect Redis
const client = redis.createClient() // this creates a new client for redis
client.on('connect', () => {
  console.log('Redis client connected')
})
const PORT = 3000

// crypto MD5 Hex
function md5 (text) {
  return crypto.createHash('md5').update(text).digest('hex')
};
app.use('/', express.static('public'))
app.use(bodyparser.json({limit: '20mb', extended: true}))
app.use(bodyparser.urlencoded({limit: '20mb', extended: true}))
app.use(bearerToken())

app.post('/newAutour' , async function (req,res){

  // console.log(req.body);
//--------------------------------------------------------預備工作 先把時段放好--------------------------------------------------------//

  // 先算有多少時段 才知道要拿多少個景點 // 順便放好 起點 住宿 終點資訊
  var periodArray = period.getperiod(req.body)
  var warningarray = new Array()
  var AllTourPlaceIdlist = new Array() // 用來檢查所有景點不能重複

  try {
    // 找到每天起點、終點的資料
    var startPlaceList = new Array()
    for (let i in periodArray) {
      let startplace = await googlemap.findPlace(periodArray[i].period.start.name)
      if (startplace.candidates.length) { //如果這天的起點找的到的話 正常
        startPlaceList.push(startplace.candidates[0])
        periodArray[i].period.start.place_id = startplace.candidates[0].place_id
        periodArray[i].period.start.lat = startplace.candidates[0].geometry.location.lat
        periodArray[i].period.start.lng = startplace.candidates[0].geometry.location.lng
      }else{ // 找不到的話就拿他選擇的城市當起點
        warningarray.push({type: 'startplace' , day: i ,status: startplace.status})
        startplace = await googlemap.findPlace(req.body.city[0])
        startPlaceList.push(startplace.candidates[0])
        periodArray[i].period.start.replaceName = startplace.candidates[0].name
        periodArray[i].period.start.place_id = startplace.candidates[0].place_id
        periodArray[i].period.start.lat = startplace.candidates[0].geometry.location.lat
        periodArray[i].period.start.lng = startplace.candidates[0].geometry.location.lng
      }
      let endplace = await googlemap.findPlace(periodArray[i].period.end.name)
      if (endplace.candidates.length) {
        periodArray[i].period.end.place_id = endplace.candidates[0].place_id
        periodArray[i].period.end.lat = endplace.candidates[0].geometry.location.lat
        periodArray[i].period.end.lng = endplace.candidates[0].geometry.location.lng
      }else {
        warningarray.push({type: 'endplace' , day: i ,status: endplace.status})
        endplace = await googlemap.findPlace(req.body.city[0])
        periodArray[i].period.end.replaceName = endplace.candidates[0].name
        periodArray[i].period.end.place_id = endplace.candidates[0].place_id
        periodArray[i].period.end.lat = endplace.candidates[0].geometry.location.lat
        periodArray[i].period.end.lng = endplace.candidates[0].geometry.location.lng
      }
    }
  //-------------------------------------------------------- must go --------------------------------------------------------//

    var mustgoList = new Array()
    for (let i in req.body.mustgo) {
      let mustgoPlace = await googlemap.findPlace(req.body.mustgo[i])
      if (mustgoPlace.candidates.length) {
        let mustgoplacedetail = await googlemap.placeDetail(mustgoPlace.candidates[0].place_id) // candidates[0] 選第一個
        mustgoList.push(mustgoplacedetail.result)
      }else {
        warningarray.push({type: 'mustgo' , name: req.body.mustgo[i] ,status: 'ZERO_RESULTS'}) // 沒找到的話給警告
      }
    }
    // console.log('mustgoList finish !');
    // 放進適合的日子的 placelist
    // 先找到每天起點的 place_id
    let startPlaceId = new Array()
    for (let i in startPlaceList) { startPlaceId.push(`place_id:${startPlaceList[i].place_id}`) }

    for (let i in mustgoList) {
      let getMoveCost = await googlemap.distanceMatrix(startPlaceId , [`place_id:${mustgoList[i].place_id}`] , 'walking')
      let moveCostMatrix = algorithm.toMatrix(getMoveCost , 'mostgo') // 轉成 Matrix
      let theNearest = 0 , minWeight = -1 , mustgoOpeningCheck = false
      for(let j = 0 ; j < moveCostMatrix.length ; j++) {

        let thisMustgoMatrix = algorithm.openingMatrix( [mustgoList[i]] , periodArray[j].period.place )
        for (let x = 0; x < thisMustgoMatrix.length; x++) {
          if (thisMustgoMatrix[x][0] && moveCostMatrix[j][0] != -1) {
            if (minWeight == -1 || moveCostMatrix[j][0] < minWeight) {
              if ( mustgoList[i].types.includes('amusement_park') && periodArray[j].period.place.length < 3 ) {
                break
              }else {
                minWeight = moveCostMatrix[j][0]
                theNearest = j
                mustgoOpeningCheck = true
                break
              }
            }
          }
        }
      }
      if (mustgoOpeningCheck) {
        // 如果是 amusement_park 放兩個 如果評論 > 9560 放三個
        if(mustgoList[i].types.includes('amusement_park')) {
          let items = 2
          if (mustgoList[i].user_ratings_total >= 9560) { items = 3 }
          else if (mustgoList[i].user_ratings_total < 500) { items = 1 }
          for (let p = 0; p < items; p++) {
             periodArray[theNearest].placelist.push({name : mustgoList[i].name ,
                                                     place_id : mustgoList[i].place_id ,
                                                     lat : mustgoList[i].geometry.location.lat ,
                                                     lng : mustgoList[i].geometry.location.lng } )
          }
        }else{
          periodArray[theNearest].placelist.push({name : mustgoList[i].name ,
                                                  place_id : mustgoList[i].place_id ,
                                                  lat : mustgoList[i].geometry.location.lat ,
                                                  lng : mustgoList[i].geometry.location.lng } )
        }
        AllTourPlaceIdlist.push(mustgoList[i].place_id)
      }else{
        warningarray.push({type: 'mustgo' , name: mustgoList[i].name ,status: 'IS_NOT_OPEN'})
      }
    }
    console.log('mustgoList push in periodArray.placelist !');

  //-----------------------------------------------------END must go --------------------------------------------------------//

  // --------------------------------------------------排每天的景點進 placelist-----------------------------------------------//

    for (let i in periodArray) {
      io.emit('server message', {day: Number(i)+1 , msg: `day ${Number(i)+1} start`})
      console.log(`\nday ${i} started`);
      let remain = periodArray[i].period.place.length - periodArray[i].placelist.length // 今天還剩多少時段
      let finalPlaceList = new Array() // 拿來放這天會找到的所有景點
      //先把這天的mustgo放進finalPlaceList
      for (let t = 0; t < periodArray[i].placelist.length; t++) {
        for (var u = 0; u < mustgoList.length; u++) {
          if (periodArray[i].placelist[t].place_id == mustgoList[u].place_id ) {
            finalPlaceList.push(mustgoList[u])
          }
        }
      }
      console.log(`day${i} remain ${remain} periods`);

      // 還有剩時段才需要給偏好跟推薦的景點
      if (remain > 0) {
        //prefer go ( nearBy start place so I need to get geocode first )
        let nearByPlace = await googlemap.nearBy(startPlaceList[i].geometry.location.lat,
          startPlaceList[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          req.body.prefertype,
          periodArray[i].period.place.length )
        nearByPlace = nearByPlace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in nearByPlace) {
          let thisnearbyplacedetail = await googlemap.placeDetail(nearByPlace[u].place_id)
          nearByPlace[u] = thisnearbyplacedetail.result
        }
        console.log(`day${i} nearByPlace finish !`);
        // console.log(`day${i} 找到 ${nearByPlace.length} 個 nearByPlace `);

        // 加上系統自己推薦 tourist_attraction
        let morePlace = await googlemap.nearBy(startPlaceList[i].geometry.location.lat,
          startPlaceList[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          ['tourist_attraction'],
          periodArray[i].period.place.length )
        morePlace = morePlace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in morePlace) {
          let thismoreplacedetail = await googlemap.placeDetail(morePlace[u].place_id)
          morePlace[u] = thismoreplacedetail.result
        }
        console.log(`day${i} morePlace finish !`);
        // console.log(`day${i} 找到 ${morePlace.length} 個 morePlace `);

        //給權重 取得綜合分數
        weight.addscore(nearByPlace,0.8)
        weight.addscore(morePlace,0.5)

        // 合併 nearByPlace & morePlace 去掉重複
        for (let u in nearByPlace) {
          let duplicatedCheck = false
          for (let j in finalPlaceList) {
            if (finalPlaceList[j].id == nearByPlace[u].id ) { duplicatedCheck = true }
          }
          if (!duplicatedCheck) { finalPlaceList.push(nearByPlace[u]) }
        }
        for (let u in morePlace) {
          let duplicatedCheck = false
          for (let j in finalPlaceList) {
            if (finalPlaceList[j].id == morePlace[u].id ) { duplicatedCheck = true }
          }
          if (!duplicatedCheck) { finalPlaceList.push(morePlace[u]) }
        }

        // sortby score
        sort.by(finalPlaceList , 'score')

        // console.log(`day${i} 最後有 ${finalPlaceList.length} 個 finalPlaceList `);
        periodArray[i].placeREC = new Array()
        let count = 0 // 算要放幾個進去

        for (let p in finalPlaceList) {

          let check = false , openingCheck = false
          for (let j in AllTourPlaceIdlist)  { if (AllTourPlaceIdlist[j] == finalPlaceList[p].place_id ) { check = true } }
          for (let j in periodArray[i].placelist) { if (periodArray[i].placelist[j].place_id == finalPlaceList[p].place_id ) { check = true } }
          let onePlaceOpening = algorithm.openingMatrix([finalPlaceList[p]] , periodArray[i].period.place)
          for (let j in onePlaceOpening) { if (onePlaceOpening[t][0]) { openingCheck = true } }

          if ( !check && openingCheck) {
            if (count < remain) {
              if( finalPlaceList[p].types.includes('amusement_park') ) {
                let item = 0
                if (finalPlaceList[p].user_ratings_total >= 9560 && remain-count >= 3) {
                  item = 3
                  AllTourPlaceIdlist.push(finalPlaceList[p].place_id)
                }else if (finalPlaceList[p].user_ratings_total < 9560 && finalPlaceList[p].user_ratings_total >= 500 && remain-count >= 2 ) {
                  item = 2
                  AllTourPlaceIdlist.push(finalPlaceList[p].place_id)
                }else if (finalPlaceList[p].user_ratings_total < 500 && remain-count >= 1) {
                  item = 1
                  AllTourPlaceIdlist.push(finalPlaceList[p].place_id)
                }else if (remain-count <= 0) {
                  // 是遊樂園但是時間不夠
                  periodArray[i].placeREC.push({name:finalPlaceList[p].name ,
                    place_id:finalPlaceList[p].place_id ,
                    lat : finalPlaceList[p].geometry.location.lat,
                    lng : finalPlaceList[p].geometry.location.lng });
                  break
                }
                for (let p = 0; p < item; p++) {
                  periodArray[i].placelist.push({name:finalPlaceList[p].name ,
                    place_id:finalPlaceList[p].place_id ,
                    lat : finalPlaceList[p].geometry.location.lat,
                    lng : finalPlaceList[p].geometry.location.lng });
                  count++;
                }
              }else{
                AllTourPlaceIdlist.push(finalPlaceList[p].place_id)
                periodArray[i].placelist.push({name:finalPlaceList[p].name ,
                  place_id:finalPlaceList[p].place_id ,
                  lat : finalPlaceList[p].geometry.location.lat,
                  lng : finalPlaceList[p].geometry.location.lng });
                count++;
              }
            }else if (count >= remain) {
                periodArray[i].placeREC.push({name:finalPlaceList[p].name ,
                  place_id:finalPlaceList[p].place_id ,
                  lat : finalPlaceList[p].geometry.location.lat,
                  lng : finalPlaceList[p].geometry.location.lng });
                  count++;
            }
         }
       }
        if (count < remain) {
          warningarray.push({type: 'finalPlaceList' , day: i ,status: 'Not_enough_recommended_places'})
        }
      }

      var allpath
      var placeopeningMatrix
      var shortpath
      var openingMatrixCheck = false
      var swapcount = 0
      var placelistcount = periodArray[i].placelist.length-1

      while (!openingMatrixCheck) {

        let placeListDetail = new Array() // 等等用來看營業時間
        let idArray = new Array()
        idArray.push(`place_id:${periodArray[i].period.start.place_id}`)// push 起點
        for (let y in periodArray[i].placelist) {
          idArray.push(`place_id:${periodArray[i].placelist[y].place_id}`) // 把 placelist 裡每個景點的 place_id push 進 idArray
          for (let x = 0; x < finalPlaceList.length; x++) {
            if (finalPlaceList[x].place_id == periodArray[i].placelist[y].place_id) {
              placeListDetail.push(finalPlaceList[x]) // 把 finalPlaceList 裡每個景點 push 進 placeListDetail
              break
            }
          }
        }
        idArray.push(`place_id:${periodArray[i].period.end.place_id}`) // push 終點
        let getMoveCost = await googlemap.distanceMatrix(idArray , idArray , 'driving') // 拿到點與點的移動成本
        let moveCostMatrix = algorithm.toMatrix(getMoveCost , 'nearby') //  轉成 Matrix
        allpath = algorithm.find2PointAllPath(moveCostMatrix,0,idArray.length-1) // 拿到所有路徑
        sort.bysmall2big(allpath , "weight")
        placeopeningMatrix = algorithm.openingMatrix( placeListDetail , periodArray[i].period.place ) // 二維陣列 每個時段*每個景點
        console.log("Matrix\n", placeopeningMatrix);
        let shortpathobj = algorithm.findShortestPath(allpath, placeopeningMatrix)
        shortpath = shortpathobj.path
        if (placeopeningMatrix.length == 0) {
          openingMatrixCheck = true
          console.log('No period , Do not need check opening');
          break
        }

        // 檢查 shortpath 是不是全部都是 false
        if (shortpathobj.truecount < placeopeningMatrix.length) {
          console.log(`day ${i} have opening issue`);
          // 先檢查有沒有點換
          if (periodArray[i].placeREC.length != 0) {
            // 要選一個點替換掉
            for (let y = periodArray[i].placelist.length-1 ; y >= 0 ; y--) {
              if (swapcount == periodArray[i].placeREC.length+1) {
                swapcount = 0
                placelistcount--
              }else {
                // 不能是mustgoList裡面的點
                let ifinmustgolist = false
                for (let p in mustgoList) {
                  if (periodArray[i].placelist[placelistcount].place_id == mustgoList[p].place_id ) { ifinmustgolist = true }
                }
                if (!ifinmustgolist) { //能換就換

                  //AllTourPlaceIdlist 要把原本的拿出來
                  AllTourPlaceIdlist.splice(AllTourPlaceIdlist.indexOf(periodArray[i].placelist[placelistcount].place_id),1)
                  periodArray[i].placeREC.push({
                    name: periodArray[i].placelist[placelistcount].name,
                    place_id: periodArray[i].placelist[placelistcount].place_id,
                    lat: periodArray[i].placelist[placelistcount].lat,
                    lng: periodArray[i].placelist[placelistcount].lng })
                    let firstplaceREC = periodArray[i].placeREC.shift()
                    periodArray[i].placelist[placelistcount] = firstplaceREC
                    AllTourPlaceIdlist.push(firstplaceREC.place_id)
                    swapcount++
                    break // 交換成功就再去外面試一次
                  }
                if (y == 0) { // 從最後一個已經檢查到第一個 代表沒有點可以換(全部都是mustgo) 不要刪 給提示
                    warningarray.push({type: 'opening_issue' , day : i , status: 'All_mustgo'})
                    openingMatrixCheck = true
                  }
              }
            }
          }else {
            // 沒景點換 不要刪 給提示
            warningarray.push({type: 'opening_issue' , day : i , status: 'No_placeREC'})
            openingMatrixCheck = true
            break
          }
        }else {
          console.log('opening Matrix check over !');
          break
        }
      }
      console.log(`day${i} shortpath`, shortpath);

      for (let k = 1 ; k < shortpath.length-1 ; k++) {
        periodArray[i].period.place[k-1].name = periodArray[i].placelist[shortpath[k]-1].name
        periodArray[i].period.place[k-1].lat = periodArray[i].placelist[shortpath[k]-1].lat
        periodArray[i].period.place[k-1].lng = periodArray[i].placelist[shortpath[k]-1].lng
        periodArray[i].period.place[k-1].place_id = periodArray[i].placelist[shortpath[k]-1].place_id
      }

      let lunchdetailarr = new Array()
      let dinnerdetailarr = new Array()
      for (let q = 0; q < periodArray[i].period.place.length; q++) {
        let utchour = new Date(periodArray[i].period.place[q].time).getUTCHours()
        // 找午餐
        if (utchour == 10 || utchour == 13 || utchour == 14) {
          if (periodArray[i].period.lunch) {
            let lunch = await googlemap.nearBy(periodArray[i].period.place[q].lat, periodArray[i].period.place[q].lng, 1000, ['restaurant'] , 4 )
            lunch = lunch.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
            lunch = lunch.filter((item, index, array)=>{return item.types.indexOf('lodging') == -1});
            for (let u in lunch) {
              let lunchdetail = await googlemap.placeDetail(lunch[u].place_id)
              if (algorithm.openingMatrix([lunchdetail.result] , [periodArray[i].period.lunch])[0]) {  // 去掉中午沒開的
                lunchdetailarr.push(lunchdetail.result)
              }
            }
          }
        }

        // 找晚餐
        if (utchour == 16 || utchour == 17 || utchour == 19 || utchour == 20) {
          if (periodArray[i].period.dinner) {
            let dinner = await googlemap.nearBy(periodArray[i].period.place[q].lat, periodArray[i].period.place[q].lng, 1000, ['restaurant'], 4 )
            dinner = dinner.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
            dinner = dinner.filter((item, index, array)=>{return item.types.indexOf('lodging') == -1})
            for (let o in dinner) {
              let dinnerdetail = await googlemap.placeDetail(dinner[o].place_id)
              if (algorithm.openingMatrix([dinnerdetail.result] , [periodArray[i].period.dinner])[0]) { // 去掉晚餐沒開的
                dinnerdetailarr.push(dinnerdetail.result)
              }
            }
          }
        }

        if (q == periodArray[i].period.place.length-1) {
          if (lunchdetailarr.length != 0) {
            sort.by(lunchdetailarr , 'user_ratings_total')
            let lunchCheck = false
            for (let o in lunchdetailarr) {
              let check = false
              for (let k in AllTourPlaceIdlist) {
                if (AllTourPlaceIdlist[k] == lunchdetailarr[o].place_id ) { check = true }
              }
              if (!check) {
                lunchCheck = true
                periodArray[i].period.lunch.name = lunchdetailarr[o].name
                periodArray[i].period.lunch.place_id = lunchdetailarr[o].place_id
                periodArray[i].period.lunch.lat = lunchdetailarr[o].geometry.location.lat
                periodArray[i].period.lunch.lng = lunchdetailarr[o].geometry.location.lng
                AllTourPlaceIdlist.push(lunchdetailarr[o].place_id)
              }
            }
            if (!lunchCheck) {
              warningarray.push({type: 'lunch' , day: i ,status:  "ZERO_RESULTS" })
            }
            // periodArray[i].lunchREC = lunchdetailarr // 8 個左右
          }else {
            warningarray.push({type: 'lunch' , day: i ,status:  "ZERO_RESULTS" })
          }
          if (dinnerdetailarr.length != 0) {
            sort.by(dinnerdetailarr , 'user_ratings_total')
            let dinnerCheck = false
            for (let o in dinnerdetailarr) {
              let check = false
              for (let k in AllTourPlaceIdlist) {
                if (AllTourPlaceIdlist[k] == dinnerdetailarr[o].place_id ) { check = true }
              }
              if (!check) {
                dinnerCheck= true
                periodArray[i].period.dinner.name = dinnerdetailarr[o].name
                periodArray[i].period.dinner.place_id = dinnerdetailarr[o].place_id
                periodArray[i].period.dinner.lat = dinnerdetailarr[o].geometry.location.lat
                periodArray[i].period.dinner.lng = dinnerdetailarr[o].geometry.location.lng
                AllTourPlaceIdlist.push(dinnerdetailarr[o].place_id)
              }
            }
            if (!dinnerCheck) {
              warningarray.push({type: 'dinner' , day: i ,status:  "ZERO_RESULTS" })
            }
            // periodArray[i].dinnerREC = dinnerdetailarr // 8 個左右
          }else {
            warningarray.push({type: 'dinner' , day: i ,status:  "ZERO_RESULTS" })
          }
        }

      }
      console.log(`day ${i} lunch & dinner are OK !`);
      console.log(`day ${i} finished`);
      io.emit('server message', {day:Number(i)+1 , msg: `day ${Number(i)+1} finish`})

    }
    console.log('periodArray finish !');

    res.status(200).send( {periodArray: periodArray, warningarray : warningarray} )
  } catch (e) {
    console.log(e);
    res.status(400).send({error:e})
  }
})

app.post('/storeAutour' , async function (req,res){
  try {
    var thisuser = await mysql.selectDataFromWhere('*' , 'user' , { id : req.body.userid })
    if(Object.keys(thisuser).length === 0){
      console.log('User Not found')
      res.status(400).send({ error: 'User Not found' })
    }else{
      const inserttourpost = {
        id: moment(moment().valueOf()).format('YYMMDDHHmmssSSS'),
        userid: req.body.userid,
        tourtitle: req.body.tourtitle,
        tourdetail: req.body.tour,
        warningarray: req.body.warningarray,
        prefertype: req.body.prefertype,
        timetype : req.body.timetype,
        transportation : req.body.transportation
      }
      await mysql.insertDataSet('tour',inserttourpost)
      res.status(200).send({ success: true })
    }
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error: 'DB error'})
  }
})

app.get('/getAutour' , async function(req,res){
  try {
    var tourdetail = await mysql.selectDataFromWhere('*', 'tour' , { id : req.query.id })
    tourdetail = JSON.stringify(tourdetail)
    tourdetail = JSON.parse(tourdetail)
    res.status(200).send(tourdetail)
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error: 'DB error'})
  }
})

app.delete('/deleteAutour' , async function(req,res){
  try {
    let userdetail = await mysql.selectDataFromWhere('id', 'user' , {access_token : req.token} )
    await mysql.deleteFromWhere( 'tour' , {userid : userdetail[0].id , id : req.headers.id})
    res.status(200).send({success : true})
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({success : false})
  }
})

app.put('/revisetitle' , async function(req,res){
  try {
    await mysql.updateDataFromWhere('tour', {tourtitle : req.body.revisetitle} , {id : req.body.tourId} )
    res.status(200).send({success:true})
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({success:false})
  }
})

app.post('/user/login' , async function (req,res){
  switch (req.body.provider) {
    case 'native':
      if ( !req.body.email.length || !req.body.password.length) {
        res.status(400).send({error : 'Email and password are required'})
      } else {
        let userDetails = await mysql.selectDataFromWhere('*', 'user', {email : req.body.email , password : req.body.password , provider : req.body.provider })
        if ( !Object.keys(userDetails).length ) {
          console.log('User Not found')
          res.status(400).send({ error: 'Please check your Email or Password' })
        } else {
          // Give a new access_token and new access_expired once the user Signin
          const time = moment().valueOf()
          // produce a new access_token by email + time
          const token = md5(`${req.body.email}` + `${time}`)
          // get the time One hour later as new access_expired
          const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')
          await mysql.updateDataFromWhere('user', {provider : req.body.provider , access_token : token , access_expired : expiredtime }, { email : req.body.email , provider : req.body.provider } )
          console.log('NEW Log In !! UPDATE provider and token and expired successfully ~ ')
          const signInOutputUser = {
            data : {
              access_token: token,
              access_expired: expiredtime,
              user : {
                id : userDetails[0].id ,
                provider : userDetails[0].provider,
                name :userDetails[0].name ,
                email : userDetails[0].email,
                picture :userDetails[0].picture
              }
            }
          }
          res.send(signInOutputUser)
          console.log('User is found')
        }
      }
      break;
    case 'facebook':
      if ( !req.body.access_token ) {
        res.status(400).send({error : 'Request Error: Access token is required.'})
      } else {
      // if FB access_token exists  // get information from Facebook API
      request(`https://graph.facebook.com/v5.0/me?fields=email%2Cname%2Cpicture&access_token=${req.body.access_token}`, async (error, response, body) => {
        if (error) console.log(error)
        let userdata = JSON.parse(body)
        try {
          if (!userdata.error) {
            const time = moment().valueOf()
            // produce access_token by email + time
            const token = md5(`${userdata.email}` + `${time}`)
            // get the time One hour later as access_expired
            const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')

            const fbLogInPost = {
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
            const fbLogInUpdate = `name = VALUES(name),email = VALUES(email),picture = VALUES(picture),access_token = VALUES(access_token),access_expired = VALUES(access_expired),three_rd_access_token = VALUES(three_rd_access_token)`
            await mysql.insertDataSetUpdate( 'user' , fbLogInPost , fbLogInUpdate)
            console.log('FB Log In ! Insert into user successfully ! Ready to select ID from user')
            const userdataFromMysql = await mysql.selectDataFromWhere('*', 'user', { three_rd_id : userdata.id , provider : req.body.provider})
            const outputUser = {
              data : {
                access_token : `${userdataFromMysql[0].access_token}` ,
                access_expired : `${userdataFromMysql[0].access_expired}` ,
                user : {
                  id : userdataFromMysql[0].id,
                  provider: userdataFromMysql[0].provider,
                  name:  userdataFromMysql[0].name,
                  email: userdataFromMysql[0].email,
                  picture : userdataFromMysql[0].picture
                }
              }
            }
            res.status(200).send(outputUser)
          }else{
            console.log('FB login Error : ' , userdata.error.message);
            res.status(400).send({ error: 'Wrong Request' })
          }
        }catch (e) {
          console.log(e.name, ':', e.message);
          res.status(400).send({ error: 'Wrong Request' })
        }
      })
    }
      break;
    case 'google':
      if ( !req.body.access_token ) {
        res.status(400).send({error : 'Request Error: Access token is required.'})
      } else {
      request(`https://oauth2.googleapis.com/tokeninfo?id_token=${req.body.access_token}` , async (error , response , body) => {
        if (error) console.log(error)
        var userdata = JSON.parse(body)
        try {
          if (!userdata.error) {
            const time = moment().valueOf()
            // produce access_token by email + time Now
            const token = md5(`${userdata.email}` + `${time}`)

            // get the time One hour later as access_expired
            const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')
            const googlePost = {
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
            const googleUpdate = `name = VALUES(name),email = VALUES(email),picture = VALUES(picture),access_token = VALUES(access_token),access_expired = VALUES(access_expired),three_rd_access_token = VALUES(three_rd_access_token)`
            await mysql.insertDataSetUpdate( 'user' , googlePost , googleUpdate)
            console.log('Google Log In ! Insert into user successfully ! Ready to select ID from user')
            const userdataFromMysql = await mysql.selectDataFromWhere('*', 'user', {email : userdata.email , provider : req.body.provider } )
            const outputUser = {
              data : {
                access_token : `${userdataFromMysql[0].access_token}` ,
                access_expired : `${userdataFromMysql[0].access_expired}` ,
                user : {
                  id : userdataFromMysql[0].id,
                  provider: userdataFromMysql[0].provider,
                  name:  userdataFromMysql[0].name,
                  email: userdataFromMysql[0].email,
                  picture : userdataFromMysql[0].picture
                }
              }
            }
            res.status(200).send(outputUser)
          }else {
            console.log('Google login Error : ' , userdata.error.message);
            res.status(400).send({ error: 'Wrong Request' })
          }
        }catch (e) {
          console.log(e.name, ':', e.message);
          res.status(400).send({ error: 'Wrong Request' })
        }
      })
    }
      break;
    default:
      res.status(400).send({ error: 'Wrong Request' })
  }
})

app.post('/user/signup' , async function (req,res){
  try {
    if (!req.body.password.length || !req.body.name.length || !req.body.email.length) {
      res.status(400).send({error:'Name, Email and Password are required.'})
    } else {
      // check Email exists or not
      const checkEmail = await mysql.selectDataFromWhere('email', 'user', {email : req.body.email} )
      if (!Object.keys(checkEmail).length) {
        console.log('The email is valid , ready to insert into database')

        const time = moment().valueOf()
        // produce access_token by email + time
        const token = md5(`${req.body.email}` + `${time}`)
        // get the time One hour later as access_expired
        const expiredtime = moment(time).add(6, 'h').format('YYYY-MM-DD HH:mm:ss')

        const insertUserPost = {
          provider: 'native',
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
          access_token: token,
          access_expired: expiredtime
        }
        await mysql.insertDataSet('user', insertUserPost)
        console.log('Insert into user successfully ! Ready to select ID from user')
        const theNewUser = await mysql.selectDataFromWhere('*', 'user', {email : req.body.email })
        const outputUser = {
          data : {
            access_token: theNewUser[0].access_token,
            access_expired: theNewUser[0].access_expired,
            user : {
              id : theNewUser[0].id ,
              provider : theNewUser[0].provider,
              name :theNewUser[0].name ,
              email : theNewUser[0].email,
              picture :theNewUser[0].picture
            }
          }
        }
        res.send(outputUser)
      } else {
        console.log('error : Email Already Exists')
        res.status(400).send({error : 'Email Already Exists'})
      }
    }
  } catch (e) {
    console.log(e.name, ':', e.message);
    res.status(400).send({error : 'Something error'})
  }
})

app.get('/user/profile' , async function(req,res){
  if (!req.headers.authorization) {
    res.status(403).send({ error: 'Wrong Request: Authorization is required.' })
  }else{
    //先找使用者
    const userdetail = await mysql.selectDataFromWhere('*' , 'user' , {access_token : req.token} )
    if (!Object.keys(userdetail).length) {
      res.status(403).send( { error: 'Invalid Access Token' })
    }else{
      const time = moment().valueOf()
      const expiredtime = userdetail[0].access_expired
      if ( !moment(expiredtime).isBefore(time) ) {
        let userTour = await mysql.selectDataFromWhere('id , tourtitle' , 'tour' , { userid : userdetail[0].id })
        userTour = JSON.stringify(userTour)
        userTour = JSON.parse(userTour)
        const profileObj = {
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

app.post('/google/getFastMatrix' , async function (req,res){
// `day:${req.body.day}`,
  client.hexists(`${req.body.tourid}`, `day:${req.body.day}`, async function (err, reply) {
      if (err) {
        console.log(err.name, ':', err.message)
        res.status(400).send('error')
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

})

server.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
