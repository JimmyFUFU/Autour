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
    var startPlaceList = new Array()
    for (let i in periodArray) {
      let startplace = await googlemap.findPlace(periodArray[i].period.start.name)
      if (startplace.candidates.length) { //如果這天的起點找的到的話 正常
        startPlaceList.push(startplace.candidates[0])
        periodArray[i].period.start.place_id = startplace.candidates[0].place_id
        periodArray[i].period.start.lat = startplace.candidates[0].geometry.location.lat
        periodArray[i].period.start.lng = startplace.candidates[0].geometry.location.lng
      }else { // 找不到的話就拿他選擇的城市當起點
        warningArray.push({type: 'startplace' , day: i ,status: startplace.status})
        startplace = await googlemap.findPlace(req.body.city[0])
        startPlaceList.push(startplace.candidates[0])
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
    var mustgoList = new Array()
    for (let i in req.body.mustgo) {
      let mustgoPlace = await googlemap.findPlace(req.body.mustgo[i])
      if (mustgoPlace.candidates.length) {
        let mustgoplacedetail = await googlemap.placeDetail(mustgoPlace.candidates[0].place_id) // candidates[0] 選第一個
        mustgoList.push(mustgoplacedetail.result)
      }else {
        warningArray.push({type: 'mustgo' , name: req.body.mustgo[i] ,status: 'ZERO_RESULTS'}) // 沒找到的話給警告
      }
    }
    // console.log('mustgoList finish !');
    // 放進適合的日子的 placelist
    // 先找到每天起點的 place_id
    let startPlaceId = new Array()
    for (let i in startPlaceList) { startPlaceId.push(`place_id:${startPlaceList[i].place_id}`) }

    for (let i in mustgoList) {
      let getMoveCost = await googlemap.distanceMatrix(startPlaceId , [`place_id:${mustgoList[i].place_id}`] , 'walking')
      let moveCostMatrix = algorithm.toMatrix(getMoveCost , 'mostgo') // 轉成 Matrix
      let theNearest = 0 , minWeight = -1 , mustgoOpeningCheck = false
      for(let j = 0 ; j < moveCostMatrix.length ; j++) {

        let thisMustgoMatrix = algorithm.openingMatrix( [mustgoList[i]] , periodArray[j].period.place )
        for (let x = 0; x < thisMustgoMatrix.length; x++) {
          if (thisMustgoMatrix[x][0] && moveCostMatrix[j][0] != -1) {
            if (minWeight == -1 || moveCostMatrix[j][0] < minWeight) {
              if ( mustgoList[i].types.includes('amusement_park') && periodArray[j].period.place.length < 3 ) {
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
        if(mustgoList[i].types.includes('amusement_park')) {
          let items = 2
          if (mustgoList[i].user_ratings_total >= 9560) { items = 3 }
          else if (mustgoList[i].user_ratings_total < 500) { items = 1 }
          for (let p = 0; p < items; p++) {
             periodArray[theNearest].placelist.push({name : mustgoList[i].name ,
                                                    place_id : mustgoList[i].place_id ,
                                                    lat : mustgoList[i].geometry.location.lat ,
                                                    lng : mustgoList[i].geometry.location.lng } )
          }
        }else{
          periodArray[theNearest].placelist.push({name : mustgoList[i].name ,
                                                 place_id : mustgoList[i].place_id ,
                                                 lat : mustgoList[i].geometry.location.lat ,
                                                 lng : mustgoList[i].geometry.location.lng } )
        }
        allTourPlaceIdArray.push(mustgoList[i].place_id)
      }else{
        warningArray.push({type: 'mustgo' , name: mustgoList[i].name ,status: 'IS_NOT_OPEN'})
      }
    }
    console.log('mustgoList push in periodArray.placelist !');
 //-----------------------------------------------------END must go --------------------------------------------------------//

 // --------------------------------------------------排每天的景點進 placelist-----------------------------------------------//
    for (let i in periodArray) {
      io.emit('server message', {day: Number(i)+1 , msg: `day ${Number(i)+1} start`})
      console.log(`\nday ${i} started`);
      let remain = periodArray[i].period.place.length - periodArray[i].placelist.length // 今天還剩多少時段
      let finalPlaceList = new Array() // 拿來放這天會找到的所有景點
      //先把這天的mustgo放進finalPlaceList
      for (let t = 0; t < periodArray[i].placelist.length; t++) {
       for (var u = 0; u < mustgoList.length; u++) {
         if (periodArray[i].placelist[t].place_id == mustgoList[u].place_id ) {
           finalPlaceList.push(mustgoList[u])
         }
       }
     }
      console.log(`day${i} remain ${remain} periods`);

      // 還有剩時段才需要給偏好跟推薦的景點
      if (remain > 0) {
      //prefer go ( nearBy start place so I need to get geocode first )
        let nearByPlace = await googlemap.nearBy(startPlaceList[i].geometry.location.lat,
          startPlaceList[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          req.body.prefertype,
          periodArray[i].period.place.length )
        nearByPlace = nearByPlace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in nearByPlace) {
          let thisnearbyplacedetail = await googlemap.placeDetail(nearByPlace[u].place_id)
          nearByPlace[u] = thisnearbyplacedetail.result
        }
        console.log(`day${i} nearByPlace finish !`);
        // console.log(`day${i} 找到 ${nearByPlace.length} 個 nearByPlace `);

        // 加上系統自己推薦 tourist_attraction
        let morePlace = await googlemap.nearBy(startPlaceList[i].geometry.location.lat,
          startPlaceList[i].geometry.location.lng,
          radius.getradius(req.body.transportation),
          ['tourist_attraction'],
          periodArray[i].period.place.length )
        morePlace = morePlace.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
        for (let u in morePlace) {
          let thismoreplacedetail = await googlemap.placeDetail(morePlace[u].place_id)
          morePlace[u] = thismoreplacedetail.result
        }
        console.log(`day${i} morePlace finish !`);
        // console.log(`day${i} 找到 ${morePlace.length} 個 morePlace `);

        //給權重 取得綜合分數
        weight.addscore(nearByPlace,0.8)
        weight.addscore(morePlace,0.5)

        // 合併 nearByPlace & morePlace 去掉重複
        for (let u in nearByPlace) {
          let duplicatedCheck = false
          for (let j in finalPlaceList) {
            if (finalPlaceList[j].id == nearByPlace[u].id ) { duplicatedCheck = true }
          }
          if (!duplicatedCheck) { finalPlaceList.push(nearByPlace[u]) }
        }
        for (let u in morePlace) {
          let duplicatedCheck = false
          for (let j in finalPlaceList) {
           if (finalPlaceList[j].id == morePlace[u].id ) { duplicatedCheck = true }
          }
          if (!duplicatedCheck) { finalPlaceList.push(morePlace[u]) }
        }

        // sortby score
        sort.big2Small(finalPlaceList , 'score')

        periodArray[i].placeREC = new Array()
        let count = 0 // 算要放幾個進去

        for (let p in finalPlaceList) {

          let check = false , openingCheck = false
          for (let j in allTourPlaceIdArray)  { if (allTourPlaceIdArray[j] == finalPlaceList[p].place_id ) { check = true } }
          for (let j in periodArray[i].placelist) { if (periodArray[i].placelist[j].place_id == finalPlaceList[p].place_id ) { check = true } }
          let onePlaceOpening = algorithm.openingMatrix([finalPlaceList[p]] , periodArray[i].period.place)
          for (let j in onePlaceOpening) { if (onePlaceOpening[j][0]) { openingCheck = true } }
          if ( !check && openingCheck) {
           if (count < remain) {
             if( finalPlaceList[p].types.includes('amusement_park') ) {
               let item = 0
               if (finalPlaceList[p].user_ratings_total >= 9560 && remain-count >= 3) {
                 item = 3
                 allTourPlaceIdArray.push(finalPlaceList[p].place_id)
               }else if (finalPlaceList[p].user_ratings_total < 9560 && finalPlaceList[p].user_ratings_total >= 500 && remain-count >= 2 ) {
                 item = 2
                 allTourPlaceIdArray.push(finalPlaceList[p].place_id)
               }else if (finalPlaceList[p].user_ratings_total < 500 && remain-count >= 1) {
                 item = 1
                 allTourPlaceIdArray.push(finalPlaceList[p].place_id)
               }else if (remain-count <= 0) {
                 // 是遊樂園但是時間不夠
                 periodArray[i].placeREC.push({name:finalPlaceList[p].name ,
                   place_id:finalPlaceList[p].place_id ,
                   lat : finalPlaceList[p].geometry.location.lat,
                   lng : finalPlaceList[p].geometry.location.lng });
                 break
               }
               for (let p = 0; p < item; p++) {
                 periodArray[i].placelist.push({name:finalPlaceList[p].name ,
                   place_id:finalPlaceList[p].place_id ,
                   lat : finalPlaceList[p].geometry.location.lat,
                   lng : finalPlaceList[p].geometry.location.lng });
                 count++;
               }
             }else{
               allTourPlaceIdArray.push(finalPlaceList[p].place_id)
               periodArray[i].placelist.push({name:finalPlaceList[p].name ,
                 place_id:finalPlaceList[p].place_id ,
                 lat : finalPlaceList[p].geometry.location.lat,
                 lng : finalPlaceList[p].geometry.location.lng });
               count++;
             }
           }else if (count >= remain) {
               periodArray[i].placeREC.push({name:finalPlaceList[p].name ,
                 place_id:finalPlaceList[p].place_id ,
                 lat : finalPlaceList[p].geometry.location.lat,
                 lng : finalPlaceList[p].geometry.location.lng });
                 count++;
           }
        }
        }
        if (count < remain) {
          warningArray.push({type: 'finalPlaceList' , day: i ,status: 'Not_enough_recommended_places'})
        }
      }

      var allpath
      var placeopeningMatrix
      var shortpath
      var openingMatrixCheck = false
      var swapcount = 0
      var placelistcount = periodArray[i].placelist.length-1

      while (!openingMatrixCheck) {

       let placeListDetail = new Array() // 等等用來看營業時間
       let idArray = new Array()
       idArray.push(`place_id:${periodArray[i].period.start.place_id}`)// push 起點
       for (let y in periodArray[i].placelist) {
         idArray.push(`place_id:${periodArray[i].placelist[y].place_id}`) // 把 placelist 裡每個景點的 place_id push 進 idArray
         for (let x = 0; x < finalPlaceList.length; x++) {
           if (finalPlaceList[x].place_id == periodArray[i].placelist[y].place_id) {
             placeListDetail.push(finalPlaceList[x]) // 把 finalPlaceList 裡每個景點 push 進 placeListDetail
             break
           }
         }
       }
       idArray.push(`place_id:${periodArray[i].period.end.place_id}`) // push 終點
       let getMoveCost = await googlemap.distanceMatrix(idArray , idArray , 'driving') // 拿到點與點的移動成本
       let moveCostMatrix = algorithm.toMatrix(getMoveCost , 'nearby') //  轉成 Matrix
       allpath = algorithm.find2PointAllPath(moveCostMatrix,0,idArray.length-1) // 拿到所有路徑
       sort.small2Big(allpath , 'weight')
       placeopeningMatrix = algorithm.openingMatrix( placeListDetail , periodArray[i].period.place ) // 二維陣列 每個時段*每個景點
       console.log('Matrix\n', placeopeningMatrix);
       let shortpathobj = algorithm.findShortestPath(allpath, placeopeningMatrix)
       shortpath = shortpathobj.path
       if (placeopeningMatrix.length == 0) {
         openingMatrixCheck = true
         console.log('No period , Do not need check opening');
         break
       }

       // 檢查 shortpath 是不是全部都是 false
       if (shortpathobj.truecount < placeopeningMatrix.length) {
         console.log(`day ${i} have opening issue`);
         // 先檢查有沒有點換
         if (periodArray[i].placeREC.length != 0) {
           // 要選一個點替換掉
           for (let y = periodArray[i].placelist.length-1 ; y >= 0 ; y--) {
             if (swapcount == periodArray[i].placeREC.length+1) {
               swapcount = 0
               placelistcount--
             }else {
               // 不能是mustgoList裡面的點
               let ifinmustgolist = false
               for (let p in mustgoList) {
                 if (periodArray[i].placelist[placelistcount].place_id == mustgoList[p].place_id ) { ifinmustgolist = true }
               }
               if (!ifinmustgolist) { //能換就換

                 //allTourPlaceIdArray 要把原本的拿出來
                 allTourPlaceIdArray.splice(allTourPlaceIdArray.indexOf(periodArray[i].placelist[placelistcount].place_id),1)
                 periodArray[i].placeREC.push({
                   name: periodArray[i].placelist[placelistcount].name,
                   place_id: periodArray[i].placelist[placelistcount].place_id,
                   lat: periodArray[i].placelist[placelistcount].lat,
                   lng: periodArray[i].placelist[placelistcount].lng })
                   let firstplaceREC = periodArray[i].placeREC.shift()
                   periodArray[i].placelist[placelistcount] = firstplaceREC
                   allTourPlaceIdArray.push(firstplaceREC.place_id)
                   swapcount++
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
      console.log(`day${i} shortpath`, shortpath);

      for (let k = 1 ; k < shortpath.length-1 ; k++) {
       periodArray[i].period.place[k-1].name = periodArray[i].placelist[shortpath[k]-1].name
       periodArray[i].period.place[k-1].lat = periodArray[i].placelist[shortpath[k]-1].lat
       periodArray[i].period.place[k-1].lng = periodArray[i].placelist[shortpath[k]-1].lng
       periodArray[i].period.place[k-1].place_id = periodArray[i].placelist[shortpath[k]-1].place_id
     }

      let lunchdetailarr = new Array()
      let dinnerdetailarr = new Array()
      for (let q = 0; q < periodArray[i].period.place.length; q++) {
        let utchour = new Date(periodArray[i].period.place[q].time).getUTCHours()
        // 找午餐
        if (utchour == 10 || utchour == 13 || utchour == 14) {
          if (periodArray[i].period.lunch) {
            let lunch = await googlemap.nearBy(periodArray[i].period.place[q].lat, periodArray[i].period.place[q].lng, 1000, ['restaurant'] , 4 )
            lunch = lunch.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
            lunch = lunch.filter((item, index, array)=>{return item.types.indexOf('lodging') == -1});
            for (let u in lunch) {
              let lunchdetail = await googlemap.placeDetail(lunch[u].place_id)
              if (algorithm.openingMatrix([lunchdetail.result] , [periodArray[i].period.lunch])[0]) {  // 去掉中午沒開的
                lunchdetailarr.push(lunchdetail.result)
              }
            }
          }
        }

        // 找晚餐
        if (utchour == 16 || utchour == 17 || utchour == 19 || utchour == 20) {
          if (periodArray[i].period.dinner) {
            let dinner = await googlemap.nearBy(periodArray[i].period.place[q].lat, periodArray[i].period.place[q].lng, 1000, ['restaurant'], 4 )
            dinner = dinner.filter((item, index, array)=>{return item.rating > 0}); // 去掉空資料
            dinner = dinner.filter((item, index, array)=>{return item.types.indexOf('lodging') == -1})
            for (let o in dinner) {
              let dinnerdetail = await googlemap.placeDetail(dinner[o].place_id)
              if (algorithm.openingMatrix([dinnerdetail.result] , [periodArray[i].period.dinner])[0]) { // 去掉晚餐沒開的
                dinnerdetailarr.push(dinnerdetail.result)
              }
            }
          }
        }

        if (q == periodArray[i].period.place.length-1) {
          if (lunchdetailarr.length != 0) {
            sort.big2Small(lunchdetailarr , 'user_ratings_total')
            let lunchCheck = false
            for (let o in lunchdetailarr) {
              let check = false
              for (let k in allTourPlaceIdArray) {
                if (allTourPlaceIdArray[k] == lunchdetailarr[o].place_id ) { check = true }
              }
              if (!check) {
                lunchCheck = true
                periodArray[i].period.lunch.name = lunchdetailarr[o].name
                periodArray[i].period.lunch.place_id = lunchdetailarr[o].place_id
                periodArray[i].period.lunch.lat = lunchdetailarr[o].geometry.location.lat
                periodArray[i].period.lunch.lng = lunchdetailarr[o].geometry.location.lng
                allTourPlaceIdArray.push(lunchdetailarr[o].place_id)
              }
            }
            if (!lunchCheck) {
              warningArray.push({type: 'lunch' , day: i ,status:  "ZERO_RESULTS" })
            }
            // periodArray[i].lunchREC = lunchdetailarr // 8 個左右
          }else {
            warningArray.push({type: 'lunch' , day: i ,status:  "ZERO_RESULTS" })
          }
          if (dinnerdetailarr.length != 0) {
            sort.big2Small(dinnerdetailarr , 'user_ratings_total')
            let dinnerCheck = false
            for (let o in dinnerdetailarr) {
              let check = false
              for (let k in allTourPlaceIdArray) {
                if (allTourPlaceIdArray[k] == dinnerdetailarr[o].place_id ) { check = true }
              }
              if (!check) {
                dinnerCheck= true
                periodArray[i].period.dinner.name = dinnerdetailarr[o].name
                periodArray[i].period.dinner.place_id = dinnerdetailarr[o].place_id
                periodArray[i].period.dinner.lat = dinnerdetailarr[o].geometry.location.lat
                periodArray[i].period.dinner.lng = dinnerdetailarr[o].geometry.location.lng
                allTourPlaceIdArray.push(dinnerdetailarr[o].place_id)
              }
            }
            if (!dinnerCheck) {
              warningArray.push({type: 'dinner' , day: i ,status:  "ZERO_RESULTS" })
            }
            // periodArray[i].dinnerREC = dinnerdetailarr // 8 個左右
          }else {
            warningArray.push({type: 'dinner' , day: i ,status:  "ZERO_RESULTS" })
          }
        }
      }
      console.log(`day ${i} lunch & dinner are OK !`);
      console.log(`day ${i} finished`);
      io.emit('server message', {day:Number(i)+1 , msg: `day ${Number(i)+1} finish`})
    }
    console.log('periodArray finish !')
    res.status(200).send( {periodArray: periodArray, warningArray : warningArray} )
  } catch (e) {
    console.log(e);
    res.status(400).send({error:e})
  }
}

module.exports = {
  newAutour,
  getIo
}
