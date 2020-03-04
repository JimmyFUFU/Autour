$(".header").load("header.html");
$(".footer").load("footer.html");
$("#signindiv").load("html/signindiv.html");
$("#storediv").load("html/storediv.html");

var API_HOST = location.origin;

function animateCSS(element, animationName, callback) {
    const node = document.querySelector(element)
    node.classList.add('animated', animationName)

    function handleAnimationEnd() {
        node.classList.remove('animated', animationName)
        node.removeEventListener('animationend', handleAnimationEnd)

        if (typeof callback === 'function') callback()
    }

    node.addEventListener('animationend', handleAnimationEnd)
}

var detail = document.querySelector('.detail')
var getUrlString = location.href;
var url = new URL(getUrlString);
var id = url.searchParams.get('id');


var id2Darray = new Array()
var markersinRoutes = new Array()
var infowindowses = new Array()
var markers = new Array()
var polylines = new Array()
var directionsService = new google.maps.DirectionsService();
var directionsDisplay = new google.maps.DirectionsRenderer();

//localStorage 存在 tour
if(localStorage["tour"] || id){
  // loading
  document.querySelector('.loading').style.display = 'flex'
  document.styleSheets[0].addRule('.bigflex.bigflex::after','display: block;');

  if(id){
    $.ajax({
      type : 'GET',
      contentType : 'application/json' ,
      url : `${location.origin}/getAutour?id=${id}`,
      success :function(data){
        if(!data[0].tourdetail) {
          console.log('tourdetail error');
          rendererror()
          document.querySelector('.loading').style.display = 'none'
          document.styleSheets[0].addRule('.bigflex.bigflex::after','display: none;');
        }else{
          renderFirstCard(data[0])
          renderwaringdiv(JSON.parse(data[0].warningarray) , JSON.parse(data[0].tourdetail))
          rendertourdetail(JSON.parse(data[0].tourdetail))
          rendertrans(id2Darray , data[0].transportation , id)
          document.querySelector('.loading').style.display = 'none'
          document.styleSheets[0].addRule('.bigflex.bigflex::after','display: none;');
        }
      },
      error : function(data){
        // console.log('Ajax error');
        rendererror()
        document.querySelector('.loading').style.display = 'none'
        document.styleSheets[0].addRule('.bigflex.bigflex::after','display: none;');
      }
    })
  } else if (localStorage["tour"]){
    let tour = JSON.parse(localStorage.tour)
    let warning = JSON.parse(localStorage.warning)
    renderwaringdiv(warning , tour)
    rendertourdetail(tour)
    rendertrans(id2Darray , localStorage.transportation , localStorage.temptourID)
    document.querySelector('#warningdiv').style.display = "flex"
    document.querySelector('.unstoreToollist').style.display = "flex"
    document.querySelector('.loading').style.display = 'none'
    document.styleSheets[0].addRule('.bigflex.bigflex::after','display: none;');
  }
}else{
  rendererror()
  document.querySelector('.loading').style.display = 'none'
  document.styleSheets[0].addRule('.bigflex.bigflex::after','display: none;');
}

function rendererror(){
  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: {
      lat: 25.053866,
      lng: 121.617225
    }
  })
  let errortext = document.createElement('div')
  errortext.className = 'errortext'
  errortext.innerText = '這裡沒有行程哦 !'
  detail.appendChild(errortext)
}

