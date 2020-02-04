const express = require('express')
const request = require('request')
const bodyparser = require('body-parser')

const weight = require('./func/addweight.js')
const googlemap = require('./func/googlemap.js')
const radius = require('./func/radius.js')
const sort = require('./func/sort.js')
const period = require('./func/period.js')
const algorithm = require('./func/algorithm.js')
const cst = require('./secret/constant.js')

const app = express()
const googleMapsClient = require('@google/maps').createClient({
  key: cst.API_KEY,
  Promise : Promise
});

const PORT = 5000

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
  //prefer go ( nearby start place so I need to get geocode first )
  let startplace = await googlemap.findplace(req.body.start.place)
  let endplace = await googlemap.findplace(req.body.end.place)
  let nearbyplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),req.body.prefertype,quantity)
  nearbyplace = nearbyplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料
  // 加上系統自己推薦 tourist_attraction
  let moreplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),['tourist_attraction'],quantity)
  moreplace = moreplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料
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

    for (let j = 0 ; j < periodarray[i].period.place.length ; j++) { // 景點們
      idarray.push(`place_id:${finalPlaceList[count].place_id}`)
      namearray.push(finalPlaceList[count].name)
      count++
    }

    let end = await googlemap.findplace(periodarray[i].period.end.name) // 終點
    idarray.push(`place_id:${end.candidates[0].place_id}`)
    namearray.push(end.candidates[0].name)

    var getMoveCost = await googlemap.distanceMatrix(idarray , idarray , 'driving')
    // 轉成 Matrix
    var moveCostMatrix = algorithm.toMatrix(getMoveCost)
    // 找到從起點到終點走過所有點的最短路徑
    var shortpath = algorithm.find2pointShortestPath(moveCostMatrix,0,idarray.length-1)
    // 依照最段路徑設置 把名字放進去
    for (let k = 0 ; k < periodarray[i].period.place.length ; k++) {
      periodarray[i].period.place[k].name = namearray[shortpath[k+1]]
    }
  }

  res.status(200).send(periodarray)

})


app.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
