const getperiod = function (body){
  let periodArray = new Array()
  let type = body.timetype

  let start = new Date (Date.parse(body.start.time))
  let end = new Date (Date.parse(body.end.time))

  let startYear = start.getFullYear(),
  startMonth = start.getMonth(),
  startDate = start.getDate(),
  startWeek = start.getDay(),
  // startHour = start.getHours(),
  endYear = end.getFullYear(),
  endMonth = end.getMonth(),
  endDate = end.getDate(),
  endWeek = end.getDay(),
  endHour = end.getHours()

  const days = ((Date.parse(new Date(endYear, endMonth, endDate)) - Date.parse(new Date(startYear, startMonth, startDate)))/86400000)+1 ;

  if (days == 1){
    periodArray.push({ year: startYear, month: startMonth+1, date: startDate, week: startWeek, period: oneDayPeriod(start, endHour, type) })
    periodArray[0].period.start = { name: body.start.place, time: body.start.time }
    periodArray[0].period.end = { name: body.end.place, time: body.end.time }
    periodArray[0].placelist = new Array()
    return periodArray
  }else{
    // 第一天
    periodArray.push({ year: startYear, month: startMonth+1, date: startDate, week: startWeek, period: oneDayPeriod(start, 22, type) })
    periodArray[0].period.start = { name: body.start.place, time: body.start.time }
    periodArray[0].period.end = { name: body.hotelarray[0].hotel }
    periodArray[0].placelist = new Array()
    // 中間的天數 // 去頭尾
    for (let i = 1; i <= days-2; i++) {
      let today = new Date(Date.UTC(startYear , startMonth , startDate+i))
      periodArray.push( { year:today.getFullYear(), month:today.getMonth()+1 , date:today.getDate() , week:today.getDay() , period:oneDayPeriod(today , 22 , type) } )
      periodArray[i].period.start = { name : body.hotelarray[i-1].hotel }
      periodArray[i].period.end = { name : body.hotelarray[i].hotel }
      periodArray[i].placelist = new Array()
    }
    // 最後一天
    periodArray.push( { year: endYear, month: endMonth+1 , date: endDate, week: endWeek, period: oneDayPeriod(new Date(Date.UTC(endYear, endMonth, endDate)), endHour , type) } )
    periodArray[days-1].period.start = { name: body.hotelarray[body.hotelarray.length-1].hotel }
    periodArray[days-1].period.end = { name: body.end.place, time: body.end.time }
    periodArray[days-1].placelist = new Array()
    return periodArray
  }
}

function oneDayPeriod(today , endHour , type){
  let returnobj = {place: new Array()}
  let hourArray = new Array()
  let todayYear = today.getFullYear(),
  todayMonth = today.getMonth(),
  todayDate = today.getDate(),
  todayHour = today.getHours()

  switch (type) {
    case 'slow':
      hourArray = [10 , 12 , 14 , 16 , 18 , 20]
      break;
    case 'fast':
      hourArray = [10 , 12 , 13 , 15 , 17 , 18 , 19 , 21]
      break;
    default:
      return [{error:'get Period Error'}]
  }
  for (let i in hourArray) {
    if (hourArray[i] < endHour && hourArray[i] >= todayHour) {
        if(hourArray[i] == 12) returnobj.lunch = {name:'',time: new Date(Date.UTC(todayYear, todayMonth, todayDate , hourArray[i]))}
        else if (hourArray[i] == 18) returnobj.dinner = {name:'',time: new Date(Date.UTC(todayYear, todayMonth, todayDate , hourArray[i]))}
        else returnobj.place.push({name:'',time: new Date(Date.UTC(todayYear, todayMonth, todayDate , hourArray[i]))})
      }
  }
  return returnobj
}

module.exports.getperiod = getperiod;