function renderwaringdiv(warningarray , tour){

  if (!warningarray)  return

  let warningdiv = document.querySelector('#warningdiv')

  //先給 mustgo 有找不到的警告
  let mustgoNotFoundArr = new Array()
  let mustgoNoOpeningArr = new Array()
  for (let v in warningarray) {
    if (warningarray[v].type == 'mustgo') {
      switch (warningarray[v].status) {
        case 'ZERO_RESULTS':
          mustgoNotFoundArr.push(warningarray[v].name)
          break;
        case 'IS_NOT_OPEN':
          mustgoNoOpeningArr.push(warningarray[v].name)
          break;
      }
    }
  }
  if (mustgoNotFoundArr.length) {
    let mustgoreport = document.createElement('div')
    mustgoreport.className ='onedayreport'
    mustgoreport.id ='mustgoreport'

    let mustgotext = document.createElement('p')
    mustgotext.className = 'mustgotext'
    mustgotext.innerText = `您的必去清單 ➜`

    let mustgoreporttext = document.createElement('p')
    mustgoreporttext.className = 'mustgoreporttext'
    mustgoreporttext.innerText += `沒有幫你找到 ${mustgoNotFoundArr} 哦 !`

    mustgoreport.appendChild(mustgotext)
    mustgoreport.appendChild(mustgoreporttext)
    warningdiv.appendChild(mustgoreport)
  }
  if (mustgoNoOpeningArr.length) {
    let mustgoreport = document.createElement('div')
    mustgoreport.className ='onedayreport'
    mustgoreport.id ='mustgoreport'

    let mustgotext = document.createElement('p')
    mustgotext.className = 'mustgotext'
    mustgotext.innerText = `您的必去清單 ➜`

    let mustgoreporttext = document.createElement('p')
    mustgoreporttext.className = 'mustgoreporttext'
    mustgoreporttext.innerText += `${mustgoNoOpeningArr} 在這幾天沒有開哦 !`

    mustgoreport.appendChild(mustgotext)
    mustgoreport.appendChild(mustgoreporttext)
    warningdiv.appendChild(mustgoreport)
  }

  //看每天的警告給text
  for (let i = 0; i < tour.length; i++) {
    let onedayreport = document.createElement('div')
    onedayreport.className ='onedayreport'

    let Daynum = document.createElement('p')
    Daynum.className = 'Daynum'
    Daynum.innerText = `Day ${Number(i)+1}`

    let Date = document.createElement('p')
    Date.className = 'Date'
    Date.innerText = `${tour[i].month}/${tour[i].date} ➜`

    let fivediv = document.createElement('div')
    fivediv.className ='fivediv'

    var warningstart = document.createElement('div')
    warningstart.className ='warningsmalldiv'
    // warningstart.id ='warningstart'
    warningstart.innerText = '起點✔'
    var starttooltiptext = document.createElement('span')
    starttooltiptext.className ='tooltiptext'
    starttooltiptext.innerText = 'No problem'
    fivediv.appendChild(warningstart)

    if (tour[i].period.lunch) {
      var warninglunch = document.createElement('div')
      warninglunch.className ='warningsmalldiv'
      // warninglunch.id ='warninglunch'
      warninglunch.innerText = '午餐✔'
      var lunchtooltiptext = document.createElement('span')
      lunchtooltiptext.className ='tooltiptext'
      lunchtooltiptext.innerText = 'No problem'
      fivediv.appendChild(warninglunch)
    }

    var warningplace = document.createElement('div')
    warningplace.className ='warningsmalldiv'
    // warningplace.id ='warningplace'
    warningplace.innerText = '景點✔'
    var placetooltiptext = document.createElement('span')
    placetooltiptext.className ='tooltiptext'
    placetooltiptext.innerText = 'No problem'
    fivediv.appendChild(warningplace)

    if (tour[i].period.dinner) {
      var warningdinner = document.createElement('div')
      warningdinner.className ='warningsmalldiv'
      // warningdinner.id ='warningdinner'
      warningdinner.innerText = '晚餐✔'
      var dinnertooltiptext = document.createElement('span')
      dinnertooltiptext.className ='tooltiptext'
      dinnertooltiptext.innerText = 'No problem'
      fivediv.appendChild(warningdinner)
    }

    var warningend = document.createElement('div')
    warningend.className ='warningsmalldiv'
    // warningend.id ='warningend'
    warningend.innerText = '終點✔'
    var endtooltiptext = document.createElement('span')
    endtooltiptext.className ='tooltiptext'
    endtooltiptext.innerText = 'No problem'
    fivediv.appendChild(warningend)

    for (let v = 0 ; v < warningarray.length ; v++) {
      if (warningarray[v].day == i) {
        switch (warningarray[v].type) {
          case 'startplace':
            warningstart.innerText = '起點✘'
            warningstart.style.border = "1px solid #ff4757"
            warningstart.style.color = "#ff4757"
            starttooltiptext.innerText = '沒有找到您指定的起點哦！會以您所選的縣市當起點'
            break;
          case 'endplace':
            warningend.innerText = '終點✘'
            warningend.style.border = "1px solid #ff4757"
            warningend.style.color = "#ff4757"
            endtooltiptext.innerText = '沒有找到您指定的落腳處哦！會以您所選的縣市當今日的終點'
            break;
          case 'finalPlaceList':
            warningplace.innerText = '景點✘'
            warningplace.style.border = "1px solid #ff4757"
            warningplace.style.color = "#ff4757"
            placetooltiptext.innerText = '行程沒有排滿 自己去逛逛吧~'
            break;
          case 'opening_issue':
            if (warningplace.style.color == "rgb(255, 71, 87)") {
              warningplace.innerText = '景點⚠'
              placetooltiptext.innerText += '出發前記得注意營業時間哦！'
            }else {
              warningplace.innerText = '景點⚠'
              warningplace.style.border = "1.3px solid #f7b731"
              warningplace.style.color = "#f7b731"
              placetooltiptext.innerText = '今天的景點可能會有營業時間的問題！出發前再確認一下哦'
            }
            break;
          case 'lunch':
            if (tour[i].period.lunch) {
              warninglunch.innerText = '午餐✘'
              warninglunch.style.border = "1px solid #ff4757"
              warninglunch.style.color = "#ff4757"
              lunchtooltiptext.innerText = '附近可能沒有推薦的餐廳哦'
            }
            break;
          case 'dinner':
            if (tour[i].period.dinner) {
              warningdinner.innerText = '晚餐✘'
              warningdinner.style.border = "1px solid #ff4757"
              warningdinner.style.color = "#ff4757"
              dinnertooltiptext.innerText = '附近可能沒有推薦的餐廳哦'
            }
            break;
        }
      }
    }

    // 因為好像改了父元素的屬性的話 span.innerText 會做不了事
    if (tour[i].period.lunch) { warninglunch.appendChild(lunchtooltiptext) }
    if (tour[i].period.dinner) { warningdinner.appendChild(dinnertooltiptext) }
    warningstart.appendChild(starttooltiptext)
    warningplace.appendChild(placetooltiptext)
    warningend.appendChild(endtooltiptext)

    onedayreport.appendChild(Daynum)
    onedayreport.appendChild(Date)
    onedayreport.appendChild(fivediv)
    warningdiv.appendChild(onedayreport)
  }
}

