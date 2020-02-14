const request = require('request')
const cst = require('../secret/constant.js')

var day = function (placeobj , day){
  if (placeobj.opening_hours) {
    for (var i in placeobj.opening_hours.periods) {
      if (placeobj.opening_hours.periods[i].open.day == 0 && placeobj.opening_hours.periods[i].open.time == "0000" && placeobj.opening_hours.periods.length == 1) { //24小時營業
        return true;
      }
      if (placeobj.opening_hours.periods[i].open.day == day) {
        return true;
      }
    }
    return false;
  }else{
    return true;
  }
}

var idday = function (placeid , day){
  return new Promise(function(resolve, reject) {
    request(`https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeid}&fields=opening_hours&key=${cst.API_KEY}` , (error, response, body)=>{
      body = JSON.parse(body)
      if(body.status === 'OK' && !body.result.opening_hours){
        // console.log(`place_id ${placeid} have no opening_hours`);
        resolve(true); //沒營業時間一樣給 true
      }
      else if(body.status === 'OK' && body.result.opening_hours){
        for (var i in body.result.opening_hours.periods) {
          if (body.result.opening_hours.periods[i].open.day == day) {
            resolve(true);
          }
          if (body.result.opening_hours.periods[i].open.day == 0 && body.result.opening_hours.periods[i].open.time == "0000" && body.result.opening_hours.periods.length == 1) { //24小時營業
            resolve(true);
          }
        }
        resolve(false);
      }else{
        console.log(`place_id ${placeid} check opening error`);
        resolve(false);
      }
    })
  })
}



module.exports.day = day;
module.exports.idday = idday;
