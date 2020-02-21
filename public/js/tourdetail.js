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
//localStorage 存在 tour
if(localStorage["tour"] || id){
  if(id){
    $.ajax({
      type : 'GET',
      contentType : 'application/json' ,
      url : `${location.origin}/getAutour?id=${id}`,
      success :function(data){
        if(!data[0].tourdetail) {
          console.log('tourdetail error');
          rendererror()
        }else{
          renderFirstCard(data[0])
          rendertourdetail(JSON.parse(data[0].tourdetail))
        }
      },
      error : function(data){
        console.log('Ajax error');
        rendererror()
      }
    })
  } else if (localStorage["tour"]){
    let tour = JSON.parse(localStorage.tour)
    let warning = JSON.parse(localStorage.warning)
    rendertourdetail(tour)
    renderwaringdiv(warning , tour)
    document.querySelector('#warningdiv').style.display = "flex"
    document.querySelector('.memberstore').style.display = "block"
  }
}else{
  rendererror()
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

  let warningdiv = document.querySelector('#warningdiv')

  //先給 mustgo 有找不到的警告
  let mustgowarningarr = new Array()
  for (let v in warningarray) {
    if (warningarray[v].type == 'mustgo') {
      mustgowarningarr.push(warningarray[v].name)
    }
  }
  if (mustgowarningarr.length != 0) {
    let mustgoreport = document.createElement('div')
    mustgoreport.className ='onedayreport'
    mustgoreport.id ='mustgoreport'

    let mustgotext = document.createElement('p')
    mustgotext.className = 'mustgotext'
    mustgotext.innerText = `您的必去清單 ➜`

    let mustgoreporttext = document.createElement('p')
    mustgoreporttext.className = 'mustgoreporttext'
    mustgoreporttext.innerText += `沒有幫你找到 ${mustgowarningarr} 哦 !`

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
    }
  })

  for (var i = 0 ; i < tourobj.length ; i++){

    let oneday = document.createElement('div')
    oneday.className = 'oneday'
    oneday.id = i
    oneday.onclick = function(){daymarker(this , tourobj , map)};

    let thisdate = document.createElement('div')
    thisdate.className = 'thisdate'
    thisdate.innerText = `${tourobj[i].year}/${tourobj[i].month}/${tourobj[i].date}`
    oneday.appendChild(thisdate)

    //放起點
    let startplace = document.createElement('div')
    startplace.className = 'oneplace'

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

    //放景點
    for (var j = 0; j < tourobj[i].period.place.length; j++) {
      if (tourobj[i].period.place[j].name != "") {
        let oneplace = document.createElement('div')
        oneplace.className = 'oneplace'

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

        // 放午餐
        if (tourobj[i].period.lunch && tourobj[i].period.lunch.name != "" && placetime.getUTCHours() == 10) {
          let lunchplace = document.createElement('div')
          lunchplace.className = 'oneplace'

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
        }
        //放晚餐
        if (placetime.getUTCHours() == 16 || placetime.getUTCHours() == 17) {
          if (tourobj[i].period.dinner && tourobj[i].period.dinner.name != ""  ) {
          let dinnerplace = document.createElement('div')
          dinnerplace.className = 'oneplace'

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
        }
        }

      }
    }

    // 放終點
    let endplace = document.createElement('div')
    endplace.className = 'oneplace'

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




  detail.appendChild(firstcard)
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
      timetype : localStorage.timetype
    }
    $.ajax({
      type:'POST',
      data:JSON.stringify(jsonobj),
      contentType: 'application/json',
      url : `${API_HOST}/storeAutour`,
      success: function(data) {
        alert('Success')
        localStorage.removeItem('titleplaceholder')
        localStorage.removeItem('tour')
        localStorage.removeItem('warning')
        localStorage.removeItem('prefertype')
        localStorage.removeItem('timetype')
        window.location.href=`${API_HOST}/profile.html`;
      },error: function(data) {
        alert('Something Wrong \n Please try again later')
        window.location.href=`${API_HOST}/tourdetail.html`;
      }
    })

  }else{
    document.querySelector('.titleinput').style.boxShadow = "0 0 8px 0 #e84118"
    document.querySelector('.titleinput').style.borderColor = "rgba(232, 65, 24,0.5)"
    animateCSS('.titleinput' , 'shake')
  }
}

function nostore(){
  localStorage.removeItem('tour');
  localStorage.removeItem('titleplaceholder');
  localStorage.removeItem('prefertype')
  localStorage.removeItem('timetype')
  localStorage.removeItem('warning')
  window.location.href=`${API_HOST}/profile.html`;
}

var markers = []
var polylines = []
function deleteMarkers() {

  markers.forEach(function(e) {
    e.setMap(null);
  });
  markers = [];

  polylines.forEach(function(e) {
    e.setMap(null);
  });
  polylines = [];
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
    if (tourobj[thisobj.id].period.place[i].name !== "") {
      points.push({lat: tourobj[thisobj.id].period.place[i].lat, lng: tourobj[thisobj.id].period.place[i].lng})
      var marker = new google.maps.Marker({
        position: {
          lat: tourobj[thisobj.id].period.place[i].lat,
          lng: tourobj[thisobj.id].period.place[i].lng
        },
        map: map,
        label: `${i+1}`,
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




    var polyline = new google.maps.Polyline({
        path: points,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 2
    });

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