function rendertourdetail(tourobj){

  var map = new google.maps.Map(document.getElementById('map'), {
    zoom: 15,
    center: {
      lat: tourobj[0].period.start.lat,
      lng: tourobj[0].period.start.lng
    },
    styles :[
        { elementType: 'geometry', stylers: [ { color: '#ebe3cd' } ] },
        { elementType: 'geometry.fill', stylers: [ { weight: 1.5 } ] },
        {
          elementType: 'labels.text.fill',
          stylers: [ { color: '#523735' } ]
        },
        {
          elementType: 'labels.text.stroke',
          stylers: [ { color: '#f5f1e6' } ]
        },
        {
          featureType: 'administrative',
          elementType: 'geometry.stroke',
          stylers: [ { color: '#c9b2a6' } ]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'geometry.stroke',
          stylers: [ { color: '#dcd2be' } ]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels',
          stylers: [ { visibility: 'off' } ]
        },
        {
          featureType: 'administrative.land_parcel',
          elementType: 'labels.text.fill',
          stylers: [ { color: '#ae9e90' } ]
        },
        {
          featureType: 'administrative.province',
          elementType: 'geometry.stroke',
          stylers: [ { color: '#848484' }, { weight: 1 } ]
        },
        {
          featureType: 'landscape.natural',
          elementType: 'geometry',
          stylers: [ { color: '#dfd2ae' } ]
        },
        {
          featureType: 'poi',
          elementType: 'geometry',
          stylers: [ { color: '#dfd2ae' } ]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text',
          stylers: [ { visibility: 'off' } ]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [ { color: '#93817c' } ]
        },
        { featureType: 'poi.business', stylers: [ { visibility: 'off' } ] },
        {
          featureType: 'poi.park',
          elementType: 'geometry.fill',
          stylers: [ { color: '#a5b076' } ]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text',
          stylers: [ { visibility: 'off' } ]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [ { color: '#447530' } ]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [ { color: '#f5f1e6' } ]
        },
        {
          featureType: 'road.arterial',
          elementType: 'geometry',
          stylers: [ { color: '#fdfcf8' } ]
        },
        {
          featureType: 'road.arterial',
          elementType: 'labels',
          stylers: [ { visibility: 'off' } ]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [ { color: '#f8c967' } ]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [ { color: '#e9bc62' } ]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels',
          stylers: [ { visibility: 'off' } ]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry',
          stylers: [ { color: '#e98d58' } ]
        },
        {
          featureType: 'road.highway.controlled_access',
          elementType: 'geometry.stroke',
          stylers: [ { color: '#db8555' } ]
        },
        { featureType: 'road.local', stylers: [ { visibility: 'off' } ] },
        {
          featureType: 'road.local',
          elementType: 'labels',
          stylers: [ { visibility: 'off' } ]
        },
        {
          featureType: 'road.local',
          elementType: 'labels.text.fill',
          stylers: [ { color: '#806b63' } ]
        },
        {
          featureType: 'transit.line',
          elementType: 'geometry',
          stylers: [ { color: '#dfd2ae' } ]
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.fill',
          stylers: [ { color: '#8f7d77' } ]
        },
        {
          featureType: 'transit.line',
          elementType: 'labels.text.stroke',
          stylers: [ { color: '#ebe3cd' } ]
        },
        {
          featureType: 'transit.station',
          elementType: 'geometry',
          stylers: [ { color: '#dfd2ae' } ]
        },
        {
          featureType: 'water',
          elementType: 'geometry.fill',
          stylers: [ { color: '#b9d3c2' } ]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [ { color: '#92998d' } ]
        }]
  })

  for (var i = 0 ; i < tourobj.length ; i++){

    let idarray = new Array() //這時候順便蒐集各天的 idarray

    let oneday = document.createElement('div')
    oneday.className = 'oneday'
    oneday.id = i
    oneday.onclick = function(){daymarker(this , tourobj , map)};

    let thisdate = document.createElement('div')
    thisdate.className = 'thisdate'
    thisdate.innerText = `${tourobj[i].year}/${tourobj[i].month}/${tourobj[i].date}`
    oneday.appendChild(thisdate)

    //放起點
    idarray.push(`place_id:${tourobj[i].period.start.place_id}`)
    let startplace = document.createElement('div')
    startplace.className = 'oneplace'
    startplace.value = tourobj[i].period.start.place_id

    let startplaceimg = document.createElement('img')
    startplaceimg.src = "../icon/point.png";
    startplace.appendChild(startplaceimg)

    let startplacetime = new Date (tourobj[i].period.start.time)
    if (startplacetime.getHours()) {
      let startplacep = document.createElement('p')
      if(startplacetime.getMinutes().toString().length == 1){ startplacep.innerText = `${startplacetime.getHours()}:0${startplacetime.getMinutes()}`}
      else{startplacep.innerText = `${startplacetime.getHours()}:${startplacetime.getMinutes()}`}
      startplace.appendChild(startplacep)
    }

    let startplacestrong = document.createElement('strong')
    startplacestrong.innerText = tourobj[i].period.start.name
    startplace.appendChild(startplacestrong)

    oneday.appendChild(startplace)

    //交通方式的 div
    let transDiv = document.createElement('div')
    transDiv.className = 'transDiv'
    transDiv.onclick = function(){routeInmap(this ,map)}

    let transImg = document.createElement('div')
    transImg.className = 'transImg'
    transDiv.appendChild(transImg)

    let transtext = document.createElement('p')
    transtext.className = 'transtext'
    transDiv.appendChild(transtext)

    oneday.appendChild(transDiv)



    //放景點
    for (var j = 0; j < tourobj[i].period.place.length; j++) {
      if (tourobj[i].period.place[j].name != "") {
        idarray.push(`place_id:${tourobj[i].period.place[j].place_id}`)
        let oneplace = document.createElement('div')
        oneplace.className = 'oneplace'
        oneplace.value = tourobj[i].period.place[j].place_id

        let oneplaceimg = document.createElement('img')
        oneplaceimg.src = "../icon/point.png";
        oneplace.appendChild(oneplaceimg)

        let placetime = new Date (tourobj[i].period.place[j].time)
        let oneplacep = document.createElement('p')
        if(placetime.getMinutes().toString().length == 1){ oneplacep.innerText = `${placetime.getUTCHours()}:0${placetime.getMinutes()}`}
        else{oneplacep.innerText = `${placetime.getUTCHours()}:${placetime.getMinutes()}`}
        oneplace.appendChild(oneplacep)

        let oneplacestrong = document.createElement('strong')
        oneplacestrong.innerText = tourobj[i].period.place[j].name
        oneplace.appendChild(oneplacestrong)

        oneday.appendChild(oneplace)

        //交通方式的 div
        let transDiv = document.createElement('div')
        transDiv.className = 'transDiv'
        transDiv.onclick = function(){routeInmap(this ,map)}

        let transImg = document.createElement('div')
        transImg.className = 'transImg'
        transDiv.appendChild(transImg)

        let transtext = document.createElement('p')
        transtext.className = 'transtext'
        transDiv.appendChild(transtext)

        oneday.appendChild(transDiv)

        // 放午餐
        if (tourobj[i].period.lunch && tourobj[i].period.lunch.name != "" && placetime.getUTCHours() == 10) {
          idarray.push(`place_id:${tourobj[i].period.lunch.place_id}`)
          let lunchplace = document.createElement('div')
          lunchplace.className = 'oneplace'
          lunchplace.value = tourobj[i].period.lunch.place_id

          let lunchplaceimg = document.createElement('img')
          lunchplaceimg.src = "../icon/meal.png";
          lunchplace.appendChild(lunchplaceimg)


          let lunchplacep = document.createElement('p')
          lunchplacep.innerText = `12:00`
          lunchplace.appendChild(lunchplacep)

          let lunchplacestrong = document.createElement('strong')
          lunchplacestrong.innerText = tourobj[i].period.lunch.name
          lunchplace.appendChild(lunchplacestrong)

          oneday.appendChild(lunchplace)

          //交通方式的 div
          let transDiv = document.createElement('div')
          transDiv.className = 'transDiv'
          transDiv.onclick = function(){routeInmap(this ,map)}

          let transImg = document.createElement('div')
          transImg.className = 'transImg'
          transDiv.appendChild(transImg)

          let transtext = document.createElement('p')
          transtext.className = 'transtext'
          transDiv.appendChild(transtext)

          oneday.appendChild(transDiv)

        }
        //放晚餐
        if (placetime.getUTCHours() == 16 || placetime.getUTCHours() == 17) {
          if (tourobj[i].period.dinner && tourobj[i].period.dinner.name != ""  ) {
            idarray.push(`place_id:${tourobj[i].period.dinner.place_id}`)
            let dinnerplace = document.createElement('div')
            dinnerplace.className = 'oneplace'
            dinnerplace.value = tourobj[i].period.dinner.place_id

            let dinnerplaceimg = document.createElement('img')
            dinnerplaceimg.src = "../icon/meal.png";
            dinnerplace.appendChild(dinnerplaceimg)


            let dinnerplacep = document.createElement('p')
            dinnerplacep.innerText = `18:00`
            dinnerplace.appendChild(dinnerplacep)

            let dinnerplacestrong = document.createElement('strong')
            dinnerplacestrong.innerText = tourobj[i].period.dinner.name
            dinnerplace.appendChild(dinnerplacestrong)

            oneday.appendChild(dinnerplace)

            //交通方式的 div
            let transDiv = document.createElement('div')
            transDiv.className = 'transDiv'
            transDiv.onclick = function(){routeInmap(this ,map)}

            let transImg = document.createElement('div')
            transImg.className = 'transImg'
            transDiv.appendChild(transImg)

            let transtext = document.createElement('p')
            transtext.className = 'transtext'
            transDiv.appendChild(transtext)

            oneday.appendChild(transDiv)
          }
        }

      }
    }

    // 放終點
    idarray.push(`place_id:${tourobj[i].period.end.place_id}`)
    let endplace = document.createElement('div')
    endplace.className = 'oneplace'
    endplace.value = tourobj[i].period.end.place_id

    let endplaceimg = document.createElement('img')
    endplaceimg.src = "../icon/point.png";
    endplace.appendChild(endplaceimg)

    let endplacetime = new Date (tourobj[i].period.end.time)
    if (endplacetime.getHours()) {
      let endplacep = document.createElement('p')
      if(endplacetime.getMinutes().toString().length == 1){ endplacep.innerText = `${endplacetime.getHours()}:0${endplacetime.getMinutes()}`}
      else{endplacep.innerText = `${endplacetime.getHours()}:${endplacetime.getMinutes()}`}
      endplace.appendChild(endplacep)
    }

    let endplacestrong = document.createElement('strong')
    endplacestrong.innerText = tourobj[i].period.end.name
    endplace.appendChild(endplacestrong)

    oneday.appendChild(endplace)

    detail.appendChild(oneday)
    id2Darray.push(idarray)
  }

}

