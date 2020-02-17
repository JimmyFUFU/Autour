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
          // renderFirstCard(data[0].prefertype , data[0].timetype)
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
    rendertourdetail(tour)
    renderwaringdiv(localStorage.warning , tour.length)
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

function renderwaringdiv(warningarray , days){
  console.log(days);
  console.log(warningarray);
  console.log(warningarray.length);
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
        if (tourobj[i].period.dinner && tourobj[i].period.dinner.name != ""  && placetime.getUTCHours() == 16) {
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

function renderFirstCard(prefertype ,timetype){
  prefertype = prefertype.split(',')

  let oneday = document.createElement('div')
  oneday.className = 'oneday'


  detail.appendChild(oneday)
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
  thisobj.style.borderWidth = "5px"
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
