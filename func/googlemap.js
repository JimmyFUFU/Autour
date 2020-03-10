const cst = require('../secret/constant.js')
const sort = require('./sort.js')
const request = require('request')

const googleMapsClient = require('@google/maps').createClient({
  key: cst.API_KEY,
  Promise : Promise
});

const findPlace = function (placename) {
  return new Promise(function(resolve, reject) {
    googleMapsClient.findPlace({
      input: placename,
      inputtype: 'textquery',
      language: cst.LANGUAGE,
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

const placeDetail = function (placeid){
  return new Promise(function(resolve, reject) {
    googleMapsClient.place({
      placeid: placeid,
      language: cst.LANGUAGE
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

const nearBy = function (lat, lng, radius, type, items){
  return new Promise(function(resolve, reject) {
    let typeList = new Array()
    for(let i in type){
      switch (type[i]) {
        case 'shopping':
          typeList = [...typeList, 'department_store', 'shopping_mall']
          break;
        case 'movie':
          typeList = [...typeList, 'movie_theater']
          break;
        case 'animal':
          typeList = [...typeList, 'zoo', 'aquarium']
          break;
        case 'spirit':
          typeList = [...typeList, 'art_gallery', 'museum', 'library', 'church']
          break;
        case 'sport':
          typeList = [...typeList ,'gym', 'bowling_alley', 'stadium']
          break;
        case 'eighteen':
          typeList = [...typeList ,'bar', 'night_club', 'casino']
          break;
        case 'Afternoon_tea':
          typeList = [...typeList ,'cafe' ]
          break;
        case 'tourist_attraction':
          typeList = [...typeList ,'tourist_attraction' ]
          break;
        case 'restaurant':
          typeList = [...typeList ,'restaurant' ]
          break;
        default:
          typeList = [...typeList]
      }
    }
    // type 一次只能指定一個 要跑loop
    let nearbylist = new Array()
    if(items <= 0 || !typeList.length) resolve(nearbylist)
    else {
      // 某些type 不要太多 看 countitems ()
      let nearbyTotalItems = 0
      typeList.forEach((item, i) => {nearbyTotalItems += countitems(item , items)});
      for (let i = 0 ; i < typeList.length ; i++ ) {
        request(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat}+${lng}&radius=${radius}&types=${typeList[i]}&language=${cst.LANGUAGE}&key=${cst.API_KEY}` , (error, response, body)=>{
          let empty = {user_ratings_total : -1 , rating : -1}
          if (error) {
            console.log(`(${typeList[i]})request error:`, error); // Print the error if one occurred
            for (let j = 0; j < countitems(typeList[i] , items); j++) {nearbylist.push(empty) }
          }else{
            body = JSON.parse(body)
            if(body.status === 'OK'){
              // 拿到要先找評分 4 (??) 分以上的 then sort by user_ratings_total  再拿前 n 個 (之後看天數決定)  S/O to 優質推薦
              let ratingThanFour = body.results.filter((item, index, array)=>{return item.rating >= 3.8});
              sort.desc(ratingThanFour,'user_ratings_total')
              for (let j = 0; j < countitems(typeList[i] , items); j++) {
                if (ratingThanFour[j] == undefined) nearbylist.push(empty)
                else { nearbylist = [...nearbylist , ratingThanFour[j] ] }
              }
            }else {
              console.log(`${typeList[i]} : ${body.status}`);
              for (let j = 0; j < countitems(typeList[i] , items); j++) {nearbylist.push(empty)}
            }
          }
          // 蒐集完景點
          if(nearbylist.length == nearbyTotalItems) {resolve(nearbylist)}
        })
      }
    }
  })
}

const distanceMatrix = function (origin , destination , type){
  return new Promise(function(resolve, reject) {
    googleMapsClient.distanceMatrix({
      origins: origin,
      destinations: destination,
      language: cst.LANGUAGE,
      units: 'metric',
      mode:type
    } ,  (err,response) => {
      if(err) {
        console.log(err);
        return reject(new Error('Google Error'))
      }
      resolve(response.json);
    })
  })
}

function countitems(typename , items) {
  switch (typename) {
    case  'movie_theater' :
      return Math.ceil(items/6)
      break;
    case 'bar':
      return Math.ceil(items/6)
      break;
    case 'night_club':
      return Math.ceil(items/6)
      break;
    case 'casino':
      return Math.ceil(items/6)
      break;
    case 'cafe':
      return Math.ceil(items/6)
      break;
    case 'aquarium':
      return Math.ceil(items/6)
      break;
    case 'zoo':
      return Math.ceil(items/6)
      break;
    case 'gym':
      return Math.ceil(items/6)
      break;
    case 'bowling_alley':
      return Math.ceil(items/6)
      break;
    case 'stadium':
      return Math.ceil(items/6)
      break;
    case 'art_gallery':
      return Math.ceil(items/2)
      break;
    case 'museum':
      return Math.ceil(items/2)
      break;
    case 'library':
      return Math.ceil(items/6)
      break;
    case 'church':
      return Math.ceil(items/6)
      break;
    case 'department_store':
      return Math.ceil(items/2)
      break;
    case 'shopping_mall':
      return Math.ceil(items/2)
      break;
    default:
      return items
  }
}

module.exports = {
  findPlace,
  placeDetail,
  nearBy,
  distanceMatrix
}