function renderFirstCard(data){

  let firstcard = document.createElement('div')
  firstcard.id = 'firstcard'

  let firstcardtourtitle = document.createElement('p')
  firstcardtourtitle.id = 'firstcardtourtitle'
  firstcardtourtitle.innerText = data.tourtitle
  firstcardtourtitle.title = '點擊編輯旅程標題'
  firstcardtourtitle.onclick = function(){change2input(this)}
  firstcard.appendChild(firstcardtourtitle)

  let firstcardtourid = document.createElement('p')
  firstcardtourid.id = 'firstcardtourid'
  firstcardtourid.value = data.id
  firstcardtourid.innerText = `行程編號 ${data.id}`
  firstcard.appendChild(firstcardtourid)

  let typetext = document.createElement('p')
  typetext.id = 'typetext'
  typetext.innerText =  '↓ 您的偏好選項 ↓'
  firstcard.appendChild(typetext)

  if ( data.prefertype.length > 0) {
    prefertype = data.prefertype.split(',')
    let preferdiv = document.createElement('div')
    preferdiv.id = 'preferdiv'
    for (let i in prefertype) {
      let preferItemdiv = document.createElement('div')
      preferItemdiv.className = 'preferItemdiv'
      preferItemdiv.innerText = getChinese(prefertype[i])
      preferdiv.appendChild(preferItemdiv)
    }
    firstcard.appendChild(preferdiv)
  }


  let timetypediv = document.createElement('div')
  timetypediv.id = 'timetypediv'
  if (data.timetype == 'fast') {
    timetypediv.innerText = '一定要去很多地方！'
  }else if (data.timetype == 'slow') {
    timetypediv.innerText = '慢慢玩就好～'
  }
  firstcard.appendChild(timetypediv)

  if ( data.transportation.length > 0) {
    transportation = data.transportation.split(',')
    let transportationdiv = document.createElement('div')
    transportationdiv.id = 'transportationdiv'
    for (let i in transportation) {
      let transportationItemdiv = document.createElement('div')
      transportationItemdiv.className = 'transportationItemdiv'
      transportationItemdiv.style.backgroundImage = getTransimg(transportation[i])
      transportationItemdiv.title = getChinese(transportation[i])
      transportationdiv.appendChild(transportationItemdiv)
    }
    firstcard.appendChild(transportationdiv)
  }


  let openreport = document.createElement('div')
  openreport.id = 'openreport'
  openreport.innerText = 'Autour 報告.'
  openreport.onclick = function() { document.querySelector('#warningdiv').style.display = "flex" }
  firstcard.appendChild(openreport)

  detail.appendChild(firstcard)
}

