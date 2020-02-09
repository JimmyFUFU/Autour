var getperiod = function (body){
  var periodarray = []
  let type = body.timetype
  let startms = Date.parse(body.start.time) + 8*60*60*1000// 加八小
  let endms = Date.parse(body.end.time)+ 8*60*60*1000
  start = new Date (startms)
  end = new Date (endms)
  let startyear = start.getUTCFullYear(),
  startmonth = start.getUTCMonth(),
  startdate = start.getUTCDate(),
  starthour = start.getUTCHours(),
  endyear = end.getUTCFullYear(),
  endmonth = end.getUTCMonth(),
  enddate = end.getUTCDate(),
  endhour = end.getUTCHours()
  var days = ((Date.parse(new Date(endyear, endmonth, enddate)) - Date.parse(new Date(startyear, startmonth, startdate)))/86400000)+1 ;
  if (days == 1){
    periodarray.push( { year:startyear, month:startmonth+1 , date:startdate , period:oneDayPeriod(start , endhour , type) } )
    periodarray[0].period.start = { name : body.start.place , time : body.start.time }
    periodarray[0].period.end = { name : body.end.place , time : body.end.time }
    return periodarray
  }else{
    // 第一天
    periodarray.push( { year:startyear, month:startmonth+1 , date:startdate , period:oneDayPeriod(start , 22 , type) } )
    periodarray[0].period.start = { name : body.start.place , time : body.start.time }
    periodarray[0].period.end = { name : body.hotelarray[0].hotel }
    // 中間的天數 // 去頭尾
    for (var i = 1; i <= days-2; i++) {
      var today = new Date(startyear , startmonth , startdate+i , 08)
      periodarray.push( { year:today.getFullYear(), month:today.getMonth()+1 , date:today.getDate() , period:oneDayPeriod(today , 22 , type) } )
      periodarray[i].period.start = { name : body.hotelarray[i-1].hotel }
      periodarray[i].period.end = { name : body.hotelarray[i].hotel }
    }

    // 最後一天
    periodarray.push( { year:endyear, month:endmonth+1 , date:enddate , period:oneDayPeriod(new Date(endyear, endmonth, enddate , 8) , endhour , type) } )
    periodarray[days-1].period.start = { name : body.hotelarray[body.hotelarray.length-1].hotel }
    periodarray[days-1].period.end = { name : body.end.place , time : body.end.time }
    return periodarray
  }
}

function oneDayPeriod(today , endhour , type){
  let returnobj = {place:[]} , hourarr =[]
  let todayyear = today.getUTCFullYear(),
  todaymonth = today.getUTCMonth(),
  todaydate = today.getUTCDate(),
  todayhour = today.getUTCHours()

    switch (type) {
      case 'slow':
          hourarr = [10 , 12 , 14 , 16 , 18 , 20]
        break;
      case 'fast':
          hourarr = [08 , 10 , 12 , 14 , 16 , 18 , 19 , 21]
        break;
      default:
        return [{error:'get Period Error'}]
    }
    for (var i in hourarr) {
      if (hourarr[i] < endhour && hourarr[i] >= todayhour) {
        if(hourarr[i] === 12) returnobj.lunch = {name:'',time: new Date(todayyear, todaymonth, todaydate , hourarr[i]+8)}
        else if (hourarr[i] === 18) returnobj.dinner = {name:'',time: new Date(todayyear, todaymonth, todaydate , hourarr[i]+8)}
        else returnobj.place.push(  {name:'',time: new Date(todayyear, todaymonth, todaydate , hourarr[i]+8)} )
      }
    }
    return returnobj
}

module.exports.getperiod = getperiod;
