const sort = require('./sort.js')

var find2pointAllPath = function(matrix , start ,end){

  var minpath = []

  var mainstack = [] , substack = []
  var eachsubstack = []
  var minweight = 0
  mainstack.push(start)
  for (let i = 0 ; i < matrix.length ; i++){
    if(matrix[start][i]>0){eachsubstack.push(i)}
  }
  substack.push(eachsubstack)
  var count = 0
  while (mainstack.length !== 0) {

    var substacklastarr = substack[substack.length-1]

    if (substacklastarr && substacklastarr.length>0) {
      var thissubstack = substack.pop()
      var eachsubstack = []
      var newpop = thissubstack.shift()
      mainstack.push(newpop)
      substack.push(thissubstack)

      for (let i = 0 ; i < matrix.length ; i++){
        if(matrix[newpop][i]>=0 && mainstack.indexOf(i) === -1){eachsubstack.push(i)}
      }
      substack.push(eachsubstack)

    }else{
      mainstack.pop()
      substack.pop()
    }
    if (mainstack[mainstack.length-1] === end) {
      if(mainstack.length === matrix.length) {
        let weight = 0
        for(let i = 0 ; i < mainstack.length-1 ; i++){
          weight += matrix[mainstack[i]][mainstack[i+1]]
        }
        minpath.push({path:[] , weight :weight})
        // minpath[count] = []
        mainstack.forEach((item, i) => {minpath[count].path.push(item)});
        count++
        // 直接找最小
        // if(minweight == 0 || weight < minweight) {
        //   minweight = weight;
        //   minpath = [];
        //   mainstack.forEach((item, i) => {minpath.push(item)});
        // }
      }
      mainstack.pop()
      substack.pop()
    }
 }
 return minpath
}

var toMatrix = function(obj){
  var moveCostMatrix = []
  for (var i = 0; i < obj.rows.length; i++) {
    let array = []
    for (var j = 0; j < obj.rows[i].elements.length; j++) {
      if(obj.rows[i].elements[j].status === 'OK' ){
        if(i==j) {array.push(-1)}
        else {array.push(obj.rows[i].elements[j].duration.value)}
      }
      else array.push(-1)
    }
    moveCostMatrix.push(array)
  }
  return moveCostMatrix
}

var openingMatrix = function(placelistdetail , periodarray){

  var returnMatrix = new Array()

  for (let i in periodarray) {
    let time = periodarray[i].time
    // 這個時段是否在每個 place 的營業時間內
    var onePeriodOpeningArray = new Array()
    for (var j in placelistdetail) {
      if(placelistdetail[j].opening_hours){
        //24 小時營業 給 true
        if (placelistdetail[j].opening_hours.periods.length == 1 && placelistdetail[j].opening_hours.periods[0].open.day == 0 && placelistdetail[j].opening_hours.periods[0].open.time == "0000") {
          onePeriodOpeningArray.push(true)
        }else{
          for (let z in placelistdetail[j].opening_hours.periods) {
            if (placelistdetail[j].opening_hours.periods[z].open.day == time.getUTCDay() ) {
              // 算出開始營業時間
              let googleopentime = placelistdetail[j].opening_hours.periods[z].open.time
              let openhour = `${googleopentime[0]}${googleopentime[1]}`
              let openminute = `${googleopentime[2]}${googleopentime[3]}`
              let thisdayOpentime = new Date(Date.UTC(time.getUTCFullYear() , time.getUTCMonth() , time.getUTCDate() ,Number(openhour) , Number(openminute)));
              // 結束營業時間
              if (placelistdetail[j].opening_hours.periods[z].close) {
                let googleclosetime = placelistdetail[j].opening_hours.periods[z].close.time
                let closehour = `${googleclosetime[0]}${googleclosetime[1]}`
                let closeminute = `${googleclosetime[2]}${googleclosetime[3]}`
                if( placelistdetail[j].opening_hours.periods[z].open.day !== placelistdetail[j].opening_hours.periods[z].close.day) {
                  var thisdayClosetime = new Date(Date.UTC(time.getUTCFullYear() , time.getUTCMonth() , time.getUTCDate()+1 , Number(closehour) , Number(closeminute)))
                }else {
                  var thisdayClosetime = new Date(Date.UTC(time.getUTCFullYear() , time.getUTCMonth() , time.getUTCDate() , Number(closehour) , Number(closeminute)))
                }
              }else{
                var thisdayClosetime = new Date(Date.UTC(time.getUTCFullYear() , time.getUTCMonth() , time.getUTCDate()+1 , Number(closehour) , Number(closeminute)))
              }
              // 判斷如果這個時段有在這個地點的營業時間內
              if( time >= thisdayOpentime && time < thisdayClosetime){
                onePeriodOpeningArray.push(true)
                break
              }
            }
            if (z == placelistdetail[j].opening_hours.periods.length-1) {
              onePeriodOpeningArray.push(false)
            }
          }
        }
      }else {
        onePeriodOpeningArray.push(true) //沒營業時間給 true
      }
    }
    returnMatrix.push(onePeriodOpeningArray)
  }
  return returnMatrix
}

var findShortestPath = function(allpath , placeopeningMatrix){
  for (let r in allpath) {
    let truecount = 0
    for (let q = 1 ; q < allpath[r].path.length-1 ; q++) {
      if(placeopeningMatrix[q-1][allpath[r].path[q]-1]){truecount++ }
    }
    allpath[r].truecount = truecount
  }
  sort.by(allpath , 'truecount')
  console.log("Matrix",placeopeningMatrix);
  return allpath[0].path
}


module.exports.find2pointAllPath = find2pointAllPath;
module.exports.toMatrix = toMatrix;
module.exports.openingMatrix = openingMatrix;
module.exports.findShortestPath = findShortestPath;