function rendertrans(id2Darray , transportation , id){
  transportation = transportation.split(',')
  let transDiv = document.querySelectorAll('.transDiv')
  let transDivcount = 0

  for (let i = 0; i < id2Darray.length;i++) {

    const jsonobj = {
      id2Darray:id2Darray[i] ,
      transportation:transportation ,
      tourid : id ,
      day : i
    }
    $.ajax({
      type: 'POST',
      data: JSON.stringify(jsonobj),
      contentType: 'application/json',
      url : `${API_HOST}/google/getFastMatrix`,
      async: false
    })
    .done(function(data){
      for (let j = 0; j < data.length; j++) {
        transDiv[transDivcount].firstChild.style.backgroundImage = getTransimg(data[j].type)
        transDiv[transDivcount].title = getChinese(data[j].type)
        transDiv[transDivcount].lastChild.innerText = `約 ${data[j].text}`
        transDiv[transDivcount].value = data[j].type
        transDivcount++
      }
    })
    .fail(function(data){
      for (let j = 0; j < data.length; j++) {
        transDiv[j].lastChild.innerText = 'error'
        transDivcount++
      }
    })
  }
}

function checkmember(){
  if (sessionStorage.name){
    document.querySelector('#storediv').style.display = 'flex'
    document.querySelector('.titleinput').value = `${localStorage.titleplaceholder}之旅`
  }else{
    //先請登入再存
    document.querySelector('#signindiv').style.display = 'flex'
  }
}

