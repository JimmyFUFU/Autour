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

module.exports.day = day;
