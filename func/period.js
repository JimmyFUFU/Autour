var getperiod = function (body){
  var periodarray = []
  let type = body.timetype

  let startms = Date.parse(body.start.time)
  let endms = Date.parse(body.end.time)
  start = new Date (startms)
  end = new Date (endms)
  let startyear = start.getFullYear(),
  startmonth = start.getMonth(),
  startdate = start.getDate(),
  startweek = start.getDay(),
  starthour = start.getHours(),
  endyear = end.getFullYear(),
  endmonth = end.getMonth(),
  enddate = end.getDate(),
  endweek = end.getDay(),
  endhour = end.getHours()

  var days = ((Date.parse(new Date(endyear, endmonth, enddate)) - Date.parse(new Date(startyear, startmonth, startdate)))/86400000)+1 ;
  if (days == 1){
    periodarray.push( { year:startyear, month:startmonth+1 , date:startdate , week:startweek , period:oneDayPeriod(start , endhour , type) } )
    periodarray[0].period.start = { name : body.start.place , time : body.start.time }
    periodarray[0].period.end = { name : body.end.place , time : body.end.time }
    periodarray[0].placelist = new Array()
    return periodarray
  }else{
    // 第一天
    periodarray.push( { year:startyear, month:startmonth+1 , date:startdate , week:startweek, period:oneDayPeriod(start , 22 , type) } )
    periodarray[0].period.start = { name : body.start.place , time : body.start.time }
    periodarray[0].period.end = { name : body.hotelarray[0].hotel }
    periodarray[0].placelist = new Array()
    // 中間的天數 // 去頭尾
    for (var i = 1; i <= days-2; i++) {
      var today = new Date(Date.UTC(startyear , startmonth , startdate+i ))
      periodarray.push( { year:today.getFullYear(), month:today.getMonth()+1 , date:today.getDate() , week:today.getDay() , period:oneDayPeriod(today , 22 , type) } )
      periodarray[i].period.start = { name : body.hotelarray[i-1].hotel }
      periodarray[i].period.end = { name : body.hotelarray[i].hotel }
      periodarray[i].placelist = new Array()
    }

    // 最後一天
    periodarray.push( { year:endyear, month:endmonth+1 , date:enddate , week:endweek , period:oneDayPeriod(new Date(Date.UTC(endyear, endmonth, enddate )) , endhour , type) } )
    periodarray[days-1].period.start = { name : body.hotelarray[body.hotelarray.length-1].hotel }
    periodarray[days-1].period.end = { name : body.end.place , time : body.end.time }
    periodarray[days-1].placelist = new Array()
    return periodarray
  }

}

function oneDayPeriod(today , endhour , type){
  let returnobj = {place:[]} , hourarr =[]
  let todayyear = today.getFullYear(),
  todaymonth = today.getMonth(),
  todaydate = today.getDate(),
  todayhour = today.getHours()

    switch (type) {
      case 'slow':
          hourarr = [10 , 12 , 14 , 16 , 18 , 20]
        break;
      case 'fast':
          hourarr = [10 , 12 , 13 , 15 , 17 , 18 , 19 , 21]
        break;
      default:
        return [{error:'get Period Error'}]
    }
    for (var i in hourarr) {
      if (hourarr[i] < endhour && hourarr[i] >= todayhour) {
        if(hourarr[i] === 12) returnobj.lunch = {name:'',time: new Date(Date.UTC(todayyear, todaymonth, todaydate , hourarr[i]))}
        else if (hourarr[i] === 18) returnobj.dinner = {name:'',time: new Date(Date.UTC(todayyear, todaymonth, todaydate , hourarr[i]))}
        else returnobj.place.push(  {name:'',time: new Date(Date.UTC(todayyear, todaymonth, todaydate , hourarr[i]))} )
      }
    }
    return returnobj
}

module.exports.getperiod = getperiod;