function memberstore(){
  //判斷 title
  if (document.querySelector('.titleinput').value) {
    //直接存進資料庫
    var jsonobj = {
      userid : sessionStorage.id,
      tourtitle : document.querySelector('.titleinput').value,
      tour : localStorage.tour,
      warningarray : localStorage.warning,
      prefertype : localStorage.prefertype,
      timetype : localStorage.timetype,
      transportation : localStorage.transportation
    }
    $.ajax({
      type:'POST',
      data:JSON.stringify(jsonobj),
      contentType: 'application/json',
      url : `${API_HOST}/storeAutour`,
      success: function(data) {
        localStorage.clear()
        window.location.href=`${API_HOST}/profile.html`;
      },error: function(data) {
        alert('Something Wrong \n Please try again later')
      }
    })

  }else{
    document.querySelector('.titleinput').style.boxShadow = "0 0 8px 0 #e84118"
    document.querySelector('.titleinput').style.borderColor = "rgba(232, 65, 24,0.5)"
    animateCSS('.titleinput' , 'shake')
  }
}

function nostore(){
  localStorage.clear()
  window.location.href=`${API_HOST}/profile.html`;
}

function deleteMarkers() {

  markers.forEach(function(e) {
    e.setMap(null);
  });
  markers = [];

  polylines.forEach(function(e) {
    e.setMap(null);
  });
  polylines = [];

  markersinRoutes.forEach(function(e) {
    e.setMap(null);
  });
  markersinRoutes = [];

  infowindowses.forEach(function(e) {
    e.setMap(null);
  });
  infowindowses = [];

  directionsDisplay.setMap(null);
}

