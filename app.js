const express = require('express')
const request = require('request')
const bodyparser = require('body-parser')

const weight = require('./func/addweight.js')
const googlemap = require('./func/googlemap.js')
const radius = require('./func/radius.js')
const sort = require('./func/sort.js')
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


// request nearby
app.get('/nearby' , (req,res)=>{
  var radius = 30000
  var type = ['department_store','shopping_mall','movie_theater']
  var lat = 25.0407554
  var lng = 121.5476781
  request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}+${lng}&radius=${radius}&types=${type}&key=${cst.API_KEY}` , (error, response, body)=>{
    console.log('error:', error); // Print the error if one occurred
    console.log('statusCode:', response && response.statusCode);
    console.log('body:', body);
    res.json(JSON.parse(body))
  })
})

// npm geocode
app.get('/geocode' , (req, res)  => {
  googleMapsClient.geocode({
    address: '110台北市信義區基隆路一段178號'
  }, function(err, response) {
    if(err) console.log(err);
    else if (!err) {
      console.log(response.json.results);
      res.send(response.json.results)
    }
  });
})



app.post('/newAutour' , async function (req,res){
  var quantity = 2
  var mustgolist = []
  // must go
  for (var i in req.body.mustgo) {
    let mustgoplace = await googlemap.findplace(req.body.mustgo[i])
    let mustgoplacedetail = await googlemap.placedetail(mustgoplace.candidates[0].place_id) // candidates[0] 選第一個
    mustgolist.push(mustgoplacedetail.result)
  }
  //prefer go ( nearby start place so I need to get geocode first )
  let startplace = await googlemap.findplace(req.body.start.place)
  let nearbyplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),req.body.prefertype,quantity)
  nearbyplace = nearbyplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料
  // 加上系統自己推薦 tourist_attraction
  let moreplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),['tourist_attraction'],quantity)
  moreplace = moreplace.filter((item, index, array)=>{return item.rating >= 0}); // 去掉空資料
  //給權重 取得綜合分數
  weight.addscore(nearbyplace,0.8)
  weight.addscore(moreplace,0.5)
  // 合併
  moreplace.forEach((item, i) => {nearbyplace = [...nearbyplace , moreplace[i]]});
  // sortby score
  sort.by(nearbyplace , 'score')
  for (var i in nearbyplace) {nearbyplace[i] = await googlemap.placedetail(nearbyplace[i].place_id)}
  // 放進最後的陣列 要把重複的去掉
  var finalPlaceList = []
  mustgolist.forEach((item, i) => {finalPlaceList = [...finalPlaceList , mustgolist[i]]});
  for (var i in nearbyplace) {
    let check = false
    for (var j in finalPlaceList) {if (finalPlaceList[j].id === nearbyplace[i].result.id ) {  check = true }  }
    if ( check == false ) finalPlaceList.push(nearbyplace[i].result)
  }

  //
  let idarray =  [`place_id:${startplace.candidates[0].place_id}`]
  finalPlaceList.forEach((item, i) => { idarray = [...idarray , `place_id:${finalPlaceList[i].place_id}` ]});
  var getMoveCost = await googlemap.distanceMatrix(idarray , idarray , 'driving')
  res.send(getMoveCost)



})


app.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
