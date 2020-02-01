const cst = require('../secret/constant.js')
const sort = require('./sort.js')
const request = require('request')

const googleMapsClient = require('@google/maps').createClient({
  key: cst.API_KEY,
  Promise : Promise
});

var findplace = function (placename) {
  return new Promise(function(resolve, reject) {
    googleMapsClient.findPlace({
      input: placename,
      inputtype: 'textquery',
      language: 'zh-TW',
      fields: [
        'formatted_address', 'geometry', 'geometry/location', 'geometry/location/lat',
        'geometry/location/lng', 'geometry/viewport', 'geometry/viewport/northeast',
        'geometry/viewport/northeast/lat', 'geometry/viewport/northeast/lng',
        'geometry/viewport/southwest', 'geometry/viewport/southwest/lat',
        'geometry/viewport/southwest/lng', 'icon', 'name',
        'permanently_closed', 'photos', 'place_id', 'types',
        'opening_hours', 'price_level', 'rating', 'plus_code'
      ]
    } , (err,response) => {
      if(err) {
        console.log(err);
        reject(new Error('Google Error') )
      }
      else {
        resolve(response.json);
      }
    })
  });
}

var placedetail = function (placeid){
  return new Promise(function(resolve, reject) {
    googleMapsClient.place({
      placeid: placeid,
      language: 'zh-TW'
    } , (err,response) => {
      if(err) {
        console.log(err);
        reject(new Error('Google Error') )
      }
      else {
        resolve(response.json);
      }
    })
  })
}

var nearby = function (lat, lng, radius, type, n){
  return new Promise(function(resolve, reject) {
    let typelist = []
    for(let i in type){
      switch (type[i]) {
        case 'shopping':
          typelist = [...typelist, 'department_store', 'shopping_mall']
          break;
        case 'movie':
          typelist = [...typelist, 'movie_theater']
          break;
        case 'animal':
          typelist = [...typelist, 'zoo', 'aquarium']
          break;
        case 'spirit':
          typelist = [...typelist, 'art_gallery', 'museum', 'library', 'church', 'university']
          break;
        case 'sport':
          typelist = [...typelist ,'gym', 'bowling_alley', 'stadium']
          break;
        case 'eighteen':
          typelist = [...typelist ,'bar', 'night_club', 'casino']
          break;
        case 'Afternoon_tea':
          typelist = [...typelist ,'cafe' ]
          break;
        case 'tourist_attraction':
          typelist = [...typelist ,'tourist_attraction' ]
          break;
        case 'restaurant':
          typelist = [...typelist ,'restaurant' ]
          break;
        default:
          typelist = [...typelist]
      }
    }

    // type 一次只能指定一個 要跑loop
    var nearbylist = []
    for (let i = 0 ; i < typelist.length ; i++ ) {
      request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}+${lng}&radius=${radius}&types=${typelist[i]}&language='zh-TW'&key=${cst.API_KEY}` , (error, response, body)=>{
      body = JSON.parse(body)
       if(body.status === 'OK'){
          // 拿到要先找評分4分以上的 then sort by user_ratings_total  再拿前 n 個 (之後看天數決定)  S/O to 優質推薦
          var ratingThanFour = body.results.filter((item, index, array)=>{return item.rating >= 4});
          sort.by(ratingThanFour,'user_ratings_total')
          for (let j = 0; j < n; j++) {nearbylist = [...nearbylist , ratingThanFour[j] ] }
        }
        else if (error) {   //有其他錯都給空資料
          console.log(`(${typelist[i]})request error:`, error); // Print the error if one occurred
          empty = {user_ratings_total : -1 , rating : -1}
          for (let j = 0; j < n; j++) {nearbylist = [...nearbylist , empty ] }
        }else{
          console.log(`(${typelist[i]})No results or other google error`);
          empty = {user_ratings_total : -1 , rating : -1}
          for (let j = 0; j < n; j++) {nearbylist = [...nearbylist , empty ] }
        }
        // 蒐集完景點
        if(nearbylist.length === typelist.length*n) {resolve(nearbylist)}
      })
    }
  });
}

var distanceMatrix = function (origin , destination , type){
  return new Promise(function(resolve, reject) {
    googleMapsClient.distanceMatrix({
      origins: origin,
      destinations: destination,
      language: 'zh-TW',
      units: 'imperial',
    } ,  (err,response) => {
      if(err) {
        console.log(err);
        reject(new Error('Google Error') )
      }
      else {
        resolve(response.json);
      }
    })
  })
}

module.exports.findplace = findplace
module.exports.placedetail = placedetail
module.exports.nearby = nearby
module.exports.distanceMatrix = distanceMatrix