function routeInmap(thisobj , map){
  event.stopPropagation(); //父層是 div

  deleteMarkers()

  directionsDisplay.setMap(map);

  var request = {
      origin: {'placeId': thisobj.previousSibling.value},
      destination: {'placeId': thisobj.nextSibling.value},
      travelMode: thisobj.value.toUpperCase()
  };

  var markersinRoute = [];
  var infowindows = [];
  directionsService.route(request, function (result, status) {
      if (status == 'OK') {
          // 回傳路線上每個步驟的細節
          // console.log(result.routes[0].legs[0].steps);
          var steps = result.routes[0].legs[0].steps;
          steps.forEach((e, i) => {
            markersinRoute[i] = new google.maps.Marker({
              position: { lat: e.start_location.lat(), lng: e.start_location.lng() },
              map: map,
              icon: {
                  url: getMarkerimg(thisobj.value),
                  scaledSize: new google.maps.Size(32, 32)
                }
            });
            markersinRoutes.push(markersinRoute[i])
              // 加入資訊視窗
            infowindows[i] = new google.maps.InfoWindow({
              content: e.instructions
            });
            infowindowses.push(infowindows[i])
            markersinRoute[i].addListener('click', function () {
               if(infowindows[i].anchor){
                   infowindows[i].close();
               }else{
                   infowindows[i].open(map, markersinRoute[i]);
               }
            });
          })
          directionsDisplay.setDirections(result);
      } else {
          console.log('Directions request failed due to ' + status);
      }
  });


}

function daymarker(thisobj , tourobj , map){

  document.querySelectorAll('.oneday').forEach((item, i) => {item.style.borderWidth = "1.5px"})
  thisobj.style.borderWidth = "3.5px"
  deleteMarkers()

  var points = []
  // 起點
  points.push({lat: tourobj[thisobj.id].period.start.lat, lng: tourobj[thisobj.id].period.start.lng})
  var marker = new google.maps.Marker({
    position: {
      lat: tourobj[thisobj.id].period.start.lat,
      lng: tourobj[thisobj.id].period.start.lng
    },
    map: map,
    animation: google.maps.Animation.DROP,
    title:tourobj[thisobj.id].period.start.name
  })
  map.panTo({
    lat: tourobj[thisobj.id].period.start.lat,
    lng: tourobj[thisobj.id].period.start.lng
  });
  markers.push(marker)

  // 景點
  for (var i = 0; i < tourobj[thisobj.id].period.place.length; i++) {
    if (tourobj[thisobj.id].period.place[i].name != "") {
      points.push({lat: tourobj[thisobj.id].period.place[i].lat, lng: tourobj[thisobj.id].period.place[i].lng})
      var marker = new google.maps.Marker({
        position: {
          lat: tourobj[thisobj.id].period.place[i].lat,
          lng: tourobj[thisobj.id].period.place[i].lng
        },
        map: map,
        label: {text:`${i+1}` , color : "#FFFFFF"},
        animation: google.maps.Animation.DROP,
        title:tourobj[thisobj.id].period.place[i].name
      })
      markers.push(marker)
    }

    if (tourobj[thisobj.id].period.place[i].time[11]==1 && tourobj[thisobj.id].period.place[i].time[12]==0 && tourobj[thisobj.id].period.lunch && tourobj[thisobj.id].period.lunch.name != '') {
      // 午餐
      points.push({lat: tourobj[thisobj.id].period.lunch.lat, lng: tourobj[thisobj.id].period.lunch.lng})
      var marker = new google.maps.Marker({
        position: {
          lat: tourobj[thisobj.id].period.lunch.lat,
          lng: tourobj[thisobj.id].period.lunch.lng
        },
        map: map,
        animation: google.maps.Animation.DROP,
        title:tourobj[thisobj.id].period.lunch.name,
        icon:'../icon/mealpoint.png'
      })
      markers.push(marker)
    }
    if (tourobj[thisobj.id].period.place[i].time[11]==1 && tourobj[thisobj.id].period.place[i].time[12]==6 && tourobj[thisobj.id].period.dinner && tourobj[thisobj.id].period.dinner.name != '') {
      //晚餐
      points.push({lat: tourobj[thisobj.id].period.dinner.lat, lng: tourobj[thisobj.id].period.dinner.lng})
      var marker = new google.maps.Marker({
        position: {
          lat: tourobj[thisobj.id].period.dinner.lat,
          lng: tourobj[thisobj.id].period.dinner.lng
        },
        map: map,
        animation: google.maps.Animation.DROP,
        title:tourobj[thisobj.id].period.dinner.name,
        icon:'../icon/mealpoint.png'
      })
      markers.push(marker)
    }
  }
  // 終點
  points.push({lat: tourobj[thisobj.id].period.end.lat, lng: tourobj[thisobj.id].period.end.lng})
  var marker = new google.maps.Marker({
    position: {
      lat: tourobj[thisobj.id].period.end.lat,
      lng: tourobj[thisobj.id].period.end.lng
    },
    map: map,
    animation: google.maps.Animation.DROP,
    title:tourobj[thisobj.id].period.end.name
  })
  markers.push(marker)



  var iconPath = {
    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW
  };
  var polyline = new google.maps.Polyline({
      path: points,
      strokeColor: '#eb2f06',
      strokeOpacity: 0.9,
      strokeWeight: 5
  });
  var a = 0
  setInterval(function(){
      a = a + 1;
      if(a>100){ a = 0; }
      polyline.setOptions({
        icons:[{
          icon: iconPath,
          offset: a + '%',
          scale:10
        }]
      })
    },80);

  polyline.setMap(map);
  polylines.push(polyline)

}

