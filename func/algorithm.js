const cst = require('../secret/constant.js')
const sort = require('./sort.js')

function getNewDate (date, time) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), time.getHour(), time.getMinute() ));
}
function getNewTomorrowDate (date, time) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()+1, time.getHour(), time.getMinute() ));
}
class googleTime {
  constructor(time) {
    this.time = time
  }

  getHour(){
    return Number(`${this.time[0]}${this.time[1]}`)
  }

  getMinute(){
    return Number(`${this.time[2]}${this.time[3]}`)
  }
}

const find2PointAllPath = function(matrix, start, end){

  let minPath = new Array()
  let mainStack = new Array() // 主
  let supStack = new Array() // 輔
  let vertexArray = new Array() // 用來裝相鄰節點列表

  mainStack.push(start)
  for (let i = 0 ; i < matrix.length ; i++){
    if(matrix[start][i] >= 0) { vertexArray.push(i) }
  }
  supStack.push(vertexArray)

  let pathCount = 0

  while (mainStack.length) {

    if (supStack[supStack.length-1] && supStack[supStack.length-1].length) {
      let subStackTop = supStack.pop()
      vertexArray = []
      let newpop = subStackTop.shift()
      mainStack.push(newpop)
      supStack.push(subStackTop)

      for (let i = 0 ; i < matrix.length ; i++){
        if(matrix[newpop][i] >= 0 && mainStack.indexOf(i) == -1){ vertexArray.push(i) }
      }
      supStack.push(vertexArray)

    }else{
      mainStack.pop()
      supStack.pop()
    }

    if (mainStack[mainStack.length-1] == end) {
      if(mainStack.length == matrix.length) {
        let weight = 0
        for(let i = 0 ; i < mainStack.length-1 ; i++) {
          weight += matrix[mainStack[i]][mainStack[i+1]]
        }
        minPath.push({path: [] , weight: weight})
        mainStack.forEach((item, i) => { minPath[pathCount].path.push(item) });
        pathCount++
      }
      mainStack.pop()
      supStack.pop()
    }
  }
  return minPath
}

const toMatrix = function(obj, placeType){
  let moveCostMatrix = new Array()
  for (let i = 0; i < obj.rows.length; i++) {
    let array = new Array()
    for (let j = 0; j < obj.rows[i].elements.length; j++) {
      if(obj.rows[i].elements[j].status == 'OK' ){
        if(i==j && placeType =='nearby') {
          array.push(-1)
        }else if(placeType =='forTrans') {
          if (obj.rows[i].elements[j].duration.value == 0) {
            array.push({time : -1 , text : obj.rows[i].elements[j].duration.text})
          }else {
            array.push({time : obj.rows[i].elements[j].duration.value , text : obj.rows[i].elements[j].duration.text})
          }
        }else {
          array.push(obj.rows[i].elements[j].duration.value)
        }
      }
      else{
        if (placeType =='forTrans') {
          array.push({time : -1 , text : obj.rows[i].elements[j].status})
        }else {
          array.push(-1)
        }
      }
    }
    moveCostMatrix.push(array)
  }
  return moveCostMatrix
}

const openingMatrix = function(placelistDetail, periodArray){

  let returnMatrix = new Array()
  for (let i in periodArray) {
    const thisPeriodTime = periodArray[i].time
    // 這個時段是否在每個 place 的營業時間內
    let onePeriodOpeningArray = new Array()

    for (let j in placelistDetail) {
      if(placelistDetail[j].opening_hours){
        //24 小時營業 給 true
        if (placelistDetail[j].opening_hours.periods.length == 1 && placelistDetail[j].opening_hours.periods[0].open.day == cst.DAYOF24HRS && placelistDetail[j].opening_hours.periods[0].open.time == cst.TIMEOF24HRS) {
          onePeriodOpeningArray.push(true)
        }else{
          for (let z in placelistDetail[j].opening_hours.periods) {
            if (placelistDetail[j].opening_hours.periods[z].open.day == thisPeriodTime.getUTCDay() ) {
              // 算出開始營業時間
              let googleOpenTime = new googleTime(placelistDetail[j].opening_hours.periods[z].open.time)
              const thisdayOpentime = getNewDate(thisPeriodTime, googleOpenTime)

              // 結束營業時間
              if (placelistDetail[j].opening_hours.periods[z].close) {
                let googleCloseTime = new googleTime(placelistDetail[j].opening_hours.periods[z].close.time)
                if( placelistDetail[j].opening_hours.periods[z].open.day !== placelistDetail[j].opening_hours.periods[z].close.day) {
                  var thisdayClosetime = getNewTomorrowDate(thisPeriodTime, googleCloseTime)
                }else {
                  var thisdayClosetime = getNewDate(thisPeriodTime, googleCloseTime)
                }
              }else{
                var thisdayClosetime = getNewTomorrowDate(thisPeriodTime, googleCloseTime)
              }
              // 判斷如果這個時段有在這個地點的營業時間內
              if( thisPeriodTime >= thisdayOpentime && thisPeriodTime < thisdayClosetime){
                onePeriodOpeningArray.push(true)
                break
              }
            }
            if (z == placelistDetail[j].opening_hours.periods.length-1) {
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

const findShortestPath = function(allPath, placeOpeningMatrix){

  for (let r in allPath) {
    let trueCount = 0
    for (let q = 1 ; q < allPath[r].path.length-1 ; q++) {
      if(placeOpeningMatrix[q-1][allPath[r].path[q]-1]){ trueCount++ }
    }
    allPath[r].truecount = trueCount
  }
  sort.big2Small(allPath , 'trueCount')
  return allPath[0]
}

module.exports = {
  find2PointAllPath,
  toMatrix,
  openingMatrix,
  findShortestPath
}
