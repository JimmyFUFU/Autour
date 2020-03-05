const algorithm = require('../func/algorithm.js')
const googlemap = require('../func/googlemap.js')
const period = require('../func/period.js')
const radius = require('../func/radius.js')
const weight = require('../func/addweight.js')
const sort = require('../func/sort.js')

let io
const getIo = (ioFromApp) => { io = ioFromApp }

const newAutour = async function (req,res){
 // console.log(req.body);
//--------------------------------------------------------預備工作 先把時段放好--------------------------------------------------------//

  // 先算有多少時段 才知道要拿多少個景點 // 順便放好 起點 住宿 終點資訊
  var periodArray = period.getperiod(req.body)
  var warningArray = new Array()
  var allTourPlaceIdArray = new Array() // 用來檢查所有景點不能重複

  try {
    // 找到每天起點、終點的資料
    var startPlaceArray = new Array()
    for (let i in periodArray) {
      let startplace = await googlemap.findPlace(periodArray[i].period.start.name)
      if (startplace.candidates.length) { //如果這天的起點找的到的話 正常
        startPlaceArray.push(startplace.candidates[0])
        periodArray[i].period.start.place_id = startplace.candidates[0].place_id
        periodArray[i].period.start.lat = startplace.candidates[0].geometry.location.lat
        periodArray[i].period.start.lng = startplace.candidates[0].geometry.location.lng
      }else { // 找不到的話就拿他選擇的城市當起點
        warningArray.push({type: 'startplace' , day: i ,status: startplace.status})
        startplace = await googlemap.findPlace(req.body.city[0])
        startPlaceArray.push(startplace.candidates[0])
        periodArray[i].period.start.replaceName = startplace.candidates[0].name
        periodArray[i].period.start.place_id = startplace.candidates[0].place_id
        periodArray[i].period.start.lat = startplace.candidates[0].geometry.location.lat
        periodArray[i].period.start.lng = startplace.candidates[0].geometry.location.lng
      }
      let endplace = await googlemap.findPlace(periodArray[i].period.end.name)
      if (endplace.candidates.length) {
        periodArray[i].period.end.place_id = endplace.candidates[0].place_id
        periodArray[i].period.end.lat = endplace.candidates[0].geometry.location.lat
        periodArray[i].period.end.lng = endplace.candidates[0].geometry.location.lng
      }else {
        warningArray.push({type: 'endplace' , day: i ,status: endplace.status})
        endplace = await googlemap.findPlace(req.body.city[0])
        periodArray[i].period.end.replaceName = endplace.candidates[0].name
        periodArray[i].period.end.place_id = endplace.candidates[0].place_id
        periodArray[i].period.end.lat = endplace.candidates[0].geometry.location.lat
        periodArray[i].period.end.lng = endplace.candidates[0].geometry.location.lng
      }
    }
 //-------------------------------------------------------- must go --------------------------------------------------------//
    var mustgoArray = new Array()
    for (let i in req.body.mustgo) {
      let mustgoPlace = await googlemap.findPlace(req.body.mustgo[i])
      if (mustgoPlace.candidates.length) {
        let mustgoPlaceDetail = await googlemap.placeDetail(mustgoPlace.candidates[0].place_id) // candidates[0] 選第一個
        mustgoArray.push(mustgoPlaceDetail.result)
      }else {
        warningArray.push({type: 'mustgo' , name: req.body.mustgo[i] ,status: 'ZERO_RESULTS'}) // 沒找到的話給警告
      }
    }
    // 放進適合的日子的 placelist
    let startPlaceId = new Array() // 每天起點的 place_id
    for (let i in startPlaceArray) { startPlaceId.push(`place_id:${startPlaceArray[i].place_id}`) }

    for (let i in mustgoArray) {
      let getMoveCost = await googlemap.distanceMatrix(startPlaceId , [`place_id:${mustgoArray[i].place_id}`] , 'walking')
      let moveCostMatrix = algorithm.toMatrix(getMoveCost , 'mostgo') // 轉成 Matrix
      let theNearest = 0 , minWeight = -1 , mustgoOpeningCheck = false
      for(let j = 0 ; j < moveCostMatrix.length ; j++) {

        let thisMustgoMatrix = algorithm.openingMatrix( [mustgoArray[i]] , periodArray[j].period.place )
        for (let x = 0; x < thisMustgoMatrix.length; x++) {
          if (thisMustgoMatrix[x][0] && moveCostMatrix[j][0] != -1) {
            if (minWeight == -1 || moveCostMatrix[j][0] < minWeight) {
              if ( mustgoArray[i].types.includes('amusement_park') && periodArray[j].period.place.length < 3 ) {
                break
              }else {
                minWeight = moveCostMatrix[j][0]
                theNearest = j
                mustgoOpeningCheck = true
                break
              }
            }
          }
        }
      }
      if (mustgoOpeningCheck) {
        // 如果是 amusement_park 放兩個 如果評論 > 9560 放三個
        if(mustgoArray[i].types.includes('amusement_park')) {
          let items = 2
          if (mustgoArray[i].user_ratings_total >= 9560) { items = 3 }
          else if (mustgoArray[i].user_ratings_total < 500) { items = 1 }
          for (let p = 0; p < items; p++) {
             periodArray[theNearest].placelist.push({name : mustgoArray[i].name ,
                                                    place_id : mustgoArray[i].place_id ,
                                                    lat : mustgoArray[i].geometry.location.lat ,
                                                    lng : mustgoArray[i].geometry.location.lng } )
          }
        }else{
          periodArray[theNearest].placelist.push({name : mustgoArray[i].name ,
                                                 place_id : mustgoArray[i].place_id ,
                                                 lat : mustgoArray[i].geometry.location.lat ,
                                                 lng : mustgoArray[i].geometry.location.lng } )
        }
        allTourPlaceIdArray.push(mustgoArray[i].place_id)
      }else{
        warningArray.push({type: 'mustgo' , name: mustgoArray[i].name ,status: 'IS_NOT_OPEN'})
      }
    }
    console.log('mustgoArray push in periodArray.placelist !');
 //-----------------------------------------------------END must go --------------------------------------------------------//

 // --------------------------------------------------排每天的景點進 placelist-----------------------------------------------//
    for (let i in periodArray) {
      io.emit('server message', {day: Number(i)+1 , msg: `day ${Number(i)+1} start`})
      console.log(`\nday ${i} started`);
      let remainPeriod = periodArray[i].period.place.length - periodArray[i].placelist.length // 今天還剩多少時段
      let finalPlaceArray = new Array() // 拿來放這天會找到的所有景點
      //先把這天的 mustgo 放進 finalPlaceArray
      for (let t = 0; t < periodArray[i].placelist.length; t++) {
        for (var u = 0; u < mustgoArray.length; u++) {
          if (periodArray[i].placelist[t].place_id == mustgoArray[u].place_id ) {
            finalPlaceArray.push(mustgoArray[u])
          }
        }
      }
      console.log(`day${i} remain ${remainPeriod} periods`);

      // 還有剩時段才需要給偏好跟推薦的景點
      if (remainPeriod > 0) {
      //prefer go ( nearBy start place so I need to get geocode first )
        let nearByPlace = await googlemap.nearBy(startPlaceArray[i].geometry.location.lat,
          startPlaceArray[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          req.body.prefertype,
          periodArray[i].period.place.length )
        nearByPlace = nearByPlace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in nearByPlace) {
          let thisNearbyPlaceDetail = await googlemap.placeDetail(nearByPlace[u].place_id)
          nearByPlace[u] = thisNearbyPlaceDetail.result
        }
        console.log(`day${i} nearByPlace finish !`);
        // console.log(`day${i} 找到 ${nearByPlace.length} 個 nearByPlace `);

        // 加上系統自己推薦 tourist_attraction
        let morePlace = await googlemap.nearBy(startPlaceArray[i].geometry.location.lat,
          startPlaceArray[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          ['tourist_attraction'],
          periodArray[i].period.place.length )
        morePlace = morePlace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in morePlace) {
          let thisMorePlaceDetail = await googlemap.placeDetail(morePlace[u].place_id)
          morePlace[u] = thisMorePlaceDetail.result
        }
        console.log(`day${i} morePlace finish !`);
        // console.log(`day${i} 找到 ${morePlace.length} 個 morePlace `);

        //給權重 取得綜合分數
        weight.addscore(nearByPlace,0.8)
        weight.addscore(morePlace,0.5)

        // 合併 nearByPlace & morePlace 去掉重複
        for (let u in nearByPlace) {
          let duplicatedCheck = false
          for (let j in finalPlaceArray) {
            if (finalPlaceArray[j].id == nearByPlace[u].id ) { duplicatedCheck = true }
          }
          if (!duplicatedCheck) { finalPlaceArray.push(nearByPlace[u]) }
        }
        for (let u in morePlace) {
          let duplicatedCheck = false
          for (let j in finalPlaceArray) {
           if (finalPlaceArray[j].id == morePlace[u].id ) { duplicatedCheck = true }
          }
          if (!duplicatedCheck) { finalPlaceArray.push(morePlace[u]) }
        }

        // sortby score
        sort.big2Small(finalPlaceArray , 'score')

        periodArray[i].placeREC = new Array()
        let placeCount = 0 // 算要放幾個進去

        for (let p in finalPlaceArray) {

          let duplicatedCheck = false , openingCheck = false
          for (let j in allTourPlaceIdArray)  { if (allTourPlaceIdArray[j] == finalPlaceArray[p].place_id ) { duplicatedCheck = true } }
          for (let j in periodArray[i].placelist) { if (periodArray[i].placelist[j].place_id == finalPlaceArray[p].place_id ) { duplicatedCheck = true } }
          let onePlaceOpening = algorithm.openingMatrix([finalPlaceArray[p]] , periodArray[i].period.place)
          for (let j in onePlaceOpening) { if (onePlaceOpening[j][0]) { openingCheck = true } }
          if ( !duplicatedCheck && openingCheck) {
           if (placeCount < remainPeriod) {
             if( finalPlaceArray[p].types.includes('amusement_park') ) {
               let item = 0
               if (finalPlaceArray[p].user_ratings_total >= 9560 && remainPeriod-placeCount >= 3) {
                 item = 3
                 allTourPlaceIdArray.push(finalPlaceArray[p].place_id)
               }else if (finalPlaceArray[p].user_ratings_total < 9560 && finalPlaceArray[p].user_ratings_total >= 500 && remainPeriod-placeCount >= 2 ) {
                 item = 2
                 allTourPlaceIdArray.push(finalPlaceArray[p].place_id)
               }else if (finalPlaceArray[p].user_ratings_total < 500 && remainPeriod-placeCount >= 1) {
                 item = 1
                 allTourPlaceIdArray.push(finalPlaceArray[p].place_id)
               }else {
                 // 是遊樂園但是時間不夠
                 periodArray[i].placeREC.push({name:finalPlaceArray[p].name ,
                   place_id:finalPlaceArray[p].place_id ,
                   lat : finalPlaceArray[p].geometry.location.lat,
                   lng : finalPlaceArray[p].geometry.location.lng });
                 break
               }
               for (let p = 0; p < item; p++) {
                 periodArray[i].placelist.push({name:finalPlaceArray[p].name ,
                   place_id:finalPlaceArray[p].place_id ,
                   lat : finalPlaceArray[p].geometry.location.lat,
                   lng : finalPlaceArray[p].geometry.location.lng });
                 placeCount++;
               }
             }else{
                allTourPlaceIdArray.push(finalPlaceArray[p].place_id)
                periodArray[i].placelist.push({name:finalPlaceArray[p].name ,
                  place_id:finalPlaceArray[p].place_id ,
                  lat : finalPlaceArray[p].geometry.location.lat,
                  lng : finalPlaceArray[p].geometry.location.lng });
                placeCount++;
              }
           }else if (placeCount >= remainPeriod) {
              periodArray[i].placeREC.push({name:finalPlaceArray[p].name ,
                place_id:finalPlaceArray[p].place_id ,
                lat : finalPlaceArray[p].geometry.location.lat,
                lng : finalPlaceArray[p].geometry.location.lng });
              placeCount++;
            }
          }
        }
        if (placeCount < remainPeriod) {
          warningArray.push({type: 'finalPlaceArray' , day: i ,status: 'Not_enough_recommended_places'})
        }
      }

      let allPath = new Array()
      let placeOpeningMatrix = new Array()
      let shortPath
      let openingMatrixCheck = false
      let swapCount = 0
      let placelistCount = periodArray[i].placelist.length-1

      while (!openingMatrixCheck) {

      let placeListDetail = new Array() // 等等用來看營業時間
      let idArray = new Array()
      idArray.push(`place_id:${periodArray[i].period.start.place_id}`)// push 起點
      for (let y in periodArray[i].placelist) {
        idArray.push(`place_id:${periodArray[i].placelist[y].place_id}`) // 把 placelist 裡每個景點的 place_id push 進 idArray
        for (let x = 0; x < finalPlaceArray.length; x++) {
          if (finalPlaceArray[x].place_id == periodArray[i].placelist[y].place_id) {
            placeListDetail.push(finalPlaceArray[x]) // 把 finalPlaceArray 裡每個景點 push 進 placeListDetail
            break
          }
        }
      }
      idArray.push(`place_id:${periodArray[i].period.end.place_id}`) // push 終點
      let getMoveCost = await googlemap.distanceMatrix(idArray , idArray , 'driving') // 拿到點與點的移動成本
      let moveCostMatrix = algorithm.toMatrix(getMoveCost , 'nearby') //  轉成 Matrix
      allPath = algorithm.find2PointAllPath(moveCostMatrix,0,idArray.length-1) // 拿到所有路徑
      sort.small2Big(allPath , 'weight')
      placeOpeningMatrix = algorithm.openingMatrix( placeListDetail , periodArray[i].period.place ) // 二維陣列 每個時段*每個景點
      console.log('Matrix\n', placeOpeningMatrix);
      let shortPathObj = algorithm.findShortestPath(allPath, placeOpeningMatrix)
      shortPath = shortPathObj.path
      if (placeOpeningMatrix.length == 0) {
        openingMatrixCheck = true
        console.log('No period , Do not need check opening');
        break
      }

      // 檢查 shortPath 是不是全部都是 false
      if (shortPathObj.truecount < placeOpeningMatrix.length) {
        console.log(`day ${i} have opening issue`);
        // 先檢查有沒有點換
        if (periodArray[i].placeREC.length != 0) {
          // 要選一個點替換掉
          for (let y = periodArray[i].placelist.length-1 ; y >= 0 ; y--) {
            if (swapCount == periodArray[i].placeREC.length+1) {
              swapCount = 0
              placelistCount--
            }else {
              // 不能是 mustgoArray 裡面的點
              let mustgoCheck = false
              for (let p in mustgoArray) {
                  if (periodArray[i].placelist[placelistCount].place_id == mustgoArray[p].place_id ) { mustgoCheck = true }
                }
              if (!mustgoCheck) { //能換就換

                //allTourPlaceIdArray 要把原本的拿出來
                allTourPlaceIdArray.splice(allTourPlaceIdArray.indexOf(periodArray[i].placelist[placelistCount].place_id),1)
                periodArray[i].placeREC.push({
                     name: periodArray[i].placelist[placelistCount].name,
                     place_id: periodArray[i].placelist[placelistCount].place_id,
                     lat: periodArray[i].placelist[placelistCount].lat,
                     lng: periodArray[i].placelist[placelistCount].lng })
                let firstplaceREC = periodArray[i].placeREC.shift()
                periodArray[i].placelist[placelistCount] = firstplaceREC
                allTourPlaceIdArray.push(firstplaceREC.place_id)
                swapCount++
                break // 交換成功就再去外面試一次
              }
              if (y == 0) { // 從最後一個已經檢查到第一個 代表沒有點可以換(全部都是mustgo) 不要刪 給提示
                warningArray.push({type: 'opening_issue' , day : i , status: 'All_mustgo'})
                openingMatrixCheck = true
              }
            }
          }
        }else {
          // 沒景點換 不要刪 給提示
          warningArray.push({type: 'opening_issue' , day : i , status: 'No_placeREC'})
          openingMatrixCheck = true
          break
        }
      }else {
        console.log('opening Matrix check over !');
        break
      }
    }
      console.log(`day${i} shortPath`, shortPath);

      for (let k = 1 ; k < shortPath.length-1 ; k++) {
       periodArray[i].period.place[k-1].name = periodArray[i].placelist[shortPath[k]-1].name
       periodArray[i].period.place[k-1].lat = periodArray[i].placelist[shortPath[k]-1].lat
       periodArray[i].period.place[k-1].lng = periodArray[i].placelist[shortPath[k]-1].lng
       periodArray[i].period.place[k-1].place_id = periodArray[i].placelist[shortPath[k]-1].place_id
     }

      let lunchDetailArray = new Array()
      let dinnerDetailArray = new Array()
      for (let q = 0; q < periodArray[i].period.place.length; q++) {
        const utcHour = new Date(periodArray[i].period.place[q].time).getUTCHours()
        // 找午餐
        if (utcHour == 10 || utcHour == 13 || utcHour == 14) {
          if (periodArray[i].period.lunch) {
            let lunchArray = await googlemap.nearBy(periodArray[i].period.place[q].lat, periodArray[i].period.place[q].lng, 1000, ['restaurant'] , 4 )
            lunchArray = lunchArray.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
            lunchArray = lunchArray.filter((item, index, array)=>{return item.types.indexOf('lodging') == -1});
            for (let u in lunchArray) {
              let lunchDetail = await googlemap.placeDetail(lunchArray[u].place_id)
              if (algorithm.openingMatrix([lunchDetail.result] , [periodArray[i].period.lunch])[0]) {  // 去掉中午沒開的
                lunchDetailArray.push(lunchDetail.result)
              }
            }
          }
        }

        // 找晚餐
        if (utcHour == 16 || utcHour == 17 || utcHour == 19 || utcHour == 20) {
          if (periodArray[i].period.dinner) {
            let dinnerArray = await googlemap.nearBy(periodArray[i].period.place[q].lat, periodArray[i].period.place[q].lng, 1000, ['restaurant'], 4 )
            dinnerArray = dinnerArray.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
            dinnerArray = dinnerArray.filter((item, index, array)=>{return item.types.indexOf('lodging') == -1})
            for (let o in dinnerArray) {
              let dinnerDetail = await googlemap.placeDetail(dinnerArray[o].place_id)
              if (algorithm.openingMatrix([dinnerDetail.result] , [periodArray[i].period.dinner])[0]) { // 去掉晚餐沒開的
                dinnerDetailArray.push(dinnerDetail.result)
              }
            }
          }
        }

        if (q == periodArray[i].period.place.length-1) {
          if (lunchDetailArray.length) {
            sort.big2Small(lunchDetailArray , 'user_ratings_total')
            let lunchCheck = false
            for (let o in lunchDetailArray) {
              let duplicatedCheck = false
              for (let k in allTourPlaceIdArray) {
                if (allTourPlaceIdArray[k] == lunchDetailArray[o].place_id ) { duplicatedCheck = true }
              }
              if (!duplicatedCheck) {
                lunchCheck = true
                periodArray[i].period.lunch.name = lunchDetailArray[o].name
                periodArray[i].period.lunch.place_id = lunchDetailArray[o].place_id
                periodArray[i].period.lunch.lat = lunchDetailArray[o].geometry.location.lat
                periodArray[i].period.lunch.lng = lunchDetailArray[o].geometry.location.lng
                allTourPlaceIdArray.push(lunchDetailArray[o].place_id)
              }
            }
            if (!lunchCheck) {
              warningArray.push({type: 'lunch' , day: i ,status:  "ZERO_RESULTS" })
            }
            // periodArray[i].lunchREC = lunchDetailArray // 8 個左右
          }else {
            warningArray.push({type: 'lunch' , day: i ,status:  "ZERO_RESULTS" })
          }
          if (dinnerDetailArray.length) {
            sort.big2Small(dinnerDetailArray , 'user_ratings_total')
            let dinnerCheck = false
            for (let o in dinnerDetailArray) {
              let duplicatedCheck = false
              for (let k in allTourPlaceIdArray) {
                if (allTourPlaceIdArray[k] == dinnerDetailArray[o].place_id ) { duplicatedCheck = true }
              }
              if (!duplicatedCheck) {
                dinnerCheck= true
                periodArray[i].period.dinner.name = dinnerDetailArray[o].name
                periodArray[i].period.dinner.place_id = dinnerDetailArray[o].place_id
                periodArray[i].period.dinner.lat = dinnerDetailArray[o].geometry.location.lat
                periodArray[i].period.dinner.lng = dinnerDetailArray[o].geometry.location.lng
                allTourPlaceIdArray.push(dinnerDetailArray[o].place_id)
              }
            }
            if (!dinnerCheck) {
              warningArray.push({type: 'dinner' , day: i ,status:  "ZERO_RESULTS" })
            }
            // periodArray[i].dinnerREC = dinnerDetailArray // 8 個左右
          }else {
            warningArray.push({type: 'dinner' , day: i ,status:  "ZERO_RESULTS" })
          }
        }
      }
      console.log(`day ${i} lunch & dinner are OK !`);
      console.log(`day ${i} finished`);
      io.emit('server message', {day: Number(i)+1 , msg: `day ${Number(i)+1} finish`})
    } 
    console.log('periodArray finish !')
    res.status(200).send( {periodArray: periodArray, warningArray : warningArray} )
  } catch (e) {
    console.log(e);
    res.status(400).send({error: e})
  }
}

module.exports = {
  newAutour,
  getIo
}
