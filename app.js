const express = require('express')
const request = require('request')
const bodyparser = require('body-parser')

const weight = require('./func/addweight.js')
const googlemap = require('./func/googlemap.js')
const radius = require('./func/radius.js')
const cst = require('./secret/constant.js')


const app = express()


const PORT = 3000



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
  var mustgolist = []
  // must go
  for (var i in req.body.mustgo) {
    let mustgoplace = await googlemap.findplace(req.body.mustgo[i])
    let mustgoplacedetail = await googlemap.placedetail(mustgoplace.candidates[0].place_id)
    mustgolist.push(mustgoplacedetail.result)
  }

  //prefer go ( nearby start place so I need to get geocode first )
  let startplace = await googlemap.findplace(req.body.start.place)
  let nearbyplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),req.body.prefertype,2)

  // 加上系統自己推薦 tourist_attraction
  let moreplace = await googlemap.nearby(startplace.candidates[0].geometry.location.lat,startplace.candidates[0].geometry.location.lng,radius.getradius(req.body.transportation),['tourist_attraction'],2)
  res.send(moreplace)

  //給權重



})


app.listen(PORT , ()=>{
  console.log(`App is running on port ${PORT}!`)
})