function closethis(thisobj) {
  thisobj.parentNode.style.display = 'none'
}

function getChinese(item) {
  switch (item) {
    case 'shopping':
      return '逛街'
      break;
    case 'movie':
      return '看電影'
      break;
    case 'animal':
      return '看動物'
      break;
    case 'spirit':
      return '知性之旅'
      break;
    case 'sport':
      return '運動'
      break;
    case 'eighteen':
      return '我有 18 歲'
      break;
    case 'Afternoon_tea':
      return '喝咖啡'
      break;
    case 'other':
      return '其他更多'
      break;
    case 'driving':
      return '開車'
      break;
    case 'bicycling':
      return '騎車'
      break;
    case 'transit':
      return '大眾運輸'
      break;
    case 'walking':
      return '步行'
      break;
  }
}

function getTransimg(item){
  switch (item) {
    case 'driving':
      return "url('../icon/car.png')"
      break;
    case 'bicycling':
      return "url('../icon/scooter.png')"
      break;
    case 'transit':
      return "url('../icon/train.png')"
      break;
    case 'walking':
      return "url('../icon/walk.png')"
      break;
  }
}

function getMarkerimg(item){
  switch (item) {
    case 'driving':
      return '../icon/orangecar.png'
      break;
    case 'bicycling':
      return '../icon/orangescooter.png'
      break;
    case 'transit':
      return '../icon/orangetrain.png'
      break;
    case 'walking':
      return '../icon/orangewalk.png'
      break;
  }
}

function change2input(thisobj) {
  var oldtitle = thisobj.innerText;
  var newobj = document.createElement('input');
  newobj.type = 'text';
  newobj.value = oldtitle;
  newobj.className = 'titleEdit'
  newobj.onblur = function() {

          if (newobj.value == '') {
            newobj.style.boxShadow = "0 0 8px 0 #eb2f06"
            newobj.style.borderColor = "rgba(235, 47, 6,0.5)"
          }else {
            newobj.style.display = 'none';
            thisobj.style.display = 'block';
            thisobj.innerText = newobj.value
            if (oldtitle != newobj.value){
              revisetitle(newobj.value , document.querySelector('#firstcardtourid').value)
            }
          }
       }
  thisobj.style.display = 'none';
  thisobj.parentNode.insertBefore(newobj ,thisobj.parentNode.firstChild);
  newobj.setSelectionRange(0, oldtitle.length);
  newobj.focus();
}

function revisetitle(titletext , tourid) {
  $.ajax({
    type:'PUT',
    data:JSON.stringify({revisetitle: titletext ,tourId: tourid ,access_token:sessionStorage.access_token}),
    contentType: 'application/json',
    url : `${API_HOST}/revisetitle`,
    success: function(data) {
      console.log('Success')
    },error: function(data) {
      console.log(data);
    }
  })
}
